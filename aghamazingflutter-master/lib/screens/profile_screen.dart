import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/userprofile_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  static const _bg = 'assets/images/backgrounds/profile_screen.png';
  static const backButtonAsset = 'assets/images/pngs/btn_back.png';

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  String? _profileAvatarPath;
  bool _loading = true;

  // Remove Firebase references and use local services
  final UserProfileService _profileService = UserProfileService();

  static const List<String> _avatarPool = [
    'assets/images/avatars/botttsNeutral-blue.png',
    'assets/images/avatars/botttsNeutral-yellow.png',
    'assets/images/avatars/botttsNeutral-cool.png',
    'assets/images/avatars/botttsNeutral-mad.png',
    'assets/images/avatars/botttsNeutral-brown.png',
  ];

  @override
  void initState() {
    super.initState();
    _loadProfileFromBackend();
  }

  // NEW: Load from Backend instead of Firebase
  Future<void> _loadProfileFromBackend() async {
    setState(() => _loading = true);

    try {
      // Check if user is authenticated
      if (!_profileService.isAuthenticated) {
        // User not logged in, redirect to login
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/login');
        }
        return;
      }

      // Get user profile from backend
      final profile = await _profileService.fetchUserProfile();

      if (profile != null) {
        _nameController.text = profile['username'] ?? profile['first_name'] ?? '';
        _emailController.text = profile['email'] ?? '';
        // Load avatar path from shared preferences
        final prefs = await SharedPreferences.getInstance();
        _profileAvatarPath = prefs.getString('avatarPath');
      } else {
        // Fallback to local storage if backend profile doesn't exist
        final prefs = await SharedPreferences.getInstance();
        _nameController.text = prefs.getString('displayName') ?? '';
        _emailController.text = prefs.getString('email') ?? '';
      }
    } catch (e) {
      debugPrint('Error loading profile: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading profile: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // UPDATE: Save name to backend
  Future<void> _saveNameToBackend() async {
    try {
      final name = _nameController.text.trim();
      if (name.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Name cannot be empty')),
        );
        return;
      }

      // Update in backend
      final success = await _profileService.updateUserProfile(displayName: name);

      if (success) {
        // Update local storage as well
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('displayName', name);

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Name saved successfully')),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to save name to server')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving name: $e')),
      );
    }
  }

  // UPDATE: Save avatar to local storage
  Future<void> _saveProfileAvatarPath(String assetPath) async {
    try {
      // Save to shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('avatarPath', assetPath);

      setState(() => _profileAvatarPath = assetPath);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile picture updated')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating picture: $e')),
      );
    }
  }

  Future<void> _showAvatarSelectionSheet() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: false,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 12.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 8),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Choose Avatar',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: GridView.builder(
                    shrinkWrap: true,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                    ),
                    itemCount: _avatarPool.length,
                    itemBuilder: (context, index) {
                      final assetPath = _avatarPool[index];
                      final isSelected = _profileAvatarPath == assetPath;
                      
                      return GestureDetector(
                        onTap: () async {
                          await _saveProfileAvatarPath(assetPath);
                          Navigator.of(context).pop(); // Close the modal
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: isSelected ? Colors.blue : Colors.transparent,
                              width: isSelected ? 3 : 0,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.asset(
                              assetPath,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _handleLogout() async {
    final authService = AuthService();
    await authService.logout();

    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/welcome');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Avatar Section
                    Center(
                      child: Stack(
                        children: [
                          GestureDetector(
                            onTap: _showAvatarSelectionSheet,
                            child: CircleAvatar(
                              radius: 60,
                              backgroundImage: _profileAvatarPath != null
                                  ? AssetImage(_profileAvatarPath!)
                                  : const AssetImage(
                                      'assets/images/avatars/botttsNeutral-cool.png', // Default avatar
                                    ),
                              backgroundColor: Colors.grey.shade300,
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              height: 40,
                              width: 40,
                              decoration: BoxDecoration(
                                color: Theme.of(context).primaryColor,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Icon(
                                Icons.camera_alt,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    
                    // Name Input
                    TextField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Name',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 10),
                    
                    ElevatedButton(
                      onPressed: _saveNameToBackend,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).primaryColor,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Save Name'),
                    ),
                    const SizedBox(height: 20),
                    
                    // Email Display (read-only for now)
                    TextField(
                      controller: _emailController,
                      enabled: false, // Read-only
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        border: OutlineInputBorder(),
                        disabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.grey),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    
                    // Additional profile fields could be added here
                  ],
                ),
              ),
            ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }
}
