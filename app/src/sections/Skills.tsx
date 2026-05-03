import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Code2, Database, Smartphone, Server, Zap, Globe, GitBranch, Layers } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Languages': Code2,
  'Frameworks & Libraries': Server,
  'Databases & ORM': Database,
  'Mobile & Tools': Smartphone,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Languages': 'from-pink-400 to-pink-500',
  'Frameworks & Libraries': 'from-lavender to-lavender-dark',
  'Databases & ORM': 'from-roseGold to-roseGold-dark',
  'Mobile & Tools': 'from-peach to-pink-400',
};

const tools = [
  { name: 'Flask',      icon: Server },
  { name: 'PostgreSQL', icon: Database },
  { name: 'Git/GitHub', icon: GitBranch },
  { name: 'REST APIs',  icon: Globe },
  { name: 'Android',    icon: Smartphone },
  { name: 'VS Code',    icon: Layers },
];

const softSkills = [
  { name: 'Real-Time UI Polling', icon: Zap },
  { name: 'DOM-Diffing Logic',    icon: Code2 },
  { name: 'Problem Solving',      icon: Globe },
];

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: '-100px' });
  const [skillGroups, setSkillGroups] = useState<Record<string, { id: number; name: string; level: number }[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://pink-portfolio-backend.onrender.com/api/skills')
      .then(r => r.json())
      .then(data => { setSkillGroups(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = Object.keys(skillGroups);

  return (
    <section ref={sectionRef} id="skills" className="relative py-32 overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-200/30 to-lavender/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-roseGold/20 to-peach/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-20">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-pink rounded-full">
            <Zap className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-foreground/80">My Expertise</span>
          </motion.div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Skills</span>{' '}
            <span className="text-foreground/80">& Tools</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            A comprehensive toolkit built over years of creating digital experiences. Always learning, always growing.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full" />
          </div>
        )}

        {/* Skills Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {categories.map((category, categoryIndex) => {
              const Icon  = CATEGORY_ICONS[category]  || Code2;
              const color = CATEGORY_COLORS[category] || 'from-pink-400 to-pink-500';
              const skills = skillGroups[category];
              return (
                <motion.div key={category}
                  initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }} className="group">
                  <div className="relative p-8 glass-pink rounded-3xl hover:shadow-soft transition-all duration-500">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-pink-md group-hover:shadow-pink-lg group-hover:scale-110 transition-all duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-foreground">{category}</h3>
                    </div>
                    <div className="space-y-5">
                      {skills.map((skill, skillIndex) => (
                        <motion.div key={skill.id}
                          initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.3 + categoryIndex * 0.1 + skillIndex * 0.05 }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">{skill.name}</span>
                            <span className="text-sm text-muted-foreground">{skill.level}%</span>
                          </div>
                          <div className="relative h-2.5 bg-pink-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={isInView ? { width: `${skill.level}%` } : {}}
                              transition={{ duration: 1, delay: 0.5 + categoryIndex * 0.1 + skillIndex * 0.05, ease: [0.22, 1, 0.36, 1] }}
                              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color}`}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-[4rem] rounded-tr-3xl`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tools & Soft Skills */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.4 }} className="p-8 glass-pink rounded-3xl">
            <h3 className="font-serif text-xl font-bold mb-6 text-foreground">Favorite Tools</h3>
            <div className="flex flex-wrap gap-3">
              {tools.map((tool, index) => (
                <motion.div key={tool.name}
                  initial={{ opacity: 0, scale: 0.8 }} animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }} whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/50 rounded-xl hover:bg-pink-100/50 hover:shadow-pink-sm transition-all duration-300">
                  <tool.icon className="w-5 h-5 text-pink-500" />
                  <span className="text-sm font-medium text-foreground">{tool.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.5 }} className="p-8 glass-pink rounded-3xl">
            <h3 className="font-serif text-xl font-bold mb-6 text-foreground">Soft Skills</h3>
            <div className="flex flex-wrap gap-3">
              {softSkills.map((skill, index) => (
                <motion.div key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }} animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 + index * 0.1 }} whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-400/10 to-lavender/10 rounded-xl hover:from-pink-400/20 hover:to-lavender/20 transition-all duration-300">
                  <skill.icon className="w-5 h-5 text-pink-500" />
                  <span className="text-sm font-medium text-foreground">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
