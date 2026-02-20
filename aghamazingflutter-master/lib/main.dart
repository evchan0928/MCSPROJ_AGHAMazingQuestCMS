import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/welcome_screen.dart';
import 'services/auth_service.dart';
import 'services/energy_manager.dart';  // This was moved up in the imports
// ADD THIS
import 'services/auth_api.dart';  // ADD THIS IMPORT
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/mainmenu_screen.dart';
import 'screens/trivia_game1/main_trivia_screen.dart';
import 'screens/gemgrab/gem_grab_game_screen.dart';
import 'screens/content_screen.dart';  // ADD CONTENT SCREEN IMPORT
import 'config/api_config.dart'; // Import the new config

void main() async {
  // Ensure Flutter bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Enforce Portrait Only Mode
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);


  // Initialize Energy System (ADD THIS)
  await EnergyManager.instance.initialize();

  // Print current API configuration for debugging
  ApiConfig.printCurrentConfig();

  // Initialize services with the base API URL from config
  final authApi = AuthApi(
    registerUrl: ApiConfig.authRegisterEndpoint,
    loginUrl: ApiConfig.authLoginEndpoint,
    otpRequestUrl: ApiConfig.otpRequestEndpoint,
    otpVerifyUrl: ApiConfig.otpVerifyEndpoint,
    passwordResetUrl: ApiConfig.passwordResetEndpoint,
    timeout: const Duration(seconds: 15),
  );


  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AGHAMazing',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
        fontFamily: 'LilitaOne',
      ),
      // Use AuthWrapper to check authentication state
      home: const AuthWrapper(),
      routes: {
        '/welcome': (_) => const WelcomeScreen(),
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/mainmenu': (_) => const MainMenuScreen(),
        '/profile': (_) => const ProfileScreen(),
        '/trivia': (_) => const MainTriviaScreen(),
        '/gemgrab': (_) => const GemGrabGameScreen(),  // ADD THIS LINE
        '/content': (_) => const ContentScreen(),  // ADD CONTENT SCREEN ROUTE
      },
    );
  }
}

// This widget checks if user is logged in
class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();

    return StreamBuilder<User?>(
      stream: authService.authStateChanges,
      builder: (context, snapshot) {
        // Show loading while checking auth state
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        // User is logged in - go to main menu
        if (snapshot.hasData) {
          return const MainMenuScreen();
        }

        // User is not logged in - show welcome screen
        return const WelcomeScreen();
      },
    );
  }
}