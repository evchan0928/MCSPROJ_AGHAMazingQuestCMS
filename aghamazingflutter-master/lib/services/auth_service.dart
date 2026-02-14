import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import 'api_client.dart';
import 'auth_api.dart';
import 'userprofile_service.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  late final AuthApi _authApi;
  late final UserProfileService _userProfileService;

  // Get current user
  User? get currentUser => _auth.currentUser;

  // Auth state stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Constructor to inject dependencies
  AuthService({AuthApi? authApi, UserProfileService? userProfileService}) {
    _authApi = authApi ?? AuthApi(
      registerUrl: 'http://10.0.2.2:8000/api/auth/register/',
      loginUrl: 'http://10.0.2.2:8000/api/auth/login/',
      otpRequestUrl: 'http://10.0.2.2:8000/api/auth/otp/request/',
      otpVerifyUrl: 'http://10.0.2.2:8000/api/auth/otp/verify/',
      passwordResetUrl: 'http://10.0.2.2:8000/api/auth/password/reset/',
    );
    _userProfileService = userProfileService ?? UserProfileService();
  }

  // Initialize the service
  Future<void> initialize() async {
    await _userProfileService.initialize();
  }

  // ============================================================
  // REGISTRATION WITH EMAIL VERIFICATION
  // ============================================================

  /// Register with email verification
  Future<Map<String, dynamic>> registerWithEmailVerification({
    required String email,
    required String password,
    required String displayName,
  }) async {
    try {
      debugPrint('🚀 Starting registration for: $email');

      // Create account - Firebase will handle if email already exists
      UserCredential result = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (result.user == null) {
        debugPrint('❌ User creation returned null');
        return {
          'success': false,
          'message': 'Account creation failed'
        };
      }

      debugPrint('✅ Firebase Auth account created: ${result.user!.uid}');

      // Skip display name update due to Firebase plugin bug
      debugPrint('⚠️ Skipping display name update (will set in Firestore instead)');

      // Create user profile in Firestore FIRST (while user is still authenticated)
      try {
        debugPrint('📝 About to create Firestore profile...');
        await _createUserProfile(
          userId: result.user!.uid,
          email: email,
          displayName: displayName,
        );
        debugPrint('✅ Firestore profile creation completed');
      } catch (firestoreError) {
        debugPrint('❌ Firestore creation failed: $firestoreError');

        // Delete the auth user if Firestore creation fails
        try {
          await result.user!.delete();
          debugPrint('🗑️ Auth user deleted due to Firestore failure');
        } catch (deleteError) {
          debugPrint('⚠️ Could not delete auth user: $deleteError');
        }

        return {
          'success': false,
          'message': 'Failed to create user profile: ${firestoreError.toString()}'
        };
      }

      // Send verification email
      debugPrint('📧 Sending verification email...');
      try {
        await result.user!.sendEmailVerification();
        debugPrint('✅ Verification email sent successfully');
      } catch (emailError) {
        debugPrint('⚠️ Error sending verification email: $emailError');
      }

      // Sign out the user so they have to verify first
      debugPrint('🚪 Signing out user...');
      await _auth.signOut();
      debugPrint('✅ User signed out');

      debugPrint('🎉 Registration completed successfully!');
      return {
        'success': true,
        'message': 'Account created! Please check $email for verification link.',
        'user': result.user
      };
    } on FirebaseAuthException catch (e) {
      debugPrint('❌ FirebaseAuthException: ${e.code} - ${e.message}');
      if (e.code == 'email-already-in-use') {
        return {
          'success': false,
          'message': 'This email is already registered. Please login instead.',
          'userExists': true,
        };
      } else if (e.code == 'weak-password') {
        return {
          'success': false,
          'message': 'Password is too weak. Use at least 6 characters.'
        };
      } else {
        return {
          'success': false,
          'message': 'Registration failed: ${e.message}'
        };
      }
    } catch (e) {
      debugPrint('❌ Unexpected error: $e');
      return {
        'success': false,
        'message': 'Error: $e'
      };
    }
  }

  // ============================================================
  // LOGIN
  // ============================================================

  Future<Map<String, dynamic>> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      UserCredential result = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (result.user != null) {
        // Check if email is verified
        if (!result.user!.emailVerified) {
          await _auth.signOut();
          return {
            'success': false,
            'message': 'Please verify your email before logging in. Check your inbox.',
            'needsVerification': true,
          };
        }

        // Update last login
        await _firestore.collection('users').doc(result.user!.uid).update({
          'lastLogin': FieldValue.serverTimestamp(),
        });

        // Save session
        await _saveSession(result.user!.uid);

        return {
          'success': true,
          'message': 'Login successful',
          'user': result.user
        };
      }

      return {
        'success': false,
        'message': 'Login failed'
      };
    } on FirebaseAuthException catch (e) {
      if (e.code == 'user-not-found' || e.code == 'invalid-credential') {
        return {
          'success': false,
          'message': 'Invalid email or password'
        };
      } else if (e.code == 'wrong-password') {
        return {
          'success': false,
          'message': 'Incorrect password'
        };
      } else if (e.code == 'invalid-email') {
        return {
          'success': false,
          'message': 'Invalid email format'
        };
      } else {
        return {
          'success': false,
          'message': 'Login failed: ${e.message}'
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error: $e'
      };
    }
  }

  /// Mask email for privacy (e.g., r****a@gmail.com)
  String _maskEmail(String email) {
    if (!email.contains('@')) return email;

    final parts = email.split('@');
    final localPart = parts[0];
    final domain = parts[1];

    if (localPart.length <= 2) {
      return '${localPart[0]}***@$domain';
    } else {
      final firstChar = localPart[0];
      final lastChar = localPart[localPart.length - 1];
      final maskLength = localPart.length - 2;
      final masked = '*' * (maskLength > 4 ? 4 : maskLength);

      return '$firstChar$masked$lastChar@$domain';
    }
  }

  // ============================================================
  // DJANGO BACKEND INTEGRATION
  // ============================================================

  /// Register with Django backend
  Future<Map<String, dynamic>> registerWithDjango({
    required String email,
    required String password,
    required String username,
  }) async {
    try {
      debugPrint('🚀 Starting registration for: $email via Django backend');

      // Register with Django backend
      final token = await authApi.registerUser(username: username, email: email, password: password);
      
      if (token == 'registration_success') {
        debugPrint('✅ Django backend registration completed successfully');
        
        // Create local session
        await _saveLocalSession(email, username);
        
        return {
          'success': true,
          'message': 'Account created successfully! Please login.',
        };
      } else {
        debugPrint('❌ Django backend registration failed - invalid token');
        return {
          'success': false,
          'message': 'Registration failed with backend'
        };
      }
    } on Exception catch (e) {
      debugPrint('❌ Registration error: $e');
      return {
        'success': false,
        'message': 'Registration failed: $e'
      };
    }
  }

  /// Login with Django backend
  Future<Map<String, dynamic>> loginWithDjango({
    required String email,
    required String password,
  }) async {
    try {
      debugPrint('🚀 Starting login for: $email via Django backend');
      
      // Authenticate with Django backend
      final token = await authApi.loginUser(email: email, password: password);
      
      if (token.isNotEmpty) {
        debugPrint('✅ Django backend login successful, token received');
        
        // Fetch user profile from backend
        final userProfile = await _userProfileService.fetchUserProfile();
        if (userProfile != null) {
          debugPrint('👤 User profile fetched successfully');
          
          // Save session locally
          await _saveSession(userProfile['user_id']);
          
          return {
            'success': true,
            'message': 'Login successful',
            'user': userProfile,
          };
        } else {
          debugPrint('❌ Failed to fetch user profile');
          return {
            'success': false,
            'message': 'Failed to fetch user profile',
          };
        }
      } else {
        debugPrint('❌ Django backend login failed');
        return {
          'success': false,
          'message': 'Invalid credentials',
        };
      }
    } catch (e) {
      debugPrint('❌ Django login error: $e');
      return {
        'success': false,
        'message': 'Login failed: ${e.toString()}',
      };
    }
  }
  
  /// Request password reset - sends reset email
  Future<Map<String, dynamic>> requestPasswordReset({required String email}) async {
    try {
      debugPrint('🔄 Requesting password reset for: $email');
      
      // Call the backend to send password reset email
      await authApi.requestPasswordReset(email: email);
      
      debugPrint('✅ Password reset email sent successfully');
      return {
        'success': true,
        'message': 'Password reset link sent to your email',
      };
    } catch (e) {
      debugPrint('❌ Password reset request failed: $e');
      return {
        'success': false,
        'message': 'Failed to send password reset: ${e.toString()}',
      };
    }
  }

  // ============================================================
  // DJANGO HELPER METHODS
  // ============================================================

  /// Save local session data
  Future<void> _saveLocalSession(String email, String displayName) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('email', email);
    await prefs.setString('displayName', displayName);
    await prefs.setBool('isLoggedIn', true);
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getBool('isLoggedIn') ?? false;
  }

  /// Get saved email
  Future<String?> getSavedEmail() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('email');
  }

  /// Get saved display name
  Future<String?> getSavedDisplayName() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('displayName');
  }

  /// Logout from Django backend and clear local session
  Future<void> logout() async {
    try {
      debugPrint('🚀 Starting logout process');
      
      // Clear local session first
      await _clearLocalSession();
      
      // Clear user profile data
      await _userProfileService.clearUserData();
      
      debugPrint('✅ Logout completed successfully');
    } catch (e) {
      debugPrint('❌ Error during logout: $e');
    }
  }

  /// Clear local session
  Future<void> _clearLocalSession() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('email');
    await prefs.remove('displayName');
    await prefs.setBool('isLoggedIn', false);
  }

  // ============================================================
  // LEGACY FIREBASE METHODS (for compatibility)
  // ============================================================

  // All deprecated methods have been removed to prevent duplicate definition errors
  // Use the primary methods defined elsewhere in the class instead

  // ============================================================
  // HELPER METHODS
  // ============================================================

  /// Save session locally
  Future<void> _saveSession(String userId) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('userId', userId);
    await prefs.setBool('isLoggedIn', true);

    await _firestore.collection('sessions').add({
      'userId': userId,
      'loginTime': FieldValue.serverTimestamp(),
      'logoutTime': null,
    });
  }

  /// Create user profile in Firestore
  Future<void> _createUserProfile({
    required String userId,
    required String email,
    required String displayName,
  }) async {
    try {
      debugPrint('🔍 Attempting to create user profile for: $userId');

      await _firestore.collection('users').doc(userId).set({
        'email': email,
        'displayName': displayName,
        'coins': 0,
        'energy': 100,
        'totalScore': 0,      // Initialize for leaderboard query
        'gamesPlayed': 0,     // Initialize for stats
        'gamesWon': 0,        // Initialize for stats
        'createdAt': FieldValue.serverTimestamp(),
        'lastLogin': FieldValue.serverTimestamp(),
      });

      debugPrint('✅ User profile created successfully in Firestore!');
    } catch (e) {
      debugPrint('❌ Error creating user profile: $e');
      rethrow;
    }
  }

  /// Get saved user ID
  Future<String?> getSavedUserId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
  }
}
