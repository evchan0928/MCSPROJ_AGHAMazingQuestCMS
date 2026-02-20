# Database Schema Migration: From Firebase to PostgreSQL

This document outlines the migration strategy from Firebase to PostgreSQL for the AGHAMazing Flutter application. This will enable the mobile app to work in a local network environment with the CMS backend using a unified database.

## Overview

The AGHAMazing Flutter app previously used Firebase for:
- Authentication (Firebase Auth)
- Real-time database (Cloud Firestore) for user profiles, sessions, and game data

We're migrating to use the existing CMS backend's PostgreSQL database via REST APIs for:
- User profiles and authentication tokens
- Game scores and progress
- User sessions
- Leaderboards
- Badges and achievements

## Current Firebase Collections and Their PostgreSQL Equivalents

### 1. Users Collection
**Firebase Structure:**
```javascript
users: {
  userId: {
    email: "user@example.com",
    displayName: "John Doe",
    coins: 0,
    energy: 100,
    totalScore: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    createdAt: timestamp,
    lastLogin: timestamp,
    avatarPath: "assets/images/avatars/..."
  }
}
```

**PostgreSQL Equivalent:**
- Use the existing `mobilemanagement_userprofile` table in the CMS backend
- Link to Django's built-in `auth_user` table
- Fields: `user_id`, `email`, `display_name`, `coins`, `energy`, `total_score`, `games_played`, `games_won`, `created_at`, `last_login`, `avatar_path`

### 2. Sessions Collection
**Firebase Structure:**
```javascript
sessions: {
  sessionId: {
    userId: "...",
    loginTime: timestamp,
    logoutTime: timestamp
  }
}
```

**PostgreSQL Equivalent:**
- Use the existing `mobilemanagement_usersession` table in the CMS backend
- Fields: `id`, `user_id`, `login_time`, `logout_time`

### 3. Scores Collection
**Firebase Structure:**
```javascript
scores: {
  scoreId: {
    userId: "...",
    gameId: "...",
    score: 100,
    timestamp: timestamp
  }
}
```

**PostgreSQL Equivalent:**
- Use the existing `mobilemanagement_score` table in the CMS backend
- Fields: `id`, `user_id`, `game_id`, `score`, `timestamp`

### 4. Badges Collection
**Firebase Structure:**
```javascript
badges: {
  badgeId: {
    name: "Explorer",
    description: "Completed first level",
    iconPath: "assets/images/badges/explorer.png"
  }
}
```

**PostgreSQL Equivalent:**
- Use the existing `mobilemanagement_badge` table in the CMS backend
- Fields: `id`, `name`, `description`, `icon_path`

### 5. UserBadges Collection
**Firebase Structure:**
```javascript
userBadges: {
  userBadgeId: {
    userId: "...",
    badgeId: "...",
    earnedAt: timestamp
  }
}
```

**PostgreSQL Equivalent:**
- Use the existing `mobilemanagement_userbadge` table in the CMS backend
- Fields: `id`, `user_id`, `badge_id`, `earned_at`

### 6. Leaderboards Collection
**Firebase Structure:**
```javascript
leaderboards: {
  leaderboardId: {
    userId: "...",
    score: 100,
    rank: 5,
    category: "weekly"
  }
}
```

**PostgreSQL Equivalent:**
- Use the existing `mobilemanagement_leaderboard` table in the CMS backend
- Fields: `id`, `user_id`, `score`, `rank`, `category`

## API Endpoints Mapping

### Authentication
- **Firebase:** `auth.createUserWithEmailAndPassword()`
- **PostgreSQL via CMS:** `POST /api/auth/register/`

- **Firebase:** `auth.signInWithEmailAndPassword()`
- **PostgreSQL via CMS:** `POST /api/auth/login/`

- **Firebase:** `auth.currentUser`
- **PostgreSQL via CMS:** `GET /api/auth/me/` (with Bearer token)

### User Profile Management
- **Firebase:** `firestore.collection('users').doc(userId).get()`
- **PostgreSQL via CMS:** `GET /api/mobile/userprofiles/{id}/`

- **Firebase:** `firestore.collection('users').doc(userId).update()`
- **PostgreSQL via CMS:** `PATCH /api/mobile/userprofiles/{id}/`

### Game Data
- **Firebase:** `firestore.collection('scores').add()`
- **PostgreSQL via CMS:** `POST /api/mobile/scores/`

- **Firebase:** `firestore.collection('leaderboards').get()`
- **PostgreSQL via CMS:** `GET /api/mobile/leaderboards/`

## Challenges and Complexity Assessment

### High Complexity Challenges:

1. **Data Migration Strategy:**
   - If there's existing Firebase data that needs to be preserved, a careful export-import process is required
   - Need to map Firebase document IDs to PostgreSQL auto-incrementing IDs or UUIDs

2. **Real-time Updates:**
   - Firebase provides real-time updates, whereas PostgreSQL requires polling or WebSocket connections
   - May need to implement Server-Sent Events (SSE) or WebSockets in the CMS backend

3. **Offline Support:**
   - Firebase SDK provides built-in offline support
   - With PostgreSQL via REST, we need to implement local caching with SQLite or Hive

### Medium Complexity Challenges:

1. **Authentication Flow:**
   - Transitioning from Firebase Auth to Django's authentication system
   - Managing JWT tokens vs Firebase tokens

2. **Data Consistency:**
   - Ensuring data consistency between local storage and remote PostgreSQL
   - Handling synchronization when network is intermittent

### Low Complexity Challenges:

1. **API Integration:**
   - The CMS backend already has the required API endpoints
   - Just need to adjust the Flutter app to use these endpoints

## Implementation Plan

### Phase 1: Core Migration (Done)
- Remove all Firebase dependencies from pubspec.yaml
- Update all services to use CMS REST APIs instead of Firebase
- Update UI screens to work with new service implementations

### Phase 2: Local Storage Enhancement
- Implement local caching using Hive or SQLite for offline support
- Create synchronization mechanism between local and remote data

### Phase 3: Testing
- Test all functionality in offline mode
- Verify data consistency between mobile app and CMS backend
- Performance testing in local network environment

## Benefits of Migration

1. **Unified Database:** Single PostgreSQL database for both CMS and mobile app
2. **Local Network Operation:** Works efficiently in local network between Ubuntu CMS server and Windows mobile development
3. **Simplified Architecture:** Eliminates need for separate Firebase project
4. **Better Control:** Full control over data and APIs within the organization
5. **Cost Efficiency:** Reduces dependency on external services