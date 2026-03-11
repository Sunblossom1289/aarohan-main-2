import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Clock, X, User, Calendar } from 'lucide-react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// Centralized Styles
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#f8fbff',
    fontFamily: "'Inter', sans-serif",
    paddingBottom: '80px'
  },
  header: {
    background: 'linear-gradient(180deg, #0f2d40 0%, #1b4965 100%)',
    padding: '80px 20px 160px',
    color: 'white',
    textAlign: 'center',
    position: 'relative',
    zIndex: 0,
    borderBottomRightRadius: '50px',
    borderBottomLeftRadius: '50px',
    marginBottom: '-100px'
  },
  backBtn: {
    position: 'absolute', left: '24px', top: '32px',
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    color: 'white', display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '30px', cursor: 'pointer',
    fontSize: '0.9rem', backdropFilter: 'blur(10px)', zIndex: 20
  },
  card: {
    background: '#0f172a',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    minHeight: '280px',
    cursor: 'pointer'
  },
  gradientOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(11, 35, 51, 0.95) 100%)',
    zIndex: 1
  },
  categoryBadge: {
    position: 'absolute', top: '20px', right: '20px',
    background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)',
    padding: '6px 12px', borderRadius: '20px',
    fontSize: '0.7rem', fontWeight: '700', color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    zIndex: 10, textTransform: 'uppercase', letterSpacing: '0.05em'
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(8px)', zIndex: 1000,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '20px'
  },
  modalContent: {
    background: 'white', width: '100%', maxWidth: '800px', maxHeight: '90vh',
    borderRadius: '24px', overflow: 'hidden', position: 'relative',
    display: 'flex', flexDirection: 'column'
  }
};

// AUTO-LAYOUT LOGIC
const LAYOUT_PATTERN = ['large', 'tall', 'medium', 'medium', 'wide', 'medium'];
const getAutoSize = (index) => {
  return LAYOUT_PATTERN[index % LAYOUT_PATTERN.length];
};

export function ArticlesPage({ onNavigate }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const indexResponse = await fetch('/articles/index.json');
        if (!indexResponse.ok) throw new Error('Failed to load article index');
        const fileList = await indexResponse.json();

        if (!Array.isArray(fileList) || fileList.length === 0) {
          setArticles([]);
          return;
        }

        const loadedArticles = await Promise.all(
          fileList.map(async (fileName, index) => {
            const res = await fetch(`/articles/${fileName}`);
            if (!res.ok) return null;
            const data = await res.json();
            // Automatically assign size based on index
            return { ...data, size: getAutoSize(index) };
          })
        );

        setArticles(loadedArticles.filter(Boolean));
      } catch (error) {
        console.error("Error loading articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return (
    <main style={styles.pageWrapper} role="main">
      <style>{`
        .bento-grid {
          display: grid; gap: 24px;
          grid-template-columns: 1fr;
          position: relative; z-index: 10;
        }
        @media (min-width: 768px) { .bento-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(3, 1fr);
            grid-auto-rows: 280px; 
          }
          /* Puzzle Layout Classes */
          .card-large { grid-column: span 2; grid-row: span 1; }
          .card-tall { grid-column: span 1; grid-row: span 2; }
          .card-medium { grid-column: span 1; grid-row: span 1; }
          .card-wide { grid-column: span 2; grid-row: span 1; }
        }

        .hover-card:hover { transform: translateY(-8px); box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.5) !important; }
        .hover-card:hover .card-img { transform: scale(1.05); }
        .card-img { transition: transform 0.6s ease; }
        
        /* --- FIXED ARROW BUTTON STYLE --- */
        .arrow-btn {
          width: 44px; 
          height: 44px; 
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1); /* Subtle default bg */
          border: 1px solid rgba(255, 255, 255, 0.2); 
          color: white;
          display: flex; 
          align-items: center; 
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          backdrop-filter: blur(4px);
          flex-shrink: 0; /* Prevents button from squashing into an oval */
        }
        
        .hover-card:hover .arrow-btn {
          background: white; 
          color: #1b4965; 
          border-color: white;
          transform: scale(1.05);
        }

        .article-body p { margin-bottom: 1.5em; line-height: 1.8; color: #334155; font-size: 1.1rem; }
        .article-body h2 { margin-top: 1.5em; margin-bottom: 0.8em; color: #0f172a; }
        .article-body h3 { margin-top: 1.2em; margin-bottom: 0.6em; color: #1e293b; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <button onClick={() => onNavigate('/')} style={styles.backBtn}>
            <ArrowLeft size={18} /> Back
          </button>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.1)', padding: '8px 20px',
              borderRadius: '30px', marginBottom: '24px', fontSize: '0.9rem',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Sparkles size={16} color="#bee9e8" /> 
              <span style={{ color: 'white', fontWeight: '600' }}>Knowledge Hub</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '800', margin: 0, color: '#ffffff', lineHeight: 1.1 }}>
              Explore Ideas
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#d1e6ff', marginTop: '16px', maxWidth: '500px', margin: '16px auto 0' }}>
              Curated insights to help you build your future.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="bento-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>
            Loading Articles...
          </div>
        ) : (
          articles.map((article) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className={`hover-card card-${article.size}`}
              style={styles.card}
              onClick={() => setSelectedArticle(article)}
            >
              <img 
                src={article.image} 
                alt={article.title} 
                className="card-img" 
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
              />
              <div style={styles.gradientOverlay} />
              <div style={styles.categoryBadge}>{article.category}</div>

              <div style={{ position: 'relative', zIndex: 2, padding: '24px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', fontWeight: '700', color: '#bee9e8', textTransform: 'uppercase', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {article.readTime}</span>
                  <span style={{ width: '4px', height: '4px', background: '#bee9e8', borderRadius: '50%' }} />
                  <span>{article.author}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: article.size === 'large' ? '1.8rem' : '1.4rem', fontWeight: '800', color: 'white', margin: '0 0 8px', lineHeight: 1.2 }}>{article.title}</h3>
                    {(article.size === 'large' || article.size === 'wide' || article.size === 'tall') && (
                      <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.5, margin: 0, maxWidth: '90%' }}>{article.excerpt}</p>
                    )}
                  </div>
                  
                  {/* Improved Arrow Button */}
                  <div className="arrow-btn">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>

      {/* Modal (Popup) */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()} 
            >
              <div style={{ height: '300px', position: 'relative' }}>
                <img src={selectedArticle.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                <button 
                  onClick={() => setSelectedArticle(null)}
                  style={{ position: 'absolute', top: 20, right: 20, background: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                >
                  <X size={24} color="#1b4965" />
                </button>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                  <span style={{ background: '#5fa8d3', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {selectedArticle.category}
                  </span>
                  <h2 style={{ color: 'white', fontSize: '2.5rem', margin: '10px 0', lineHeight: 1.1 }}>{selectedArticle.title}</h2>
                  <div style={{ display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={16} /> {selectedArticle.author}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> {selectedArticle.date}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }}>
                <div className="article-body" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}