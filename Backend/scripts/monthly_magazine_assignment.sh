#!/bin/bash

# Monthly Magazine Assignment Script
# This script runs the Django management command to assign magazine IDs to articles
# It should be run at the end of each month (e.g., on the 1st of each month at 2 AM)

# Set the Django project directory
DJANGO_DIR="/Users/moinkhan/Coding/hilal-main/hilal_server/backend"

# Change to Django directory
cd "$DJANGO_DIR"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Run the management command
python3 manage.py assign_magazine_to_articles

# Log the execution
echo "$(date): Monthly magazine assignment completed" >> /var/log/hilal_magazine_assignment.log

# Deactivate virtual environment if it was activated
if [ -n "$VIRTUAL_ENV" ]; then
    deactivate
fi
