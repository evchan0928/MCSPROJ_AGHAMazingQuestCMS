#!/bin/bash

echo "==========================================="
echo "Setting up Android SDK for Flutter Development"
echo "==========================================="

# Create directory for Android SDK
mkdir -p ~/Android/Sdk

echo "Downloading Android Command Line Tools..."
cd ~/Android/Sdk

# Download the latest command line tools
if [ ! -f "cmdline-tools-temp.zip" ]; then
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools-temp.zip
fi

# Create directory structure and extract
mkdir -p cmdline-tools
cd cmdline-tools
rm -rf latest temp
unzip ../cmdline-tools-temp.zip -d temp
mv temp cmdline-tools
mv cmdline-tools latest

echo "Setting up environment variables..."
# Add exports to bashrc if they don't already exist
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
    echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
fi

if ! grep -q "ANDROID_HOME/cmdline-tools/latest/bin" ~/.bashrc; then
    echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
fi

if ! grep -q "ANDROID_HOME/platform-tools" ~/.bashrc; then
    echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
fi

# Source the updated bashrc
source ~/.bashrc

echo "Installing required SDK components..."
# Install required packages
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2" --sdk_root=$ANDROID_HOME

# Accept the licenses
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --sdk_root=$ANDROID_HOME --licenses

echo "Configuring Flutter to use Android SDK..."
flutter config --android-sdk ~/Android/Sdk

echo "==========================================="
echo "Android SDK setup completed!"
echo "==========================================="
echo "To verify the setup, run: flutter doctor"
echo "If everything is set up correctly, you should see a checkmark for Android toolchain"
echo ""
echo "To run the Flutter app on Android, ensure:"
echo "1. A device is connected via USB with developer options enabled"
echo "2. OR an emulator is running"
echo "3. Then run: cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/aghamazingflutter-master && flutter run"
echo "==========================================="