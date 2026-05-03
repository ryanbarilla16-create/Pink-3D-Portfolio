import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Code, Database, Sparkles, Award, Coffee } from 'lucide-react';

const features = [
  {
    icon: Code,
    title: 'Full-Stack Development',
    description: 'Building scalable web apps with Flask, Python, and modern JavaScript frameworks.',
    color: 'from-pink-400 to-pink-500',
  },
  {
    icon: Database,
    title: 'Database Architecture',
    description: 'Designing robust schemas with PostgreSQL, SQLAlchemy, and Neon for complex business systems.',
    color: 'from-lavender to-lavender-dark',
  },
  {
    icon: Sparkles,
    title: 'Mobile Development',
    description: 'End-to-end Android app development and deployment via Google Play Console.',
    color: 'from-roseGold to-roseGold-dark',
  },
];

const personalInfo = [
  { icon: Heart, label: 'Passion', value: 'Build Systems' },
  { icon: Award, label: 'Experience', value: 'Full-Stack' },
  { icon: Coffee, label: 'Specialty', value: 'Flask + PG' },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="relative py-32 overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-pink-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-lavender/20 to-lavender-dark/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

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
            <span className="text-sm font-medium text-foreground/80">About Me</span>
          </motion.div>
          
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Dedicated Developer</span>
            <br />
            <span className="text-foreground/80">& Problem Solver</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            I transform complex business requirements into seamless digital experiences.
            I thrive on solving technical challenges — from optimizing database performance
            to building real-time, flicker-free user interfaces.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Left - Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Image Container */}
            <div className="relative">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 bg-gradient-to-br from-pink-300 via-lavender to-roseGold rounded-[3rem] opacity-30 blur-lg animate-pulse" />
              
              {/* Main Visual */}
              <div className="relative aspect-square rounded-[2.5rem] overflow-hidden glass-pink shadow-soft">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-pink-50 to-lavender-light" />
                
                {/* Abstract Design */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="relative w-3/4 h-3/4"
                  >
                    {/* Orbiting Circles */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0"
                        animate={{ rotate: 360 * (i % 2 === 0 ? 1 : -1) }}
                        transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                      >
                        <div 
                          className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 shadow-pink-md"
                          style={{ 
                            top: `${20 + i * 30}%`, 
                            left: `${10 + i * 40}%`,
                          }}
                        />
                      </motion.div>
                    ))}
                    
                    {/* Center Element */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-lavender shadow-pink-lg flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Floating Badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-8 right-8 px-4 py-2 glass rounded-full shadow-soft"
                >
                  <span className="text-sm font-medium text-pink-600">Creative</span>
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute bottom-8 left-8 px-4 py-2 glass rounded-full shadow-soft"
                >
                  <span className="text-sm font-medium text-lavender-dark">Passionate</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">
                Building with <span className="gradient-text">Purpose</span> & <span className="gradient-text">Precision</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                I am a dedicated Full-Stack Developer with a passion for building scalable,
                real-time web and mobile applications. My expertise lies in transforming
                complex business requirements into seamless digital experiences. My goal
                is to build technology that drives efficiency and simplifies daily operations.
              </p>
            </div>

            {/* Personal Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              {personalInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center p-4 glass-pink rounded-2xl"
                >
                  <info.icon className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                  <div className="font-semibold text-foreground">{info.value}</div>
                  <div className="text-xs text-muted-foreground">{info.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Quote */}
            <motion.blockquote
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="relative pl-6 border-l-4 border-pink-400"
            >
              <p className="font-serif text-xl italic text-foreground/80">
                "I don't just write code; I build systems that solve real-world problems."
              </p>
              <cite className="text-sm text-muted-foreground mt-2 block">— Ryan Bien N. Barilla</cite>
            </motion.blockquote>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative p-8 glass-pink rounded-3xl hover:shadow-soft transition-all duration-500"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-pink-md group-hover:shadow-pink-lg group-hover:scale-110 transition-all duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="font-serif text-xl font-bold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-400/0 to-lavender/0 group-hover:from-pink-400/5 group-hover:to-lavender/5 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
