/// API Configuration for different environments
/// This allows easy switching between development, staging, and production environments
library;

class ApiConfig {
  // Development environment (local CMS backend)
  static const String developmentBaseUrl = 'http://localhost:8001';
  
  // Staging environment (replace with actual staging URL)
  static const String stagingBaseUrl = 'https://staging-aghamazingquestcms.example.com';
  
  // Production environment (replace with actual production URL)
  static const String productionBaseUrl = 'https://api.aghamazingquestcms.example.com';
  
  // Current active environment - change this to switch environments
  static const String currentEnvironment = 'development'; // Options: 'development', 'staging', 'production'
  
  // Get the base URL based on current environment
  static String getBaseUrl() {
    switch (currentEnvironment) {
      case 'development':
        return developmentBaseUrl;
      case 'staging':
        return stagingBaseUrl;
      case 'production':
        return productionBaseUrl;
      default:
        // Default to development if environment is not recognized
        return developmentBaseUrl;
    }
  }
  
  // API Path constants
  static const String _authPath = '/api/auth';
  static const String _contentPath = '/api/content';
  static const String _mobilePath = '/api/mobile';
  
  // Get specific API endpoints based on the current environment
  static String getAuthRegisterEndpoint() => '${getBaseUrl()}$_authPath/register/';
  static String getAuthLoginEndpoint() => '${getBaseUrl()}$_authPath/login/';
  static String getAuthMeEndpoint() => '${getBaseUrl()}$_authPath/me/';
  
  // Content endpoints
  static String getContentEndpoint() => '${getBaseUrl()}$_contentPath/content-items/';
  static String getPublicContentEndpoint() => '${getBaseUrl()}$_contentPath/content-items/';
  // Note: Public and private content endpoints are currently the same as the CMS serves both from the same endpoint
  static String getArMarkersEndpoint() => '${getBaseUrl()}$_contentPath/ar-markers/';
  
  // Mobile endpoints
  static String getMobileUserProfileEndpoint() => '${getBaseUrl()}$_mobilePath/user-profiles/';
  static String getMobileUserSessionsEndpoint() => '${getBaseUrl()}$_mobilePath/user-sessions/';
  static String getMobileScoresEndpoint() => '${getBaseUrl()}$_mobilePath/scores/';
  static String getMobileBadgesEndpoint() => '${getBaseUrl()}$_mobilePath/badges/';
  static String getMobileLeaderboardEndpoint() => '${getBaseUrl()}$_mobilePath/leaderboards/';
  
  // Print current configuration (useful for debugging)
  static void printCurrentConfig() {
    print('Current API Configuration:');
    print('Environment: $currentEnvironment');
    print('Base URL: ${getBaseUrl()}');
    print('Auth Register: ${getAuthRegisterEndpoint()}');
    print('Content Endpoint: ${getContentEndpoint()}');
  }
}