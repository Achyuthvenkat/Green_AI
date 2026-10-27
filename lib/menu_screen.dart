import 'package:flutter/material.dart';
import 'package:get/get.dart';

class MenuScreen extends StatelessWidget {
  const MenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFBDBDBD),
      appBar: AppBar(
        backgroundColor: const Color(0xFF4CAF50),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black, size: 26),
          onPressed: () => Get.back(),
        ),
        title: const Text(
          'MENU',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 40),

            // Replaced Image.asset with Flutter Icon
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: const Color(0xFF2E7D32),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Icon(Icons.eco, size: 60, color: Colors.white),
            ),

            const SizedBox(height: 20),

            const Text(
              'MENU',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                letterSpacing: 2,
                color: Colors.black87,
              ),
            ),

            const SizedBox(height: 60),

            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32.0),
                child: Column(
                  children: [
                    _buildMenuItem('Settings', () => Get.toNamed('/settings')),
                    const SizedBox(height: 24),
                    _buildMenuItem('Privacy Policy', () => _showPrivacyPolicyDialog(context)),
                    const SizedBox(height: 24),
                    _buildMenuItem('About', () => _showAboutDialog(context)),
                    const SizedBox(height: 24),
                    _buildMenuItem('Log Out', () => _showLogoutConfirmationDialog(context)),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(String title, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 56,
        decoration: BoxDecoration(
          color: const Color(0xFF81C784),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ),
    );
  }

  void _showPrivacyPolicyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFFBDBDBD),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Privacy Policy',
          style: TextStyle(fontWeight: FontWeight.w700, color: Colors.black87, fontSize: 20),
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Data Collection & Usage',
                  style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black87, fontSize: 16)),
              const SizedBox(height: 8),
              const Text(
                '• We collect location data for weather and market price information\n'
                    '• Camera access is used for crop disease identification\n'
                    '• Personal information is stored securely on your device\n'
                    '• We do not share your data with third parties',
                style: TextStyle(color: Colors.black87, fontSize: 14, height: 1.4),
              ),
              const SizedBox(height: 16),
              const Text('Permissions',
                  style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black87, fontSize: 16)),
              const SizedBox(height: 8),
              const Text(
                '• Location: For weather forecasts and nearby markets\n'
                    '• Camera: For crop disease identification\n'
                    '• Storage: To save your farming records\n'
                    '• Notifications: For important farming reminders',
                style: TextStyle(color: Colors.black87, fontSize: 14, height: 1.4),
              ),
              const SizedBox(height: 16),
              const Text('Contact',
                  style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black87, fontSize: 16)),
              const SizedBox(height: 8),
              const Text('For privacy concerns, contact us through the Helpline section.',
                  style: TextStyle(color: Colors.black87, fontSize: 14, height: 1.4)),
            ],
          ),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4CAF50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
            child: const Text('Got it', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFFBDBDBD),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            // Replaced Image.asset with Flutter Icon
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                color: Color(0xFF2E7D32),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.eco, size: 24, color: Colors.white),
            ),
            const SizedBox(width: 12),
            const Text(
              'About GREEN AI',
              style: TextStyle(fontWeight: FontWeight.w700, color: Colors.black87, fontSize: 18),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Version 1.0\n',
                  style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black54, fontSize: 14)),
              const Text(
                'GREEN AI is your comprehensive agricultural management platform designed to help farmers prosper through technology.\n',
                style: TextStyle(color: Colors.black87, fontSize: 14, height: 1.4),
              ),
              const Text('Key Features:',
                  style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black87, fontSize: 15)),
              const SizedBox(height: 8),
              _buildFeatureItem('🌱', 'Image-based crop disease identification'),
              _buildFeatureItem('🌤️', 'Real-time weather forecasting'),
              _buildFeatureItem('💰', 'Live market prices & trends'),
              _buildFeatureItem('🗺️', 'Interactive disease & market maps'),
              _buildFeatureItem('⏰', 'Smart farming reminders'),
              _buildFeatureItem('👥', 'Farmer community groups'),
              _buildFeatureItem('📞', 'Expert helpline support'),
              _buildFeatureItem('🗣️', 'Multi-lingual voice assistance'),
              _buildFeatureItem('📊', 'Farmer profile & record management'),
              const SizedBox(height: 16),
              const Text(
                'Scan. Detect. Prosper.',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF4CAF50),
                  fontSize: 16,
                  fontStyle: FontStyle.italic,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4CAF50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
            child: const Text('Close', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(String icon, String feature) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(icon, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(feature,
                style: const TextStyle(color: Colors.black87, fontSize: 13, height: 1.3)),
          ),
        ],
      ),
    );
  }

  void _showLogoutConfirmationDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFFBDBDBD),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.logout, color: Colors.orange[700], size: 24),
            const SizedBox(width: 12),
            const Text(
              'Logout Confirmation',
              style: TextStyle(fontWeight: FontWeight.w700, color: Colors.black87, fontSize: 18),
            ),
          ],
        ),
        content: const Text(
          'Are you sure you want to logout? You will need to login again to access your account.',
          style: TextStyle(color: Colors.black87, fontSize: 15, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel',
                style: TextStyle(color: Color(0xFF4CAF50), fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Get.snackbar(
                'Logged Out',
                'You have been successfully logged out',
                backgroundColor: Colors.orange[200],
                snackPosition: SnackPosition.BOTTOM,
                duration: const Duration(seconds: 2),
              );
              Future.delayed(const Duration(milliseconds: 500), () {
                Get.offAllNamed('/login');
              });
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange[700],
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
            child: const Text('Logout',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

enum MenuItemType { normal, highlighted }