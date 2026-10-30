import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:greenai/url.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String temperature = "26.8°C";
  String humidity = "68%";
  String soilMoisture = "22.9%";
  String windSpeed = "4.8 km/h";
  bool isLoadingWeather = true;

  @override
  void initState() {
    super.initState();
    _fetchLiveWeather();
  }

  Future<void> _fetchLiveWeather() async {
    try {
      // 1. Try our backend proxy
      final uri = Uri.parse("${Url.Urls}/api/weather?lat=17.3850&lng=78.4867");
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          if (mounted) {
            setState(() {
              temperature = data['temperature'] ?? temperature;
              humidity = data['humidity'] ?? humidity;
              soilMoisture = data['soil_moisture'] ?? soilMoisture;
              windSpeed = data['wind_speed'] ?? windSpeed;
              isLoadingWeather = false;
            });
            return;
          }
        }
      }
    } catch (_) {
      // Backend proxy fallback: query Open-Meteo directly
    }

    try {
      final directUri = Uri.parse(
          "https://api.open-meteo.com/v1/forecast?latitude=17.3850&longitude=78.4867&current=temperature_2m,relative_humidity_2m,wind_speed_10m,soil_moisture_0_to_1cm");
      final directRes = await http.get(directUri).timeout(const Duration(seconds: 6));
      if (directRes.statusCode == 200) {
        final data = jsonDecode(directRes.body);
        final cur = data['current'] ?? {};
        final double? sm = cur['soil_moisture_0_to_1cm'];
        final smPct = sm != null ? ((sm / 0.45) * 100).clamp(0, 100).toStringAsFixed(1) : "24.5";

        if (mounted) {
          setState(() {
            temperature = "${cur['temperature_2m'] ?? 27}°C";
            humidity = "${cur['relative_humidity_2m'] ?? 65}%";
            soilMoisture = "$smPct%";
            windSpeed = "${cur['wind_speed_10m'] ?? 6} km/h";
            isLoadingWeather = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoadingWeather = false;
        });
      }
    }
  }

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
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome, Farmer! 👋',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1B5E20),
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Live farm environmental metrics',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.black54,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF81C784)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF2E7D32),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'Live Weather',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF2E7D32),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Live Weather Cards Banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildWeatherPill(
                    icon: Icons.thermostat,
                    value: temperature,
                    label: "Temp",
                    color: Colors.orange,
                  ),
                  _buildWeatherPill(
                    icon: Icons.water_drop,
                    value: humidity,
                    label: "Humidity",
                    color: Colors.blue,
                  ),
                  _buildWeatherPill(
                    icon: Icons.grass,
                    value: soilMoisture,
                    label: "Soil Water",
                    color: Colors.green,
                  ),
                  _buildWeatherPill(
                    icon: Icons.air,
                    value: windSpeed,
                    label: "Wind",
                    color: Colors.purple,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),
            const Text(
              'Agricultural Services',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1B5E20),
              ),
            ),
            const SizedBox(height: 8),

            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 1.15,
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

  Widget _buildWeatherPill({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
  }) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 20, color: color),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: Colors.black87,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: Colors.black54,
          ),
        ),
      ],
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
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: backgroundColor.withOpacity(0.18),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: backgroundColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 28,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
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