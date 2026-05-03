import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Star, Folder, ArrowUpRight } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  tags: string;
  tags_list: string[];
  live_url: string;
  github_url: string;
  featured: number;
}

const COLORS = [
  'from-pink-400 to-pink-600',
  'from-lavender to-purple-500',
  'from-roseGold to-pink-400',
  'from-peach to-pink-400',
  'from-emerald-300 to-teal-400',
  'from-purple-400 to-pink-500',
];

const categories = ['All', 'Web App', 'Dashboard', 'Mobile App', 'Backend', 'E-Commerce'];

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [activeCategory, setActiveCategory] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <section ref={sectionRef} id="projects" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-pink opacity-30" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-lavender/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-pink rounded-full">
            <Folder className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-foreground/80">My Work</span>
          </motion.div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Featured</span>{' '}
            <span className="text-foreground/80">Projects</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            A curated selection of my recent work, showcasing creativity, technical skills, and attention to detail.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <motion.button key={cat} onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-pink-400 to-lavender text-white shadow-pink-md'
                  : 'glass-pink text-foreground/70 hover:text-foreground hover:bg-pink-100/50'
              }`}>
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, index) => (
                <motion.div key={project.id} layout
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -10 }} className="group relative">
                  <div className="relative overflow-hidden rounded-3xl glass-pink shadow-soft hover:shadow-pink-lg transition-all duration-500">
                    {/* Image / Gradient */}
                    <div className={`relative h-56 overflow-hidden ${project.image_url ? 'bg-gray-100' : `bg-gradient-to-br ${COLORS[index % COLORS.length]}`}`}>
                      {project.image_url ? (
                        <img src={project.image_url} alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      ) : (
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                        </div>
                      )}
                      <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity }}
                        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </motion.div>
                      {project.featured === 1 && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                          <span className="text-xs font-semibold text-pink-500">Featured</span>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full">
                        <span className="text-xs font-medium text-white">{project.category}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-serif text-xl font-bold mb-2 text-foreground group-hover:text-pink-500 transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(project.tags_list || []).map(tag => (
                          <span key={tag} className="px-3 py-1 text-xs font-medium bg-pink-100 text-pink-600 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        {project.live_url ? (
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white text-sm font-medium rounded-xl hover:shadow-pink-md transition-all duration-300">
                            <ExternalLink className="w-4 h-4" /> Live Demo
                          </a>
                        ) : (
                          <button disabled className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-xl cursor-not-allowed">
                            <ExternalLink className="w-4 h-4" /> Live Demo
                          </button>
                        )}
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                            className="p-2.5 glass rounded-xl hover:bg-pink-100/50 transition-all duration-300">
                            <Github className="w-5 h-5 text-foreground" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* View All */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.6 }} className="text-center mt-12">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 glass-pink text-foreground font-medium rounded-full hover:bg-pink-100/50 hover:shadow-soft transition-all duration-300">
            View All Projects <ArrowUpRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
