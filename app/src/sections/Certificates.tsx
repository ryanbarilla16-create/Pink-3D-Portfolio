import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Award, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface Certificate {
  id: number;
  image_url: string;
}

export default function Certificates() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/certificates')
      .then((r) => r.json())
      .then((data) => { setCertificates(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const selectedCert = selected !== null ? certificates[selected] : null;

  const prev = () => { if (selected !== null && selected > 0) setSelected(selected - 1); };
  const next = () => { if (selected !== null && selected < certificates.length - 1) setSelected(selected + 1); };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selected === null) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, certificates.length]);

  return (
    <section ref={sectionRef} id="certificates" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-pink opacity-20" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-lavender/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-pink rounded-full"
          >
            <Award className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-foreground/80">Achievements</span>
          </motion.div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Certificates</span>{' '}
            <span className="text-foreground/80">& Awards</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Recognitions and certifications earned through continuous learning and dedication.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full"
            />
          </div>
        )}

        {/* Empty */}
        {!loading && certificates.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-pink-300" />
            </div>
            <p className="text-muted-foreground">No certificates uploaded yet.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && certificates.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                onClick={() => setSelected(index)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl glass-pink shadow-soft hover:shadow-pink-lg transition-all duration-300 aspect-[4/3]">
                  <img
                    src={cert.image_url}
                    alt={`Certificate ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <ZoomIn className="w-5 h-5 text-pink-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-pink-50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Image */}
              <img
                src={selectedCert.image_url}
                alt="Certificate"
                className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]"
              />

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                {(selected ?? 0) + 1} / {certificates.length}
              </div>

              {/* Prev / Next */}
              {selected !== null && selected > 0 && (
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-pink-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              {selected !== null && selected < certificates.length - 1 && (
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-pink-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
