# urls.py

from django.urls import path
from .views import GetAllAuthorsView

urlpatterns = [
    path('authors/', GetAllAuthorsView.as_view(), name='get_all_authors'),
]
