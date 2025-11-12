# Generated manually for adding year and month fields to magazines table

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0027_remove_old_category_column'),
    ]

    operations = [
        migrations.AddField(
            model_name='magazines',
            name='year',
            field=models.IntegerField(blank=True, help_text='Year of the magazine (e.g., 2025)', null=True),
        ),
        migrations.AddField(
            model_name='magazines',
            name='month',
            field=models.CharField(blank=True, help_text="Month of the magazine (e.g., 'September', 'October')", max_length=20, null=True),
        ),
    ]
