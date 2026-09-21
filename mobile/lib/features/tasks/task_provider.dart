import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../core/api/api_exception.dart';
import '../../models/task.dart';
import 'task_repository.dart';

/// Task list state: current filter/search, loading/error state, and CRUD
/// methods that refetch the list afterwards (mirrors the web app's
/// TanStack Query "invalidate the tasks query key on success" pattern,
/// without pulling in a query-caching library for a single list screen).
class TaskProvider extends ChangeNotifier {
  final TaskRepository _repository;

  TaskProvider(this._repository);

  List<Task> tasks = [];
  TaskStatus? statusFilter;
  String search = '';
  bool isLoading = false;
  String? error;

  Timer? _debounce;

  Future<void> loadTasks() async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final page = await _repository.list(status: statusFilter, search: search);
      tasks = page.content;
    } on ApiException catch (e) {
      error = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void setStatusFilter(TaskStatus? status) {
    if (statusFilter == status) return;
    statusFilter = status;
    loadTasks();
  }

  /// Debounced the same way the web app debounces its search field
  /// (`hooks/use-debounced-value.ts`).
  void setSearch(String value) {
    search = value;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), loadTasks);
  }

  Future<bool> createTask({
    required String title,
    String? description,
    TaskStatus? status,
  }) => _mutate(() => _repository.create(title: title, description: description, status: status));

  Future<bool> updateTask(
    int id, {
    required String title,
    String? description,
    required TaskStatus status,
  }) => _mutate(
    () => _repository.update(id, title: title, description: description, status: status),
  );

  Future<bool> _mutate(Future<void> Function() action) async {
    try {
      await action();
      await loadTasks();
      return true;
    } on ApiException catch (e) {
      error = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteTask(int id) async {
    final previous = tasks;
    tasks = tasks.where((t) => t.id != id).toList();
    notifyListeners();
    try {
      await _repository.delete(id);
      return true;
    } on ApiException catch (e) {
      tasks = previous;
      error = e.message;
      notifyListeners();
      return false;
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
}
