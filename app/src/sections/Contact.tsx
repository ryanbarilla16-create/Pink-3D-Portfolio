import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Heart,
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [profile, setProfile] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(setProfile).catch(() => {});
  }, []);

  const contactInfo = [
    { icon: Mail,   label: 'Email',    value: profile.email    || 'ryanbarilla16@gmail.com' },
    { icon: Phone,  label: 'Phone',    value: profile.phone    || '+63 963 682 6231' },
    { icon: MapPin, label: 'Location', value: profile.location || 'Philippines' },
  ];

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: profile.instagram || '#' },
    { name: 'Twitter',   icon: Twitter,   href: profile.twitter   || '#' },
    { name: 'LinkedIn',  icon: Linkedin,  href: profile.linkedin  || '#' },
    { name: 'GitHub',    icon: Github,    href: profile.github    || '#' },
  ];

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormData({ name: '', email: '', message: '' });
        showToast('success', "Thank you for your message! I'll get back to you soon. 💌");
      } else {
        showToast('error', data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      showToast('error', 'Could not send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="relative py-32 overflow-hidden"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -80, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -80, x: '-50%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-6 left-1/2 z-[100] min-w-[320px] max-w-md"
          >
            <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl
              ${toast.type === 'success'
                ? 'bg-white/90 border-pink-200 text-gray-800'
                : 'bg-white/90 border-red-200 text-gray-800'
              }`}>
              {toast.type === 'success'
                ? <CheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              }
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {toast.type === 'success' ? 'Message Sent!' : 'Error'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-gray-300 hover:text-gray-500 transition-colors">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className={`h-1 rounded-full mt-1 ${toast.type === 'success' ? 'bg-gradient-to-r from-pink-400 to-lavender' : 'bg-red-400'}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background */}
      <div className="absolute inset-0 gradient-pink opacity-40" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-lavender/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-pink rounded-full"
          >
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span className="text-sm font-medium text-foreground/80">Get in Touch</span>
          </motion.div>
          
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Let's Create</span>
            <br />
            <span className="text-foreground/80">Something Beautiful</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Have a project in mind? I'd love to hear about it. 
            Let's discuss how we can bring your vision to life.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-4 glass-pink rounded-2xl hover:shadow-soft transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-pink-sm">
                    <info.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{info.label}</div>
                    <div className="font-medium text-foreground">{info.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="p-6 glass-pink rounded-3xl"
            >
              <h3 className="font-serif text-lg font-bold mb-4 text-foreground">
                Follow Me
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-400 hover:to-pink-500 hover:text-white hover:shadow-pink-md transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Decorative Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="p-6 glass-pink rounded-3xl relative overflow-hidden"
            >
              <Sparkles className="absolute top-4 right-4 w-8 h-8 text-pink-300" />
              <p className="font-serif text-lg italic text-foreground/80">
                "Great things happen when talented people come together to create."
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="p-8 glass-pink rounded-3xl shadow-soft">
              <h3 className="font-serif text-2xl font-bold mb-6 text-foreground">
                Send a Message
              </h3>

              <div className="space-y-6">
                {/* Name Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 placeholder:text-muted-foreground/50"
                    placeholder="John Doe"
                  />
                </motion.div>

                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 placeholder:text-muted-foreground/50"
                    placeholder="john@example.com"
                  />
                </motion.div>

                {/* Message Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-5 py-4 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 resize-none placeholder:text-muted-foreground/50"
                    placeholder="Tell me about your project..."
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-pink-400 via-pink-500 to-lavender text-white font-medium rounded-xl shadow-pink-md hover:shadow-pink-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
