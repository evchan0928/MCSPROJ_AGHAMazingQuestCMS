# AGHAMazing Flutter Application

This is the mobile application for the AGHAMazing Quest project, which connects to the AGHAMazingQuestCMS backend system. The app provides an augmented reality experience for educational tours, allowing users to interact with AR content, participate in educational games, and track learning progress.

## Features

- AR-based educational experiences
- Interactive games and quizzes
- User profiles and progress tracking
- Content consumption from CMS backend
- Multi-language support

## Backend Integration

The Flutter app connects to the AGHAMazingQuestCMS backend via RESTful APIs:

- **Authentication**: User registration, login, and session management
- **Content Management**: Fetching educational content from the CMS
- **User Profiles**: Managing user data and preferences
- **Progress Tracking**: Recording user achievements and game scores

## Removed Dependencies

Previously, this app used Firebase services for authentication and data storage. These have been removed to simplify the architecture for local network deployment:
- Firebase Core
- Firebase Auth
- Cloud Firestore

All data operations now go through the CMS backend's PostgreSQL database via REST APIs.

## Getting Started

### Prerequisites

- Flutter SDK (3.16.0 or higher)
- Android Studio or Xcode
- Android SDK (API level 33 recommended)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aghamazingflutter-master
   ```

2. Get Flutter dependencies:
   ```bash
   flutter pub get
   ```

3. Ensure the CMS backend is running on your development machine:
   - Start the Django backend server
   - The app is configured to connect to `http://localhost:8001`

4. Run the app:
   ```bash
   flutter run
   ```

## Development Environment Setup

For detailed Windows setup instructions, see [WINDOWS_DEVELOPMENT_SETUP.md](WINDOWS_DEVELOPMENT_SETUP.md).

## API Configuration

The app connects to the CMS backend through the following API endpoints:

- Authentication: `http://localhost:8001/api/auth/`
- Content: `http://localhost:8001/api/content/`
- User Management: `http://localhost:8001/api/users/`
- Mobile Management: `http://localhost:8001/api/mobile/`

These endpoints are configured in [lib/services/api_client.dart](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/aghamazingflutter-master/lib/services/api_client.dart).

## Database Integration

The Flutter app interacts with the PostgreSQL database through the Django REST APIs. All database operations are handled by the CMS backend, ensuring consistent data management and security.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.