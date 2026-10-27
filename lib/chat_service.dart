import 'dart:convert';
import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:mime/mime.dart';

class ChatService {
  static List<String> get _apiKeys {
    final key = dotenv.env['GROQ_API_KEY'];
    return [if (key != null && key.isNotEmpty) key];
  }

  static const String _baseUrl = "https://api.groq.com/openai/v1/chat/completions";

  // Use vision-capable model for image analysis
  static const String _visionModel = "meta-llama/llama-4-scout-17b-16e-instruct";
  static const String _textModel = "llama-3.1-8b-instant";

  /// Send either text-only message or image-only message
  Future<String> sendMessage({String? message, File? imageFile}) async {
    // Validate input - either message or imageFile should be provided
    if (message == null && imageFile == null) {
      return "Please provide either a text message or an image for analysis.";
    }

    for (int i = 0; i < _apiKeys.length; i++) {
      try {
        if (imageFile != null) {
          // Handle image-only request
          return await _sendImageOnlyRequest(imageFile, _apiKeys[i], message);
        } else {
          // Handle text-only request
          return await _sendTextOnlyRequest(message!, _apiKeys[i]);
        }
      } catch (e) {
        print('Exception with API key ${i + 1}: $e');
        continue;
      }
    }

    return "I'm experiencing high demand right now. Please try again in a few moments, and I'll be happy to help with your farming questions!";
  }

  /// Send text-only message
  Future<String> _sendTextOnlyRequest(String message, String apiKey) async {
    final response = await http.post(
      Uri.parse(_baseUrl),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'model': _textModel,
        'messages': [
          {
            'role': 'system',
            'content': '''You are GREEN AI, an expert agricultural assistant specializing in sustainable farming practices, crop management, and modern agriculture techniques. 

Always provide practical, actionable advice with focus on:
- Environmental sustainability and farmer success
- Safe and cost-effective solutions
- Clear explanations suitable for farmers of all levels
- Specific recommendations when possible

Respond in a friendly, helpful tone and keep answers concise but comprehensive.'''
          },
          {'role': 'user', 'content': message}
        ],
        'temperature': 0.7,
        'max_tokens': 1024,
        'top_p': 0.9,
        'stream': false,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['choices'] != null && data['choices'].isNotEmpty) {
        return data['choices'][0]['message']['content'] ?? 'No response received.';
      }
    } else if (response.statusCode == 429) {
      throw Exception('Rate limit exceeded');
    } else {
      throw Exception('API Error ${response.statusCode}: ${response.body}');
    }

    throw Exception('No valid response received');
  }

  /// Send image-only request for agricultural analysis
  Future<String> _sendImageOnlyRequest(File imageFile, String apiKey, String? additionalText) async {
    try {
      // Validate file size (4MB limit for base64)
      final fileSize = await imageFile.length();
      if (fileSize > 4 * 1024 * 1024) {
        return "Image file is too large. Please use an image smaller than 4MB.";
      }

      // Encode image as base64
      final imageBytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(imageBytes);
      final mimeType = lookupMimeType(imageFile.path) ?? 'image/jpeg';

      // Create agricultural analysis prompt
      String analysisPrompt = '''Analyze this agricultural image and provide expert advice. Focus on:

🌱 **Crop Identification**: If you can identify the crop/plant, provide its name and growing information
🦠 **Disease Detection**: Look for signs of diseases, pests, or health issues and provide treatment recommendations  
🌤️ **Environmental Assessment**: Analyze growing conditions, soil health, or environmental factors visible
⚡ **Quick Recommendations**: Provide immediate actionable advice for the farmer

${additionalText != null ? 'Additional context: $additionalText' : ''}

Please provide practical, specific guidance that a farmer can implement immediately.''';

      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'model': _visionModel,
          'messages': [
            {
              'role': 'system',
              'content': '''You are GREEN AI, an expert agricultural vision assistant with advanced image analysis capabilities. You specialize in:
- Crop disease identification and treatment recommendations
- Plant species identification and growing guidance  
- Soil condition assessment from visual cues
- Pest and nutrient deficiency detection
- Weather impact analysis on crops
- Sustainable farming practice recommendations

Provide clear, actionable advice that farmers can implement immediately. Always prioritize safe, environmentally-friendly solutions.'''
            },
            {
              'role': 'user',
              'content': [
                {
                  'type': 'text',
                  'text': analysisPrompt
                },
                {
                  'type': 'image_url',
                  'image_url': {
                    'url': 'data:$mimeType;base64,$base64Image'
                  }
                }
              ]
            }
          ],
          'temperature': 0.7,
          'max_completion_tokens': 1024,
          'top_p': 0.9,
          'stream': false,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['choices'] != null && data['choices'].isNotEmpty) {
          return data['choices'][0]['message']['content'] ?? 'No response received.';
        }
      } else if (response.statusCode == 429) {
        throw Exception('Rate limit exceeded');
      } else {
        throw Exception('API Error ${response.statusCode}: ${response.body}');
      }

      throw Exception('No valid response received');
    } catch (e) {
      throw Exception('Failed to analyze image: $e');
    }
  }
}
