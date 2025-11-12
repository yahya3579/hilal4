"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views import GoogleLoginAPIView,LoginView,RefreshTokenView
from api.views import FacebookLoginAPIView
from api.views import CustomLoginView
from adminpanel.views import SingleArticleView
from adminpanel.views import CreateCommentView, CreateArticleView, GetAllArticlesView
from adminpanel.views import GetAllCommentsView, GetTopArticlesView , DeleteCommentView
from adminpanel.views import GetCommentsByUserView
from api.views import UserRoleAPIView
from adminpanel.views import GetArticlesByUserView,hello_view
from api.views import LogoutAPIView
from adminpanel.views import SingleBillboardView, CreateBillboardView, GetAllBillboardsView
from adminpanel.views import DeleteBillboardView
from adminpanel.views import GetBillboardByPositionView,GetBillboardsByLocationView,GetAllEbooksView,SingleEbookView,CreateOrUpdateEbookView,GetArchivedEbooksView,GetActiveEbooksView,ToggleEbookArchiveView
from adminpanel.views import GetAllMagazinesView, SingleMagazineView, CreateOrUpdateMagazineView, ForceDeleteMagazineView
from adminpanel.views import CreateAuthorView, GetAllAuthorsView, SingleAuthorView
from adminpanel.views import GetAllVideosView, SingleVideoView, CreateVideoView, GetAllVideosManagementView, DashboardStatsView, GetHilalDigitalView
from adminpanel.views import CreatePublicationView, GetAllPublicationsView, SinglePublicationView, GetArticlesByPublicationView, GetActivePublicationsView
from adminpanel.views import GetArticlesByPublicationNameView
from adminpanel.views import CreateCategoryView, GetAllCategoriesView, SingleCategoryView, GetActiveCategoriesView, GetFilteredArticlesView, GetTrendingArticlesView, GetMagazineAssignmentsView, GetPreviousMonthMagazinesView, GetFilteredMagazineArticlesView, FileUploadView, GetContributorsView, GetContributorsByPublicationView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    # path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
     path("api/token/", CustomLoginView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", RefreshTokenView.as_view(), name="token_refresh"),
    path("api/user/google-login/", GoogleLoginAPIView.as_view(), name="google-login"),
    path("api/user/facebook-login/", FacebookLoginAPIView.as_view(), name="facebook-login"),
    path("api-auth/",include("rest_framework.urls")),
    path('author_management/', include('author_management.urls')),  # Add this line

    # article management URLs
    path('api/article/<int:pk>/', SingleArticleView.as_view(), name='single-article'), #get the single article with post delete up and get methods
    path('api/article/<int:pk>', SingleArticleView.as_view(), name='single-article-no-slash'), #handle requests without trailing slash
    path('api/create-article/', CreateArticleView.as_view(), name='create-article'), # create article with post method
    path('api/get-articles/', GetAllArticlesView.as_view(), name='get-articles'),# get all articles with get method
    path('api/create-comment/', CreateCommentView.as_view(), name='create-comment'), # create comment with post method
    path('api/get-comments/', GetAllCommentsView.as_view(), name='get-comments'), # get all comments with get method
    path('api/get-recent-articles/', GetTopArticlesView.as_view(), name='get-top-articles'), # get top 10 recent articles
    path("api/user/<int:user_id>/role/", UserRoleAPIView.as_view(), name="user-role"),
    path("api/articles/author/<int:author_id>/", GetArticlesByUserView.as_view(), name="articles-by-author"),
    path("api/logout/", LogoutAPIView.as_view(), name="logout"),
    path("api/hello/", hello_view, name="hello"),

    # billboard management URLs
    path('api/billboard/<int:pk>/', SingleBillboardView.as_view(), name='single-billboard'),  # Get, update, delete single billboard
    path('api/create-billboard/', CreateBillboardView.as_view(), name='create-billboard'),  # Create billboard
    path('api/get-billboards/', GetAllBillboardsView.as_view(), name='get-billboards'),  # Get all billboards
    path('api/delete-billboard/<int:pk>/', DeleteBillboardView.as_view(), name='delete-billboard'),  # Delete billboard
    path('api/billboard/location/<str:location>/', GetBillboardByPositionView.as_view(), name='billboard-by-location'),  # Get single billboard by location (legacy)
    path('api/billboards/location/<str:location>/', GetBillboardsByLocationView.as_view(), name='billboards-by-location'),  # Get ALL billboards by location (for slider)

    # comment management URLs
    path('api/comment/<int:pk>/', DeleteCommentView.as_view(), name='delete-comment'),  # Delete comment
    path('api/comments/user/<int:user_id>/', GetCommentsByUserView.as_view(), name='comments-by-user'),  # Get comments by user ID

    # Magazine management URLs
    path('api/magazines/', GetAllMagazinesView.as_view(), name='get-all-magazines'),  # Get all magazines
    path('api/magazine/<int:pk>/', SingleMagazineView.as_view(), name='single-magazine'),  # Get or delete a single magazine
    path('api/magazine/force-delete/<int:pk>/', ForceDeleteMagazineView.as_view(), name='force-delete-magazine'),  # Force delete magazine (unassigns articles)
    path('api/magazine/create/', CreateOrUpdateMagazineView.as_view(), name='create-magazine'),  # Create a new magazine
    path('api/magazine/update/<int:pk>/', CreateOrUpdateMagazineView.as_view(), name='update-magazine'),  # Update a magazine

    # Author management URLs
    path('api/authors/', GetAllAuthorsView.as_view(), name='get-all-authors'),  # Get all authors
    path('api/author/<int:pk>/', SingleAuthorView.as_view(), name='single-author'),  # Get, update, delete a single author
    path('api/author/create/', CreateAuthorView.as_view(), name='create-author'),  # Create a new author

    # Video management URLs
    path('api/videos/', GetAllVideosView.as_view(), name='get-all-videos'),  # Get all active videos for frontend
    path('api/videos/hilal-digital/', GetHilalDigitalView.as_view(), name='get-hilal-digital'),  # Get Hilal Digital data
    path('api/video/<int:pk>/', SingleVideoView.as_view(), name='single-video'),  # Get, update, delete a single video
    path('api/video/create/', CreateVideoView.as_view(), name='create-video'),  # Create a new video
    path('api/videos/management/', GetAllVideosManagementView.as_view(), name='get-all-videos-management'),  # Get all videos for admin management

       # Ebook management URLs
    path('api/ebooks/', GetAllEbooksView.as_view(), name='get-all-ebooks'),  # Get all ebooks
    path('api/ebooks/active/', GetActiveEbooksView.as_view(), name='get-active-ebooks'),  # Get all non-archived ebooks
    path('api/ebooks/archived/', GetArchivedEbooksView.as_view(), name='get-archived-ebooks'),  # Get archived ebooks
    path('api/ebook/<int:pk>/', SingleEbookView.as_view(), name='single-ebook'),  # Get or delete a single ebook
    path('api/ebook/create/', CreateOrUpdateEbookView.as_view(), name='create-ebook'),  # Create a new ebook
    path('api/ebook/update/<int:pk>/', CreateOrUpdateEbookView.as_view(), name='update-ebook'),  # Update a ebook
    path('api/ebook/<int:pk>/toggle-archive/', ToggleEbookArchiveView.as_view(), name='toggle-ebook-archive'),  # Toggle ebook archive status
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),  # Get dashboard statistics

    # Publication management URLs
    path('api/publications/', GetAllPublicationsView.as_view(), name='get-all-publications'),  # Get all publications
    path('api/publications/active/', GetActivePublicationsView.as_view(), name='get-active-publications'),  # Get only active publications for navigation
    path('api/publication/<int:pk>/', SinglePublicationView.as_view(), name='single-publication'),  # Get, update, delete a single publication
    path('api/publication/create/', CreatePublicationView.as_view(), name='create-publication'),  # Create a new publication
    path('api/publication/<int:publication_id>/articles/', GetArticlesByPublicationView.as_view(), name='articles-by-publication'),  # Get articles by publication
    path('api/articles/by-publication/', GetArticlesByPublicationNameView.as_view(), name='articles-by-publication-name'),  # Get articles by publication name and date range
    
    # Categories management URLs
    path('api/categories/', GetAllCategoriesView.as_view(), name='get-all-categories'),  # Get all categories
    path('api/categories/active/', GetActiveCategoriesView.as_view(), name='get-active-categories'),  # Get only active categories for navigation
    path('api/category/<int:pk>/', SingleCategoryView.as_view(), name='single-category'),  # Get, update, delete a single category
    path('api/category/create/', CreateCategoryView.as_view(), name='create-category'),  # Create a new category
    
    # Unified Articles Filter API
    path('api/articles/filtered/', GetFilteredArticlesView.as_view(), name='filtered-articles'),  # Get articles with multiple filters
    path('api/articles/magazine-filtered/', GetFilteredMagazineArticlesView.as_view(), name='filtered-magazine-articles'),  # Get magazine articles with year/month/publication filters
    path('api/articles/publication/<str:publication_name>/', GetArticlesByPublicationView.as_view(), name='articles-by-publication'),  # Get articles by publication for current month
    path('api/articles/trending/<str:publication_name>/', GetTrendingArticlesView.as_view(), name='trending-articles'),  # Get latest 6 trending articles for a publication
    path('api/magazine-assignments/', GetMagazineAssignmentsView.as_view(), name='magazine-assignments'),  # Get magazine assignment statistics
    path('api/magazines/previous/<str:publication_name>/', GetPreviousMonthMagazinesView.as_view(), name='previous-month-magazines'),  # Get previous month magazines for publication
    
    # File upload URL
    path('api/upload-file/', FileUploadView.as_view(), name='upload-file'),  # File upload endpoint
    
    # Contributors URLs
    path('api/contributors/', GetContributorsView.as_view(), name='contributors'),  # Get all contributors
    path('api/contributors/by-publication/', GetContributorsByPublicationView.as_view(), name='contributors-by-publication'),  # Get contributors grouped by publication

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
