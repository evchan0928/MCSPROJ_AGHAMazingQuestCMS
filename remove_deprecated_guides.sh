#!/bin/bash
# Script to remove deprecated guides after confirming the new guide is in place

echo "This script removes deprecated setup guides."
echo "Please confirm that you have reviewed DEVELOPMENT_SETUP_GUIDE.md and it meets your needs."
echo ""
read -p "Do you want to proceed with removing deprecated guides? (yes/no): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing deprecated guides..."
    
    # Remove deprecated guides
    rm -f SETUP_GUIDE.md
    rm -f SYSTEM_ACCESS_GUIDE.md
    
    echo "Deprecated guides removed successfully."
    echo ""
    echo "Remember to use DEVELOPMENT_SETUP_GUIDE.md for all development setup procedures."
else
    echo "Operation cancelled. Deprecated guides will be kept."
fi