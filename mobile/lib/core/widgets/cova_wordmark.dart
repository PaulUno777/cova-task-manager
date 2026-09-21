import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// The badge alone (teal rounded square, white checkmark) — same brand mark
/// as [CovaWordmark] but without the text label, for compact spots like an
/// AppBar title next to a page name.
class CovaBadge extends StatelessWidget {
  final double size;

  const CovaBadge({super.key, this.size = 28});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: CovaColors.teal,
        borderRadius: BorderRadius.circular(size * 0.28),
      ),
      child: Icon(Icons.check, color: Colors.white, size: size * 0.56),
    );
  }
}

/// Mirrors the web app's header wordmark (`frontend/src/app/AppShell.tsx`):
/// a teal rounded-square badge with a white checkmark, plus the "COVA" /
/// "Task Manager" two-line label — same brand mark, not an independently
/// chosen mobile logo.
class CovaWordmark extends StatelessWidget {
  final double badgeSize;
  final bool centered;

  const CovaWordmark({super.key, this.badgeSize = 44, this.centered = true});

  @override
  Widget build(BuildContext context) {
    final badge = CovaBadge(size: badgeSize);

    final label = Column(
      crossAxisAlignment: centered ? CrossAxisAlignment.center : CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text(
          'COVA',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.2,
            color: CovaColors.mutedForeground,
          ),
        ),
        Text(
          'Task Manager',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
        ),
      ],
    );

    return centered
        ? Column(
            mainAxisSize: MainAxisSize.min,
            children: [badge, const SizedBox(height: 12), label],
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [badge, const SizedBox(width: 10), label],
          );
  }
}
