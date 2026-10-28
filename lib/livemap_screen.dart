import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:location/location.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({super.key});

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen> {
  // App Colors
  static const Color primaryColor = Color(0xFF6366F1);
  static const Color backgroundColor = Color(0xFFF8FAFC);
  static const Color surfaceColor = Color(0xFFFFFFFF);
  static const Color textColor = Color(0xFF1F2937);
  static const Color hintColor = Color(0xFF9CA3AF);
  static const Color successColor = Color(0xFF10B981);
  static const Color warningColor = Color(0xFFF59E0B);

  final MapController mapController = MapController();
  LatLng? currentLocation;
  bool isLoadingLocation = true;
  String locationStatus = "Getting your location...";
  final Location location = Location();

  // Demo markers for spending locations and alerts
  List<Marker> spendingMarkers = [];
  List<Marker> alertMarkers = [];
  List<CircleMarker> spendingCircles = [];

  bool showSpendingLocations = true;
  bool showNearbyAlerts = true;

  // Default center (Mumbai) - will be updated with user location
  LatLng center = const LatLng(19.0760, 72.8777);

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      isLoadingLocation = true;
      locationStatus = "Getting your location...";
    });

    try {
      bool serviceEnabled = await location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await location.requestService();
        if (!serviceEnabled) {
          setState(() {
            locationStatus = "Location service is disabled";
            isLoadingLocation = false;
          });
          _setDefaultMarkers();
          return;
        }
      }

      PermissionStatus permissionGranted = await location.hasPermission();
      if (permissionGranted == PermissionStatus.denied) {
        permissionGranted = await location.requestPermission();
        if (permissionGranted != PermissionStatus.granted) {
          setState(() {
            locationStatus = "Location permission denied";
            isLoadingLocation = false;
          });
          _setDefaultMarkers();
          return;
        }
      }

      LocationData locationData = await location.getLocation();
      final double lat = locationData.latitude;
      final double lng = locationData.longitude;
      final newLocation = LatLng(lat, lng);

      setState(() {
        currentLocation = newLocation;
        center = newLocation;
        locationStatus = "Location found";
        isLoadingLocation = false;
      });

      _updateMarkersForLocation(newLocation);
      mapController.move(newLocation, 14.0);
    } catch (e) {
      setState(() {
        locationStatus = "Error getting location: ${e.toString()}";
        isLoadingLocation = false;
      });
      _setDefaultMarkers();
    }
  }

  void _updateMarkersForLocation(LatLng userLocation) {
    setState(() {
      spendingMarkers = [
        _buildSpendingMarker(
          id: 'phoenix_mall',
          point: LatLng(userLocation.latitude + 0.01, userLocation.longitude + 0.01),
          title: "Phoenix Mall",
          amount: "₹4,500",
          category: "Shopping",
          transactions: 12,
          color: const Color(0xFFEC4899),
          icon: Icons.shopping_bag,
        ),
        _buildSpendingMarker(
          id: 'cafe_coffee_day',
          point: LatLng(userLocation.latitude - 0.008, userLocation.longitude + 0.012),
          title: "Cafe Coffee Day",
          amount: "₹1,200",
          category: "Food & Dining",
          transactions: 8,
          color: const Color(0xFFEF4444),
          icon: Icons.local_cafe,
        ),
        _buildSpendingMarker(
          id: 'pvr_cinemas',
          point: LatLng(userLocation.latitude + 0.015, userLocation.longitude - 0.01),
          title: "PVR Cinemas",
          amount: "₹2,800",
          category: "Entertainment",
          transactions: 5,
          color: const Color(0xFF8B5CF6),
          icon: Icons.movie,
        ),
        _buildSpendingMarker(
          id: 'metro_station',
          point: LatLng(userLocation.latitude - 0.012, userLocation.longitude - 0.005),
          title: "Metro Station",
          amount: "₹3,200",
          category: "Transportation",
          transactions: 15,
          color: const Color(0xFF06B6D4),
          icon: Icons.directions_subway,
        ),
        // User Location Marker
        Marker(
          point: userLocation,
          width: 50,
          height: 50,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: primaryColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withValues(alpha: 0.4),
                      blurRadius: 10,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.person,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ],
          ),
        ),
      ];

      spendingCircles = [
        CircleMarker(
          point: LatLng(userLocation.latitude + 0.01, userLocation.longitude + 0.01),
          radius: 2250,
          useRadiusInMeter: true,
          color: const Color(0xFFEC4899).withValues(alpha: 0.18),
          borderColor: const Color(0xFFEC4899),
          borderStrokeWidth: 2,
        ),
        CircleMarker(
          point: LatLng(userLocation.latitude - 0.008, userLocation.longitude + 0.012),
          radius: 600,
          useRadiusInMeter: true,
          color: const Color(0xFFEF4444).withValues(alpha: 0.18),
          borderColor: const Color(0xFFEF4444),
          borderStrokeWidth: 2,
        ),
        CircleMarker(
          point: LatLng(userLocation.latitude + 0.015, userLocation.longitude - 0.01),
          radius: 1400,
          useRadiusInMeter: true,
          color: const Color(0xFF8B5CF6).withValues(alpha: 0.18),
          borderColor: const Color(0xFF8B5CF6),
          borderStrokeWidth: 2,
        ),
        CircleMarker(
          point: LatLng(userLocation.latitude - 0.012, userLocation.longitude - 0.005),
          radius: 1600,
          useRadiusInMeter: true,
          color: const Color(0xFF06B6D4).withValues(alpha: 0.18),
          borderColor: const Color(0xFF06B6D4),
          borderStrokeWidth: 2,
        ),
      ];

      alertMarkers = [
        Marker(
          point: LatLng(userLocation.latitude + 0.005, userLocation.longitude - 0.008),
          width: 46,
          height: 46,
          child: GestureDetector(
            onTap: _showBudgetAlert,
            child: Container(
              decoration: BoxDecoration(
                color: warningColor,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2.5),
                boxShadow: [
                  BoxShadow(
                    color: warningColor.withValues(alpha: 0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 24),
            ),
          ),
        ),
        Marker(
          point: LatLng(userLocation.latitude - 0.018, userLocation.longitude + 0.008),
          width: 46,
          height: 46,
          child: GestureDetector(
            onTap: _showSavingsOpportunity,
            child: Container(
              decoration: BoxDecoration(
                color: successColor,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2.5),
                boxShadow: [
                  BoxShadow(
                    color: successColor.withValues(alpha: 0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(Icons.savings_outlined, color: Colors.white, size: 24),
            ),
          ),
        ),
      ];
    });
  }

  void _setDefaultMarkers() {
    setState(() {
      spendingMarkers = [
        _buildSpendingMarker(
          id: 'phoenix_mall',
          point: const LatLng(19.0896, 72.8656),
          title: "Phoenix Mall",
          amount: "₹4,500",
          category: "Shopping",
          transactions: 12,
          color: const Color(0xFFEC4899),
          icon: Icons.shopping_bag,
        ),
        _buildSpendingMarker(
          id: 'cafe_coffee_day',
          point: const LatLng(19.0760, 72.8777),
          title: "Cafe Coffee Day",
          amount: "₹1,200",
          category: "Food & Dining",
          transactions: 8,
          color: const Color(0xFFEF4444),
          icon: Icons.local_cafe,
        ),
      ];

      alertMarkers = [
        Marker(
          point: const LatLng(19.0540, 72.8570),
          width: 46,
          height: 46,
          child: GestureDetector(
            onTap: _showBudgetAlert,
            child: Container(
              decoration: BoxDecoration(
                color: warningColor,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2.5),
                boxShadow: [
                  BoxShadow(
                    color: warningColor.withValues(alpha: 0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 24),
            ),
          ),
        ),
      ];

      spendingCircles = [
        CircleMarker(
          point: const LatLng(19.0896, 72.8656),
          radius: 2250,
          useRadiusInMeter: true,
          color: const Color(0xFFEC4899).withValues(alpha: 0.18),
          borderColor: const Color(0xFFEC4899),
          borderStrokeWidth: 2,
        ),
      ];
    });
  }

  Marker _buildSpendingMarker({
    required String id,
    required LatLng point,
    required String title,
    required String amount,
    required String category,
    required int transactions,
    required Color color,
    required IconData icon,
  }) {
    return Marker(
      point: point,
      width: 48,
      height: 48,
      child: GestureDetector(
        onTap: () => _showLocationDetails(title, amount, category, transactions),
        child: Container(
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.4),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: 24),
        ),
      ),
    );
  }

  void _showLocationDetails(String name, String amount, String category, int transactions) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  height: 4,
                  width: 40,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        Text(
                          amount,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: primaryColor,
                          ),
                        ),
                        const Text('Total Spent', style: TextStyle(color: hintColor)),
                      ],
                    ),
                    Column(
                      children: [
                        Text(
                          '$transactions',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: successColor,
                          ),
                        ),
                        const Text('Transactions', style: TextStyle(color: hintColor)),
                      ],
                    ),
                    Column(
                      children: [
                        Text(
                          category,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: warningColor,
                          ),
                        ),
                        const Text('Category', style: TextStyle(color: hintColor)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showBudgetAlert() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('⚠️ Budget Alert: You spent 30% more than usual here last month!'),
        backgroundColor: warningColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showSavingsOpportunity() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('💡 Savings Tip: Local market 500m away offers 20% cheaper groceries!'),
        backgroundColor: successColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Future<void> _showTestNotification() async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
    AndroidNotificationDetails(
      'nearby_alerts',
      'Nearby Spending Alerts',
      channelDescription: 'Notifications for nearby spending locations',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: false,
    );

    const NotificationDetails platformChannelSpecifics =
    NotificationDetails(android: androidPlatformChannelSpecifics);

    await FlutterLocalNotificationsPlugin().show(
      0,
      'FinSightAI Alert',
      'You\'re near Phoenix Mall where you spent ₹4,500 last month. Budget wisely! 💰',
      platformChannelSpecifics,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Test notification sent!'),
          backgroundColor: successColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<Marker> activeMarkers = [];
    final List<CircleMarker> activeCircles = [];

    if (showSpendingLocations) {
      activeMarkers.addAll(spendingMarkers);
      activeCircles.addAll(spendingCircles);
    }
    if (showNearbyAlerts) {
      activeMarkers.addAll(alertMarkers);
    }

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: surfaceColor,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: textColor, size: 18),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        title: const Text(
          'Live Map',
          style: TextStyle(
            color: textColor,
            fontWeight: FontWeight.bold,
            fontSize: 20,
            letterSpacing: 1,
          ),
        ),
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: surfaceColor,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: const Icon(Icons.my_location, color: primaryColor),
              onPressed: _getCurrentLocation,
              tooltip: 'Get my location',
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Location status indicator
          if (isLoadingLocation)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: primaryColor.withValues(alpha: 0.1),
                border: Border(
                  bottom: BorderSide(color: primaryColor.withValues(alpha: 0.2)),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: primaryColor,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    locationStatus,
                    style: const TextStyle(color: primaryColor, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            )
          else if (currentLocation != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: successColor.withValues(alpha: 0.1),
                border: Border(
                  bottom: BorderSide(color: successColor.withValues(alpha: 0.2)),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.location_on, color: successColor, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    "Showing spending locations near you (OpenStreetMap)",
                    style: TextStyle(
                      color: successColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

          // Map Area with OpenStreetMap
          Expanded(
            flex: 3,
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Stack(
                  children: [
                    FlutterMap(
                      mapController: mapController,
                      options: MapOptions(
                        initialCenter: center,
                        initialZoom: 13.5,
                        minZoom: 3.0,
                        maxZoom: 18.0,
                      ),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.example.greenai',
                        ),
                        if (showSpendingLocations && activeCircles.isNotEmpty)
                          CircleLayer(circles: activeCircles),
                        if (activeMarkers.isNotEmpty)
                          MarkerLayer(markers: activeMarkers),
                      ],
                    ),
                    // Floating Zoom Controls
                    Positioned(
                      right: 12,
                      bottom: 12,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          FloatingActionButton.small(
                            heroTag: 'zoom_in',
                            backgroundColor: surfaceColor,
                            foregroundColor: textColor,
                            elevation: 4,
                            onPressed: () {
                              final currentZoom = mapController.camera.zoom;
                              mapController.move(mapController.camera.center, currentZoom + 1);
                            },
                            child: const Icon(Icons.add),
                          ),
                          const SizedBox(height: 8),
                          FloatingActionButton.small(
                            heroTag: 'zoom_out',
                            backgroundColor: surfaceColor,
                            foregroundColor: textColor,
                            elevation: 4,
                            onPressed: () {
                              final currentZoom = mapController.camera.zoom;
                              mapController.move(mapController.camera.center, currentZoom - 1);
                            },
                            child: const Icon(Icons.remove),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Control Panel
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: surfaceColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildToggleButton(
                  title: "Most Spend Points",
                  icon: Icons.account_balance_wallet,
                  color: showSpendingLocations ? primaryColor : hintColor,
                  selected: showSpendingLocations,
                  onTap: () => setState(() => showSpendingLocations = !showSpendingLocations),
                ),
                const SizedBox(height: 12),
                _buildToggleButton(
                  title: 'Nearby Alerts',
                  icon: Icons.notifications_active,
                  color: showNearbyAlerts ? warningColor : hintColor,
                  selected: showNearbyAlerts,
                  onTap: () => setState(() => showNearbyAlerts = !showNearbyAlerts),
                ),
                if (showNearbyAlerts) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton.icon(
                      onPressed: _showTestNotification,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        foregroundColor: successColor,
                        side: BorderSide(color: successColor.withValues(alpha: 0.3)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.notifications, size: 16),
                      label: const Text(
                        'Test Notification',
                        style: TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleButton({
    required String title,
    required IconData icon,
    required Color color,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        height: 56,
        decoration: BoxDecoration(
          color: selected ? color.withValues(alpha: 0.1) : Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? color : Colors.grey[300]!,
            width: selected ? 2 : 1,
          ),
          boxShadow: selected
              ? [
            BoxShadow(
              color: color.withValues(alpha: 0.2),
              blurRadius: 8,
              offset: const Offset(0, 2),
            )
          ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Text(
              title,
              style: TextStyle(
                color: color,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (selected) ...[
              const SizedBox(width: 8),
              Icon(Icons.check_circle, color: color, size: 18),
            ],
          ],
        ),
      ),
    );
  }
}
