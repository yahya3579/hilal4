from django.db import models
from api.models import CustomUser
from django.core.validators import MinValueValidator, MaxValueValidator
import re

class Publications(models.Model):
    name = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255, default='')
    cover_image = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True, help_text="Description of the publication")
    status = models.CharField(max_length=8, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        managed = True
        db_table = 'publications'


class Categories(models.Model):
    name = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255)
    publication = models.ForeignKey(Publications, models.DO_NOTHING, null=True, blank=True)
    status = models.CharField(max_length=8, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.display_name
    
    class Meta:
        managed = True
        db_table = 'categories'

class Articles(models.Model):
    author = models.ForeignKey('Authors', models.DO_NOTHING, null=True, blank=True)
    publication = models.ForeignKey(Publications, models.DO_NOTHING, null=True, blank=True)
    magazine = models.ForeignKey('Magazines', models.DO_NOTHING, null=True, blank=True)
    category = models.ForeignKey(Categories, models.DO_NOTHING, null=True, blank=True)
    cover_image = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255)
    publish_date = models.DateTimeField(blank=True, null=True)
    publish_date_year = models.IntegerField(blank=True, null=True, help_text="Year extracted from publish_date")
    publish_date_month = models.IntegerField(blank=True, null=True, help_text="Month extracted from publish_date (1-12)")
    visits = models.IntegerField(blank=True, null=True)
    issue_new = models.CharField(max_length=3, blank=True, null=True)
    status = models.CharField(max_length=8, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    section = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        managed = True
        db_table = 'articles'


class Comments(models.Model):
    comment = models.TextField()
    user = models.ForeignKey(CustomUser, models.DO_NOTHING,null=True,blank=True)
    article = models.ForeignKey(Articles, models.DO_NOTHING,null=True,blank=True)
    created_at = models.DateTimeField(blank=True, null=True)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=1
    )

    class Meta:
        managed = False
        db_table = 'comments'


class Roles(models.Model):
    name = models.CharField(unique=True, max_length=50)
    user = models.ForeignKey(CustomUser, models.DO_NOTHING,null=True,blank=True)

    class Meta:
        managed = False
        db_table = 'roles'


class Billboards(models.Model):
    user = models.ForeignKey(CustomUser, models.DO_NOTHING)
    image = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255)
    created = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    issue_news = models.CharField(
        max_length=3,  # "Yes" or "No"
        choices=[('Yes', 'Yes'), ('No', 'No')],
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=8,  # "Active" or "Disabled"
        choices=[('Active', 'Active'), ('Disabled', 'Disabled')],
        default='Active'
    )

    class Meta:
        managed = False
        db_table = 'billboards'


class Magazines(models.Model):
    title = models.CharField(max_length=255)
    publish_date = models.CharField(max_length=255, blank=True, null=True)
    language = models.CharField(max_length=50)
    direction = models.CharField(max_length=3, choices=[('LTR', 'Left-to-Right'), ('RTL', 'Right-to-Left')])
    status = models.CharField(max_length=8, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')
    cover_image = models.CharField(max_length=255, blank=True, null=True)
    doc_url = models.CharField(max_length=255, blank=True, null=True)
    publication = models.ForeignKey(Publications, models.DO_NOTHING, null=True, blank=True)
    
    # New fields for magazine period
    year = models.IntegerField(blank=True, null=True, help_text="Year of the magazine (e.g., 2025)")
    month = models.CharField(max_length=20, blank=True, null=True, help_text="Month of the magazine (e.g., 'September', 'October')")
    
    class Meta:
        managed = False
        db_table = 'magazines'


class Ebook(models.Model):
    title = models.CharField(max_length=255)
    publish_date = models.CharField(max_length=255, blank=True, null=True)
    language = models.CharField(max_length=50)
    direction = models.CharField(max_length=3, choices=[('LTR', 'Left-to-Right'), ('RTL', 'Right-to-Left')])
    status = models.CharField(max_length=8, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')
    cover_image = models.CharField(max_length=255, blank=True, null=True)
    doc_url = models.CharField(max_length=255, blank=True, null=True)
    is_archived = models.BooleanField(default=False)  # New field to indicate if the ebook is archived
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ebooks'


class Authors(models.Model):
    author_image = models.CharField(max_length=255, blank=True, null=True)
    author_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    contact_no = models.CharField(max_length=15)
    no_of_articles = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=50, choices=[("Approved", "Approved"), ("Pending", "Pending"), ("Rejected", "Rejected")], default="Pending")
    category = models.CharField(max_length=100)
    introduction = models.TextField()

    def __str__(self):
        return self.author_name

    class Meta:
        managed = False
        db_table = 'authors'


class Videos(models.Model):
    title = models.CharField(max_length=255)
    youtube_url = models.URLField(max_length=500)
    video_id = models.CharField(max_length=20, blank=True, null=True)
    thumbnail_url = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=8, 
        choices=[('Active', 'Active'), ('Inactive', 'Inactive')], 
        default='Active'
    )
    language = models.CharField(
        max_length=10,
        choices=[('English', 'English'), ('Urdu', 'Urdu')],
        default='English'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order = models.PositiveIntegerField(default=0)  # For ordering videos
    # views = models.CharField(max_length=20, default="0 views")  # For display views like "1.4K views"
    # time_ago = models.CharField(max_length=20, default="Just now")  # For display time like "3 days ago"
    # is_featured = models.BooleanField(default=False)  # To mark featured video for left side

    def save(self, *args, **kwargs):
        # Extract video ID from YouTube URL
        if self.youtube_url and not self.video_id:
            self.video_id = self.extract_video_id(self.youtube_url)
        
        # Generate thumbnail URL if not provided
        if self.video_id and not self.thumbnail_url:
            self.thumbnail_url = f"https://i.ytimg.com/vi/{self.video_id}/maxresdefault.jpg"
        
        super().save(*args, **kwargs)

    def extract_video_id(self, url):
        """Extract YouTube video ID from various URL formats"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def __str__(self):
        return self.title

    class Meta:
        managed = True
        db_table = 'videos'
        ordering = ['order', 'created_at']


class Contributors(models.Model):
    """Model for Hilal team contributors from old_hilal database"""
    publication = models.ForeignKey(Publications, models.DO_NOTHING, null=True, blank=True)
    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    cover_image = models.CharField(max_length=255, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=8, 
        choices=[('Active', 'Active'), ('Inactive', 'Inactive')], 
        default='Active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        managed = True
        db_table = 'contributors'
        ordering = ['publication', 'order', 'name']
