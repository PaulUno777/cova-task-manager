import 'package:dio/dio.dart';

import '../../models/auth_response.dart';
import '../storage/auth_storage.dart';
import 'api_exception.dart';

/// Thin wrapper around a Dio instance that attaches the bearer access token
/// to every non-public request and, on a 401, shares a single in-flight
/// refresh call across any concurrently-failing requests before retrying
/// once — porting `refreshAccessToken()` from the web app's
/// `frontend/src/lib/api-client.ts`.
class ApiClient {
  final Dio dio;
  final AuthStorage _authStorage;
  late final Dio _refreshDio;

  /// Called when a 401 survives a refresh attempt (refresh token itself is
  /// invalid/expired) — the app should drop back to the login screen.
  void Function()? onSessionExpired;

  Future<String?>? _refreshFuture;

  ApiClient({required String baseUrl, AuthStorage? authStorage})
    : _authStorage = authStorage ?? AuthStorage(),
      dio = Dio(BaseOptions(baseUrl: baseUrl, contentType: 'application/json')) {
    _refreshDio = Dio(BaseOptions(baseUrl: baseUrl, contentType: 'application/json'));
    dio.interceptors.add(
      InterceptorsWrapper(onRequest: _onRequest, onError: _onError),
    );
  }

  Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (options.extra['public'] != true) {
      final stored = await _authStorage.read();
      if (stored != null) {
        options.headers['Authorization'] = 'Bearer ${stored.accessToken}';
      }
    }
    handler.next(options);
  }

  Future<void> _onError(DioException error, ErrorInterceptorHandler handler) async {
    final isPublic = error.requestOptions.extra['public'] == true;
    final alreadyRetried = error.requestOptions.extra['retried'] == true;

    if (error.response?.statusCode == 401 && !isPublic && !alreadyRetried) {
      final newAccessToken = await _refreshAccessToken();
      if (newAccessToken != null) {
        final retryOptions = error.requestOptions
          ..extra['retried'] = true
          ..headers['Authorization'] = 'Bearer $newAccessToken';
        try {
          final response = await dio.fetch(retryOptions);
          return handler.resolve(response);
        } on DioException catch (retryError) {
          return handler.next(retryError);
        }
      }
      await _authStorage.clear();
      onSessionExpired?.call();
    }

    handler.next(error);
  }

  Future<String?> _refreshAccessToken() {
    return _refreshFuture ??= _doRefresh().whenComplete(() => _refreshFuture = null);
  }

  Future<String?> _doRefresh() async {
    final stored = await _authStorage.read();
    if (stored == null) return null;
    try {
      final response = await _refreshDio.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refresh_token': stored.refreshToken},
      );
      final auth = AuthResponse.fromJson(response.data!);
      await _authStorage.write(
        StoredAuth(
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          user: auth.user,
        ),
      );
      return auth.accessToken;
    } catch (_) {
      return null;
    }
  }

  /// Runs [body] and converts any [DioException] into an [ApiException]
  /// built from the backend's error shape (docs/api.md), so callers only
  /// ever need to catch one exception type.
  Future<T> guard<T>(Future<T> Function() body) async {
    try {
      return await body();
    } on DioException catch (e) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        throw ApiException.fromJson(data);
      }
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw ApiException.network();
      }
      throw ApiException(
        status: e.response?.statusCode ?? 0,
        message: e.message ?? 'Request failed',
      );
    }
  }
}
