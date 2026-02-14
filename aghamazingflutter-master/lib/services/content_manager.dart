import 'package:aghamazing1/services/api_client.dart';
import 'package:aghamazing1/services/userprofile_service.dart';

class ContentManager {
  final UserProfileService _userProfileService;
  
  ContentManager(this._userProfileService);

  /// Fetch published content for the mobile app
  Future<List<dynamic>> getPublishedContent() async {
    if (!_userProfileService.isAuthenticated || _userProfileService.token == null) {
      throw Exception('User not authenticated');
    }
    
    try {
      return await contentApi.getPublishedContent(_userProfileService.token!);
    } catch (e) {
      throw Exception('Failed to fetch content: $e');
    }
  }

  /// Fetch public content for the mobile app
  Future<List<dynamic>> getPublicContent() async {
    try {
      return await contentApi.getPublicContent();
    } catch (e) {
      throw Exception('Failed to fetch public content: $e');
    }
  }

  /// Fetch AR tour markers for the mobile app
  Future<List<dynamic>> getArTourMarkers() async {
    try {
      return await contentApi.getArMarkers();
    } catch (e) {
      throw Exception('Failed to fetch AR markers: $e');
    }
  }

  /// Fetch user profile data
  Future<Map<String, dynamic>?> getUserProfile() async {
    if (!_userProfileService.isAuthenticated || _userProfileService.token == null) {
      return null;
    }
    
    try {
      return await _userProfileService.fetchUserProfile();
    } catch (e) {
      throw Exception('Failed to fetch user profile: $e');
    }
  }
}