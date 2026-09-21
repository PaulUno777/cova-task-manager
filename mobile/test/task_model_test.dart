import 'package:cova_task_manager/models/task.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('TaskStatus', () {
    test('round-trips through the backend TODO/IN_PROGRESS/DONE strings', () {
      for (final status in TaskStatus.values) {
        expect(TaskStatus.fromJson(status.toJson()), status);
      }
    });
  });

  group('Task.fromJson', () {
    test('parses a full task payload', () {
      final task = Task.fromJson({
        'id': 1,
        'title': 'Write tests',
        'description': 'Cover the model layer',
        'status': 'IN_PROGRESS',
        'createdAt': '2026-09-18T12:00:00Z',
        'updatedAt': '2026-09-19T08:30:00Z',
      });

      expect(task.id, 1);
      expect(task.title, 'Write tests');
      expect(task.status, TaskStatus.inProgress);
      expect(task.createdAt, DateTime.parse('2026-09-18T12:00:00Z'));
    });

    test('accepts a null description', () {
      final task = Task.fromJson({
        'id': 2,
        'title': 'No description',
        'description': null,
        'status': 'TODO',
        'createdAt': '2026-09-18T12:00:00Z',
        'updatedAt': '2026-09-18T12:00:00Z',
      });

      expect(task.description, isNull);
    });
  });
}
