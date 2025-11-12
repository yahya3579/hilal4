# Generated manually for articles table cleanup

from django.db import migrations


def clear_articles_data(apps, schema_editor):
    """
    Clear all existing article data from the database
    """
    # Since Articles model is unmanaged, we need to use raw SQL
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DELETE FROM articles")


def reverse_clear_articles_data(apps, schema_editor):
    """
    This migration cannot be reversed as we're deleting data
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0029_add_description_to_publications'),
    ]

    operations = [
        migrations.RunPython(
            clear_articles_data,
            reverse_clear_articles_data,
        ),
    ]
