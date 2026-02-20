import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';

class EnergyManager {
  static final EnergyManager _instance = EnergyManager._internal();
  factory EnergyManager() => _instance;
  EnergyManager._internal();

  static const String _keyCurrentEnergy = 'current_energy';
  static const String _keyLastEnergyUpdateTime = 'last_energy_update_time';
  static const String _keyMaxEnergy = 'max_energy';
  static const String _keyEnergyRegenMinutes = 'energy_regen_minutes';
  static const String _keyLastSyncTime = 'last_sync_time';

  // Default values
  static const int defaultMaxEnergy = 100;
  static const int defaultEnergyRegenMinutes = 10; // Regenerate 1 energy every 10 minutes

  // Singleton instance
  static EnergyManager? _cachedInstance;

  static Future<EnergyManager> get instance async {
    _cachedInstance ??= await _getInstance();
    return _cachedInstance!;
  }

  static Future<EnergyManager> _getInstance() async {
    final manager = EnergyManager._internal();
    await manager._initializeDefaults();
    return manager;
  }

  Future<void> _initializeDefaults() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Set defaults if not already set
    if (!prefs.containsKey(_keyMaxEnergy)) {
      await prefs.setInt(_keyMaxEnergy, defaultMaxEnergy);
    }
    if (!prefs.containsKey(_keyEnergyRegenMinutes)) {
      await prefs.setInt(_keyEnergyRegenMinutes, defaultEnergyRegenMinutes);
    }
    
