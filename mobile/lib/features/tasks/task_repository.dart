import '../../core/api/api_client.dart';
import '../../models/page_response.dart';
import '../../models/task.dart';

class TaskRepository {
  final ApiClient _client;

  TaskRepository(this._client);

  Future<PageResponse<Task>> list({
    TaskStatus? status,
    String? search,
    int page = 0,
    int size = 50,
  }) => _client.guard(() async {
    final response = await _client.dio.get<Map<String, dynamic>>(
      '/tasks',
      queryParameters: {
        if (status != null) 'status': status.toJson(),
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page,
        'size': size,
      },
    );
    return PageResponse.fromJson(response.data!, Task.fromJson);
  });

  Future<Task> create({
    required String title,
    String? description,
    TaskStatus? status,
  }) => _client.guard(() async {
    final response = await _client.dio.post<Map<String, dynamic>>(
      '/tasks',
      data: {
        'title': title,
        if (description != null && description.isNotEmpty) 'description': description,
        if (status != null) 'status': status.toJson(),
      },
    );
    return Task.fromJson(response.data!);
  });

  Future<Task> update(
    int id, {
    required String title,
    String? description,
    required TaskStatus status,
  }) => _client.guard(() async {
    final response = await _client.dio.put<Map<String, dynamic>>(
      '/tasks/$id',
      data: {
        'title': title,
        if (description != null && description.isNotEmpty) 'description': description,
        'status': status.toJson(),
      },
    );
    return Task.fromJson(response.data!);
  });

  Future<void> delete(int id) => _client.guard(() async {
    await _client.dio.delete('/tasks/$id');
  });
}
