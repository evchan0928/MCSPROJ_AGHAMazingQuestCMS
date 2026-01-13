#!/usr/bin/env bash

# Dependency installation script for AGHAMazingQuestCMS on Ubuntu Linux
# This script installs all system-level dependencies needed for the project

set -e  # Exit on any error

echo "Installing system dependencies for AGHAMazingQuestCMS on Ubuntu Linux..."

# Update package list
sudo apt update

# Install Python 3.11 and development tools
echo "Installing Python 3.11 and development tools..."
sudo apt install -y python3.11 python3.11-dev python3.11-venv python3-pip

# Install system dependencies for Python packages
echo "Installing system dependencies for Python packages..."
sudo apt install -y build-essential libpq-dev gcc curl

# Install Node.js and npm (needed for the React frontend)
echo "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
echo "Verifying installations..."
python3.11 --version
node --version
npm --version

# Install pip packages globally (optional)
echo "Installing additional Python tools..."
pip3 install --user --upgrade pip setuptools wheel

echo ""
echo "System dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Run the setup script: ./environment_setup/linux/setup.sh"
echo "2. Or follow manual setup instructions in environment_setup/linux/README.md"