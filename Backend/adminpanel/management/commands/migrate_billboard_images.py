import os
import requests
import urllib.parse
from django.core.management.base import BaseCommand
from django.conf import settings
from adminpanel.models import Billboards


class Command(BaseCommand):
    help = 'Migrate billboard images from Cloudinary to local media storage'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without actually doing it',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force migration even if local file already exists',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        
        self.stdout.write(
            self.style.SUCCESS('Starting billboard image migration...')
        )
        
        # Get all billboards
        billboards = Billboards.objects.all()
        total_billboards = billboards.count()
        
        if total_billboards == 0:
            self.stdout.write(
                self.style.WARNING('No billboards found in database.')
            )
            return
        
        self.stdout.write(f'Found {total_billboards} billboards to process.')
        
        # Create billboards directory if it doesn't exist
        billboards_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', 'billboards')
        if not dry_run:
            os.makedirs(billboards_dir, exist_ok=True)
            self.stdout.write(f'Created directory: {billboards_dir}')
        
        migrated_count = 0
        skipped_count = 0
        error_count = 0
        
        for billboard in billboards:
            try:
                result = self.migrate_billboard_image(billboard, billboards_dir, dry_run, force)
                if result == 'migrated':
                    migrated_count += 1
                elif result == 'skipped':
                    skipped_count += 1
                else:
                    error_count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error processing billboard {billboard.id}: {str(e)}')
                )
                error_count += 1
        
        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write('MIGRATION SUMMARY')
        self.stdout.write('='*50)
        self.stdout.write(f'Total billboards: {total_billboards}')
        self.stdout.write(f'Migrated: {migrated_count}')
        self.stdout.write(f'Skipped: {skipped_count}')
        self.stdout.write(f'Errors: {error_count}')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('\nThis was a DRY RUN. No changes were made.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('\nMigration completed!')
            )

    def migrate_billboard_image(self, billboard, billboards_dir, dry_run, force):
        """Migrate a single billboard image from Cloudinary to local storage"""
        
        if not billboard.image:
            self.stdout.write(
                self.style.WARNING(f'Billboard {billboard.id}: No image URL found')
            )
            return 'skipped'
        
        # Check if it's already a local filename (not a URL)
        if not billboard.image.startswith('http'):
            self.stdout.write(
                self.style.WARNING(f'Billboard {billboard.id}: Already using local storage ({billboard.image})')
            )
            return 'skipped'
        
        # Check if it's a Cloudinary URL
        if 'cloudinary.com' not in billboard.image:
            self.stdout.write(
                self.style.WARNING(f'Billboard {billboard.id}: Not a Cloudinary URL ({billboard.image})')
            )
            return 'skipped'
        
        # Determine file extension from URL
        parsed_url = urllib.parse.urlparse(billboard.image)
        path = parsed_url.path
        file_extension = os.path.splitext(path)[1]
        
        if not file_extension:
            # Default to .jpg if no extension found
            file_extension = '.jpg'
        
        # Create local filename
        local_filename = f"{billboard.id}{file_extension}"
        local_filepath = os.path.join(billboards_dir, local_filename)
        
        # Check if file already exists
        if os.path.exists(local_filepath) and not force:
            self.stdout.write(
                self.style.WARNING(f'Billboard {billboard.id}: Local file already exists ({local_filename})')
            )
            return 'skipped'
        
        if dry_run:
            self.stdout.write(
                f'[DRY RUN] Would download: {billboard.image} -> {local_filename}'
            )
            return 'migrated'
        
        # Download the image
        try:
            self.stdout.write(f'Downloading billboard {billboard.id}: {billboard.image}')
            
            response = requests.get(billboard.image, timeout=30)
            response.raise_for_status()
            
            # Save to local file
            with open(local_filepath, 'wb') as f:
                f.write(response.content)
            
            # Update database
            billboard.image = local_filename
            billboard.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'✓ Migrated billboard {billboard.id}: {local_filename}')
            )
            return 'migrated'
            
        except requests.exceptions.RequestException as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to download billboard {billboard.id}: {str(e)}')
            )
            return 'error'
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error processing billboard {billboard.id}: {str(e)}')
            )
            return 'error'
