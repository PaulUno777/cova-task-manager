import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_theme.dart';
import '../../models/task.dart';
import 'task_provider.dart';

/// Shared create/edit form. `task == null` means create mode.
class TaskFormScreen extends StatefulWidget {
  final Task? task;

  const TaskFormScreen({super.key, this.task});

  @override
  State<TaskFormScreen> createState() => _TaskFormScreenState();
}

class _TaskFormScreenState extends State<TaskFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleController;
  late final TextEditingController _descriptionController;
  late TaskStatus _status;
  bool _isSubmitting = false;

  bool get _isEditing => widget.task != null;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.task?.title ?? '');
    _descriptionController = TextEditingController(text: widget.task?.description ?? '');
    _status = widget.task?.status ?? TaskStatus.todo;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    final provider = context.read<TaskProvider>();
    try {
      final success = _isEditing
          ? await provider.updateTask(
              widget.task!.id,
              title: _titleController.text.trim(),
              description: _descriptionController.text.trim(),
              status: _status,
            )
          : await provider.createTask(
              title: _titleController.text.trim(),
              description: _descriptionController.text.trim(),
              status: _status,
            );
      if (!mounted) return;
      if (success) {
        Navigator.of(context).pop();
      } else if (provider.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(provider.error!)));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _delete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete task?'),
        content: Text('"${widget.task!.title}" will be permanently deleted.'),
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
    if (confirmed != true || !mounted) return;
    final provider = context.read<TaskProvider>();
    final success = await provider.deleteTask(widget.task!.id);
    if (!mounted) return;
    if (success) {
      Navigator.of(context).pop();
    } else if (provider.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(provider.error!)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit task' : 'New task'),
        actions: [
          if (_isEditing)
            IconButton(
              tooltip: 'Delete task',
              icon: const Icon(Icons.delete_outline),
              onPressed: _isSubmitting ? null : _delete,
            ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _titleController,
                  decoration: const InputDecoration(labelText: 'Title'),
                  textInputAction: TextInputAction.next,
                  validator: (value) =>
                      (value == null || value.trim().isEmpty) ? 'Title is required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _descriptionController,
                  decoration: const InputDecoration(labelText: 'Description'),
                  minLines: 3,
                  maxLines: 6,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<TaskStatus>(
                  initialValue: _status,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: TaskStatus.values
                      .map((status) => DropdownMenuItem(value: status, child: Text(status.label)))
                      .toList(),
                  onChanged: (value) {
                    if (value != null) setState(() => _status = value);
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isSubmitting ? null : _save,
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(_isEditing ? 'Save changes' : 'Create task'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
