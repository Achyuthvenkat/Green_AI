import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'apptrans.dart';

class LanguageController extends GetxController {
  static const String _languageKey = 'selected_language';
  final RxString currentLanguage = 'English'.obs;

  @override
  void onInit() {
    super.onInit();
    loadSavedLanguage();
  }

  // Load saved language from SharedPreferences
  Future<void> loadSavedLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    final savedLanguage = prefs.getString(_languageKey) ?? 'English';
    currentLanguage.value = savedLanguage;
    changeLanguage(savedLanguage);
  }

  // Save language to SharedPreferences and update app locale
  Future<void> saveAndChangeLanguage(String language) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, language);
    currentLanguage.value = language;
    changeLanguage(language);
  }

  // Change app language using GetX
  void changeLanguage(String language) {
    final String? languageCode = AppTranslations.languageToCode[language];
    if (languageCode != null) {
      final parts = languageCode.split('_');
      final locale = Locale(parts[0], parts.length > 1 ? parts[1] : null);
      Get.updateLocale(locale);
    }
  }

  // Get current locale
  Locale getCurrentLocale() {
    final String? languageCode = AppTranslations.languageToCode[currentLanguage.value];
    if (languageCode != null) {
      final parts = languageCode.split('_');
      return Locale(parts[0], parts.length > 1 ? parts[1] : null);
    }
    return const Locale('en', 'US');
  }
}
