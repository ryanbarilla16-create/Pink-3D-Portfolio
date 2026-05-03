import 'package:flutter/material.dart';
import '../services/api_service.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});
  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<dynamic> _messages = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  Future<void> _loadMessages() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getMessages();
      setState(() { _messages = data['messages'] ?? []; _loading = false; });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _delete(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete Message'),
        content: const Text('Are you sure you want to delete this message?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm == true) {
      await ApiService.deleteMessage(id);
      _loadMessages();
    }
  }

  void _openReply(Map msg) {
    final bodyCtrl    = TextEditingController();
    final subjectCtrl = TextEditingController(text: 'Re: Your message to Ryan Bien');
    bool sending      = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Handle
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 20),
                Row(children: [
                  const Icon(Icons.reply_rounded, color: Color(0xFFF472B6)),
                  const SizedBox(width: 8),
                  Text('Reply to ${msg['name']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ]),
                Text(msg['email'], style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
                const SizedBox(height: 16),

                // Original message
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: const Color(0xFFFFF0F6), borderRadius: BorderRadius.circular(12)),
                  child: Text(msg['message'], style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                ),
                const SizedBox(height: 16),

                // Subject
                TextField(
                  controller: subjectCtrl,
                  decoration: InputDecoration(
                    labelText: 'Subject',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFFCE7F3))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFF472B6), width: 2)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFFCE7F3))),
                  ),
                ),
                const SizedBox(height: 12),

                // Body
                TextField(
                  controller: bodyCtrl,
                  maxLines: 4,
                  decoration: InputDecoration(
                    labelText: 'Your reply',
                    hintText: 'Type your message here...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFFCE7F3))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFF472B6), width: 2)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFFCE7F3))),
                  ),
                ),
                const SizedBox(height: 16),

                // Send button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFFF472B6), Color(0xFFA78BFA)]),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: ElevatedButton(
                      onPressed: sending ? null : () async {
                        if (bodyCtrl.text.trim().isEmpty) return;
                        setModalState(() => sending = true);
                        final res = await ApiService.replyMessage(
                          msg['id'], msg['email'], subjectCtrl.text, bodyCtrl.text.trim(),
                        );
                        setModalState(() => sending = false);
                        if (ctx.mounted) Navigator.pop(ctx);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            content: Text(res['success'] == true ? '✓ Reply sent!' : 'Failed: ${res['error']}'),
                            backgroundColor: res['success'] == true ? Colors.green : Colors.red,
                          ));
                        }
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                      child: sending
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                              Icon(Icons.send_rounded, color: Colors.white, size: 18),
                              SizedBox(width: 8),
                              Text('Send Reply', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                            ]),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF8FC),
      appBar: AppBar(
        title: const Text('Messages', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1F2937),
        elevation: 0,
        actions: [
          IconButton(onPressed: _loadMessages, icon: const Icon(Icons.refresh_rounded, color: Color(0xFFF472B6))),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF472B6)))
          : _messages.isEmpty
              ? Center(
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.email_outlined, size: 64, color: Colors.pink[200]),
                    const SizedBox(height: 16),
                    const Text('No messages yet', style: TextStyle(fontSize: 16, color: Color(0xFF9CA3AF))),
                  ]),
                )
              : RefreshIndicator(
                  onRefresh: _loadMessages,
                  color: const Color(0xFFF472B6),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (_, i) {
                      final msg = _messages[i];
                      final initial = (msg['name'] as String).isNotEmpty ? msg['name'][0].toUpperCase() : '?';
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFFCE7F3)),
                          boxShadow: [BoxShadow(color: Colors.pink.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 22,
                                    backgroundColor: const Color(0xFFF472B6).withOpacity(0.2),
                                    child: Text(initial, style: const TextStyle(color: Color(0xFFF472B6), fontWeight: FontWeight.bold, fontSize: 16)),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(msg['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1F2937))),
                                        Text(msg['email'], style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
                                      ],
                                    ),
                                  ),
                                  Text(msg['created_at'] ?? '', style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(color: const Color(0xFFFFF0F6), borderRadius: BorderRadius.circular(12)),
                                child: Text(msg['message'], style: const TextStyle(fontSize: 14, color: Color(0xFF374151), height: 1.5)),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () => _openReply(msg),
                                      icon: const Icon(Icons.reply_rounded, size: 16),
                                      label: const Text('Reply'),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: const Color(0xFFF472B6),
                                        side: const BorderSide(color: Color(0xFFF472B6)),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  OutlinedButton.icon(
                                    onPressed: () => _delete(msg['id']),
                                    icon: const Icon(Icons.delete_outline_rounded, size: 16),
                                    label: const Text('Delete'),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: Colors.red,
                                      side: const BorderSide(color: Colors.red),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
