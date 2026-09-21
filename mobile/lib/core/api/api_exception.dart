/// Mirrors the backend's `@RestControllerAdvice` error shape
/// (`{status, message, timestamp, path, fields?}`), see docs/api.md.
class ApiException implements Exception {
  final int status;
  final String message;
  final Map<String, String>? fields;

  const ApiException({required this.status, required this.message, this.fields});

  factory ApiException.fromJson(Map<String, dynamic> json) => ApiException(
    status: json['status'] as int? ?? 0,
    message: json['message'] as String? ?? 'Request failed',
    fields: (json['fields'] as Map<String, dynamic>?)?.map(
      (key, value) => MapEntry(key, value.toString()),
    ),
  );

  factory ApiException.network() =>
      const ApiException(status: 0, message: 'Network error. Check your connection.');

  @override
  String toString() => message;
}
