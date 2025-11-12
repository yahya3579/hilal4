from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Create your models here.

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    fname = models.CharField(max_length=50, null=True, blank=True)
    lname = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField(max_length=100, unique=True)
    contact_no = models.CharField(max_length=50, null=True, blank=True)
    cnic = models.CharField(max_length=15, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    country = models.CharField(max_length=250, null=True, blank=True)
    state = models.CharField(max_length=250, null=True, blank=True)
    postal_address = models.TextField(max_length=500, null=True, blank=True)
    email_verification = models.IntegerField(default=0, choices=[(0, 'Not Verified'), (1, 'Verification Email Sent'), (2, 'Email Verified')])
    image = models.BooleanField(default=False)
    login_datetime = models.DateTimeField(null=True, blank=True)
    status = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)  # Required for Django authentication
    is_staff = models.BooleanField(default=False)  # Required for Django admin access

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('author', 'Author'),
        ('editor', 'Editor'),

    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='author')

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        managed= True
        db_table = "users"
