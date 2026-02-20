import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart'; // Import the API config
import 'auth_api.dart';

class AuthService {
  // Updated to use API config with correct endpoints
  final AuthApi _authApi = AuthApi(
    registerUrl: ApiConfig.getAuthRegisterEndpoint(),
    loginUrl: ApiConfig.getAuthLoginEndpoint(),
    otpRequestUrl: '${ApiConfig.getBaseUrl()}/api/auth/otp/request/',
    otpVerifyUrl: '${ApiConfig.getBaseUrl()}/api/auth/otp/verify/',
    passwordResetUrl: '${ApiConfig.getBaseUrl()}/api/auth/password/reset/',
  );


  // ============================================================
  // DJANGO BACKEND INTEGRATION
  // ============================================================

  // Method to register a new user
  Future<bool> register(String username, String email, String password) async {
    try {
      final token = await _authApi.registerUser(
        username: username,
        email: email,
        password: password,
      );
      
      // If registration successful, store the token
      if (token != 'registration_failed') {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        return true;
      }
      return false;
    } catch (e) {
      print('Registration error: $e');
      return false;
    }
  }

  // Method to log in an existing user
  Future<bool> login(String email, String password) async {
    try {
      final token = await _authApi.loginUser(
        email: email,
        password: password,
      );
      
      // If login successful, store the token and update state
      if (token.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  // Method to log out the current user
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }

  // Method to check if user is logged in
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return token != null && token.isNotEmpty;
  }

  // Method to get the stored token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Method to get user data
  Future<Map<String, dynamic>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataString = prefs.getString('user_data');
    if (userDataString != null) {
      return json.decode(userDataString);
    }
    return null;
  }

  // Method to store user data
  Future<void> storeUserData(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', json.encode(userData));
  }

  // Method to refresh the token
  Future<bool> refreshToken() async {
    // Implementation for refreshing the token
    // This would typically involve sending the refresh token to the server
    // and receiving a new access token in return
    try {
      // Get the refresh token from shared preferences
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString('refresh_token');
      
      if (refreshToken == null || refreshToken.isEmpty) {
        return false;
      }

      // Make a request to refresh the token
      // Note: This is a simplified implementation
      // In a real-world app, you would make an HTTP request to refresh the token
      // and handle the response appropriately
      // Example:
      // final response = await http.post(
      //   Uri.parse(ApiConfig.getTokenRefreshEndpoint()),
      //   headers: {'Content-Type': 'application/json'},
      //   body: jsonEncode({'refresh': refreshToken}),
      // );
      //
      // if (response.statusCode == 200) {
      //   final data = jsonDecode(response.body);
      //   await prefs.setString('auth_token', data['access']);
      //   return true;
      // }

      // Placeholder implementation
      return true;
    } catch (e) {
      print('Token refresh error: $e');
      return false;
    }
  }
}
