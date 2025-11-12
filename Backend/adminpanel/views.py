# myapp/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Comments, Articles, Billboards, Magazines, Authors, Ebook, Videos, Publications, Categories, Contributors
from .serializers import CommentSerializer, ArticleSerializer, BillboardSerializer, MagazineSerializer, AuthorSerializer, EbookSerializer, VideosSerializer, PublicationsSerializer, CategoriesSerializer, ContributorsSerializer
from django.http import HttpResponse
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.timezone import now
from rest_framework.generics import ListAPIView
from django.db.models import Count, Q
from datetime import datetime
import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile


def extract_date_fields(publish_date):
    """
    Helper function to extract year and month from publish_date
    """
    if publish_date:
        if isinstance(publish_date, str):
            # Parse string date
            try:
                date_obj = datetime.fromisoformat(publish_date.replace('Z', '+00:00'))
            except ValueError:
                try:
                    date_obj = datetime.strptime(publish_date, '%Y-%m-%d')
                except ValueError:
                    return None, None
        else:
            # Already a datetime object
            date_obj = publish_date
        
        return date_obj.year, date_obj.month
    return None, None


def home(request):
    return HttpResponse("Welcome to MyApp!")



#  Comments Related Views
class CreateCommentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Comment created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetAllCommentsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        comments = Comments.objects.all().order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response({"message": "Comments retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)

class GetCommentsByUserView(APIView):
    """
    API to get all comments created by a specific user based on their user ID.
    """
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        comments = Comments.objects.filter(user_id=user_id)
        serializer = CommentSerializer(comments, many=True)
        return Response(
            {"message": "Comments retrieved successfully", "data": serializer.data},
            status=status.HTTP_200_OK
        )

class DeleteCommentView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            comment = Comments.objects.get(pk=pk)
            comment.delete()
            return Response({"message": "Comment deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Comments.DoesNotExist:
            return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)



#  Articles Related Views
class CreateArticleView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Create a mutable copy of the request data
        data = request.data.copy()
        
        # Extract year and month from publish_date if provided
        publish_date = data.get('publish_date')
        if publish_date:
            year, month = extract_date_fields(publish_date)
            if year and month:
                data['publish_date_year'] = year
                data['publish_date_month'] = month
        
        serializer = ArticleSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Article created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetAllArticlesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        articles = Articles.objects.all().order_by('-publish_date')
        serializer = ArticleSerializer(articles, many=True)
        return Response({"message": "Articles retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)


class SingleArticleView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            # Get the main article with all related data
            article = Articles.objects.select_related(
                'author', 'publication', 'category', 'magazine'
            ).get(pk=pk)
            
            # Serialize the article
            article_serializer = ArticleSerializer(article)
            article_data = article_serializer.data
            
            # Get author data if exists
            author_data = None
            if article.author:
                author_serializer = AuthorSerializer(article.author)
                author_data = author_serializer.data
            
            # Get recent articles (same language as current article)
            recent_articles = []
            if article.category:
                # Determine if current article is in Urdu based on category
                is_urdu_article = self.is_urdu_article(article.category.name)
                
                # Get recent articles from the same publication, filtered by language
                recent_articles_query = Articles.objects.filter(
                    publication=article.publication,
                    status='Active'
                ).exclude(id=pk).select_related('category').order_by('-publish_date')
                
                # Filter by language if needed
                if is_urdu_article:
                    recent_articles_query = recent_articles_query.filter(
                        category__name__icontains='urdu'
                    )
                else:
                    recent_articles_query = recent_articles_query.exclude(
                        category__name__icontains='urdu'
                    )
                
                # Apply slice after all filters
                recent_articles_query = recent_articles_query[:10]
                
                # Serialize recent articles
                recent_serializer = ArticleSerializer(recent_articles_query, many=True)
                recent_articles = recent_serializer.data
            
            # Get category display name
            category_display_name = None
            if article.category:
                category_display_name = article.category.display_name
            
            # Get publication info
            publication_data = None
            if article.publication:
                publication_data = {
                    'id': article.publication.id,
                    'name': article.publication.name,
                    'display_name': article.publication.display_name
                }
            
            return Response({
                "article": article_data,
                "author": author_data,
                "recent_articles": recent_articles,
                "category_display_name": category_display_name,
                "publication": publication_data
            }, status=status.HTTP_200_OK)
            
        except Articles.DoesNotExist:
            return Response({"error": "Article not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def is_urdu_article(self, category_name):
        """Helper method to determine if article is in Urdu based on category"""
        if not category_name:
            return False
        urdu_categories = [
            'in-focus-urdu',
            'trending-urdu', 
            'national-international-news-urdu',
            'armed-forces-news-urdu',
            'in-focus-urdu-kids',
            'trending-urdu-kids', 
            'national-international-news-urdu-kids'
        ]
        return category_name.lower() in urdu_categories or 'urdu' in category_name.lower()

    def put(self, request, pk):
        try:
            article = Articles.objects.get(pk=pk)
            
            # Create a mutable copy of the request data
            data = request.data.copy()
            
            # Extract year and month from publish_date if provided
            publish_date = data.get('publish_date')
            if publish_date:
                year, month = extract_date_fields(publish_date)
                if year and month:
                    data['publish_date_year'] = year
                    data['publish_date_month'] = month
            
            serializer = ArticleSerializer(article, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Articles.DoesNotExist:
            return Response({"error": "Article not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            article = Articles.objects.get(pk=pk)
            article.delete()
            return Response({"message": "Article deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Articles.DoesNotExist:
            return Response({"error": "Article not found"}, status=status.HTTP_404_NOT_FOUND)


class GetTopArticlesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        articles = Articles.objects.filter(publish_date__lte=now()).order_by('-publish_date')[:10]
        serializer = ArticleSerializer(articles, many=True)
        return Response({"message": "Top 10 recent articles retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)


class GetArticlesByUserView(APIView):
    """
    API to get all articles created by a specific author based on their author ID.
    """
    permission_classes = [AllowAny]

    def get(self, request, author_id):
        articles = Articles.objects.filter(author_id=author_id)
        serializer = ArticleSerializer(articles, many=True)
        return Response(
            {"message": "Articles retrieved successfully", "data": serializer.data},
            status=status.HTTP_200_OK
        )


# Billboards Related Views
class CreateBillboardView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Remove location uniqueness constraint to allow multiple billboards per location
        serializer = BillboardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Billboard created successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetAllBillboardsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters for filtering
        location = request.GET.get('location')
        status_filter = request.GET.get('status')
        search = request.GET.get('search')  # Add search parameter for title search
        
        # Build filter
        filter_kwargs = {}
        if location:
            filter_kwargs['location'] = location
        if status_filter:
            filter_kwargs['status'] = status_filter
        
        # Filter billboards
        billboards = Billboards.objects.filter(**filter_kwargs)
        
        # Add search filter for title if provided (before ordering and pagination)
        if search:
            billboards = billboards.filter(title__icontains=search)
        
        # Order by created date
        billboards = billboards.order_by('-created')
        
        # Get total count before pagination
        total_count = billboards.count()
        
        # Get pagination parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 50)  # Default 50 billboards per page
        
        # Apply pagination
        try:
            page = int(page)
            page_size = int(page_size)
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if page_size < 1:
                page_size = 50
            if page_size > 100:  # Max 100 billboards per page
                page_size = 100
            
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Apply pagination
            billboards = billboards[offset:offset + page_size]
        except ValueError:
            return Response({
                "error": "Invalid page or page_size parameter. Must be integers."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = BillboardSerializer(billboards, many=True)
        
        # Calculate pagination metadata
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0
        
        return Response({
            "message": "Billboards retrieved successfully", 
            "data": serializer.data,
            "pagination": {
                "current_page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "location": location,
                "status": status_filter,
                "search": search
            }
        }, status=status.HTTP_200_OK)


class SingleBillboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            billboard = Billboards.objects.get(pk=pk)
            serializer = BillboardSerializer(billboard)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Billboards.DoesNotExist:
            return Response({"error": "Billboard not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            billboard = Billboards.objects.get(pk=pk)
            # Remove location uniqueness constraint to allow multiple billboards per location
            serializer = BillboardSerializer(billboard, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Billboards.DoesNotExist:
            return Response({"error": "Billboard not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            billboard = Billboards.objects.get(pk=pk)
            billboard.delete()
            return Response({"message": "Billboard deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Billboards.DoesNotExist:
            return Response({"error": "Billboard not found"}, status=status.HTTP_404_NOT_FOUND)


class DeleteBillboardView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            billboard = Billboards.objects.get(pk=pk)
            billboard.delete()
            return Response({"message": "Billboard deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Billboards.DoesNotExist:
            return Response({"error": "Billboard not found"}, status=status.HTTP_404_NOT_FOUND)


class GetBillboardByPositionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, location):
        try:
            billboard = Billboards.objects.get(location=location)
            serializer = BillboardSerializer(billboard)
            return Response({"message": "Billboard retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Billboards.DoesNotExist:
            return Response({"error": f"No billboard found at location {location}"}, status=status.HTTP_404_NOT_FOUND)

class GetBillboardsByLocationView(APIView):
    """
    API to get ALL billboards for a specific location (for slider functionality)
    """
    permission_classes = [AllowAny]

    def get(self, request, location):
        try:
            billboards = Billboards.objects.filter(location=location, status='Active').order_by('-id')
            serializer = BillboardSerializer(billboards, many=True)
            return Response({
                "message": f"Billboards retrieved successfully for location {location}", 
                "data": serializer.data,
                "count": billboards.count()
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error retrieving billboards: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Magazines Related Views
class GetAllMagazinesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters for filtering
        publication_name = request.GET.get('publication')
        status_filter = request.GET.get('status')
        year_filter = request.GET.get('year')
        month_filter = request.GET.get('month')
        language_filter = request.GET.get('language')
        
        # Build filter
        filter_kwargs = {}
        
        # Add publication filter
        if publication_name:
            try:
                # Try to find by name first, then by display_name
                try:
                    publication = Publications.objects.get(name=publication_name, status='Active')
                except Publications.DoesNotExist:
                    publication = Publications.objects.get(display_name=publication_name, status='Active')
                filter_kwargs['publication_id'] = publication.id
            except Publications.DoesNotExist:
                return Response({
                    "error": f"Publication '{publication_name}' not found or inactive"
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Add status filter
        if status_filter:
            filter_kwargs['status'] = status_filter
        
        # Add year filter
        if year_filter:
            try:
                filter_kwargs['year'] = int(year_filter)
            except ValueError:
                return Response({
                    "error": "Invalid year parameter. Must be an integer."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add month filter
        if month_filter:
            filter_kwargs['month'] = month_filter
        
        # Add language filter
        if language_filter:
            filter_kwargs['language'] = language_filter
        
        # Filter magazines
        magazines = Magazines.objects.filter(**filter_kwargs).order_by('-publish_date')
        
        # Get total count before pagination
        total_count = magazines.count()
        
        # Get pagination parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 50)  # Default 50 magazines per page
        
        # Apply pagination
        try:
            page = int(page)
            page_size = int(page_size)
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if page_size < 1:
                page_size = 50
            if page_size > 100:  # Max 100 magazines per page
                page_size = 100
            
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Apply pagination
            magazines = magazines[offset:offset + page_size]
        except ValueError:
            return Response({
                "error": "Invalid page or page_size parameter. Must be integers."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = MagazineSerializer(magazines, many=True)
        
        # Calculate pagination metadata
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0
        
        return Response({
            "message": "Magazines retrieved successfully", 
            "data": serializer.data,
            "pagination": {
                "current_page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "publication": publication_name,
                "status": status_filter,
                "year": year_filter,
                "month": month_filter,
                "language": language_filter
            }
        }, status=status.HTTP_200_OK)

class SingleMagazineView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            magazine = Magazines.objects.get(pk=pk)
            serializer = MagazineSerializer(magazine)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Magazines.DoesNotExist:
            return Response({"error": "Magazine not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            magazine = Magazines.objects.get(pk=pk)
            
            # Check if any articles are referencing this magazine
            articles_count = Articles.objects.filter(magazine=magazine).count()
            
            if articles_count > 0:
                return Response({
                    "error": f"Cannot delete magazine '{magazine.title}' because {articles_count} articles are referencing it. Please reassign or remove these articles first."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            magazine.delete()
            return Response({"message": "Magazine deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Magazines.DoesNotExist:
            return Response({"error": "Magazine not found"}, status=status.HTTP_404_NOT_FOUND)

class ForceDeleteMagazineView(APIView):
    """
    API to force delete a magazine by first unassigning all articles referencing it.
    Use with caution as this will remove magazine assignments from articles.
    """
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            magazine = Magazines.objects.get(pk=pk)
            
            # Get articles referencing this magazine
            articles = Articles.objects.filter(magazine=magazine)
            articles_count = articles.count()
            
            if articles_count > 0:
                # Unassign articles from this magazine
                articles.update(magazine=None)
                
            magazine.delete()
            
            message = f"Magazine '{magazine.title}' deleted successfully"
            if articles_count > 0:
                message += f". {articles_count} articles were unassigned from this magazine."
            
            return Response({"message": message}, status=status.HTTP_200_OK)
        except Magazines.DoesNotExist:
            return Response({"error": "Magazine not found"}, status=status.HTTP_404_NOT_FOUND)

class CreateOrUpdateMagazineView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MagazineSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Magazine created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            magazine = Magazines.objects.get(pk=pk)
            serializer = MagazineSerializer(magazine, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Magazine updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Magazines.DoesNotExist:
            return Response({"error": "Magazine not found"}, status=status.HTTP_404_NOT_FOUND)


class GetAllEbooksView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters for filtering
        status_filter = request.GET.get('status')
        language_filter = request.GET.get('language')
        direction_filter = request.GET.get('direction')
        archive_filter = request.GET.get('is_archived')
        search = request.GET.get('search')  # Add search parameter for title search
        
        # Build filter
        filter_kwargs = {}
        
        # Add status filter
        if status_filter:
            filter_kwargs['status'] = status_filter
        
        # Add language filter
        if language_filter:
            filter_kwargs['language'] = language_filter
        
        # Add direction filter
        if direction_filter:
            filter_kwargs['direction'] = direction_filter
        
        # Add archive filter
        if archive_filter:
            if archive_filter.lower() == 'true':
                filter_kwargs['is_archived'] = True
            elif archive_filter.lower() == 'false':
                filter_kwargs['is_archived'] = False
        
        # Filter ebooks
        ebooks = Ebook.objects.filter(**filter_kwargs)
        
        # Add search filter for title if provided (before ordering and pagination)
        if search:
            ebooks = ebooks.filter(title__icontains=search)
        
        # Order by publish date
        ebooks = ebooks.order_by('-publish_date')
        
        # Get total count before pagination
        total_count = ebooks.count()
        
        # Get pagination parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 50)  # Default 50 ebooks per page
        
        # Apply pagination
        try:
            page = int(page)
            page_size = int(page_size)
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if page_size < 1:
                page_size = 50
            if page_size > 100:  # Max 100 ebooks per page
                page_size = 100
            
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Apply pagination
            ebooks = ebooks[offset:offset + page_size]
        except ValueError:
            return Response({
                "error": "Invalid page or page_size parameter. Must be integers."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = EbookSerializer(ebooks, many=True, context={'request': request})
        
        # Calculate pagination metadata
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0
        
        return Response({
            "message": "Ebooks retrieved successfully", 
            "data": serializer.data,
            "pagination": {
                "current_page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "status": status_filter,
                "language": language_filter,
                "direction": direction_filter,
                "is_archived": archive_filter,
                "search": search
            }
        }, status=status.HTTP_200_OK)

class SingleEbookView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            ebook = Ebook.objects.get(pk=pk)
            serializer = EbookSerializer(ebook, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Ebook.DoesNotExist:
            return Response({"error": "Ebook not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            ebook = Ebook.objects.get(pk=pk)
            ebook.delete()
            return Response({"message": "Ebook deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Ebook.DoesNotExist:
            return Response({"error": "Ebook not found"}, status=status.HTTP_404_NOT_FOUND)

class CreateOrUpdateEbookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EbookSerializer(data=request.data)
        if serializer.is_valid():
            ebook = serializer.save()
            response_serializer = EbookSerializer(ebook, context={'request': request})
            return Response({"message": "Ebook created successfully", "data": response_serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            ebook = Ebook.objects.get(pk=pk)
            serializer = EbookSerializer(ebook, data=request.data, partial=True)
            if serializer.is_valid():
                ebook = serializer.save()
                response_serializer = EbookSerializer(ebook, context={'request': request})
                return Response({"message": "Ebook updated successfully", "data": response_serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Ebook.DoesNotExist:
            return Response({"error": "Magazine not found"}, status=status.HTTP_404_NOT_FOUND)



class GetArchivedEbooksView(ListAPIView):
    """
    API to retrieve all ebooks that are archived.
    """
    permission_classes = [AllowAny]
    serializer_class = EbookSerializer

    def get_queryset(self):
        return Ebook.objects.filter(is_archived=True)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class GetActiveEbooksView(APIView):
    """
    API to retrieve all ebooks that are not archived.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        ebooks = Ebook.objects.filter(is_archived=False)
        serializer = EbookSerializer(ebooks, many=True, context={'request': request})
        return Response({"message": "Active ebooks retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)

class ToggleEbookArchiveView(APIView):
    """
    API to toggle the archive status of an ebook.
    """
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            ebook = Ebook.objects.get(pk=pk)
            ebook.is_archived = not ebook.is_archived
            ebook.save()
            status_text = "archived" if ebook.is_archived else "unarchived"
            return Response(
                {"message": f"Ebook {status_text} successfully", "is_archived": ebook.is_archived},
                status=status.HTTP_200_OK
            )
        except Ebook.DoesNotExist:
            return Response({"error": "Ebook not found"}, status=status.HTTP_404_NOT_FOUND)

# Authors Related Views
class CreateAuthorView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AuthorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Author created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetAllAuthorsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters for filtering
        status_filter = request.GET.get('status')
        category_filter = request.GET.get('category')
        search = request.GET.get('search')  # Add search parameter for name/email search
        
        # Build filter
        filter_kwargs = {}
        
        # Add status filter
        if status_filter:
            filter_kwargs['status'] = status_filter
        
        # Add category filter
        if category_filter:
            filter_kwargs['category'] = category_filter
        
        # Filter authors
        authors = Authors.objects.filter(**filter_kwargs)
        
        # Add search filter for author_name or email if provided (before ordering and pagination)
        if search:
            authors = authors.filter(
                Q(author_name__icontains=search) | Q(email__icontains=search)
            )
        
        # Order by id
        authors = authors.order_by('-id')
        
        # Get total count before pagination
        total_count = authors.count()
        
        # Get pagination parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 50)  # Default 50 authors per page
        
        # Apply pagination
        try:
            page = int(page)
            page_size = int(page_size)
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if page_size < 1:
                page_size = 50
            if page_size > 100:  # Max 100 authors per page
                page_size = 100
            
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Apply pagination
            authors = authors[offset:offset + page_size]
        except ValueError:
            return Response({
                "error": "Invalid page or page_size parameter. Must be integers."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AuthorSerializer(authors, many=True)
        
        # Calculate pagination metadata
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0
        
        return Response({
            "message": "Authors retrieved successfully", 
            "data": serializer.data,
            "pagination": {
                "current_page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "status": status_filter,
                "category": category_filter,
                "search": search
            }
        }, status=status.HTTP_200_OK)

class SingleAuthorView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            author = Authors.objects.get(pk=pk)
            serializer = AuthorSerializer(author)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Authors.DoesNotExist:
            return Response({"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            author = Authors.objects.get(pk=pk)
            old_author_name = author.author_name  # Store the old author name
            serializer = AuthorSerializer(author, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Note: Articles are now linked to authors via author_id foreign key
                # No need to update article references since they use the author's ID, not name
                
                return Response({"message": "Author updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Authors.DoesNotExist:
            return Response({"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            author = Authors.objects.get(pk=pk)
            author.delete()
            return Response({"message": "Author deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Authors.DoesNotExist:
            return Response({"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND)


def hello_view(request):
    return HttpResponse("Hello")

# Videos Related Views
class GetAllVideosView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        videos = Videos.objects.filter(status='Active').order_by('order', 'created_at')
        serializer = VideosSerializer(videos, many=True)
        return Response({"message": "Videos retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)


class SingleVideoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            video = Videos.objects.get(pk=pk)
            serializer = VideosSerializer(video)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Videos.DoesNotExist:
            return Response({"error": "Video not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            video = Videos.objects.get(pk=pk)
            serializer = VideosSerializer(video, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Videos.DoesNotExist:
            return Response({"error": "Video not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            video = Videos.objects.get(pk=pk)
            video.delete()
            return Response({"message": "Video deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Videos.DoesNotExist:
            return Response({"error": "Video not found"}, status=status.HTTP_404_NOT_FOUND)


class CreateVideoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VideosSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Video created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetAllVideosManagementView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters for filtering
        status_filter = request.GET.get('status')
        language_filter = request.GET.get('language')
        search = request.GET.get('search')  # Add search parameter for title search
        
        # Build filter
        filter_kwargs = {}
        
        # Add status filter
        if status_filter:
            filter_kwargs['status'] = status_filter
        
        # Add language filter
        if language_filter:
            filter_kwargs['language'] = language_filter
        
        # Filter videos
        videos = Videos.objects.filter(**filter_kwargs)
        
        # Add search filter for title if provided (before ordering and pagination)
        if search:
            videos = videos.filter(title__icontains=search)
        
        # Order by created_at
        videos = videos.order_by('-created_at')
        
        # Get total count before pagination
        total_count = videos.count()
        
        # Get pagination parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 50)  # Default 50 videos per page
        
        # Apply pagination
        try:
            page = int(page)
            page_size = int(page_size)
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if page_size < 1:
                page_size = 50
            if page_size > 100:  # Max 100 videos per page
                page_size = 100
            
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Apply pagination
            videos = videos[offset:offset + page_size]
        except ValueError:
            return Response({
                "error": "Invalid page or page_size parameter. Must be integers."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = VideosSerializer(videos, many=True)
        
        # Calculate pagination metadata
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0
        
        return Response({
            "message": "Videos retrieved successfully", 
            "data": serializer.data,
            "pagination": {
                "current_page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "status": status_filter,
                "language": language_filter,
                "search": search
            }
        }, status=status.HTTP_200_OK)


class GetHilalDigitalView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get first active video (for left side)
        featured_video = Videos.objects.filter(status='Active').first()
        
        # Get other active videos (for right side, excluding featured)
        other_videos = Videos.objects.filter(
            status='Active'
        ).order_by('order', 'created_at')[1:]  # Skip first one, get all remaining
        
        featured_serializer = VideosSerializer(featured_video) if featured_video else None
        other_serializer = VideosSerializer(other_videos, many=True)
        
        return Response({
            "message": "Hilal Digital data retrieved successfully",
            "data": {
                "featured_video": featured_serializer.data if featured_serializer else None,
                "other_videos": other_serializer.data
            }
        }, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
    """
    API to get dashboard statistics for admin panel.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Get total counts
            total_articles = Articles.objects.count()
            total_magazines = Magazines.objects.count()
            total_ebooks = Ebook.objects.count()
            total_authors = Authors.objects.count()
            total_comments = Comments.objects.count()
            total_videos = Videos.objects.count()

            stats = {
                "total_articles": total_articles,
                "total_magazines": total_magazines,
                "total_ebooks": total_ebooks,
                "total_authors": total_authors,
                "total_comments": total_comments,
                "total_videos": total_videos,
            }

            return Response({
                "message": "Dashboard statistics retrieved successfully",
                "data": stats
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": "Failed to retrieve dashboard statistics",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Publications Related Views
class CreatePublicationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PublicationsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Publication created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetAllPublicationsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters for filtering
        status_filter = request.GET.get('status')
        search = request.GET.get('search')  # Add search parameter for name/display_name search
        
        # Build filter
        filter_kwargs = {}
        
        # Add status filter
        if status_filter:
            filter_kwargs['status'] = status_filter
        
        # Filter publications
        publications = Publications.objects.filter(**filter_kwargs)
        
        # Add search filter for name or display_name if provided (before ordering and pagination)
        if search:
            publications = publications.filter(
                Q(name__icontains=search) | Q(display_name__icontains=search)
            )
        
        # Order by id
        publications = publications.order_by('-id')
        
        # Get total count before pagination
        total_count = publications.count()
        
        # Get pagination parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 50)  # Default 50 publications per page
        
        # Apply pagination
        try:
            page = int(page)
            page_size = int(page_size)
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if page_size < 1:
                page_size = 50
            if page_size > 100:  # Max 100 publications per page
                page_size = 100
            
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Apply pagination
            publications = publications[offset:offset + page_size]
        except ValueError:
            return Response({
                "error": "Invalid page or page_size parameter. Must be integers."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = PublicationsSerializer(publications, many=True)
        
        # Calculate pagination metadata
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0
        
        return Response({
            "message": "Publications retrieved successfully", 
            "data": serializer.data,
            "pagination": {
                "current_page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "status": status_filter,
                "search": search
            }
        }, status=status.HTTP_200_OK)


class SinglePublicationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            publication = Publications.objects.get(pk=pk)
            serializer = PublicationsSerializer(publication)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Publications.DoesNotExist:
            return Response({"error": "Publication not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            publication = Publications.objects.get(pk=pk)
            serializer = PublicationsSerializer(publication, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Publication updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Publications.DoesNotExist:
            return Response({"error": "Publication not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            publication = Publications.objects.get(pk=pk)
            publication.delete()
            return Response({"message": "Publication deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Publications.DoesNotExist:
            return Response({"error": "Publication not found"}, status=status.HTTP_404_NOT_FOUND)


class GetArticlesByPublicationView(APIView):
    """
    API to get all articles for a specific publication.
    """
    permission_classes = [AllowAny]

    def get(self, request, publication_id):
        articles = Articles.objects.filter(publication_id=publication_id)
        serializer = ArticleSerializer(articles, many=True)
        return Response(
            {"message": "Articles retrieved successfully", "data": serializer.data},
            status=status.HTTP_200_OK
        )




class GetArticlesByPublicationNameView(APIView):
    """
    API to get articles for a specific publication by name and date range.
    Accepts publication name, month, and year as query parameters.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from datetime import datetime
        
        publication_name = request.GET.get('publication', 'Hilal English')
        month = request.GET.get('month')
        year = request.GET.get('year')
        
        try:
            # Get publication by name first, then by display_name
            try:
                publication = Publications.objects.get(name=publication_name, status='Active')
            except Publications.DoesNotExist:
                publication = Publications.objects.get(display_name=publication_name, status='Active')
            
            # Use provided month/year or default to current month/year
            now = datetime.now()
            filter_month = int(month) if month else now.month
            filter_year = int(year) if year else now.year
            
            # Build the filter
            filter_kwargs = {
                'publication_id': publication.id,
                'status': 'Active'
            }
            
            # Add date filters if provided
            if month and year:
                filter_kwargs['publish_date__month'] = filter_month
                filter_kwargs['publish_date__year'] = filter_year
            
            # Filter articles
            articles = Articles.objects.filter(**filter_kwargs).order_by('-publish_date')
            
            serializer = ArticleSerializer(articles, many=True)
            return Response({
                "message": f"{publication_name} articles retrieved successfully", 
                "data": serializer.data,
                "publication": publication.name,
                "publication_id": publication.id,
                "month": filter_month,
                "year": filter_year
            }, status=status.HTTP_200_OK)
            
        except Publications.DoesNotExist:
            return Response({
                "error": f"Publication '{publication_name}' not found or inactive"
            }, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({
                "error": "Invalid month or year parameter. Must be integers."
            }, status=status.HTTP_400_BAD_REQUEST)


class GetActivePublicationsView(APIView):
    """
    API to get only active publications for navigation menu.
    Returns id, name, display_name, cover_image, description, and status fields.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        publications = Publications.objects.filter(status='Active').values('id', 'name', 'display_name', 'cover_image', 'description', 'status')
        return Response({
            "message": "Active publications retrieved successfully", 
            "data": list(publications)
        }, status=status.HTTP_200_OK)


class GetFilteredMagazineArticlesView(APIView):
    """
    API to get filtered magazine articles by year, month, and publication.
    This API looks for Magazine records (not Articles) by year/month/publication.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Get query parameters
            year = request.query_params.get('year')
            month = request.query_params.get('month')
            publication = request.query_params.get('publication')
            
            # Build the query for Magazines
            query = Q()
            
            # Filter by publication if provided
            if publication:
                query &= Q(publication__name=publication)
            
            # Filter by year and month if provided
            if year and month:
                # Convert month number to month name
                month_names = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December']
                month_name = month_names[int(month)]
                query &= Q(year=int(year), month=month_name)
            elif year:
                # Filter by year only
                query &= Q(year=int(year))
            
            # Get magazines with related data
            magazines = Magazines.objects.filter(query).select_related('publication').order_by('-year', '-month')
            
            # Serialize the data
            magazines_data = []
            for magazine in magazines:
                # Get article count for this magazine
                article_count = Articles.objects.filter(
                    magazine=magazine,
                    status='Active'
                ).count()
                
                # If no articles assigned to magazine, try to get articles from the month/year
                if article_count == 0:
                    try:
                        month_num = datetime.strptime(magazine.month, '%B').month
                        article_count = Articles.objects.filter(
                            publication=magazine.publication,
                            status='Active',
                            publish_date__year=magazine.year,
                            publish_date__month=month_num
                        ).count()
                    except ValueError:
                        pass
                
                magazine_data = {
                    'id': magazine.id,
                    'title': magazine.title,
                    'cover_image': magazine.cover_image,
                    'doc_url': magazine.doc_url,
                    'year': magazine.year,
                    'month': magazine.month,
                    'month_num': datetime.strptime(magazine.month, '%B').month if magazine.month else None,
                    'article_count': article_count,
                    'publication_name': magazine.publication.name if magazine.publication else None,
                    'publication_display_name': magazine.publication.display_name if magazine.publication else None,
                }
                magazines_data.append(magazine_data)
            
            return Response({
                "message": "Filtered magazine articles retrieved successfully",
                "data": magazines_data,
                "filters": {
                    "year": year,
                    "month": month,
                    "publication": publication
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"Error retrieving filtered articles: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Categories management views
class CreateCategoryView(APIView):
    """
    API to create a new category.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CategoriesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Category created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetAllCategoriesView(APIView):
    """
    API to get all categories with pagination and filtering.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Get query parameters for filtering
        status_filter = request.GET.get('status')
        publication_filter = request.GET.get('publication')
        search = request.GET.get('search')  # Add search parameter for name/display_name search
        
        # Build filter
        filter_kwargs = {}
        
        # Add status filter
        if status_filter:
            filter_kwargs['status'] = status_filter
        
        # Add publication filter
        if publication_filter:
            try:
                publication_id = int(publication_filter)
                filter_kwargs['publication_id'] = publication_id
            except ValueError:
                return Response({
                    "error": "Invalid publication parameter. Must be an integer ID."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Filter categories
        categories = Categories.objects.filter(**filter_kwargs).select_related('publication')
        
        # Add search filter for name or display_name if provided (before ordering and pagination)
        if search:
            categories = categories.filter(
                Q(name__icontains=search) | Q(display_name__icontains=search)
            )
        
        # Order by created_at
        categories = categories.order_by('-created_at')
        
        # Get total count before pagination
        total_count = categories.count()
        
        # Get pagination parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 50)  # Default 50 categories per page
        
        # Apply pagination
        try:
            page = int(page)
            page_size = int(page_size)
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if page_size < 1:
                page_size = 50
            if page_size > 100:  # Max 100 categories per page
                page_size = 100
            
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Apply pagination
            categories = categories[offset:offset + page_size]
        except ValueError:
            return Response({
                "error": "Invalid page or page_size parameter. Must be integers."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CategoriesSerializer(categories, many=True)
        
        # Calculate pagination metadata
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0
        
        return Response({
            "message": "Categories retrieved successfully",
            "data": serializer.data,
            "pagination": {
                "current_page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "status": status_filter,
                "publication": publication_filter,
                "search": search
            }
        }, status=status.HTTP_200_OK)


class GetActiveCategoriesView(APIView):
    """
    API to get only active categories for navigation menu.
    Returns id, name, display_name, publication, and status fields.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Categories.objects.filter(status='Active').select_related('publication').values(
            'id', 'name', 'display_name', 'publication', 'publication__name', 'status'
        )
        
        # Transform the data to include publication_name
        categories_data = []
        for category in categories:
            categories_data.append({
                'id': category['id'],
                'name': category['name'],
                'display_name': category['display_name'],
                'publication': category['publication'],
                'publication_name': category['publication__name'],
                'status': category['status']
            })
        
        return Response({
            "message": "Active categories retrieved successfully",
            "data": categories_data
        }, status=status.HTTP_200_OK)


class SingleCategoryView(APIView):
    """
    API to get, update, or delete a single category.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            category = Categories.objects.get(pk=pk)
            serializer = CategoriesSerializer(category)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Categories.DoesNotExist:
            return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            category = Categories.objects.get(pk=pk)
            serializer = CategoriesSerializer(category, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Category updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Categories.DoesNotExist:
            return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            category = Categories.objects.get(pk=pk)
            category.delete()
            return Response({"message": "Category deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Categories.DoesNotExist:
            return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)


# Unified Articles Filter API
class GetFilteredArticlesView(APIView):
    """
    Unified API to get articles filtered by publication, magazine, category, and date.
    Accepts multiple optional query parameters for flexible filtering.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from datetime import datetime
        
        # Get query parameters
        publication_name = request.GET.get('publication')
        magazine_id = request.GET.get('magazine_id')
        category_id = request.GET.get('category_id')
        category_name = request.GET.get('category')  # Add category name parameter
        author_id = request.GET.get('author_id')  # Add author_id parameter
        month = request.GET.get('month')
        year = request.GET.get('year')
        count = request.GET.get('count')  # Add count parameter
        search = request.GET.get('search')  # Add search parameter for title search
        
        # Build the filter
        filter_kwargs = {
            'status': 'Active'
        }
        
        # Add publication filter - prioritize name over display_name
        if publication_name:
            try:
                # Try to find by name first, then by display_name
                try:
                    publication = Publications.objects.get(name=publication_name, status='Active')
                except Publications.DoesNotExist:
                    publication = Publications.objects.get(display_name=publication_name, status='Active')
                filter_kwargs['publication_id'] = publication.id
            except Publications.DoesNotExist:
                return Response({
                    "error": f"Publication '{publication_name}' not found or inactive"
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Add magazine filter
        if magazine_id:
            try:
                magazine_id = int(magazine_id)
                filter_kwargs['magazine_id'] = magazine_id
            except ValueError:
                return Response({
                    "error": "Invalid magazine_id parameter. Must be an integer."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add category filter - support both category_id and category name
        if category_id:
            try:
                category_id = int(category_id)
                # Verify category exists and is active
                try:
                    category = Categories.objects.get(id=category_id, status='Active')
                    filter_kwargs['category_id'] = category_id
                except Categories.DoesNotExist:
                    return Response({
                        "error": f"Category with ID {category_id} not found or inactive"
                    }, status=status.HTTP_404_NOT_FOUND)
            except ValueError:
                return Response({
                    "error": "Invalid category_id parameter. Must be an integer."
                }, status=status.HTTP_400_BAD_REQUEST)
        elif category_name:
            try:
                # Find category by name within the publication
                if publication_name:
                    try:
                        # Try to find by name first, then by display_name
                        try:
                            publication = Publications.objects.get(name=publication_name, status='Active')
                        except Publications.DoesNotExist:
                            publication = Publications.objects.get(display_name=publication_name, status='Active')
                        
                        category = Categories.objects.get(
                            name=category_name, 
                            publication=publication, 
                            status='Active'
                        )
                        filter_kwargs['category_id'] = category.id
                    except (Publications.DoesNotExist, Categories.DoesNotExist):
                        return Response({
                            "error": f"Category '{category_name}' not found for publication '{publication_name}'"
                        }, status=status.HTTP_404_NOT_FOUND)
                else:
                    return Response({
                        "error": "Publication parameter is required when using category name"
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({
                    "error": f"Error finding category '{category_name}': {str(e)}"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add author filter
        if author_id:
            try:
                author_id = int(author_id)
                filter_kwargs['author_id'] = author_id
            except ValueError:
                return Response({
                    "error": "Invalid author_id parameter. Must be an integer."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add date filters
        if month and year:
            try:
                filter_month = int(month)
                filter_year = int(year)
                filter_kwargs['publish_date__month'] = filter_month
                filter_kwargs['publish_date__year'] = filter_year
            except ValueError:
                return Response({
                    "error": "Invalid month or year parameter. Must be integers."
                }, status=status.HTTP_400_BAD_REQUEST)
        elif month or year:
            # If only one is provided, use current for the missing one
            now = datetime.now()
            filter_month = int(month) if month else now.month
            filter_year = int(year) if year else now.year
            filter_kwargs['publish_date__month'] = filter_month
            filter_kwargs['publish_date__year'] = filter_year
        
        # Filter articles with optimized queries using select_related to reduce database hits
        articles = Articles.objects.filter(**filter_kwargs).select_related(
            'author', 'publication', 'magazine', 'category'
        )
        
        # Add search filter for title if provided (before ordering and pagination)
        if search:
            articles = articles.filter(title__icontains=search)
        
        # Order by publish date
        articles = articles.order_by('-publish_date')
        
        # Get total count before pagination
        total_count = articles.count()
        
        # Get pagination parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 50)  # Default 50 articles per page
        
        # Apply count limit if provided (for backward compatibility)
        if count:
            try:
                count_limit = int(count)
                articles = articles[:count_limit]
                total_count = min(total_count, count_limit)
                page_size = count_limit
                page = 1
            except ValueError:
                return Response({
                    "error": "Invalid count parameter. Must be an integer."
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Apply pagination
            try:
                page = int(page)
                page_size = int(page_size)
                
                # Validate pagination parameters
                if page < 1:
                    page = 1
                if page_size < 1:
                    page_size = 50
                if page_size > 100:  # Max 100 articles per page to prevent performance issues
                    page_size = 100
                
                # Calculate offset
                offset = (page - 1) * page_size
                
                # Apply pagination
                articles = articles[offset:offset + page_size]
            except ValueError:
                return Response({
                    "error": "Invalid page or page_size parameter. Must be integers."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ArticleSerializer(articles, many=True)
        
        # Calculate pagination metadata
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0
        
        return Response({
            "message": "Filtered articles retrieved successfully",
            "data": serializer.data,
            "pagination": {
                "current_page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "publication": publication_name,
                "magazine_id": magazine_id,
                "category_id": category_id,
                "category": category_name,
                "month": month,
                "year": year,
                "count": count,
                "search": search
            }
        }, status=status.HTTP_200_OK)


class GetArticlesByPublicationView(APIView):
    """
    API to get articles for a specific publication for the current month.
    This replaces the old get-articles API with our unified filter approach.
    """
    permission_classes = [AllowAny]

    def get(self, request, publication_name):
        from datetime import datetime
        
        try:
            # Get the publication by name first, then by display_name
            try:
                publication = Publications.objects.get(name=publication_name, status='Active')
            except Publications.DoesNotExist:
                publication = Publications.objects.get(display_name=publication_name, status='Active')
            
            # Get current month and year
            now = datetime.now()
            current_month = now.month
            current_year = now.year
            
            # Filter articles by publication and current month
            articles = Articles.objects.filter(
                publication_id=publication.id,
                status='Active',
                publish_date__month=current_month,
                publish_date__year=current_year
            ).order_by('-publish_date')
            
            serializer = ArticleSerializer(articles, many=True)
            return Response({
                "message": f"Articles for {publication_name} (current month) retrieved successfully",
                "data": serializer.data,
                "publication": {
                    "id": publication.id,
                    "name": publication.name
                },
                "month": current_month,
                "year": current_year
            }, status=status.HTTP_200_OK)
            
        except Publications.DoesNotExist:
            return Response({
                "error": f"Publication '{publication_name}' not found or inactive"
            }, status=status.HTTP_404_NOT_FOUND)

class GetTrendingArticlesView(APIView):
    """
    API to get mixed trending articles for a specific publication.
    For hilal-english: 6 articles (2 from in-focus, 2 from national-news, 2 from misc)
    For hilal-urdu: 6 articles (2 from special-focus/in-focus equivalent, 2 from national-and-international-issues, 2 from misc)
    For others: Get articles from available categories (2 from each category, up to 6 total)
    """
    permission_classes = [AllowAny]

    def get(self, request, publication_name):
        try:
            # Get the publication by name first, then by display_name
            try:
                publication = Publications.objects.get(name=publication_name, status='Active')
            except Publications.DoesNotExist:
                publication = Publications.objects.get(display_name=publication_name, status='Active')
            
            # Normalize publication name for comparison (handle spaces, hyphens, case)
            pub_name_lower = publication_name.lower().replace(' ', '-').replace('_', '-')
            articles = []
            
            # For hilal-english: use specific categories (in-focus, national-news, miscellaneous)
            if pub_name_lower in ['hilal-english', 'hilalenglish']:
                # Get in-focus articles (2) - Left column
                infocus_articles = []
                try:
                    infocus_category = Categories.objects.get(
                        name='in-focus',
                        publication=publication,
                        status='Active'
                    )
                    infocus_articles = list(Articles.objects.filter(
                        publication_id=publication.id,
                        category_id=infocus_category.id,
                        status='Active'
                    ).order_by('-publish_date')[:2])
                except Categories.DoesNotExist:
                    pass
                
                # Get national-news articles (2) - Middle column
                national_news_articles = []
                try:
                    national_news_category = Categories.objects.get(
                        name='national-news',
                        publication=publication,
                        status='Active'
                    )
                    national_news_articles = list(Articles.objects.filter(
                        publication_id=publication.id,
                        category_id=national_news_category.id,
                        status='Active'
                    ).order_by('-publish_date')[:2])
                except Categories.DoesNotExist:
                    pass
                
                # Get misc articles (2) - Right column
                misc_articles = []
                try:
                    misc_category = Categories.objects.get(
                        name='miscellaneous',
                        publication=publication,
                        status='Active'
                    )
                    misc_articles = list(Articles.objects.filter(
                        publication_id=publication.id,
                        category_id=misc_category.id,
                        status='Active'
                    ).order_by('-publish_date')[:2])
                except Categories.DoesNotExist:
                    pass
                
                # Combine articles: [in-focus1, in-focus2, national-news1, national-news2, misc1, misc2]
                articles = infocus_articles + national_news_articles + misc_articles
                
            # For hilal-urdu: use Urdu-specific categories
            elif pub_name_lower in ['hilal-urdu', 'hilalurdu']:
                # Get special-focus or in-focus equivalent (2) - Left column
                infocus_articles = []
                try:
                    # Try special-focus first (Urdu equivalent of in-focus)
                    infocus_category = Categories.objects.get(
                        name='special-focus',
                        publication=publication,
                        status='Active'
                    )
                    infocus_articles = list(Articles.objects.filter(
                        publication_id=publication.id,
                        category_id=infocus_category.id,
                        status='Active'
                    ).order_by('-publish_date')[:2])
                except Categories.DoesNotExist:
                    # Try in-focus if special-focus doesn't exist
                    try:
                        infocus_category = Categories.objects.get(
                            name='in-focus',
                            publication=publication,
                            status='Active'
                        )
                        infocus_articles = list(Articles.objects.filter(
                            publication_id=publication.id,
                            category_id=infocus_category.id,
                            status='Active'
                        ).order_by('-publish_date')[:2])
                    except Categories.DoesNotExist:
                        pass
                
                # Get national-and-international-issues articles (2) - Middle column
                national_news_articles = []
                try:
                    # Try national-and-international-issues (Urdu category name)
                    national_category = Categories.objects.get(
                        name='national-and-international-issues',
                        publication=publication,
                        status='Active'
                    )
                    national_news_articles = list(Articles.objects.filter(
                        publication_id=publication.id,
                        category_id=national_category.id,
                        status='Active'
                    ).order_by('-publish_date')[:2])
                except Categories.DoesNotExist:
                    # Try national-news as fallback
                    try:
                        national_category = Categories.objects.get(
                            name='national-news',
                            publication=publication,
                            status='Active'
                        )
                        national_news_articles = list(Articles.objects.filter(
                            publication_id=publication.id,
                            category_id=national_category.id,
                            status='Active'
                        ).order_by('-publish_date')[:2])
                    except Categories.DoesNotExist:
                        pass
                
                # Get misc articles (2) - Right column
                misc_articles = []
                try:
                    misc_category = Categories.objects.get(
                        name='miscellaneous',
                        publication=publication,
                        status='Active'
                    )
                    misc_articles = list(Articles.objects.filter(
                        publication_id=publication.id,
                        category_id=misc_category.id,
                        status='Active'
                    ).order_by('-publish_date')[:2])
                except Categories.DoesNotExist:
                    pass
                
                # Combine articles: [infocus1, infocus2, national1, national2, misc1, misc2]
                articles = infocus_articles + national_news_articles + misc_articles
                
            # For other publications: get articles from available categories
            else:
                # Get all active categories for this publication
                categories = Categories.objects.filter(
                    publication=publication,
                    status='Active'
                ).order_by('id')[:3]  # Get first 3 categories
                
                # For each category, get 2 articles
                for category in categories:
                    category_articles = list(Articles.objects.filter(
                        publication_id=publication.id,
                        category_id=category.id,
                        status='Active'
                    ).order_by('-publish_date')[:2])
                    articles.extend(category_articles)
                
                # If we have less than 6 articles, fill with latest articles from any category
                if len(articles) < 6:
                    remaining_count = 6 - len(articles)
                    existing_article_ids = [a.id for a in articles] if articles else []
                    additional_articles = Articles.objects.filter(
                        publication_id=publication.id,
                        status='Active'
                    ).exclude(id__in=existing_article_ids).order_by('-publish_date')[:remaining_count]
                    articles.extend(list(additional_articles))
            
            serializer = ArticleSerializer(articles, many=True)
            return Response({
                "message": f"Mixed trending articles for {publication_name} retrieved successfully",
                "data": serializer.data,
                "publication": {
                    "id": publication.id,
                    "name": publication.name,
                    "display_name": publication.display_name
                },
                "article_type": "mixed",
                "count": len(serializer.data)
            }, status=status.HTTP_200_OK)
            
        except Publications.DoesNotExist:
            return Response({
                "error": f"Publication '{publication_name}' not found or inactive"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": f"Error retrieving articles for publication '{publication_name}': {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetMagazineAssignmentsView(APIView):
    """
    API to get magazine assignment statistics and details.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Get statistics
            total_articles = Articles.objects.filter(status='Active').count()
            articles_with_magazines = Articles.objects.filter(
                status='Active', 
                magazine__isnull=False
            ).count()
            articles_without_magazines = total_articles - articles_with_magazines
            
            # Get recent magazine assignments
            recent_assignments = Articles.objects.filter(
                status='Active',
                magazine__isnull=False
            ).select_related('magazine', 'publication').order_by('-publish_date')[:10]
            
            # Get magazines with article counts
            magazines_with_counts = []
            magazines = Magazines.objects.filter(status='Active').order_by('-year', '-month')
            
            for magazine in magazines:
                article_count = Articles.objects.filter(
                    magazine=magazine,
                    status='Active'
                ).count()
                
                magazines_with_counts.append({
                    'id': magazine.id,
                    'title': magazine.title,
                    'year': magazine.year,
                    'month': magazine.month,
                    'publication': magazine.publication.display_name if magazine.publication else None,
                    'article_count': article_count
                })
            
            # Serialize recent assignments
            recent_assignments_data = []
            for article in recent_assignments:
                recent_assignments_data.append({
                    'id': article.id,
                    'title': article.title,
                    'publish_date': article.publish_date,
                    'publication': article.publication.display_name if article.publication else None,
                    'magazine': {
                        'id': article.magazine.id,
                        'title': article.magazine.title,
                        'year': article.magazine.year,
                        'month': article.magazine.month
                    }
                })
            
            return Response({
                "message": "Magazine assignment statistics retrieved successfully",
                "statistics": {
                    "total_articles": total_articles,
                    "articles_with_magazines": articles_with_magazines,
                    "articles_without_magazines": articles_without_magazines,
                    "assignment_percentage": round((articles_with_magazines / total_articles * 100), 2) if total_articles > 0 else 0
                },
                "magazines": magazines_with_counts,
                "recent_assignments": recent_assignments_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"Error retrieving magazine assignment data: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetPreviousMonthMagazinesView(APIView):
    """
    API to get previous month magazines for a specific publication.
    Returns magazines from previous months (not current month) with article counts.
    """
    permission_classes = [AllowAny]

    def get(self, request, publication_name):
        try:
            # Get the publication by name first, then by display_name
            try:
                publication = Publications.objects.get(name=publication_name, status='Active')
            except Publications.DoesNotExist:
                publication = Publications.objects.get(display_name=publication_name, status='Active')
            
            # Get current date
            from datetime import datetime
            current_date = datetime.now()
            current_month = current_date.month
            current_year = current_date.year
            
            # Get magazines from previous months (not current month)
            previous_magazines = Magazines.objects.filter(
                publication=publication,
                status='Active',
                year__isnull=False,
                month__isnull=False
            ).exclude(
                # Exclude current month
                year=current_year,
                month=current_date.strftime('%B')  # e.g., 'October'
            ).order_by('-year', '-month')[:4]  # Get last 4 previous month magazines
            
            # Get article counts for each magazine
            magazines_with_counts = []
            for magazine in previous_magazines:
                # Count articles assigned to this magazine
                article_count = Articles.objects.filter(
                    magazine=magazine,
                    status='Active'
                ).count()
                
                # If no articles assigned, try to get articles from the month/year
                if article_count == 0:
                    # Try to match articles by publication and date
                    try:
                        # Convert month name to number
                        month_num = datetime.strptime(magazine.month, '%B').month
                        article_count = Articles.objects.filter(
                            publication=publication,
                            status='Active',
                            publish_date__year=magazine.year,
                            publish_date__month=month_num
                        ).count()
                    except ValueError:
                        # If month name is invalid, keep count as 0
                        pass
                
                magazines_with_counts.append({
                    'id': magazine.id,
                    'title': magazine.title,
                    'year': magazine.year,
                    'month': magazine.month,
                    'month_num': datetime.strptime(magazine.month, '%B').month if magazine.month else None,
                    'cover_image': magazine.cover_image,
                    'doc_url': magazine.doc_url,
                    'article_count': article_count,
                    'publication': {
                        'id': publication.id,
                        'name': publication.name,
                        'display_name': publication.display_name
                    }
                })
            
            return Response({
                "message": f"Previous month magazines for {publication_name} retrieved successfully",
                "data": magazines_with_counts,
                "publication": {
                    "id": publication.id,
                    "name": publication.name,
                    "display_name": publication.display_name
                },
                "count": len(magazines_with_counts)
            }, status=status.HTTP_200_OK)
            
        except Publications.DoesNotExist:
            return Response({
                "error": f"Publication '{publication_name}' not found or inactive"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": f"Error retrieving previous month magazines for publication '{publication_name}': {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileUploadView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            # Get the uploaded file
            file = request.FILES.get('file')
            entity_type = request.data.get('entity_type')
            entity_id = request.data.get('entity_id')
            file_purpose = request.data.get('file_purpose', '').lower()
            
            if not file:
                return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not entity_type or not entity_id:
                return Response({'error': 'entity_type and entity_id are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate entity type
            valid_entity_types = ['articles', 'authors', 'gallery', 'magazines', 'publications', 'billboards', 'magazinesPdf', 'ebooks']
            if entity_type not in valid_entity_types:
                return Response({'error': f'Invalid entity_type. Must be one of: {valid_entity_types}'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get file extension
            file_extension = os.path.splitext(file.name)[1].lower()
            
            # Validate file type based on entity type
            # Determine storage rules based on entity type
            if entity_type == 'magazines':
                allowed_extensions = ['.jpg', '.jpeg', '.png', '.pdf']
                subdirectory_parts = []
            elif entity_type == 'magazinesPdf':
                allowed_extensions = ['.pdf']
                subdirectory_parts = []
            elif entity_type == 'ebooks':
                cover_extensions = ['.jpg', '.jpeg', '.png', '.jfif']
                document_extensions = ['.pdf']
                
                if file_purpose not in ['cover', 'document']:
                    return Response({'error': "file_purpose must be either 'cover' or 'document' for ebooks"}, status=status.HTTP_400_BAD_REQUEST)
                
                if file_purpose == 'cover':
                    allowed_extensions = cover_extensions
                    subdirectory_parts = ['ebooks', 'covers']
                else:
                    allowed_extensions = document_extensions
                    subdirectory_parts = ['ebooks', 'documents']
            else:
                allowed_extensions = ['.jpg', '.jpeg', '.png', '.jfif']
                subdirectory_parts = []
            
            if file_extension not in allowed_extensions:
                return Response({'error': f'Invalid file type. Supported extensions: {", ".join(allowed_extensions)}'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Build upload directory
            base_upload_parts = ['uploads']
            if entity_type == 'ebooks' and subdirectory_parts:
                upload_parts = base_upload_parts + subdirectory_parts
            else:
                upload_parts = base_upload_parts + [entity_type]
            
            upload_dir = os.path.join(settings.MEDIA_ROOT, *upload_parts)
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate filename with entity ID
            if entity_type == 'magazinesPdf':
                # Special naming convention for magazine PDFs: {id}-0-hilal-archive.pdf
                filename = f"{entity_id}-0-hilal-archive.pdf"
            else:
                filename = f"{entity_id}{file_extension}"
            file_path = os.path.join(upload_dir, filename)
            
            # Save the file
            with open(file_path, 'wb') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            # Generate the URL for the uploaded file
            if entity_type == 'ebooks' and subdirectory_parts:
                relative_path = os.path.join('uploads', *subdirectory_parts, filename).replace('\\', '/')
            else:
                relative_path = os.path.join('uploads', entity_type, filename).replace('\\', '/')
            
            file_url = f"{settings.MEDIA_URL}{relative_path}"
            
            return Response({
                'message': 'File uploaded successfully',
                'file_url': file_url,
                'file_path': file_path,
                'filename': filename,
                'relative_path': relative_path,
                'entity_type': entity_type,
                'entity_id': entity_id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Error uploading file: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Contributors Related Views
class GetContributorsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Get all contributors, optionally filtered by publication
        """
        try:
            # Get query parameters
            publication_id = request.GET.get('publication_id')
            
            # Base queryset
            contributors = Contributors.objects.filter(status='Active').order_by('publication', 'order', 'name')
            
            # Apply filters
            if publication_id:
                try:
                    publication_id = int(publication_id)
                    contributors = contributors.filter(publication_id=publication_id)
                except ValueError:
                    return Response({
                        "error": "Invalid publication_id parameter. Must be an integer."
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Serialize the data
            serializer = ContributorsSerializer(contributors, many=True)
            
            return Response({
                "contributors": serializer.data,
                "total": contributors.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"Error fetching contributors: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetContributorsByPublicationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Get contributors grouped by publication
        """
        try:
            # Get all publications with their contributors
            publications = Publications.objects.filter(status='Active').order_by('id')
            
            result = []
            for publication in publications:
                contributors = Contributors.objects.filter(
                    publication=publication, 
                    status='Active'
                ).order_by('order', 'name')
                
                if contributors.exists():
                    serializer = ContributorsSerializer(contributors, many=True)
                    result.append({
                        'publication': {
                            'id': publication.id,
                            'name': publication.name,
                            'display_name': publication.display_name
                        },
                        'contributors': serializer.data,
                        'count': contributors.count()
                    })
            
            return Response({
                "publications_with_contributors": result,
                "total_publications": len(result)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"Error fetching contributors by publication: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


