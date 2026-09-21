import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../models/user.dart';

/// Single owner of persisted auth state (Keychain on iOS, Keystore-backed
/// EncryptedSharedPreferences on Android) — the mobile equivalent of the
/// web app's `localStorage`-based `lib/auth-storage.ts`.
class StoredAuth {
  final String accessToken;
  final String refreshToken;
  final User user;

  const StoredAuth({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory StoredAuth.fromJson(Map<String, dynamic> json) => StoredAuth(
    accessToken: json['accessToken'] as String,
    refreshToken: json['refreshToken'] as String,
    user: User.fromJson(json['user'] as Map<String, dynamic>),
  );

  Map<String, dynamic> toJson() => {
    'accessToken': accessToken,
    'refreshToken': refreshToken,
    'user': user.toJson(),
  };
}

class AuthStorage {
  static const _storageKey = 'cova_auth';
  final FlutterSecureStorage _storage;

  AuthStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  Future<StoredAuth?> read() async {
    final raw = await _storage.read(key: _storageKey);
    if (raw == null) return null;
    try {
      return StoredAuth.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      await _storage.delete(key: _storageKey);
      return null;
    }
  }

  Future<void> write(StoredAuth auth) =>
      _storage.write(key: _storageKey, value: jsonEncode(auth.toJson()));

  Future<void> clear() => _storage.delete(key: _storageKey);
}
