import 'package:flutter/material.dart';

class ReminderModel {
  final int id;
  final int userId;
  final String reminderType;
  final String cropType;
  final String date;
  final String time;
  final String intervalType;
  final bool isActive;
  final String createdAt;
  final String updatedAt;

  ReminderModel({
    required this.id,
    required this.userId,
    required this.reminderType,
    required this.cropType,
    required this.date,
    required this.time,
    required this.intervalType,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ReminderModel.fromJson(Map<String, dynamic> json) {
    return ReminderModel(
      id: json['id'],
      userId: json['user_id'],
      reminderType: json['reminder_type'],
      cropType: json['crop_type'],
      date: json['date'],
      time: json['time'],
      intervalType: json['interval_type'],
      isActive: json['is_active'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'reminder_type': reminderType,
      'crop_type': cropType,
      'date': date,
      'time': time,
      'interval_type': intervalType,
      'is_active': isActive,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  String get formattedDateTime {
    try {
      final dateTime = DateTime.parse(date);
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final reminderDate = DateTime(dateTime.year, dateTime.month, dateTime.day);

      if (reminderDate == today) {
        return 'Today at $time';
      } else if (reminderDate == today.add(const Duration(days: 1))) {
        return 'Tomorrow at $time';
      } else {
        final difference = reminderDate.difference(today).inDays;
        return 'In $difference days at $time';
      }
    } catch (e) {
      return '$date at $time';
    }
  }

  IconData get iconData {
    switch (reminderType.toLowerCase()) {
      case 'irrigation':
        return Icons.water_drop;
      case 'fertilization':
        return Icons.eco;
      case 'pesticide spray':
        return Icons.bug_report;
      case 'harvesting':
        return Icons.agriculture;
      case 'planting':
        return Icons.local_florist;
      case 'pruning':
        return Icons.content_cut;
      case 'soil testing':
        return Icons.science;
      default:
        return Icons.notification_important;
    }
  }
}
