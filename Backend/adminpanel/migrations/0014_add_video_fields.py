# Generated manually for adding new video fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0013_alter_articles_options_alter_authors_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='videos',
            name='views',
            field=models.CharField(default='0 views', max_length=20),
        ),
        migrations.AddField(
            model_name='videos',
            name='time_ago',
            field=models.CharField(default='Just now', max_length=20),
        ),
        migrations.AddField(
            model_name='videos',
            name='is_featured',
            field=models.BooleanField(default=False),
        ),
    ]