    // Initialize energy to max if not set
    if (!prefs.containsKey(_keyCurrentEnergy)) {
      await prefs.setInt(_keyCurrentEnergy, getMaxEnergy());
    }
  }

  // Get current energy
  Future<int> getCurrentEnergy() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_keyCurrentEnergy) ?? 0;
  }

  // Get max energy
  int getMaxEnergy() {
    final prefs = SharedPreferences.getInstance();
    return prefs.getInt(_keyMaxEnergy) ?? defaultMaxEnergy;
  }

  // Get energy regeneration rate (minutes per energy point)
  int getEnergyRegenMinutes() {
    final prefs = SharedPreferences.getInstance();
    return prefs.getInt(_keyEnergyRegenMinutes) ?? defaultEnergyRegenMinutes;
  }

  // Set max energy
  Future<void> setMaxEnergy(int maxEnergy) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_keyMaxEnergy, maxEnergy);
  }

  // Set energy regeneration rate
  Future<void> setEnergyRegenMinutes(int minutes) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_keyEnergyRegenMinutes, minutes);
  }

  // Spend energy (reduce by specified amount)
  Future<bool> spendEnergy(int amount) async {
    int currentEnergy = await getCurrentEnergy();
    int maxEnergy = getMaxEnergy();

    if (currentEnergy < amount) {
      return false; // Not enough energy
    }

    int newEnergy = (currentEnergy - amount).clamp(0, maxEnergy);
    await setCurrentEnergy(newEnergy);
    return true;
  }

  // Restore energy to full
  Future<void> restoreFullEnergy() async {
    int maxEnergy = getMaxEnergy();
    await setCurrentEnergy(maxEnergy);
  }

  // Reduce energy by specific amount
  Future<void> reduceEnergy(int amount) async {
    int currentEnergy = await getCurrentEnergy();
    int maxEnergy = getMaxEnergy();
    int newEnergy = (currentEnergy - amount).clamp(0, maxEnergy);
    await setCurrentEnergy(newEnergy);
  }

  // Increase energy by specific amount
  Future<void> increaseEnergy(int amount) async {
    int currentEnergy = await getCurrentEnergy();
    int maxEnergy = getMaxEnergy();
    int newEnergy = (currentEnergy + amount).clamp(0, maxEnergy);
    await setCurrentEnergy(newEnergy);
  }

  // Set current energy value
  Future<void> setCurrentEnergy(int energy) async {
    final prefs = await SharedPreferences.getInstance();
    int maxEnergy = getMaxEnergy();
    int clampedEnergy = energy.clamp(0, maxEnergy);
    
    await prefs.setInt(_keyCurrentEnergy, clampedEnergy);
    await prefs.setString(
      _keyLastEnergyUpdateTime,
      DateTime.now().toIso8601String(),
    );
  }

  // Calculate regenerated energy based on time passed
  Future<int> calculateRegeneratedEnergy() async {
    final prefs = await SharedPreferences.getInstance();
    String? lastUpdateStr = prefs.getString(_keyLastEnergyUpdateTime);
    
    if (lastUpdateStr == null) return 0;

    try {
      DateTime lastUpdate = DateTime.parse(lastUpdateStr);
      Duration duration = DateTime.now().difference(lastUpdate);
      int minutesPassed = duration.inMinutes;
      int energyRegenMinutes = getEnergyRegenMinutes();
      
      if (minutesPassed < energyRegenMinutes) return 0;
      
      int regeneratedEnergy = (minutesPassed / energyRegenMinutes).floor();
      int currentEnergy = await getCurrentEnergy();
      int maxEnergy = getMaxEnergy();
      int potentialEnergy = (currentEnergy + regeneratedEnergy).clamp(0, maxEnergy);
      
      return potentialEnergy - currentEnergy;
    } catch (e) {
      debugPrint("Error calculating regenerated energy: $e");
      return 0;
    }
  }

  // Regenerate energy based on time passed
  Future<void> regenerateEnergy() async {
    int regeneratedEnergy = await calculateRegeneratedEnergy();
    if (regeneratedEnergy > 0) {
      await increaseEnergy(regeneratedEnergy);
    }
  }

  // Get formatted time until next energy regeneration
  Future<String> getTimeUntilNextEnergy() async {
    final prefs = await SharedPreferences.getInstance();
    String? lastUpdateStr = prefs.getString(_keyLastEnergyUpdateTime);
    
    if (lastUpdateStr == null) return "00:00";
    
    try {
      DateTime lastUpdate = DateTime.parse(lastUpdateStr);
      int energyRegenMinutes = getEnergyRegenMinutes();
      Duration elapsed = DateTime.now().difference(lastUpdate);
      int minutesUntilNext = (energyRegenMinutes - elapsed.inMinutes % energyRegenMinutes) % energyRegenMinutes;
      
      // If current energy is at max, no regeneration needed
      if (await getCurrentEnergy() >= getMaxEnergy()) {
        return "Fully Charged";
      }
      
      if (minutesUntilNext <= 0) return "Ready";
      
      int secondsUntilNext = (energyRegenMinutes * 60) - elapsed.inSeconds % (energyRegenMinutes * 60);
      int minutes = secondsUntilNext ~/ 60;
      int seconds = secondsUntilNext % 60;
      
      return "${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}";
    } catch (e) {
      debugPrint("Error calculating time until next energy: $e");
      return "00:00";
    }
  }

  // Calculate time needed to regenerate to full energy
  Future<String> getTimeUntilFullEnergy() async {
    int currentEnergy = await getCurrentEnergy();
    int maxEnergy = getMaxEnergy();
    int missingEnergy = maxEnergy - currentEnergy;
    
    if (missingEnergy <= 0) return "Fully Charged";
    
    int energyRegenMinutes = getEnergyRegenMinutes();
    int totalMinutesNeeded = missingEnergy * energyRegenMinutes;
    
    int hours = totalMinutesNeeded ~/ 60;
    int minutes = totalMinutesNeeded % 60;
    
    return "${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:00";
  }

  // Calculate seconds needed to regenerate to full energy
  Future<int> getSecondsUntilFullEnergy() async {
    int currentEnergy = await getCurrentEnergy();
    int maxEnergy = getMaxEnergy();
    int missingEnergy = maxEnergy - currentEnergy;
    
    if (missingEnergy <= 0) return 0;
    
    int energyRegenMinutes = getEnergyRegenMinutes();
    return missingEnergy * energyRegenMinutes * 60; // Convert to seconds
  }

  // ============================================================
  // SYNC METHODS (Sync with CMS backend)
  // ============================================================

  /// Sync local energy with CMS backend
  /// Call this periodically or when internet connection is restored
  Future<bool> syncWithBackend(String? token) async {
    if (token == null) {
      debugPrint('No token available for sync, skipping');
      return false;
    }

    try {
      int currentEnergy = await getCurrentEnergy();

      // Update CMS backend with current local energy
      bool success = await _updateEnergyOnBackend(token, currentEnergy);

      if (success) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(
          _keyLastSyncTime,
          DateTime.now().toIso8601String(),
        );
      }

      return success;
    } catch (e) {
      debugPrint('Error syncing energy with backend: $e');
      return false;
    }
  }

  /// Update energy on backend via CMS API
  Future<bool> _updateEnergyOnBackend(String token, int energy) async {
    try {
      // Note: Currently we don't have a specific energy field in the user profile
      // So we'll skip backend sync for energy until the backend is updated to support it
      debugPrint('Energy sync skipped - no backend energy field implemented');
      return true;
      
      /* // Original code commented out until backend supports energy field
      final url = Uri.parse('${ApiConfig.getBaseUrl()}/api/mobile/user-profiles/');
      final headers = {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      };
      final body = jsonEncode({'energy': energy});

      final response = await http.patch(url, headers: headers, body: body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        debugPrint('Successfully synced energy ($energy) with backend');
        return true;
      } else {
        debugPrint('Failed to sync energy with backend: ${response.statusCode}');
        return false;
      }
      */
    } catch (e) {
      debugPrint('Exception syncing energy with backend: $e');
      return false;
    }
  }

  /// Fetch energy from backend to sync local state
  Future<bool> refreshFromBackend(String? token) async {
    if (token == null) {
      debugPrint('No token available for refresh, skipping');
      return false;
    }

    // Note: Currently we don't have a specific energy field in the user profile
    // So we'll skip backend sync for energy until the backend is updated to support it
    debugPrint('Energy refresh from backend skipped - no backend energy field implemented');
    return true;
    
    /* // Original code commented out until backend supports energy field
    try {
      final url = Uri.parse('${ApiConfig.getBaseUrl()}/api/mobile/user-profiles/');
      final headers = {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      };

      final response = await http.get(url, headers: headers);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final backendEnergy = data['energy'] as int?;
        
        if (backendEnergy != null) {
          await setCurrentEnergy(backendEnergy);
          debugPrint('Successfully refreshed energy ($backendEnergy) from backend');
          return true;
        }
      }
      
      debugPrint('Failed to refresh energy from backend: ${response.statusCode}');
      return false;
    } catch (e) {
      debugPrint('Exception refreshing energy from backend: $e');
      return false;
    }
    */
  }
}