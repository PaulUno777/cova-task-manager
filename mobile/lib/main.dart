import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/api/api_client.dart';
import 'core/storage/auth_storage.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/auth_provider.dart';
import 'features/auth/auth_repository.dart';
import 'features/auth/login_screen.dart';
import 'features/tasks/task_list_screen.dart';
import 'features/tasks/task_provider.dart';
import 'features/tasks/task_repository.dart';

/// Build-time API base URL, e.g.
/// `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080/api`
/// See mobile/README.md for platform-specific values (Android emulator
/// can't reach `localhost`).
const _apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:8080/api',
);

void main() {
  final authStorage = AuthStorage();
  final apiClient = ApiClient(baseUrl: _apiBaseUrl, authStorage: authStorage);

  runApp(
    CovaTaskManagerApp(
      authStorage: authStorage,
      apiClient: apiClient,
      authRepository: AuthRepository(apiClient),
      taskRepository: TaskRepository(apiClient),
    ),
  );
}

class CovaTaskManagerApp extends StatelessWidget {
  final AuthStorage authStorage;
  final ApiClient apiClient;
  final AuthRepository authRepository;
  final TaskRepository taskRepository;

  const CovaTaskManagerApp({
    super.key,
    required this.authStorage,
    required this.apiClient,
    required this.authRepository,
    required this.taskRepository,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      // Providers live above MaterialApp (its Navigator/Overlay), not inside
      // AuthGate's returned subtree — a provider scoped to one route's
      // content is invisible to routes pushed on top of it, since pushed
      // routes are siblings in the Overlay, not descendants of that route.
      providers: [
        Provider<TaskRepository>.value(value: taskRepository),
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(
            repository: authRepository,
            storage: authStorage,
            apiClient: apiClient,
          ),
        ),
        ChangeNotifierProvider<TaskProvider>(
          create: (context) => TaskProvider(context.read<TaskRepository>()),
        ),
      ],
      child: MaterialApp(
        title: 'COVA Task Manager',
        debugShowCheckedModeBanner: false,
        theme: buildCovaTheme(),
        home: const AuthGate(),
      ),
    );
  }
}

/// Swaps between the login flow and the task list based on `AuthProvider`'s
/// session state.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final status = context.watch<AuthProvider>().status;
    switch (status) {
      case AuthStatus.unknown:
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      case AuthStatus.unauthenticated:
        return const LoginScreen();
      case AuthStatus.authenticated:
        return const TaskListScreen();
    }
  }
}
