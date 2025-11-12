from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import datetime, timedelta
from adminpanel.models import Articles, Magazines, Publications
import calendar


class Command(BaseCommand):
    help = 'Auto-assign magazine IDs to articles from previous month (e.g., October magazine gets September articles)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without making actual changes to see what would be updated',
        )
        parser.add_argument(
            '--year',
            type=int,
            help='Specific year to process (default: current year)',
        )
        parser.add_argument(
            '--month',
            type=str,
            help='Specific month to process (default: previous month)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        target_year = options.get('year')
        target_month = options.get('month')
        
        # If no specific year/month provided, use previous month
        if not target_year or not target_month:
            now = datetime.now()
            # Get previous month
            if now.month == 1:
                prev_month = 12
                prev_year = now.year - 1
            else:
                prev_month = now.month - 1
                prev_year = now.year
            
            target_year = target_year or prev_year
            target_month = target_month or calendar.month_name[prev_month]
        
        # Calculate date range for articles to be assigned
        # Articles from the PREVIOUS month should be assigned to the target month's magazine
        # e.g., September 2025 articles → October 2025 magazine
        # e.g., October 2025 articles → November 2025 magazine
        
        # Get the month number for the target month
        target_month_num = list(calendar.month_name).index(target_month)
        
        # Calculate the previous month for articles
        if target_month_num == 1:
            # If target is January, previous month is December of previous year
            article_month_num = 12
            article_year = target_year - 1
        else:
            # Previous month of the same year
            article_month_num = target_month_num - 1
            article_year = target_year
        
        self.stdout.write(
            self.style.SUCCESS(f'Processing {target_month} {target_year} magazines to assign {calendar.month_name[article_month_num]} {article_year} articles')
        )
        
        # First, try to assign magazines using exact month/year matching
        self.stdout.write('\n=== STEP 1: EXACT MONTH/YEAR MATCHING ===')
        exact_matches = self.assign_exact_matches(target_year, target_month, dry_run)
        
        # Then, try the previous month assignment logic
        self.stdout.write('\n=== STEP 2: PREVIOUS MONTH ASSIGNMENT ===')
        prev_matches = self.assign_previous_month_articles(target_year, target_month, article_year, article_month_num, dry_run)
        
        total_updated = exact_matches + prev_matches
        self.stdout.write(
            self.style.SUCCESS(f'\nTOTAL: Successfully assigned magazines to {total_updated} articles')
        )
    
    def assign_exact_matches(self, target_year, target_month, dry_run):
        """Assign magazines using exact month/year matching"""
        # Get all magazines for the target month/year
        magazines = Magazines.objects.filter(
            year=target_year,
            month=target_month,
            status='Active'
        )
        
        if not magazines.exists():
            self.stdout.write(
                self.style.WARNING(f'No active magazines found for {target_month} {target_year}')
            )
            return 0
        
        self.stdout.write(f'Found {magazines.count()} magazines for {target_month} {target_year}')
        
        # Get the month number for the target month
        target_month_num = list(calendar.month_name).index(target_month)
        
        # Find articles with exact month/year match that don't have magazines
        articles_to_update = Articles.objects.filter(
            publish_date_year=target_year,
            publish_date_month=target_month_num,
            status='Active',
            magazine__isnull=True
        )
        
        total_articles = articles_to_update.count()
        self.stdout.write(f'Found {total_articles} articles with exact {target_month} {target_year} match')
        
        if total_articles == 0:
            self.stdout.write(self.style.WARNING('No articles found for exact matching'))
            return 0
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN: Would assign magazines to exact matches'))
            return 0
        
        # Update articles by matching publication
        updated_count = 0
        with transaction.atomic():
            for article in articles_to_update:
                # Find the matching magazine for this article's publication
                matching_magazine = None
                for magazine in magazines:
                    if (article.publication and magazine.publication and 
                        article.publication.id == magazine.publication.id):
                        matching_magazine = magazine
                        break
                
                if matching_magazine:
                    article.magazine = matching_magazine
                    article.save()
                    updated_count += 1
                    self.stdout.write(f'  Assigned "{matching_magazine.title}" to "{article.title}"')
                else:
                    self.stdout.write(
                        self.style.WARNING(f'  No matching magazine found for article "{article.title}" (Publication: {article.publication.display_name if article.publication else "No Publication"})')
                    )
        
        return updated_count
    
    def assign_previous_month_articles(self, target_year, target_month, article_year, article_month_num, dry_run):
        """Assign magazines using previous month logic"""
        
        # Get all magazines for the target month/year
        magazines = Magazines.objects.filter(
            year=target_year,
            month=target_month,
            status='Active'
        )
        
        if not magazines.exists():
            self.stdout.write(
                self.style.WARNING(f'No active magazines found for {target_month} {target_year}')
            )
            return 0
        
        self.stdout.write(f'Found {magazines.count()} magazines for {target_month} {target_year}')
        
        # Create date range for the PREVIOUS month (articles to be assigned)
        start_date = datetime(article_year, article_month_num, 1)
        if article_month_num == 12:
            end_date = datetime(article_year + 1, 1, 1)
        else:
            end_date = datetime(article_year, article_month_num + 1, 1)
        
        self.stdout.write(
            f'Looking for articles published between {start_date.strftime("%Y-%m-%d")} '
            f'and {end_date.strftime("%Y-%m-%d")}'
        )
        
        # Find articles that need to be assigned
        articles_to_update = Articles.objects.filter(
            publish_date__gte=start_date,
            publish_date__lt=end_date,
            status='Active',
            magazine__isnull=True  # Only articles that don't already have a magazine assigned
        )
        
        total_articles = articles_to_update.count()
        self.stdout.write(f'Found {total_articles} articles to update')
        
        if total_articles == 0:
            self.stdout.write(self.style.WARNING('No articles found to update'))
            return 0
        
        # Group articles by publication for better reporting
        articles_by_publication = {}
        for article in articles_to_update:
            pub_name = article.publication.display_name if article.publication else 'No Publication'
            if pub_name not in articles_by_publication:
                articles_by_publication[pub_name] = []
            articles_by_publication[pub_name].append(article)
        
        # Display what will be updated
        self.stdout.write('\nArticles to be updated:')
        for pub_name, articles in articles_by_publication.items():
            self.stdout.write(f'  {pub_name}: {len(articles)} articles')
            for article in articles[:3]:  # Show first 3 articles as examples
                self.stdout.write(f'    - {article.title} ({article.publish_date})')
            if len(articles) > 3:
                self.stdout.write(f'    ... and {len(articles) - 3} more')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN: Would assign magazines to previous month articles'))
            return 0
        
        # Auto-confirm for non-interactive environments
        self.stdout.write(f'\nAuto-assigning magazines to {total_articles} articles...')
        
        # Update articles by matching publication
        updated_count = 0
        with transaction.atomic():
            for article in articles_to_update:
                # Find the matching magazine for this article's publication
                matching_magazine = None
                for magazine in magazines:
                    if (article.publication and magazine.publication and 
                        article.publication.id == magazine.publication.id):
                        matching_magazine = magazine
                        break
                
                if matching_magazine:
                    article.magazine = matching_magazine
                    article.save()
                    updated_count += 1
                    self.stdout.write(f'  Assigned "{matching_magazine.title}" to "{article.title}"')
                else:
                    self.stdout.write(
                        self.style.WARNING(f'  No matching magazine found for article "{article.title}" (Publication: {article.publication.display_name if article.publication else "No Publication"})')
                    )
        
        # Show summary by publication
        self.stdout.write('\nSummary by publication:')
        for pub_name, articles in articles_by_publication.items():
            self.stdout.write(f'  {pub_name}: {len(articles)} articles updated')
        
        return updated_count
