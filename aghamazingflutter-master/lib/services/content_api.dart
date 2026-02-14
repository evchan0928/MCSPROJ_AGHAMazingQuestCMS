import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';

class ContentApiException implements Exception {
  final String message;
  ContentApiException(this.message);
  @override
  String toString() => 'ContentApiException: $message';
}

class ContentApi {
  // Base URL for the Django backend
  final String baseUrl;
  final Duration timeout;

  late final http.Client _client;

  ContentApi({
    required this.baseUrl,
    Duration? timeout,
    bool allowBadCertificateInDebug = true,
  }) : timeout = timeout ?? const Duration(seconds: 10) {
    // In debug builds allow a bad certificate callback (DEV ONLY)
    if (!kReleaseMode && allowBadCertificateInDebug) {
      final ioc = HttpClient()
        ..badCertificateCallback = (X509Certificate cert, String host, int port) => true;
      _client = IOClient(ioc);
    } else {
      _client = http.Client();
    }
  }

  // Clean up client when done
  void close() => _client.close();

  /// Fetch published content for the mobile app
  Future<List<dynamic>> getPublishedContent(String token) async {
    final uri = Uri.parse('$baseUrl/api/content/game/content/');
    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final resp = await _get(uri, headers);
    try {
      final data = jsonDecode(resp);
      if (data is List) {
        return data;
      } else {
        throw ContentApiException('Unexpected response format');
      }
    } catch (e) {
      if (e is ContentApiException) rethrow;
      throw ContentApiException('Invalid content response');
    }
  }

  /// Fetch public content for the mobile app
  Future<List<dynamic>> getPublicContent() async {
    final uri = Uri.parse('$baseUrl/api/content/game/public-content/');
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final resp = await _get(uri, headers);
    try {
      final data = jsonDecode(resp);
      if (data is List) {
        return data;
      } else {
        throw ContentApiException('Unexpected response format');
      }
    } catch (e) {
      if (e is ContentApiException) rethrow;
      throw ContentApiException('Invalid content response');
    }
  }

  /// Fetch AR tour markers for the mobile app
  Future<List<dynamic>> getArMarkers() async {
    final uri = Uri.parse('$baseUrl/api/content/ar-markers/');
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final resp = await _get(uri, headers);
    try {
      final data = jsonDecode(resp);
      if (data['markers'] is List) {
        return data['markers'];
      } else {
        throw ContentApiException('Unexpected response format');
      }
    } catch (e) {
      if (e is ContentApiException) rethrow;
      throw ContentApiException('Invalid AR markers response');
    }
  }

  /// Get user profile information
  Future<Map<String, dynamic>> getUserProfile(String token) async {
    final uri = Uri.parse('$baseUrl/api/auth/me/');
    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final resp = await _get(uri, headers);
    try {
      final data = jsonDecode(resp);
      if (data is Map<String, dynamic>) {
        return data;
      } else {
        throw ContentApiException('Unexpected response format');
      }
    } catch (e) {
      if (e is ContentApiException) rethrow;
      throw ContentApiException('Invalid user profile response');
    }
  }

  // Internal helper for GET requests with timeout + error handling
  Future<String> _get(Uri uri, Map<String, String> headers) async {
    http.Response res;
    try {
      final future = _client.get(uri, headers: headers);
      res = await future.timeout(timeout);
    } on TimeoutException {
      throw ContentApiException('Request timed out. Please try again.');
    } on SocketException catch (e) {
      throw ContentApiException('Network error: ${e.message}');
    } catch (e) {
      throw ContentApiException('Request failed: $e');
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.body;
    }

    // Non-successful response: try to parse JSON error message
    try {
      final decoded = jsonDecode(res.body);
      final err = _parseErrorMessage(decoded);
      throw ContentApiException(err ?? 'Server returned ${res.statusCode}');
    } catch (_) {
      throw ContentApiException('Server error: ${res.statusCode}');
    }
  }

  String? _parseErrorMessage(dynamic decoded) {
    if (decoded == null) return null;
    if (decoded is Map) {
      if (decoded['message'] is String) return decoded['message'] as String;
      if (decoded['error'] is String) return decoded['error'] as String;
      for (final entry in decoded.entries) {
        final v = entry.value;
        if (v is List && v.isNotEmpty) return v.first.toString();
        if (v is String && v.isNotEmpty) return v;
      }
    } else if (decoded is String) {
      return decoded;
    }
    return null;
  }
}