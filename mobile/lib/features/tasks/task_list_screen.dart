import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_theme.dart';
import '../../core/widgets/cova_wordmark.dart';
import '../../models/task.dart';
import '../auth/auth_provider.dart';
import 'task_form_screen.dart';
import 'task_provider.dart';

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Deferred to after this frame: TaskProvider lives above MaterialApp,
    // so this is safe, but notifyListeners() during initState's own frame
    // would hit other widgets mid-build.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<TaskProvider>().loadTasks();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tasks = context.watch<TaskProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [CovaBadge(size: 28), SizedBox(width: 12), Text('My tasks')],
        ),
        actions: [
          IconButton(
            tooltip: 'Log out',
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.of(
          context,
        ).push(MaterialPageRoute(builder: (_) => const TaskFormScreen())),
        child: const Icon(Icons.add),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Search tasks',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
                isDense: true,
              ),
              onChanged: (value) => context.read<TaskProvider>().setSearch(value),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              height: 36,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _StatusChip(label: 'All', selected: tasks.statusFilter == null, status: null),
                  const SizedBox(width: 8),
                  _StatusChip(
                    label: TaskStatus.todo.label,
                    selected: tasks.statusFilter == TaskStatus.todo,
                    status: TaskStatus.todo,
                  ),
                  const SizedBox(width: 8),
                  _StatusChip(
                    label: TaskStatus.inProgress.label,
                    selected: tasks.statusFilter == TaskStatus.inProgress,
                    status: TaskStatus.inProgress,
                  ),
                  const SizedBox(width: 8),
                  _StatusChip(
                    label: TaskStatus.done.label,
                    selected: tasks.statusFilter == TaskStatus.done,
                    status: TaskStatus.done,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(child: _TaskListBody(tasks: tasks)),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final bool selected;
  final TaskStatus? status;

  const _StatusChip({required this.label, required this.selected, required this.status});

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => context.read<TaskProvider>().setStatusFilter(status),
    );
  }
}

class _TaskListBody extends StatelessWidget {
  final TaskProvider tasks;

  const _TaskListBody({required this.tasks});

  @override
  Widget build(BuildContext context) {
    if (tasks.isLoading && tasks.tasks.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (tasks.error != null && tasks.tasks.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(tasks.error!, textAlign: TextAlign.center),
              const SizedBox(height: 12),
              OutlinedButton(onPressed: tasks.loadTasks, child: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    if (tasks.tasks.isEmpty) {
      return const Center(child: Text('No tasks yet — tap + to add one.'));
    }

    return RefreshIndicator(
      onRefresh: tasks.loadTasks,
      child: ListView.builder(
        padding: const EdgeInsets.only(bottom: 88),
        itemCount: tasks.tasks.length,
        itemBuilder: (context, index) {
          final task = tasks.tasks[index];
          return Dismissible(
            key: ValueKey(task.id),
            direction: DismissDirection.endToStart,
            background: Container(
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              color: Theme.of(context).colorScheme.errorContainer,
              child: Icon(Icons.delete, color: Theme.of(context).colorScheme.onErrorContainer),
            ),
            confirmDismiss: (_) => _confirmDelete(context, task.title),
            onDismissed: (_) => context.read<TaskProvider>().deleteTask(task.id),
            child: ListTile(
              title: Text(task.title),
              subtitle: task.description == null || task.description!.isEmpty
                  ? null
                  : Text(task.description!, maxLines: 2, overflow: TextOverflow.ellipsis),
              trailing: _StatusBadge(status: task.status),
              onTap: () => Navigator.of(
                context,
              ).push(MaterialPageRoute(builder: (_) => TaskFormScreen(task: task))),
            ),
          );
        },
      ),
    );
  }

  Future<bool> _confirmDelete(BuildContext context, String title) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete task?'),
        content: Text('"$title" will be permanently deleted.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton.tonal(
            style: FilledButton.styleFrom(
              backgroundColor: CovaColors.destructive.withValues(alpha: 0.1),
              foregroundColor: CovaColors.destructive,
            ),
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    return confirmed ?? false;
  }
}

/// Status → color mirrors the web app's Kanban column tints
/// (`KanbanColumn.tsx`'s `COLUMN_STYLES`): neutral for To do, the COVA
/// accent orange for In progress, the COVA teal for Done.
class _StatusBadge extends StatelessWidget {
  final TaskStatus status;

  const _StatusBadge({required this.status});

  Color _background() {
    switch (status) {
      case TaskStatus.todo:
        return CovaColors.neutral100;
      case TaskStatus.inProgress:
        return CovaColors.accentSoftBackground;
      case TaskStatus.done:
        return CovaColors.teal.withValues(alpha: 0.1);
    }
  }

  Color _foreground() {
    switch (status) {
      case TaskStatus.todo:
        return CovaColors.neutral700;
      case TaskStatus.inProgress:
        return CovaColors.accentSoftForeground;
      case TaskStatus.done:
        return CovaColors.tealDark;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: _background(), borderRadius: BorderRadius.circular(999)),
      child: Text(
        status.label,
        style: Theme.of(
          context,
        ).textTheme.labelSmall?.copyWith(color: _foreground(), fontWeight: FontWeight.w600),
      ),
    );
  }
}
