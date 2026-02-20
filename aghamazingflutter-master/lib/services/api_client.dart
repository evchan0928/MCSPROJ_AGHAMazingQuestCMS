import 'package:aghamazing1/services/auth_api.dart';
import 'package:aghamazing1/services/content_api.dart';
import 'package:aghamazing1/config/api_config.dart'; // Import the new config

// Create shared instances of API classes for the app
// Using the Django backend API endpoints
final AuthApi authApi = AuthApi(
  registerUrl: ApiConfig.getAuthRegisterEndpoint(),  // Updated to use config
  loginUrl: ApiConfig.getAuthLoginEndpoint(),       // Updated to use config
  otpRequestUrl: '${ApiConfig.getBaseUrl()}/api/auth/otp/request/',  // Updated to use config
  otpVerifyUrl: '${ApiConfig.getBaseUrl()}/api/auth/otp/verify/',    // Updated to use config
  passwordResetUrl: '${ApiConfig.getBaseUrl()}/api/auth/password/reset/', // Updated to use config
  timeout: const Duration(seconds: 40),
  allowBadCertificateInDebug: true,
);

// Content API instance - connects to Django backend
final ContentApi contentApi = ContentApi(
  baseUrl: ApiConfig.getBaseUrl(),  // Updated to use config
  timeout: const Duration(seconds: 30),
  allowBadCertificateInDebug: true,
);