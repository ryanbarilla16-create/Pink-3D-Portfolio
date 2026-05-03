import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config.dart';

class ApiService {
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('${Config.baseUrl}/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(res.body);
  }

  // ─── Messages ──────────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> getMessages() async {
    final res = await http.get(
      Uri.parse('${Config.baseUrl}/messages'),
      headers: await _headers(),
    );
    return jsonDecode(res.body);
  }

  static Future<bool> deleteMessage(int id) async {
    final res = await http.delete(
      Uri.parse('${Config.baseUrl}/messages/$id'),
      headers: await _headers(),
    );
    return res.statusCode == 200;
  }

  static Future<Map<String, dynamic>> replyMessage(
      int id, String to, String subject, String body) async {
    final res = await http.post(
      Uri.parse('${Config.baseUrl}/messages/$id/reply'),
      headers: await _headers(),
      body: jsonEncode({'to': to, 'subject': subject, 'body': body}),
    );
    return jsonDecode(res.body);
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> getStats() async {
    final res = await http.get(
      Uri.parse('${Config.baseUrl}/stats'),
      headers: await _headers(),
    );
    return jsonDecode(res.body);
  }
}
