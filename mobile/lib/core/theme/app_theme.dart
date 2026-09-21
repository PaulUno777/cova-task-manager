import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// COVA color tokens — kept in lockstep with the web app's
/// `frontend/src/index.css` / `docs/ux.md` ("Frontend CSS variables ...
/// should match them"), so this is the mobile side of the same source of
/// truth rather than an independently chosen palette.
class CovaColors {
  CovaColors._();

  static const teal = Color(0xFF0D9488);
  static const tealDark = Color(0xFF0F766E);
  static const accent = Color(0xFFEA580C);
  static const accentLight = Color(0xFFFB923C);
  static const background = Color(0xFFFFFFFF);
  static const foreground = Color(0xFF0F172A);
  static const mutedForeground = Color(0xFF64748B);
  static const border = Color(0xFFE2E8F0);
  static const neutral50 = Color(0xFFF8FAFC);
  static const neutral100 = Color(0xFFF1F5F9);
  static const neutral700 = Color(0xFF334155);
  static const destructive = Color(0xFFDC2626);
  // Matches the web app's soft `--accent` / `--accent-foreground` pair
  // (used for the "In progress" badge/column tint).
  static const accentSoftBackground = Color(0xFFFFF7ED);
  static const accentSoftForeground = Color(0xFF9A3412);
}

ThemeData buildCovaTheme() {
  final colorScheme = ColorScheme.fromSeed(
    seedColor: CovaColors.teal,
    brightness: Brightness.light,
    primary: CovaColors.teal,
    onPrimary: Colors.white,
    secondary: CovaColors.accent,
    onSecondary: Colors.white,
    error: CovaColors.destructive,
    onError: Colors.white,
    surface: CovaColors.background,
    onSurface: CovaColors.foreground,
    onSurfaceVariant: CovaColors.mutedForeground,
    outline: CovaColors.border,
    surfaceContainerHighest: CovaColors.neutral50,
  );

  final textTheme = GoogleFonts.interTextTheme().apply(
    bodyColor: CovaColors.foreground,
    displayColor: CovaColors.foreground,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: CovaColors.background,
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: CovaColors.background,
      foregroundColor: CovaColors.foreground,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: textTheme.titleLarge,
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: const UnderlineInputBorder(borderSide: BorderSide(color: CovaColors.border)),
      enabledBorder: const UnderlineInputBorder(
        borderSide: BorderSide(color: CovaColors.border),
      ),
      focusedBorder: const UnderlineInputBorder(
        borderSide: BorderSide(color: CovaColors.teal, width: 2),
      ),
      labelStyle: const TextStyle(color: CovaColors.mutedForeground),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: CovaColors.teal,
        foregroundColor: Colors.white,
        disabledBackgroundColor: CovaColors.teal.withValues(alpha: 0.4),
        disabledForegroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: CovaColors.neutral100,
        foregroundColor: CovaColors.destructive,
      ),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: CovaColors.teal,
      foregroundColor: Colors.white,
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: CovaColors.teal),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: CovaColors.neutral50,
      selectedColor: CovaColors.teal,
      labelStyle: const TextStyle(color: CovaColors.foreground),
      secondaryLabelStyle: const TextStyle(color: Colors.white),
      side: const BorderSide(color: CovaColors.border),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
    ),
    dividerTheme: const DividerThemeData(color: CovaColors.border),
    snackBarTheme: const SnackBarThemeData(
      backgroundColor: CovaColors.foreground,
      contentTextStyle: TextStyle(color: Colors.white),
    ),
  );
}
