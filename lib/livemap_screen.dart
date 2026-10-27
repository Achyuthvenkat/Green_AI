import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:location/location.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'dart:math' as math;

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({Key? key}) : super(key: key);

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
  static const Color errorColor = Color(0xFFEF4444);
  static const Color warningColor = Color(0xFFF59E0B);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  late GoogleMapController mapController;
  LatLng? currentLocation;
  bool isLoadingLocation = true;
  String locationStatus = "Getting your location...";
  Location location = Location();

  // Demo markers for spending locations and alerts
  List<Marker> spendingMarkers = [];
  List<Marker> alertMarkers = [];
  Set<Circle> spendingCircles = {};

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
      bool serviceEnabled;
      PermissionStatus permissionGranted;
      LocationData locationData;

      // Check if location service is enabled
      serviceEnabled = await location.serviceEnabled();
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

      // Check for location permission
      permissionGranted = await location.hasPermission();
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

      // Get current location
      locationData = await location.getLocation();

      setState(() {
        currentLocation = LatLng(locationData.latitude!, locationData.longitude!);
        center = currentLocation!;
        locationStatus = "Location found";
        isLoadingLocation = false;
      });

      // Update markers based on current location
      _updateMarkersForLocation(currentLocation!);

      // Move camera to current location
      mapController.animateCamera(
        CameraUpdate.newLatLngZoom(currentLocation!, 14),
      );

    } catch (e) {
      setState(() {
        locationStatus = "Error getting location: ${e.toString()}";
        isLoadingLocation = false;
      });
      _setDefaultMarkers();
    }
  }

  void _updateMarkersForLocation(LatLng userLocation) {
    // Generate nearby spending locations based on user location
    spendingMarkers = [
      Marker(
        markerId: const MarkerId('phoenix_mall'),
        position: LatLng(
            userLocation.latitude + 0.01,
            userLocation.longitude + 0.01
        ),
        infoWindow: const InfoWindow(
            title: "Phoenix Mall",
            snippet: "₹4,500 spent • 12 transactions"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueMagenta),
        onTap: () => _showLocationDetails("Phoenix Mall", "₹4,500", "Shopping", 12),
      ),
      Marker(
        markerId: const MarkerId('cafe_coffee_day'),
        position: LatLng(
            userLocation.latitude - 0.008,
            userLocation.longitude + 0.012
        ),
        infoWindow: const InfoWindow(
            title: "Cafe Coffee Day",
            snippet: "₹1,200 spent • 8 transactions"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        onTap: () => _showLocationDetails("Cafe Coffee Day", "₹1,200", "Food & Dining", 8),
      ),
      Marker(
        markerId: const MarkerId('pvr_cinemas'),
        position: LatLng(
            userLocation.latitude + 0.015,
            userLocation.longitude - 0.01
        ),
        infoWindow: const InfoWindow(
            title: "PVR Cinemas",
            snippet: "₹2,800 spent • 5 transactions"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueViolet),
        onTap: () => _showLocationDetails("PVR Cinemas", "₹2,800", "Entertainment", 5),
      ),
      Marker(
        markerId: const MarkerId('metro_station'),
        position: LatLng(
            userLocation.latitude - 0.012,
            userLocation.longitude - 0.005
        ),
        infoWindow: const InfoWindow(
            title: "Metro Station",
            snippet: "₹3,200 spent • 15 transactions"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        onTap: () => _showLocationDetails("Metro Station", "₹3,200", "Transportation", 15),
      ),
    ];

    // Generate spending intensity circles
    spendingCircles = {
      Circle(
        circleId: const CircleId('phoenix_mall_circle'),
        center: LatLng(userLocation.latitude + 0.01, userLocation.longitude + 0.01),
        radius: 2250, // Based on spending amount
        fillColor: const Color(0xFFEC4899).withOpacity(0.2),
        strokeColor: const Color(0xFFEC4899),
        strokeWidth: 2,
      ),
      Circle(
        circleId: const CircleId('cafe_circle'),
        center: LatLng(userLocation.latitude - 0.008, userLocation.longitude + 0.012),
        radius: 600,
        fillColor: const Color(0xFFEF4444).withOpacity(0.2),
        strokeColor: const Color(0xFFEF4444),
        strokeWidth: 2,
      ),
      Circle(
        circleId: const CircleId('pvr_circle'),
        center: LatLng(userLocation.latitude + 0.015, userLocation.longitude - 0.01),
        radius: 1400,
        fillColor: const Color(0xFF8B5CF6).withOpacity(0.2),
        strokeColor: const Color(0xFF8B5CF6),
        strokeWidth: 2,
      ),
      Circle(
        circleId: const CircleId('metro_circle'),
        center: LatLng(userLocation.latitude - 0.012, userLocation.longitude - 0.005),
        radius: 1600,
        fillColor: const Color(0xFF06B6D4).withOpacity(0.2),
        strokeColor: const Color(0xFF06B6D4),
        strokeWidth: 2,
      ),
    };

    // Generate nearby financial alerts based on user location
    alertMarkers = [
      Marker(
        markerId: const MarkerId('budget_alert'),
        position: LatLng(
            userLocation.latitude + 0.005,
            userLocation.longitude - 0.008
        ),
        infoWindow: const InfoWindow(
            title: "Budget Alert Zone",
            snippet: "You exceeded budget here last month!"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        onTap: () => _showBudgetAlert(),
      ),
      Marker(
        markerId: const MarkerId('saving_opportunity'),
        position: LatLng(
            userLocation.latitude - 0.018,
            userLocation.longitude + 0.008
        ),
        infoWindow: const InfoWindow(
            title: "Savings Opportunity",
            snippet: "Cheaper alternatives available nearby"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        onTap: () => _showSavingsOpportunity(),
      ),
    ];

    // Add user location marker
    spendingMarkers.add(
      Marker(
        markerId: const MarkerId('user_location'),
        position: userLocation,
        infoWindow: const InfoWindow(
            title: "You are here",
            snippet: "Your current location"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
      ),
    );
  }

  void _setDefaultMarkers() {
    // Fallback to default Mumbai markers if location fails
    spendingMarkers = [
      Marker(
        markerId: const MarkerId('phoenix_mall'),
        position: const LatLng(19.0896, 72.8656),
        infoWindow: const InfoWindow(
            title: "Phoenix Mall",
            snippet: "₹4,500 spent • 12 transactions"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueMagenta),
        onTap: () => _showLocationDetails("Phoenix Mall", "₹4,500", "Shopping", 12),
      ),
      Marker(
        markerId: const MarkerId('cafe_coffee_day'),
        position: const LatLng(19.0760, 72.8777),
        infoWindow: const InfoWindow(
            title: "Cafe Coffee Day",
            snippet: "₹1,200 spent • 8 transactions"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        onTap: () => _showLocationDetails("Cafe Coffee Day", "₹1,200", "Food & Dining", 8),
      ),
    ];

    alertMarkers = [
      Marker(
        markerId: const MarkerId('budget_alert'),
        position: const LatLng(19.0540, 72.8570),
        infoWindow: const InfoWindow(
            title: "Budget Alert Zone",
            snippet: "You exceeded budget here last month!"
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        onTap: () => _showBudgetAlert(),
      ),
    ];

    spendingCircles = {
      Circle(
        circleId: const CircleId('phoenix_mall_circle'),
        center: const LatLng(19.0896, 72.8656),
        radius: 2250,
        fillColor: const Color(0xFFEC4899).withOpacity(0.2),
        strokeColor: const Color(0xFFEC4899),
        strokeWidth: 2,
      ),
    };
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

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Test notification sent!'),
        backgroundColor: successColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    Set<Marker> markers = {};
    Set<Circle> circles = {};

    if (showSpendingLocations) {
      markers.addAll(spendingMarkers);
      circles.addAll(spendingCircles);
    }
    if (showNearbyAlerts) {
      markers.addAll(alertMarkers);
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
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: textColor),
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
                  color: Colors.black.withOpacity(0.1),
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
                color: primaryColor.withOpacity(0.1),
                border: Border(
                  bottom: BorderSide(color: primaryColor.withOpacity(0.2)),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
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
                color: successColor.withOpacity(0.1),
                border: Border(
                  bottom: BorderSide(color: successColor.withOpacity(0.2)),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.location_on, color: successColor, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    "Showing spending locations near you",
                    style: TextStyle(
                      color: successColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

          // Map Area
          Expanded(
            flex: 3,
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: center,
                    zoom: 12,
                  ),
                  markers: markers,
                  circles: circles,
                  onMapCreated: (GoogleMapController controller) {
                    mapController = controller;
                    // If we already have current location, move to it
                    if (currentLocation != null) {
                      controller.animateCamera(
                        CameraUpdate.newLatLngZoom(currentLocation!, 14),
                      );
                    }
                  },
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                  mapType: MapType.normal,
                  compassEnabled: true,
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
                  color: Colors.black.withOpacity(0.05),
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
                        side: BorderSide(color: successColor.withOpacity(0.3)),
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
          color: selected ? color.withOpacity(0.1) : Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? color : Colors.grey[300]!,
            width: selected ? 2 : 1,
          ),
          boxShadow: selected
              ? [
            BoxShadow(
              color: color.withOpacity(0.2),
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
