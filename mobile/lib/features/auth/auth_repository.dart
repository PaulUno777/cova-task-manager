import 'package:dio/dio.dart';

import '../../core/api/api_client.dart';
import '../../models/auth_response.dart';
import '../../models/user.dart';

class AuthRepository {
  final ApiClient _client;

  AuthRepository(this._client);

  Future<AuthResponse> register(String email, String password) =>
      _client.guard(() async {
        final response = await _client.dio.post<Map<String, dynamic>>(
          '/auth/register',
          data: {'email': email, 'password': password},
          options: Options(extra: {'public': true}),
        );
        return AuthResponse.fromJson(response.data!);
      });

  Future<AuthResponse> login(String email, String password) =>
      _client.guard(() async {
        final response = await _client.dio.post<Map<String, dynamic>>(
          '/auth/login',
          data: {'email': email, 'password': password},
          options: Options(extra: {'public': true}),
        );
        return AuthResponse.fromJson(response.data!);
      });

  Future<User> me() => _client.guard(() async {
    final response = await _client.dio.get<Map<String, dynamic>>('/auth/me');
    return User.fromJson(response.data!);
  });
}
