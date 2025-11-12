"""
Production settings for backend project.
"""

from .settings import *

# Override Django's MariaDB version check for production
import django.db.backends.mysql.base as mysql_base
import django.db.backends.mysql.features as mysql_features

# Monkey patch to bypass MariaDB version check and disable RETURNING clause
def patched_minimum_database_version(self):
    if self.connection.mysql_is_mariadb:
        return (10, 4)  # Allow MariaDB 10.4
    else:
        return (5, 7)   # MySQL 5.7

# Disable RETURNING clause support for MariaDB 10.4
def patched_can_return_columns_from_insert(self):
    return False

mysql_features.DatabaseFeatures.minimum_database_version = property(patched_minimum_database_version)
mysql_features.DatabaseFeatures.can_return_columns_from_insert = property(patched_can_return_columns_from_insert)

# Ensure we're not inheriting middleware from settings.py
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
import os

# Enable debug temporarily to troubleshoot deployment issues
DEBUG = False

ALLOWED_HOSTS = [
    "api.lunarismanagement.com",
    "lunarismanagement.com",
    "www.lunarismanagement.com",
    "localhost",
    "127.0.0.1",
]

# Use environment variables for database connection
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DATABASE_NAME', 'hilal_database'),
        'USER': os.environ.get('DATABASE_USER', 'root'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD', ''),
        'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
        'PORT': os.environ.get('DATABASE_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'ssl': {'ssl-mode': 'preferred'}
        }
    }
}

# Update CORS settings for production
CORS_ALLOWED_ORIGINS = ["https://lunarismanagement.com", "https://www.lunarismanagement.com"]

CSRF_TRUSTED_ORIGINS = [
    "https://lunarismanagement.com",
    "https://www.lunarismanagement.com",
]

# Enable additional CORS settings
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = ["Content-Type", "Authorization", "X-Requested-With"]
CORS_PREFLIGHT_MAX_AGE = 86400  # 24 hours
CORS_ALLOW_ALL_ORIGINS = False
CORS_REPLACE_HTTPS_REFERER = True

# Ensure Django handles URLs without trailing slashes
APPEND_SLASH = True

# Additional CORS settings to handle all scenarios
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Ensure CORS works for all HTTP methods and scenarios
CORS_PREFLIGHT_MAX_AGE = 86400
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGIN_REGEXES = []
CORS_EXPOSE_HEADERS = []

# Static files storage
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
