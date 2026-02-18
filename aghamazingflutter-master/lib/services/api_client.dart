import 'package:aghamazing1/services/auth_api.dart';
import 'package:aghamazing1/services/content_api.dart';

// Create shared instances of API classes for the app
// Using the Django backend API endpoints
final AuthApi authApi = AuthApi(
  registerUrl: 'http://localhost:8001/api/auth/register/',  // Updated to Django backend
  loginUrl: 'http://localhost:8001/api/auth/login/',      // Updated to Django backend
  otpRequestUrl: 'http://localhost:8001/api/auth/otp/request/',  // Placeholder if needed
  otpVerifyUrl: 'http://localhost:8001/api/auth/otp/verify/',    // Placeholder if needed
  passwordResetUrl: 'http://localhost:8001/api/auth/password/reset/', // Added password reset endpoint
  timeout: const Duration(seconds: 40),
  allowBadCertificateInDebug: true,
);

// Content API instance - connects to Django backend
final ContentApi contentApi = ContentApi(
  baseUrl: 'http://localhost:8001',  // Base URL for Django backend
  timeout: const Duration(seconds: 30),
  allowBadCertificateInDebug: true,
);