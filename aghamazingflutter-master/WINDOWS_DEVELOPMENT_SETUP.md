# Windows Development Setup for AGHAMazing Flutter App

This guide will help you set up the development environment for the AGHAMazing Flutter app on Windows, connecting to the AGHAMazingQuestCMS backend.

## Prerequisites

- Windows 10 or higher (64-bit)
- At least 4GB RAM (8GB recommended)
- At least 20GB free disk space
- Internet connection for downloading tools and dependencies

## Installation Steps

### 1. Install Git for Windows

Download and install Git from [https://git-scm.com/download/win](https://git-scm.com/download/win).

During installation, select these options:
- Use Git from the Windows Command Prompt
- Checkout as-is, commit Unix-style endings
- Use Windows' default console window

### 2. Install Java Development Kit (JDK)

1. Download OpenJDK 17 or higher from [https://adoptium.net/](https://adoptium.net/)
2. Run the installer and follow the setup wizard
3. Set the `JAVA_HOME` environment variable:
   - Open "Environment Variables" (search "env" in Start menu)
   - Under "System Variables", click "New"
   - Variable name: `JAVA_HOME`
   - Variable value: Path to your JDK installation (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17.0.8.7-hotspot`)
   - Click "OK"

### 3. Install Android Studio

1. Download Android Studio from [https://developer.android.com/studio](https://developer.android.com/studio)
2. Run the installer and follow the setup wizard
3. During setup, ensure these components are selected:
   - Android SDK Platform 33 (API level 33)
   - Android SDK Command-line Tools
   - Android SDK Build-Tools 33.0.2

4. Set the `ANDROID_HOME` environment variable:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\[YOUR_USERNAME]\AppData\Local\Android\Sdk`

### 4. Install Flutter SDK

1. Download the Flutter SDK from [https://docs.flutter.dev/get-started/install/windows](https://docs.flutter.dev/get-started/install/windows)
2. Extract the archive to a desired location (e.g., `C:\flutter`)
3. Add Flutter to your PATH:
   - In Environment Variables, find and select the "Path" variable
   - Click "Edit" then "New"
   - Add the path to your Flutter bin directory (e.g., `C:\flutter\bin`)

### 5. Configure Flutter

Open Command Prompt or PowerShell and run:

```bash
flutter config --android-sdk "C:\Users\[YOUR_USERNAME]\AppData\Local\Android\Sdk"
flutter doctor
```

Accept Android licenses:
```bash
flutter doctor --android-licenses
```

Follow the prompts to accept all licenses.

### 6. Verify Installation

Run `flutter doctor` to verify all installations:

```bash
flutter doctor -v
```

All entries should show as checked (✓) except potentially for IntelliJ and VS Code if you haven't installed them.

## Configuring Backend Connection

The Flutter app is already configured to connect to the CMS backend. In the file [lib/services/api_client.dart](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/aghamazingflutter-master/lib/services/api_client.dart), the endpoints are set to connect to `http://localhost:8001`.

To connect to the CMS running on localhost:

1. Ensure the Django CMS backend is running:
   ```bash
   cd /path/to/AGHAMazingQuestCMS/backend
   python manage.py runserver 8001
   ```

2. The Flutter app will automatically connect to the CMS backend through the REST APIs defined in the services.

## Running the Flutter App

1. Navigate to the Flutter project directory:
   ```bash
   cd /path/to/AGHAMazingQuestCMS/aghamazingflutter-master
   ```

2. Get dependencies:
   ```bash
   flutter pub get
   ```

3. Connect an Android device or start an emulator

4. Run the app:
   ```bash
   flutter run
   ```

## Environment Configuration for Different Environments

If you need to connect to different backend environments (development, staging, production), you can modify the base URL in [lib/services/api_client.dart](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/aghamazingflutter-master/lib/services/api_client.dart):

```dart
// Development
final String baseUrl = 'http://localhost:8001';

// Staging
// final String baseUrl = 'https://staging.yourdomain.com';

// Production
// final String baseUrl = 'https://api.yourdomain.com';
```

## Troubleshooting

### Common Issues:

1. **License not accepted**: Run `flutter doctor --android-licenses` and accept all licenses
2. **Platform Android is missing**: Ensure Android Studio is installed with the required SDK components
3. **Visual Studio C++ components missing**: Install Visual Studio Build Tools
4. **Git not found**: Ensure Git is installed and added to PATH

### For PostgreSQL Database Integration:

The Flutter app integrates with the PostgreSQL database through the Django REST APIs. Direct connections from Flutter to PostgreSQL are not implemented. All database interactions happen through the CMS backend APIs.

## Testing Backend Connection

To verify that the Flutter app can connect to the CMS backend:

1. Start the Django backend:
   ```bash
   cd backend
   python manage.py runserver 8001
   ```

2. Test the API endpoints:
   - http://localhost:8001/api/auth/register/
   - http://localhost:8001/api/auth/login/
   - http://localhost:8001/api/content/game/content/
   - http://localhost:8001/api/swagger/ (for API documentation)

3. Run the Flutter app to connect to these endpoints.

## Next Steps

After setting up the development environment:

1. Customize the app UI/UX according to requirements
2. Implement additional features as needed
3. Test the integration between Flutter app and CMS backend
4. Configure Firebase services for user authentication and data storage