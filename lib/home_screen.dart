import 'package:flutter/material.dart';
import 'package:get/get.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F8E9),
      appBar: AppBar(
        backgroundColor: const Color(0xFF2E7D32),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Colors.white, size: 26),
          onPressed: () => Get.toNamed('/menu'),
        ),
        title: const Text(
          'GREEN AI',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            letterSpacing: 3,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.person, color: Colors.white, size: 26),
            onPressed: () => Get.toNamed('/profile'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),
            const Text(
              'Welcome, Farmer! 👋',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1B5E20),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'What would you like to do today?',
              style: TextStyle(
                fontSize: 14,
                color: Colors.black54,
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.0,
                children: [
                  _buildCard(
                    icon: Icons.psychology,
                    title: 'GREEN AI',
                    subtitle: 'AI Assistant',
                    backgroundColor: const Color(0xFF2E7D32),
                    onTap: () => Get.toNamed('/green-ai'),
                  ),
                  _buildCard(
                    icon: Icons.map,
                    title: 'Live Map',
                    subtitle: 'Track Location',
                    backgroundColor: const Color(0xFFE53935),
                    onTap: () => Get.toNamed('/live-map'),
                  ),
                  _buildCard(
                    icon: Icons.trending_up,
                    title: 'Market Price',
                    subtitle: 'Today\'s Rates',
                    backgroundColor: const Color(0xFF1565C0),
                    onTap: () => Get.toNamed('/market-price'),
                  ),
                  _buildCard(
                    icon: Icons.groups,
                    title: 'Community',
                    subtitle: 'Connect & Share',
                    backgroundColor: const Color(0xFF6A1B9A),
                    onTap: () => Get.toNamed('/community'),
                  ),
                  _buildCard(
                    icon: Icons.notifications_active,
                    title: 'Reminders',
                    subtitle: 'Farm Schedule',
                    backgroundColor: const Color(0xFFE65100),
                    onTap: () => Get.toNamed('/reminder'),
                  ),
                  _buildCard(
                    icon: Icons.support_agent,
                    title: 'Helpline',
                    subtitle: '24/7 Support',
                    backgroundColor: const Color(0xFF00695C),
                    onTap: () => Get.toNamed('/helpline'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color backgroundColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: backgroundColor.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: backgroundColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 34,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 11,
                color: Colors.black45,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}