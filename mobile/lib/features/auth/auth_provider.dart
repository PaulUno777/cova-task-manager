// Named constructor params (`repository:`, `storage:`) stay readable at call
// sites; an underscore-prefixed initializing formal would not.
// ignore_for_file: prefer_initializing_formals

import 'package:flutter/foundation.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_exception.dart';
import '../../core/storage/auth_storage.dart';
import '../../models/auth_response.dart';
import '../../models/user.dart';
import 'auth_repository.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

/// Session state for the whole app: bootstraps from secure storage on
/// startup, exposes login/register/logout, and reacts to the API client
/// signalling that a refresh attempt failed (expired refresh token).
class AuthProvider extends ChangeNotifier {
  final AuthRepository _repository;
  final AuthStorage _storage;

  AuthStatus status = AuthStatus.unknown;
  User? currentUser;
  String? error;
  bool isSubmitting = false;

  AuthProvider({
    required AuthRepository repository,
    required AuthStorage storage,
    required ApiClient apiClient,
  }) : _repository = repository,
       _storage = storage {
    apiClient.onSessionExpired = _handleSessionExpired;
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final stored = await _storage.read();
    currentUser = stored?.user;
    status = stored == null ? AuthStatus.unauthenticated : AuthStatus.authenticated;
    notifyListeners();
  }

  void _handleSessionExpired() {
    currentUser = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  Future<bool> login(String email, String password) =>
      _submit(() => _repository.login(email, password));

  Future<bool> register(String email, String password) =>
      _submit(() => _repository.register(email, password));

  Future<bool> _submit(Future<AuthResponse> Function() action) async {
    isSubmitting = true;
    error = null;
    notifyListeners();
    try {
      final auth = await action();
      await _storage.write(
        StoredAuth(
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          user: auth.user,
        ),
      );
      currentUser = auth.user;
      status = AuthStatus.authenticated;
      return true;
    } on ApiException catch (e) {
      error = e.message;
      return false;
    } finally {
      isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _storage.clear();
    currentUser = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
