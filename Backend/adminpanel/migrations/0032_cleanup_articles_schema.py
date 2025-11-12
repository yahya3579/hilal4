# Generated manually for articles table schema cleanup

from django.db import migrations


def cleanup_articles_schema(apps, schema_editor):
    """
    Clean up articles table schema:
    1. Drop the old user_id foreign key constraint and column
    2. Drop the writer column
    """
    with schema_editor.connection.cursor() as cursor:
        # Drop the old user_id foreign key constraint and column
        cursor.execute("ALTER TABLE articles DROP FOREIGN KEY articles_user_id_b9d9571c_fk")
        cursor.execute("ALTER TABLE articles DROP INDEX user_id")
        cursor.execute("ALTER TABLE articles DROP COLUMN user_id")
        
        # Drop the writer column
        cursor.execute("ALTER TABLE articles DROP COLUMN writer")


def reverse_cleanup_articles_schema(apps, schema_editor):
    """
    Reverse the schema changes
    """
    with schema_editor.connection.cursor() as cursor:
        # Add back user_id column
        cursor.execute("ALTER TABLE articles ADD COLUMN user_id INT DEFAULT NULL")
        cursor.execute("ALTER TABLE articles ADD INDEX user_id (user_id)")
        cursor.execute("ALTER TABLE articles ADD CONSTRAINT articles_user_id_b9d9571c_fk FOREIGN KEY (user_id) REFERENCES users (id)")
        
        # Add back writer column
        cursor.execute("ALTER TABLE articles ADD COLUMN writer VARCHAR(100) DEFAULT NULL")


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0031_clear_articles_data'),
    ]

    operations = [
        migrations.RunPython(
            cleanup_articles_schema,
            reverse_cleanup_articles_schema,
        ),
    ]
