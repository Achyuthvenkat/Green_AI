import 'dart:convert';
import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:mime/mime.dart';

class ChatService {
  static List<String> get _geminiApiKeys {
    final key = dotenv.env['GEMINI_API_KEY'];
    return [if (key != null && key.isNotEmpty) key];
  }

  static List<String> get _groqApiKeys {
    final key = dotenv.env['GROQ_API_KEY'];
    return [if (key != null && key.isNotEmpty) key];
  }

  /// Send either text-only message or image-only message
  Future<String> sendMessage({String? message, File? imageFile}) async {
    if (message == null && imageFile == null) {
      return "Please provide either a text message or an image for analysis.";
    }

    // 1. Try Google Gemini API first if available
    for (int i = 0; i < _geminiApiKeys.length; i++) {
      try {
        final res = await _sendGeminiRequest(
          message: message,
          imageFile: imageFile,
          apiKey: _geminiApiKeys[i],
        );
        if (res.isNotEmpty) return res;
      } catch (e) {
        print('Gemini API exception: $e');
        continue;
      }
    }

    // 2. Fallback to Groq API
    for (int i = 0; i < _groqApiKeys.length; i++) {
      try {
        if (imageFile != null) {
          return await _sendGroqImageRequest(imageFile, _groqApiKeys[i], message);
        } else {
          return await _sendGroqTextRequest(message!, _groqApiKeys[i]);
        }
      } catch (e) {
        print('Groq API exception: $e');
        continue;
      }
    }

    return "I'm experiencing high demand right now. Please try again in a few moments, and I'll be happy to help with your farming questions!";
  }

  /// Google AI Studio (Gemini 3.5 Flash)
  Future<String> _sendGeminiRequest({
    String? message,
    File? imageFile,
    required String apiKey,
  }) async {
    final url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=$apiKey";

    final parts = <Map<String, dynamic>>[];

    if (message != null && message.trim().isNotEmpty) {
      parts.add({'text': message});
    } else {
      parts.add({
        'text':
            'Analyze this agricultural image. Identify crop diseases, pest damage, soil conditions, and provide actionable remedies.'
      });
    }

    if (imageFile != null) {
      final bytes = await imageFile.readAsBytes();
      final b64 = base64Encode(bytes);
      final mime = lookupMimeType(imageFile.path) ?? 'image/jpeg';
      parts.add({
        'inline_data': {
          'mime_type': mime,
          'data': b64,
        }
      });
    }

    final payload = {
      'contents': [
        {'parts': parts}
      ],
      'systemInstruction': {
        'parts': [
          {
            'text':
                '''You are GREEN AI, an expert agricultural assistant specializing in sustainable farming practices, crop pathology, pest control, and soil management. 
Always provide clear, practical, and actionable advice tailored for farmers, with safe organic and chemical recommendations.'''
          }
        ]
      }
    };

    final response = await http.post(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    ).timeout(const Duration(seconds: 25));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final candidates = data['candidates'] as List?;
      if (candidates != null && candidates.isNotEmpty) {
        final content = candidates[0]['content'];
        final resParts = content['parts'] as List?;
        if (resParts != null && resParts.isNotEmpty) {
          return resParts[0]['text'] ?? 'No advice generated.';
        }
      }
    }

    throw Exception('Gemini API Error ${response.statusCode}: ${response.body}');
  }

  /// Groq Text-only
  Future<String> _sendGroqTextRequest(String message, String apiKey) async {
    const url = "https://api.groq.com/openai/v1/chat/completions";
    final response = await http.post(
      Uri.parse(url),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'model': "llama-3.1-8b-instant",
        'messages': [
          {
            'role': 'system',
            'content': 'You are GREEN AI, an expert agricultural assistant.'
          },
          {'role': 'user', 'content': message}
        ],
        'temperature': 0.7,
        'max_tokens': 1024,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['choices'][0]['message']['content'] ?? 'No response received.';
    }
    throw Exception('Groq API Error: ${response.statusCode}');
  }

  /// Groq Image
  Future<String> _sendGroqImageRequest(File imageFile, String apiKey, String? additionalText) async {
    const url = "https://api.groq.com/openai/v1/chat/completions";
    final bytes = await imageFile.readAsBytes();
    final b64 = base64Encode(bytes);
    final mime = lookupMimeType(imageFile.path) ?? 'image/jpeg';

    final response = await http.post(
      Uri.parse(url),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'model': "meta-llama/llama-4-scout-17b-16e-instruct",
        'messages': [
          {
            'role': 'user',
            'content': [
              {'type': 'text', 'text': additionalText ?? "Analyze this crop leaf for diseases."},
              {'type': 'image_url', 'image_url': {'url': 'data:$mime;base64,$b64'}}
            ]
          }
        ],
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['choices'][0]['message']['content'] ?? 'No response.';
    }
    throw Exception('Groq Vision Error: ${response.statusCode}');
  }
}
