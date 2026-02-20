import 'dart:async';
import 'dart:convert';
import 'package:aghamazing1/services/api_client.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart'; // For debugPrint
// Import for EnergyManager
import 'package:aghamazing1/config/api_config.dart'; // Import for API configuration

class UserProfileService {
  static const String _userTokenKey = 'user_token';
  static const String _userIdKey = 'user_id';
  static const String _userNameKey = 'user_name';
  static const String _userEmailKey = 'user_email';
  
  String? _token;
  String? _userId;
  String? _userName;
  String? _userEmail;

  // Initialize the service with stored values
  Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_userTokenKey);
    _userId = prefs.getString(_userIdKey);
    _userName = prefs.getString(_userNameKey);
    _userEmail = prefs.getString(_userEmailKey);
  }

  // Store user token and profile data
  Future<void> storeUserProfile(String token, Map<String, dynamic> profileData) async {
    final prefs = await SharedPreferences.getInstance();
    
    _token = token;
    await prefs.setString(_userTokenKey, token);
    
    _userId = profileData['id'].toString();
    await prefs.setString(_userIdKey, _userId!);
    
    _userName = profileData['username'] ?? profileData['first_name'] ?? profileData['email'];
    await prefs.setString(_userNameKey, _userName!);
    
    _userEmail = profileData['email'];
    await prefs.setString(_userEmailKey, _userEmail!);
  }

  // Clear stored user data
  Future<void> clearUserData() async {
    final prefs = await SharedPreferences.getInstance();
    
    _token = null;
    _userId = null;
    _userName = null;
    _userEmail = null;
    
    await prefs.remove(_userTokenKey);
    await prefs.remove(_userIdKey);
    await prefs.remove(_userNameKey);
    await prefs.remove(_userEmailKey);
  }

  // Get user profile from backend using stored token
  Future<Map<String, dynamic>?> fetchUserProfile() async {
    if (_token == null) {
      return null;
    }

    try {
      final profileData = await contentApi.getUserProfile(_token!);
      await storeUserProfile(_token!, profileData);
      return profileData;
    } catch (e) {
      // If fetching from backend fails, return cached data
      if (_userId != null) {
        return {
          'id': _userId,
          'username': _userName,
          'email': _userEmail,
        };
      }
      return null;
    }
  }

  // Get stored token
  String? get token => _token;

  // Get stored user ID
  String? get userId => _userId;

  // Get stored user name
  String? get userName => _userName;

  // Get stored user email
  String? get userEmail => _userEmail;

  // Check if user is authenticated
  bool get isAuthenticated => _token != null;

  // Update user profile in backend
  Future<bool> updateUserProfile({String? displayName, String? email}) async {
    if (_token == null) {
      return false;
    }

    try {
      final uri = Uri.parse('${ApiConfig.getBaseUrl()}/api/auth/me/');
      final headers = {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      final body = <String, dynamic>{};
      if (displayName != null) body['first_name'] = displayName;
      if (email != null) body['email'] = email;

      final response = await http.patch(
        uri,
        headers: headers,
        body: jsonEncode(body),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Update local cache
        if (displayName != null) _userName = displayName;
        if (email != null) _userEmail = email;
        
        // Update shared preferences
        final prefs = await SharedPreferences.getInstance();
        if (displayName != null) await prefs.setString(_userNameKey, displayName);
        if (email != null) await prefs.setString(_userEmailKey, email);
        
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error updating user profile: $e');
      return false;
    }
  }

  // Get user profile from backend
  Future<Map<String, dynamic>?> getUserProfile() async {
    if (_token == null) {
      return null;
    }

    try {
      final profileData = await contentApi.getUserProfile(_token!);
      return profileData;
    } catch (e) {
      debugPrint('Error getting user profile: $e');
      return null;
    }
  }
}