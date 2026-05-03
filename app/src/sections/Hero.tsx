import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Heart, Star, Sparkles } from 'lucide-react';
import FloatingShapes from '../components/FloatingShapes';
import gsap from 'gsap';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [profile, setProfile] = useState<Record<string, string>>({});

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    fetch('https://pink-portfolio-backend.onrender.com/api/profile').then(r => r.json()).then(setProfile).catch(() => {});
  }, []);

  useEffect(() => {
    if (textRef.current) {
      const chars = textRef.current.querySelectorAll('.char');
      gsap.fromTo(chars,
        { opacity: 0, y: 50, rotateX: -90 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.03, ease: "back.out(1.7)", delay: 0.5 }
      );
    }
  }, [profile]);

  const scrollToAbout = () => {
    const element = document.querySelector('#about');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const titleText    = profile.hero_name     || "Ryan Bien";
  const subtitleText = profile.hero_subtitle || "N. Barilla";
  const tagline      = profile.hero_tagline  || "I'm a Full Stack Developer";
  const description  = profile.hero_description || "Specialized in Integrated Business Solutions. I build scalable, real-time web and mobile applications that drive efficiency and simplify daily operations.";
  const badgeText    = profile.hero_badge    || "Available for work";
  const stat1Value   = profile.hero_stat1_value || "5+";
  const stat1Label   = profile.hero_stat1_label || "Years Exp";
  const stat2Value   = profile.hero_stat2_value || "50+";
  const stat2Label   = profile.hero_stat2_label || "Projects Done";

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <FloatingShapes />

      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 gradient-pink opacity-60" />

      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-pink-300/30 to-pink-500/30 blur-xl"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-lavender/30 to-lavender-dark/30 blur-xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-gradient-to-br from-roseGold/30 to-roseGold-dark/30 blur-lg"
        animate={{
          x: [0, 20, 0],
          y: [0, -10, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text Content */}
          <div className="text-left order-2 lg:order-1">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass-pink rounded-full"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-foreground/80">Welcome to my portfolio</span>
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            </motion.div>

            {/* Main Title */}
            <h1
              ref={textRef}
              className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold mb-6 perspective-1000 leading-tight"
            >
              <span className="block gradient-text">
                {titleText.split('').map((char, i) => (
                  <span key={i} className="char inline-block" style={{ display: char === ' ' ? 'inline' : 'inline-block' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
              <span className="block text-foreground/90 mt-2">
                {subtitleText.split('').map((char, i) => (
                  <span key={i} className="char inline-block" style={{ display: char === ' ' ? 'inline' : 'inline-block' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="max-w-xl text-lg md:text-xl font-medium mb-10"
            >
              <span className="text-pink-500">{tagline}</span>
              <br />
              <span className="text-muted-foreground text-base mt-2 block leading-relaxed">
                {description}
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center justify-start gap-4 mb-16"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const element = document.querySelector('#projects');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-400 via-pink-500 to-lavender text-white font-medium rounded-full shadow-pink-lg hover:shadow-pink-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                View My Work
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const element = document.querySelector('#contact');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 glass-pink text-foreground font-medium rounded-full hover:bg-pink-100/50 transition-all duration-300"
              >
                Get in Touch
              </motion.button>
              <motion.a
                href="https://pink-portfolio-backend.onrender.com/api/resume"
                download
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 glass-pink text-foreground font-medium rounded-full hover:bg-pink-100/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CV
              </motion.a>
            </motion.div>

            {/* Stats */}
            <div className="flex gap-8">
              {[
                { value: stat1Value, label: stat1Label },
                { value: stat2Value, label: stat2Label },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                >
                  <div className="font-serif text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Profile Image */}
          <div className="relative order-1 lg:order-2 flex justify-center items-center">
            {/* Main Profile Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
            >
              {/* Outer Decorative Rings */}
              <div className="absolute inset-[-20px] rounded-full border border-pink-200/50 animate-spin-slow" />
              <div className="absolute inset-[-40px] rounded-full border border-lavender/30 animate-spin-reverse-slow" />

              {/* Image Border/Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-400 to-lavender p-1.5 shadow-pink-xl">
                {/* Profile Image */}
                <div className="w-full h-full rounded-full overflow-hidden bg-pink-100 border-4 border-white">
                  <img
                    src="https://pink-portfolio-backend.onrender.com/api/profile-picture"
                    alt="Ryan Bien"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://i.postimg.cc/154GgL5f/74d02ed8-3d2d-4bd1-b4fe-46789b39ed5d.jpg";
                    }}
                  />
                </div>
              </div>

              {/* Floating Badges (Similar to Reference) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 px-4 py-2 glass-pink rounded-2xl shadow-lg flex items-center gap-2 border border-white/50"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold text-pink-700">{badgeText}</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-6 -left-6 px-4 py-3 glass-pink rounded-2xl shadow-lg flex flex-col items-center gap-1 border border-white/50"
              >
                <span className="text-xl">🎨</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500">Creative</span>
              </motion.div>

              <motion.div
                animate={{ x: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -right-12 px-4 py-2 glass-pink rounded-full shadow-lg flex items-center gap-2 border border-white/50"
              >
                <span className="text-sm font-bold text-foreground">3D Specialist</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground hover:text-pink-500 transition-colors duration-300"
      >
        <span className="text-sm font-medium">Scroll Down</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(340 30% 98%)"
          />
        </svg>
      </div>
    </section>
  );
}
