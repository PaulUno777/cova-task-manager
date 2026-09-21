import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final success = await auth.register(
      _emailController.text.trim(),
      _passwordController.text,
    );
    if (!success && mounted && auth.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(auth.error!)));
    }
    // On success the AuthGate reacts to AuthProvider.status and swaps the
    // screen itself; just pop this one back off the login stack.
    if (success && mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.newUsername],
                    decoration: const InputDecoration(labelText: 'Email'),
                    validator: (value) =>
                        (value == null || value.isEmpty) ? 'Email is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    autofillHints: const [AutofillHints.newPassword],
                    decoration: const InputDecoration(labelText: 'Password'),
                    validator: (value) =>
                        (value == null || value.isEmpty) ? 'Password is required' : null,
                    onFieldSubmitted: (_) => _submit(),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: auth.isSubmitting ? null : _submit,
                    child: auth.isSubmitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Create account'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
