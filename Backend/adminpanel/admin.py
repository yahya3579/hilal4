from django.contrib import admin
from .models import Publications

# Register your models here.
@admin.register(Publications)
class PublicationsAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
