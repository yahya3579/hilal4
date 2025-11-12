#!/bin/bash

# Install Python dependencies
pip install -r requirements_vercel.txt

# Create a dummy file to indicate successful build
touch .vercel_build_success
