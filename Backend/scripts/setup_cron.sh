#!/bin/bash

# Setup script for monthly magazine assignment cron job
# This script adds the cron job to run the magazine assignment on the 1st of each month at 2 AM

SCRIPT_DIR="/Users/moinkhan/Coding/hilal-main/hilal_server/backend/scripts"
CRON_JOB="0 2 1 * * $SCRIPT_DIR/monthly_magazine_assignment.sh"

echo "Setting up monthly magazine assignment cron job..."
echo "Cron job: $CRON_JOB"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "monthly_magazine_assignment.sh"; then
    echo "Cron job already exists. Removing old entry..."
    crontab -l 2>/dev/null | grep -v "monthly_magazine_assignment.sh" | crontab -
fi

# Add the new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "Cron job added successfully!"
echo "The magazine assignment will run on the 1st of each month at 2:00 AM"
echo ""
echo "To view current cron jobs, run: crontab -l"
echo "To remove this cron job, run: crontab -e (then delete the line)"
echo ""
echo "To test the script manually, run:"
echo "  $SCRIPT_DIR/monthly_magazine_assignment.sh"
