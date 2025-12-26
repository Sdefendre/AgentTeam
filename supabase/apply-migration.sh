#!/bin/bash
# Script to apply Supabase migration using Supabase CLI
# Make sure you have Supabase CLI installed: npm install -g supabase

echo "Applying Agent Team database migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Apply the migration
supabase db push

echo "Migration applied successfully!"

