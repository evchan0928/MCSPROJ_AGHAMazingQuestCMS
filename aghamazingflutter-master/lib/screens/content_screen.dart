import 'package:flutter/material.dart';
import '../services/content_manager.dart';
import '../services/userprofile_service.dart';

class ContentScreen extends StatefulWidget {
  const ContentScreen({super.key});

  @override
  State<ContentScreen> createState() => _ContentScreenState();
}

class _ContentScreenState extends State<ContentScreen> {
  final UserProfileService _userProfileService = UserProfileService();
  late ContentManager _contentManager;
  List<dynamic> _contentItems = [];
  List<dynamic> _arMarkers = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializeServices();
  }

  Future<void> _initializeServices() async {
    await _userProfileService.initialize();
    _contentManager = ContentManager(_userProfileService);
    await _loadContent();
  }

  Future<void> _loadContent() async {
    try {
      // Load both public and user-specific content
      final publicContentFuture = _contentManager.getPublicContent();
      final arMarkersFuture = _contentManager.getArTourMarkers();
      
      final results = await Future.wait([publicContentFuture, arMarkersFuture]);
      
      setState(() {
        _contentItems = results[0];
        _arMarkers = results[1];
        _isLoading = false;
        _errorMessage = null;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Content Management'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        color: Colors.red,
                        size: 64,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Error: $_errorMessage',
                        style: const TextStyle(fontSize: 16),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadContent,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadContent,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // User profile section
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Your Profile',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              FutureBuilder<Map<String, dynamic>?>(
                                future: _contentManager.getUserProfile(),
                                builder: (context, snapshot) {
                                  if (snapshot.connectionState == ConnectionState.waiting) {
                                    return const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 8),
                                      child: LinearProgressIndicator(),
                                    );
                                  }
                                  
                                  if (snapshot.hasError) {
                                    return Text('Error loading profile: ${snapshot.error}');
                                  }
                                  
                                  final profile = snapshot.data;
                                  if (profile != null) {
                                    return Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('ID: ${profile['id']}'),
                                        Text('Username: ${profile['username'] ?? profile['email']}'),
                                        Text('Email: ${profile['email']}'),
                                      ],
                                    );
                                  } else {
                                    return const Text('Not authenticated');
                                  }
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // AR Markers Section
                      if (_arMarkers.isNotEmpty) ...[
                        const Text(
                          'AR Tour Markers',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ..._arMarkers.map((marker) => Card(
                              child: ListTile(
                                leading: const Icon(Icons.location_on),
                                title: Text(marker['title'] ?? 'Untitled Marker'),
                                subtitle: Text(marker['description'] ?? 'No description'),
                                trailing: const Icon(Icons.qr_code),
                              ),
                            )),
                        const Divider(height: 32),
                      ],
                      
                      // Content Items Section
                      const Text(
                        'Available Content',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      if (_contentItems.isEmpty)
                        const Padding(
                          padding: EdgeInsets.all(16),
                          child: Center(
                            child: Text(
                              'No content available',
                              style: TextStyle(fontSize: 16, color: Colors.grey),
                            ),
                          ),
                        )
                      else
                        ..._contentItems.map((item) => Card(
                              child: ListTile(
                                leading: CircleAvatar(
                                  child: Text(
                                    (item['title'] ?? '')[0].toUpperCase(),
                                  ),
                                ),
                                title: Text(item['title'] ?? 'Untitled'),
                                subtitle: Text(
                                  item['description'] ?? item['body'] ?? 'No description',
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                trailing: Text(
                                  item['content_type'] ?? 'Unknown',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                              ),
                            )),
                    ],
                  ),
                ),
    );
  }
}