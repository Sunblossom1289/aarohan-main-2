// FILE: src/components/pages/BannerPage.jsx

import React, { useRef, useState, useEffect, useMemo, useCallback, lazy, Suspense, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Brain, Target, Users, 
  Globe, Award, Zap, BookOpen, Mail, ChevronRight, ChevronLeft,
  GraduationCap, PenTool, MessageSquare, Send, Check,
  Map, Library, Sparkles, X, Heart, Menu
} from 'lucide-react';

// ==================== PERFORMANCE OPTIMIZATIONS & HOOKS ====================

const useDevicePerformance = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);
    
    const detectLowEndDevice = () => {
      const memory = navigator.deviceMemory || 8; 
      const cores = navigator.hardwareConcurrency || 4;
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const slowConnection = connection && (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLow = memory <= 4 || cores <= 2 || slowConnection || (isMobile && memory <= 6);
      
      setIsLowEnd(isLow);
    };
    
    detectLowEndDevice();
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);
  
  return { isLowEnd, prefersReducedMotion, shouldReduceAnimations: isLowEnd || prefersReducedMotion };
};

const useThrottledScroll = (callback, delay = 100) => {
  const lastCall = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, delay]);
};

const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options.once !== false) observer.unobserve(element);
        } else if (options.once === false) {
          setIsInView(false);
        }
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '50px' }
    );
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin, options.once]);
  
  return [ref, isInView];
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

const getCenterArrowStyle = (canScroll, direction) => ({
  position: 'absolute',
  top: '50%',
  [direction]: '12px',
  transform: 'translateY(-50%)',
  zIndex: 20,
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(27, 73, 101, 0.1)',
  boxShadow: '0 8px 25px rgba(27, 73, 101, 0.25)',
  color: 'var(--yale-blue)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: canScroll ? 'pointer' : 'default',
  opacity: canScroll ? 1 : 0,
  pointerEvents: canScroll ? 'auto' : 'none',
  transition: 'all 0.3s ease',
  WebkitTapHighlightColor: 'transparent'
});

const OptimizedMotion = memo(({ children, shouldReduceAnimations, ...props }) => {
  if (shouldReduceAnimations) {
    const { initial, animate, exit, whileHover, whileTap, whileInView, transition, variants, ...restProps } = props;
    return <div {...restProps}>{children}</div>;
  }
  return <motion.div {...props}>{children}</motion.div>;
});

const LazyImage = memo(({ src, alt, style, ...props }) => {
  const [imgRef, isInView] = useInView({ rootMargin: '100px' });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  return (
    <div ref={imgRef} style={{ ...style, position: 'relative' }}>
      {isInView && !error && (
        <img
          src={src} alt={alt} loading="lazy" decoding="async"
          onLoad={() => setLoaded(true)} onError={() => setError(true)}
          style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
          {...props}
        />
      )}
      {(!isInView || !loaded) && !error && (
        <div style={{ ...style, background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)', position: 'absolute', inset: 0 }} />
      )}
    </div>
  );
});

// ==================== FLOATING CAREER LABELS BACKGROUND ====================
const CAREER_LABELS_FULL = [
  'Data Scientist', 'Prompt Engineer', 'ML Scientist', 'AI Ethicist', 'Cybersecurity', 'Ethical Hacker', 'Robotics Engineer', 'Cloud Security',
  'Full Stack Developer', 'DevOps Engineer', 'Blockchain Developer', 'IoT Architect', 'Systems Analyst', 'Network Engineer', 'Database Admin', 'QA Engineer',
  'Site Reliability', 'Mobile Developer', 'Frontend Engineer', 'Backend Engineer', 'AR/VR Developer', 'Computer Vision', 'NLP Engineer', 'Data Engineer',
  'Cloud Architect', 'Security Analyst', 'Penetration Tester', 'IT Consultant', 'Tech Lead', 'CTO', 'Scrum Master', 'Product Manager',
  'Web Developer', 'API Developer', 'Platform Engineer', 'Solutions Architect', 'Big Data', 'Edge Computing', 'Quantum Computing', 'Digital Twin Engineer',
  'Rocket Scientist', 'EV Diagnostics', 'Aerospace', 'Civil Engineering', 'Marine Biology', 'Forensic Science', 'Biotechnology', 'Genomics',
  'Space Tech', 'Neuroscience', 'Chemical Engineer', 'Materials Scientist', 'Nuclear Physicist', 'Astrophysicist', 'Climate Scientist', 'Geologist',
  'Oceanographer', 'Zoologist', 'Botanist', 'Microbiologist', 'Nanotechnologist', 'Biomedical Engineer', 'Environmental Engineer', 'Structural Engineer',
  'Petroleum Engineer', 'Mining Engineer', 'Metallurgist', 'Polymer Scientist', 'Seismologist', 'Volcanologist', 'Paleontologist', 'Geneticist',
  'Epidemiologist', 'Pharmacologist', 'Toxicologist', 'Lab Technician', 'Research Scientist', 'R&D Director', 'Patent Analyst', 'Science Writer',
  'Renewable Energy', 'Solar Engineer', 'Wind Energy', 'Hydrogen Fuel', 'Healthcare', 'Gerontologist', 'Sports Medicine', 'Pharmacy & R&D',
  'Surgeon', 'Pediatrician', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Psychiatrist', 'Radiologist', 'Anesthesiologist'
];

const CAREER_LABELS_MOBILE = [
  'Data Scientist', 'Prompt Engineer', 'ML Scientist', 'AI Ethicist', 'Cybersecurity', 'Ethical Hacker', 'Robotics Engineer', 'Cloud Security',
  'Full Stack Developer', 'DevOps Engineer', 'Blockchain Developer', 'IoT Architect', 'Systems Analyst', 'Network Engineer', 'Database Admin', 'QA Engineer',
  'Site Reliability', 'Mobile Developer', 'Frontend Engineer', 'Backend Engineer', 'AR/VR Developer', 'Computer Vision', 'NLP Engineer', 'Data Engineer',
  'Cloud Architect', 'Security Analyst', 'Penetration Tester', 'IT Consultant', 'Tech Lead', 'CTO', 'Scrum Master', 'Product Manager',
  'Web Developer', 'API Developer', 'Platform Engineer', 'Solutions Architect', 'Big Data', 'Edge Computing', 'Quantum Computing', 'Digital Twin Engineer'
];

const CareerNetworkCanvas = memo(({ shouldReduceAnimations }) => {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isMobileView = window.innerWidth < 1024;
    const labels = isMobileView ? CAREER_LABELS_MOBILE : CAREER_LABELS_FULL;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes = labels.map((label, i) => {
      const fontSize = isMobileView ? (10 + Math.random() * 10) : (12 + Math.random() * 16);
      return {
        label,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (isMobileView ? 0.2 : 0.35),
        vy: (Math.random() - 0.5) * (isMobileView ? 0.2 : 0.35),
        fontSize,
        opacity: 0.45 + Math.random() * 0.55,
        color: i % 3 === 0 ? '#1b4965' : i % 3 === 1 ? '#1a7a94' : '#2b6d8a',
      };
    });
    nodesRef.current = nodes;

    const CONNECTION_DIST = isMobileView ? 80 : 120;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
            ctx.strokeStyle = `rgba(27, 73, 101, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.font = `600 ${node.fontSize}px Inter, sans-serif`;
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.opacity;
        ctx.fillText(node.label, node.x, node.y);
        ctx.globalAlpha = 1;
      }

      if (!shouldReduceAnimations) {
        for (const node of nodes) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x > canvas.width + 100) node.x = -100;
          if (node.x < -100) node.x = canvas.width + 100;
          if (node.y > canvas.height + 40) node.y = -40;
          if (node.y < -40) node.y = canvas.height + 40;
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [shouldReduceAnimations]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
});


// ==================== PREMIUM PAGE BREAKER STACK WRAPPER ====================
const StackedSection = memo(({ children, zIndex, isFirst = false, bg, shouldReduceAnimations }) => {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  if (shouldReduceAnimations) {
    return <div style={{ position: 'relative', zIndex, background: bg }}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex,
        background: bg,
        y,
        scale,
        opacity,
        transformOrigin: "top center",
        boxShadow: isFirst ? 'none' : '0 -30px 60px -15px rgba(27, 73, 101, 0.4)',
        borderTopLeftRadius: isFirst ? '0' : '40px',
        borderTopRightRadius: isFirst ? '0' : '40px',
        overflow: 'hidden',
        willChange: "transform, opacity",
        marginTop: isFirst ? '0' : '-40px',
      }}
    >
      <div style={{ paddingTop: isFirst ? '0' : '40px', height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
});

// --- GLOBAL STYLES ---
const GlobalStyles = memo(() => (
  <style>{`
    :root {
      --frozen-water: #bee9e8;
      --pacific-blue: #62b6cb;
      --yale-blue: #1b4965;
      --pale-sky: #cae9ff;
      --fresh-sky: #5fa8d3;
      --color-primary: var(--yale-blue);      
      --color-primary-light: var(--fresh-sky); 
      --color-accent: var(--pacific-blue);     
      --color-text-main: var(--yale-blue);
      --color-text-muted: #4a7a96;            
      --color-border: var(--frozen-water);
      --font-family-base: 'Inter', sans-serif;
    }
    
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; font-family: var(--font-family-base); color: var(--color-text-main); background-color: #f8fbff; overflow-x: hidden; }
    
    .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; }
    
    .text-huge { font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1rem; color: var(--yale-blue); }
    .text-label { text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; font-size: 0.875rem; color: var(--fresh-sky); display: block; margin-bottom: 1rem; }
    
    .btn { display: inline-flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
    .btn-primary { background: var(--color-primary); color: white; }
    .btn-primary:hover { background: var(--color-primary-light); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(95, 168, 211, 0.4); }
    .btn-sm { padding: 8px 16px; font-size: 0.875rem; }
    .rounded-full { border-radius: 9999px; }

    .navbar-menu a { text-decoration: none; color: var(--color-text-muted); font-weight: 500; transition: color 0.2s; }
    .navbar-menu a:hover { color: var(--color-primary); }
    
    .hidden { display: none; }
    .block { display: block; }

    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: 1fr; }
    .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; } .gap-8 { gap: 2rem; } .gap-12 { gap: 3rem; } 

    .input-field, .hero-input { width: 100%; padding: 12px 16px; border-radius: 8px; outline: none; transition: all 0.3s; }
    .hero-input { border: 1px solid var(--frozen-water); background: rgba(255, 255, 255, 0.8); color: var(--yale-blue); font-size: 0.9rem; }
    .hero-input:focus { border-color: var(--fresh-sky); background: #fff; box-shadow: 0 0 0 3px rgba(95, 168, 211, 0.15); }
    .input-field { border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; }
    .input-field::placeholder { color: rgba(255,255,255,0.5); }
    .input-field:focus { background: rgba(255,255,255,0.15); border-color: var(--pacific-blue); }

    .form-label { font-size: 0.7rem; font-weight: 800; color: var(--pacific-blue); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; display: block; }

    .gpu-accelerated, [style*="position: sticky"], [style*="position: fixed"], .sticky-viewport, .sticky-wrapper, .section-padding > div, .hero-grid > div {
      transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden;
    }

    .mobile-only { display: none !important; }
    .desktop-only { display: block !important; }
    .hero-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 80px; }
    .section-padding { padding: 8rem 0; }
    .sticky-wrapper { height: 500vh; }
    .sticky-viewport { position: sticky; top: 0; height: 100vh; overflow: hidden; }

    @media (min-width: 1024px) { 
      .lg\\:flex { display: flex; } 
      .lg\\:hidden { display: none; }
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); } 
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); } 
      .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); } 
    }

    @media (max-width: 1024px) {
      .mobile-only { display: block !important; }
      .desktop-only { display: none !important; }
      
      .hero-grid { grid-template-columns: 1fr; gap: 40px; }
      .section-padding { padding: 4rem 0; }
      .sticky-wrapper { height: auto !important; }
      .sticky-viewport { position: relative !important; height: auto !important; overflow: visible !important; }
      
      .mobile-menu-overlay {
        position: fixed; inset: 0; background: rgba(27, 73, 101, 0.95); backdrop-filter: blur(10px); z-index: 999;
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem;
      }
      .mobile-menu-link { font-size: 1.5rem; color: white; text-decoration: none; font-weight: 700; }
    }

    .form-modal-overlay {
      position: fixed; inset: 0; z-index: 9999; 
      background: rgba(27, 73, 101, 0.9); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .form-modal-content {
      background: rgba(255, 255, 255, 0.95); border-radius: 24px; padding: 32px 24px 24px 24px;
      width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; position: relative;
      box-shadow: 0 25px 60px -12px rgba(0,0,0,0.5);
    }
    .close-modal-btn {
      position: absolute; top: 16px; right: 16px; background: #f1f5f9; border: none; border-radius: 50%;
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      color: var(--yale-blue); cursor: pointer; z-index: 10;
    }

    @keyframes marqueeLeft {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); } 
    }

    .scrolling-container {
      display: flex;
      width: max-content; 
      animation: marqueeLeft 12s linear infinite; 
    }

    .scrolling-container:hover, 
    .scrolling-container:active,
    .scrolling-container:focus-within {
      animation-play-state: paused !important;
    }
    
    .scrolling-container > div {
      display: flex;
      gap: 16px;
      padding-right: 16px; 
    }
  `}</style>
));

// --- NAVBAR ---
const Navbar = memo(({ onNavigate, shouldReduceAnimations }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleScroll = useCallback((scrollY) => setScrolled(scrollY > 20), []);
  useThrottledScroll(handleScroll, 50);

  const toggleMenu = useCallback(() => setMobileMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  const headerStyle = useMemo(() => ({
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 40px',
    background: scrolled ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.95) 100%)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 100%)',
    backdropFilter: 'blur(12px)', borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid transparent',
    boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.03)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.4s ease'
  }), [scrolled]);

  const NavContent = (
    <>
      <div onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); if (onNavigate) onNavigate('home'); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo/logou.webp" alt="myaarohan" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
        <span style={{ fontWeight: '900', fontSize: '1.35rem', letterSpacing: '-0.02em', color: 'var(--yale-blue)' }}>MYAAROHAN</span>
      </div>
      
      <div className="navbar-menu hidden lg:flex" style={{ gap: '32px', alignItems: 'center' }}>
        {[
          { label: 'Why Us', href: '#features' }, { label: 'Programs', href: '#programs' },
          { label: 'Knowledge Hub', href: '#blog' }, { label: 'About', href: '#about' },
          { label: 'Stories', href: '#testimonials' }
        ].map((item) => (
          <a key={item.label} href={item.href} style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-text-muted)', position: 'relative', textDecoration: 'none' }} className="nav-link">
            {item.label}
          </a>
        ))}
      </div>

      <div className="hidden lg:flex" style={{ gap: '16px', alignItems: 'center' }}>
        <button onClick={() => onNavigate('counselor-login')} style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--frozen-water)', cursor: 'pointer', color: 'var(--yale-blue)', fontWeight: '700', fontSize: '0.9rem', padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s' }}>
          Counselor Login
        </button>
        <button onClick={() => onNavigate('student-login')} className="btn btn-primary btn-sm rounded-full" style={{ padding: '10px 24px', boxShadow: '0 8px 20px -4px rgba(95, 168, 211, 0.5)' }}>
          Student Login
        </button>
      </div>

      <button className="lg:hidden" onClick={toggleMenu} style={{ background: 'none', border: 'none', color: 'var(--yale-blue)', padding: '4px' }}>
        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </>
  );

  return (
    <>
      {shouldReduceAnimations ? (
        <header style={headerStyle}>{NavContent}</header>
      ) : (
        <motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ ...headerStyle, willChange: 'transform, opacity', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          {NavContent}
        </motion.header>
      )}

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mobile-menu-overlay">
            <a href="#features" className="mobile-menu-link" onClick={closeMenu}>Why Us</a>
            <a href="#programs" className="mobile-menu-link" onClick={closeMenu}>Programs</a>
            <a href="#blog" className="mobile-menu-link" onClick={closeMenu}>Knowledge Hub</a>
            <a href="#about" className="mobile-menu-link" onClick={closeMenu}>About</a>
            <a href="#testimonials" className="mobile-menu-link" onClick={closeMenu}>Stories</a>
            <div style={{ width: '60px', height: '2px', background: 'rgba(255,255,255,0.2)', margin: '10px 0' }} />
            <button onClick={() => { closeMenu(); onNavigate('counselor-login'); }} className="mobile-menu-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8 }}>Counselor Login</button>
            <button onClick={() => { closeMenu(); onNavigate('student-login'); }} className="btn btn-primary rounded-full" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Student Login</button>
            <button onClick={closeMenu} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white' }}>
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

// --- HERO SECTION ---
const HeroSection = memo(({ onNavigate, shouldReduceAnimations }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const hasAutoOpened = useRef(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMobile && !hasAutoOpened.current) {
        setIsFormOpen(true);
        hasAutoOpened.current = true; 
      }
    }, 2500); 
    return () => clearTimeout(timer); 
  }, [isMobile]);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '',
    school: '', standard: '', phone: '', email: '',
    dateOfBirth: '', age: ''
  });

  const [dobParts, setDobParts] = useState({ day: '', month: '', year: '' });
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const STANDARDS = ["5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

  const calculateAge = useCallback((dobStr) => {
    if (!dobStr) return '';
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return '';
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
    return String(Math.max(0, years));
  }, []);

  const handleDobChange = useCallback((part, value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (part === 'day' && (cleanValue.length > 2 || parseInt(cleanValue) > 31)) return;
    if (part === 'month' && (cleanValue.length > 2 || parseInt(cleanValue) > 12)) return;
    if (part === 'year' && (cleanValue.length > 4 || parseInt(cleanValue) > 2023)) return;

    const newParts = { ...dobParts, [part]: cleanValue };
    setDobParts(newParts);

    if (newParts.day && newParts.month && newParts.year.length === 4) {
      const dayStr = newParts.day.padStart(2, '0');
      const monthStr = newParts.month.padStart(2, '0');
      const yearStr = newParts.year;
      const yearInt = parseInt(yearStr);
      
      const isoDate = `${yearStr}-${monthStr}-${dayStr}`;
      const dateObj = new Date(isoDate);
      const today = new Date();
      const currentYear = today.getFullYear();

      today.setHours(0,0,0,0);
      const isRealDate = !Number.isNaN(dateObj.getTime()) && 
                          dateObj.getDate() === parseInt(dayStr) &&
                          dateObj.getMonth() + 1 === parseInt(monthStr);
      const isNotFuture = dateObj <= today;
      const isWithin50Years = yearInt >= (currentYear - 50);

      if (isRealDate && isNotFuture && isWithin50Years) {
        setFormData(prev => ({ ...prev, dateOfBirth: isoDate, age: calculateAge(isoDate) }));
        if (error) setError('');
      } else {
        setFormData(prev => ({ ...prev, dateOfBirth: '', age: '' }));
      }
    } else if (formData.dateOfBirth) {
      setFormData(prev => ({ ...prev, dateOfBirth: '', age: '' }));
    }
  }, [dobParts, formData.dateOfBirth, error, calculateAge]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const rawDigits = value.replace(/\D/g, '');
      if (rawDigits.length > 0 && ![6, 7, 8, 9].includes(parseInt(rawDigits[0]))) return;
      setFormData((prev) => ({ ...prev, [name]: rawDigits.slice(0, 10) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.dateOfBirth) { setError('Please enter a valid complete Date of Birth'); setLoading(false); return; }
    if (formData.phone.length !== 10) { setError('Please enter a valid 10-digit phone number'); setLoading(false); return; }

    try {
      const apiBase = window.APIBASEURL || "http://localhost:5000/";
      const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
      const response = await fetch(`${base}/students/register-step1`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) 
      });

      const data = await response.json().catch(() => ({ success: false, error: 'Invalid server response' }));
      if (!response.ok) throw new Error(data.error || `Server error: ${response.status}`);

      alert('Registration completed! Please login to continue.');
      setFormData({ firstName: '', lastName: '', middleName: '', school: '', standard: '', phone: '', email: '', dateOfBirth: '', age: '' });
      setDobParts({ day: '', month: '', year: '' });
      setIsFormOpen(false);

      if (typeof onNavigate === 'function') onNavigate('student-login');
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FormElement = (
    <>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: 'var(--yale-blue)', fontSize: '1.5rem', fontWeight: 800 }}>Start Your Journey</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--pacific-blue)' }}>Get your personalized roadmap today.</p>
      </div>
      {error && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '10px' }}>{error}</div>}
      <form style={{ display: 'grid', gap: '12px' }} onSubmit={handleSubmit}>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label">First Name</label>
            <input className="hero-input" name="firstName" type="text" placeholder="John" required value={formData.firstName} onChange={handleChange} autoComplete="given-name" />
          </div>
          <div>
            <label className="form-label">Last Name</label>
            <input className="hero-input" name="lastName" type="text" placeholder="Doe" required value={formData.lastName} onChange={handleChange} autoComplete="family-name" />
          </div>
        </div>
        <div>
          <label className="form-label">Middle Name</label>
          <input className="hero-input" name="middleName" type="text" placeholder="Optional" value={formData.middleName} onChange={handleChange} autoComplete="additional-name" />
        </div>
        <div>
          <label className="form-label">Date of Birth</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '8px' }}>
            <input className="hero-input" placeholder="DD" value={dobParts.day} onChange={(e) => handleDobChange('day', e.target.value)} maxLength={2} required style={{ textAlign: 'center', padding: '12px 4px' }} />
            <input className="hero-input" placeholder="MM" value={dobParts.month} onChange={(e) => handleDobChange('month', e.target.value)} maxLength={2} required style={{ textAlign: 'center', padding: '12px 4px' }} />
            <input className="hero-input" placeholder="YYYY" value={dobParts.year} onChange={(e) => handleDobChange('year', e.target.value)} maxLength={4} required style={{ textAlign: 'center', padding: '12px 4px' }} />
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1.5fr 0.5fr', gap: '12px' }}>
          <div>
            <label className="form-label">School</label>
            <input className="hero-input" name="school" type="text" placeholder="School Name" required value={formData.school} onChange={handleChange} autoComplete="organization" />
          </div>
          <div>
            <label className="form-label">Standard</label>
            <select className="hero-input" name="standard" value={formData.standard} onChange={handleChange} required style={{ cursor: 'pointer', appearance: 'auto' }}>
              <option value="" disabled>Class</option>
              {STANDARDS.map((std) => <option key={std} value={std}>{std}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="form-label">Phone Number</label>
          <input className="hero-input" name="phone" type="tel" placeholder="9876543210" maxLength={10} required value={formData.phone} onChange={handleChange} autoComplete="tel" />
        </div>
        <div>
          <label className="form-label">Email ID</label>
          <input className="hero-input" name="email" type="email" placeholder="john@example.com" required value={formData.email} onChange={handleChange} autoComplete="email" />
        </div>
        <div onClick={() => setIsSubscribed(!isSubscribed)} style={{ display: 'flex', gap: '12px', marginTop: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
          <div style={{ minWidth: '20px', height: '20px', borderRadius: '4px', background: isSubscribed ? 'var(--yale-blue)' : 'transparent', border: isSubscribed ? 'none' : '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginTop: '2px', transition: 'all 0.2s' }}>
            {isSubscribed && <Check size={14} strokeWidth={3} />}
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4, userSelect: 'none' }}>
            Join the climbers getting weekly cheat codes.
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', marginTop: '10px', gap: '8px' }}>
          {loading ? 'Submitting...' : 'Upgrade My Career'} {!loading && <ArrowRight size={18} />}
        </motion.button>
      </form>
    </>
  );

  return (
    <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', background: 'linear-gradient(180deg, #ffffff 0%, var(--pale-sky) 100%)', paddingTop: '100px', paddingBottom: '60px', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <CareerNetworkCanvas shouldReduceAnimations={shouldReduceAnimations} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.15) 80%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '120px', background: 'linear-gradient(to bottom, transparent, var(--pale-sky))' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="grid hero-grid" style={{ alignItems: 'center' }}>
          
          <OptimizedMotion shouldReduceAnimations={shouldReduceAnimations} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden', background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '24px', padding: 'clamp(24px, 4vw, 40px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)' }}>
            <span style={{ color: 'var(--pacific-blue)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', display: 'block', marginBottom: '16px' }}>
              Est. 2025 | Your Career Partner
            </span>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: 'var(--yale-blue)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
              Unlock your <br />
              <span style={{ color: 'var(--fresh-sky)' }}>true potential</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '580px', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
              Your trusted partner, guiding and mentoring you at every step of the journey
            </p>

            <motion.button onClick={() => onNavigate('/career-explorer')} whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(27, 73, 101, 0.45)' }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginTop: '32px', padding: '16px 36px', background: 'linear-gradient(135deg, var(--yale-blue) 0%, var(--fresh-sky) 100%)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 24px -4px rgba(27, 73, 101, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)', letterSpacing: '0.01em', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)', transform: 'translateX(-100%)', animation: 'shimmer 3s ease-in-out infinite' }} />
              <BookOpen size={20} strokeWidth={2.5} />
              <span style={{ position: 'relative', zIndex: 1 }}>Explore 250+ Careers</span>
              <ArrowRight size={18} strokeWidth={2.5} style={{ position: 'relative', zIndex: 1 }} />
            </motion.button>

            {isMobile && (
              <motion.button onClick={() => setIsFormOpen(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', padding: '14px 32px', background: 'var(--yale-blue)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px -4px rgba(27, 73, 101, 0.4)', width: '100%', justifyContent: 'center' }}>
                <GraduationCap size={20} /> Register Now <ArrowRight size={16} />
              </motion.button>
            )}
          </OptimizedMotion>

          {!isMobile && (
          <OptimizedMotion shouldReduceAnimations={shouldReduceAnimations} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', padding: 'clamp(20px, 5vw, 32px)', borderRadius: '24px', border: '1px solid white', boxShadow: '0 25px 60px -12px rgba(27, 73, 101, 0.15)', willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}>
            {FormElement}
          </OptimizedMotion>
          )}

        </div>
      </div>

      <AnimatePresence>
        {isMobile && isFormOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setIsFormOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 32px', boxShadow: '0 -10px 40px rgba(0,0,0,0.15)', position: 'relative' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#cbd5e1', margin: '0 auto 20px' }} />
              <button onClick={() => setIsFormOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--yale-blue)' }}>
                <X size={20} />
              </button>
              {FormElement}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

// --- FEATURES SECTION ---
const FeaturesSection = memo(({ onNavigate, shouldReduceAnimations }) => {
  const cards = [
    { id: 1, title: "Personalized Career Mentorship", headline: "Your Very Own Career GPS", copy: "Stop the guesswork. Sit down with an expert who gets you. We’ll map out your detours, shortcuts, and the ultimate destination.", btn: "Meet Your Human Compass", icon: <Users size={48} strokeWidth={1.5} />, color: "var(--yale-blue)", imgUrl: "/images/22.webp" },
    { id: 2, title: "Advanced Assessments", headline: "Decode Your Superpowers", copy: "Take a multi-dimensional dive into your brain. Find out why you’re a natural leader or a creative genius.", btn: "Unlock My Profile", icon: <Brain size={48} strokeWidth={1.5} />, color: "var(--pacific-blue)", imgUrl: "/images/28.webp" },
    { id: 3, title: "Roadmap Planner", headline: "The \"No-Stress\" Blueprint", copy: "From school to your dream corner office. We break the \"big scary future\" into tiny, doable steps. Just follow the dots.", btn: "Start My Roadmap", icon: <Map size={48} strokeWidth={1.5} />, color: "var(--fresh-sky)", imgUrl: "/images/27.webp" },
    { id: 4, title: "Career Library", headline: "The Ultimate Cheat Sheet", copy: "500+ careers, zero fluff. Salary trends, \"a day in the life\" videos, and the raw truth about what it’s actually like.", btn: "Browse the Vault", icon: <Library size={48} strokeWidth={1.5} />, color: "var(--yale-blue)", imgUrl: "/images/23.webp" }
  ];

  return (
    <section id="features" className="section-padding" style={{ background: '#fff' }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem auto' }}>
          <span className="text-label">The 'secret sauce' revealed</span>
          <h2 className="text-huge" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '24px' }}>
            Sneak Peek at Your Experience
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto' }}>
            We didn’t just build another course or career platform; we built a career-launching machine. Just the tools you need to win.
          </p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          {cards.map((card) => (
            <FeatureCard key={card.id} card={card} shouldReduceAnimations={shouldReduceAnimations} />
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('student-login')} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 32px', background: 'var(--yale-blue)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(27, 73, 101, 0.2)' }}>
            <Sparkles size={18} /> Unlock the Perks 🔓
          </motion.button>
        </div>

      </div>
    </section>
  );
});

const FeatureCard = memo(({ card, shouldReduceAnimations }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial="rest" whileHover={shouldReduceAnimations ? "rest" : "hover"} whileTap={shouldReduceAnimations ? "rest" : "hover"} animate="rest"
      style={{
        position: 'relative', height: '360px', borderRadius: '24px', background: '#f8fbff',
        border: '1px solid var(--frozen-water)', overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
        willChange: 'transform', backfaceVisibility: 'hidden'
      }}
    >
      <motion.div variants={{ rest: { opacity: 1, y: 0 }, hover: { opacity: 0, y: -10 } }} transition={{ duration: 0.2, ease: 'easeOut' }} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '50px', zIndex: 1 }}>
        <div style={{ width: '200px', height: '200px', background: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(27, 73, 101, 0.15), inset 0 0 0 1px rgba(255,255,255,0.5)', marginBottom: '32px', color: card.color, overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!imageError && card.imgUrl ? (
              <img src={card.imgUrl} alt={card.title} onError={() => setImageError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              React.cloneElement(card.icon, { size: 64 }) 
            )}
          </div>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--yale-blue)' }}>{card.title}</h3>
      </motion.div>
      <motion.div variants={{ rest: { opacity: 0, y: 10 }, hover: { opacity: 1, y: 0 } }} transition={{ duration: 0.2, ease: 'easeOut' }} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--yale-blue) 0%, var(--pacific-blue) 100%)', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2, color: 'white' }}>
        <div style={{ marginBottom: '16px', color: 'var(--frozen-water)' }}>{card.icon}</div>
        <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>{card.headline}</h4>
        <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9, marginBottom: '24px' }}>{card.copy}</p>
      </motion.div>
    </motion.div>
  );
});

// --- PERKS SECTION (STATIC WRAPPER - NO STACK ANIMATION FOR THIS SPECIFIC BLOCK) ---
const PerksSection = memo(({ shouldReduceAnimations }) => {
  const containerRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start start", "end end"] 
  });

  const features = useMemo(() => [
    { id: 0, title: "Aptitude Assessment", desc: "Scientific testing algorithms designed to uncover your innate strengths.", processTitle: "Take Aptitude Assessment", processDesc: "Our proprietary AI driven algorithm analyzes aptitude, interest and personality data to provide scientific inputs to the parents, Students & Counselors.", icon: <Award size={32} />, color: "#1b4965", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1920" },
    { id: 1, title: "Career Mapping", desc: "AI-powered roadmaps that connect your current skills to future demands.", processTitle: "Create Your Customized Career Map", processDesc: "The Platform helps curate your personalized Career Roadmap and how to achieve your Goal. We also monitor progress through our dynamic Dashboard.", icon: <Globe size={32} />, color: "#62b6cb", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1920" },
    { id: 2, title: "1-on-1 Career Mentorship", desc: "Direct access to certified career mentors for personalized guidance.", processTitle: "Attend 1-on-1 Career Mentorship", processDesc: "Our platform connects you with psychologists and expertly trained counselors, giving you contextual guidance beyond data points.", icon: <Users size={32} />, color: "#5fa8d3", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1920" },
    { id: 3, title: "Skill Workshops", desc: "Exclusive workshops on soft skills, technical abilities, and interview prep.", processTitle: "Access Skill Workshops & Resources", processDesc: "Access a vast repository of study materials, roadmaps & skill building content to stay ahead of the curve.", icon: <Zap size={32} />, color: "#1b4965", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1920" }
  ], []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.min(features.length - 1, Math.floor(latest * features.length));
    if (index !== activeSlide) setActiveSlide(index);
  });

  if (isMobile || shouldReduceAnimations) {
    return (
      <div className="section-padding" style={{ background: 'transparent' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span className="text-label">Your Journey</span>
            <h2 className="text-huge">HOW IT WORKS</h2>
          </div>
          {features.map((feature, i) => (
             <div key={i} style={{ borderRadius: '24px', overflow: 'hidden', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ height: '200px', backgroundImage: `url(${feature.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ padding: '24px' }}>
                   <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: feature.color, display: 'flex', alignItems: 'center', gap: '10px' }}>
                     {feature.icon} {feature.title}
                   </h3>
                   <p style={{ color: '#4a7a96', lineHeight: 1.6, marginBottom: '20px' }}>{feature.desc}</p>
                   <div style={{ height: '1px', background: '#e2e8f0', margin: '0 0 20px 0' }}></div>
                   <h4 style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '4px' }}>{feature.processDesc}</h4>
                </div>
             </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="sticky-wrapper" style={{ position: 'relative', height: '400vh' }}>
      <div className="sticky-viewport" style={{ background: 'transparent', position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', transform: 'translateZ(0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
        
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem', flexShrink: 0 }}>
            <span className="text-label">Your Journey</span>
            <h2 className="text-huge" style={{ marginBottom: 0 }}>HOW IT WORKS</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', width: '100%' }}>
            
            <div>
              <AnimatePresence mode='wait'>
                <motion.div 
                  key={activeSlide}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '12px', 
                    padding: '8px 16px', background: `${features[activeSlide].color}15`, 
                    borderRadius: '50px', color: features[activeSlide].color, fontWeight: 'bold', marginBottom: '24px' 
                  }}>
                    {features[activeSlide].icon} STEP 0{activeSlide + 1}
                  </div>

                  <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--yale-blue)', marginBottom: '16px', lineHeight: 1.1 }}>
                    {features[activeSlide].title}
                  </h2>
                  <p style={{ fontSize: '1.25rem', color: '#1b4965', fontWeight: 500, lineHeight: 1.6, maxWidth: '500px' }}>
                    {features[activeSlide].desc}
                  </p>

                  <div style={{ marginTop: '32px', marginBottom: '32px', height: '4px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: "linear" }}
                      style={{ height: '100%', background: features[activeSlide].color, willChange: 'width' }}
                    />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                        {features[activeSlide].processDesc}
                    </h3>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ position: 'relative', height: '500px', width: '100%' }}>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, scale: 0.95, rotate: 3 }}
                  animate={{ opacity: 1, scale: 1, rotate: -1 }}
                  exit={{ opacity: 0, scale: 0.95, rotate: -3 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ 
                    position: 'absolute', inset: 0, 
                    borderRadius: '32px', overflow: 'hidden',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.2)',
                    border: '8px solid white',
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <LazyImage 
                    src={features[activeSlide].img} 
                    alt={features[activeSlide].title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

// --- PROGRAM MODAL ---
const ProgramModal = memo(({ program, onClose, onNavigate }) => {
  if (!program) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(27, 73, 101, 0.4)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={{ width: '100%', maxWidth: '900px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(24px)', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 25px 50px -12px rgba(27, 73, 101, 0.25), inset 0 0 0 1px rgba(255,255,255,0.2)', padding: '40px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.5)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--yale-blue)', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'white'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}><X size={24} /></button>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--yale-blue)', marginBottom: '32px', textAlign: 'center', lineHeight: 1.2 }}>{program.title}</h2>
        <div className="grid md:grid-cols-2 gap-8" style={{ alignItems: 'center' }}>
          <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', background: 'white', padding: '10px' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '1/1' }}><img src={program.imgUrl} alt={program.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--yale-blue)', marginBottom: '16px' }}>Program Details</h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {program.features.map((feature, idx) => <li key={idx} style={{ color: 'var(--yale-blue)', fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>{feature}</li>)}
            </ul>
            <p style={{ color: '#4a7a96', lineHeight: 1.6, fontSize: '1rem', marginBottom: '32px' }}>{program.fullDesc}</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary rounded-full" style={{ padding: '12px 32px', fontSize: '1rem' }} onClick={() => { onClose(); if (onNavigate) onNavigate('student-register?enroll=1'); }}>Enroll Now</button>
              <button className="btn rounded-full" style={{ padding: '12px 24px', fontSize: '1rem', background: 'transparent', color: 'var(--fresh-sky)', border: '2px solid var(--fresh-sky)' }} onClick={() => { onClose(); if (onNavigate) onNavigate('pricing'); }}>Our Offering <ChevronRight size={18} style={{ marginLeft: '4px' }} /></button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

// --- STACKED PROGRAM CARD ---
const StackedProgramCard = memo(({ prog, i, progress, range, targetScale, onClick }) => {
  const scale = useTransform(progress, range, [1, targetScale]);
  const opacity = useTransform(progress, range, [1, 0.6]);

  return (
    <div style={{ position: 'sticky', top: `calc(120px + ${i * 25}px)`, paddingBottom: '40px', zIndex: i }}>
      <motion.div style={{ scale, opacity, transformOrigin: 'top center', background: '#f8fbff', borderRadius: '32px', border: '1px solid var(--frozen-water)', boxShadow: '0 -15px 40px -10px rgba(27, 73, 101, 0.15)', padding: '40px', display: 'flex', gap: '40px', alignItems: 'center', minHeight: '400px', willChange: 'transform, opacity' }}>
        <div style={{ flex: '0 0 35%', aspectRatio: '1 / 1', borderRadius: '24px', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
          <img src={prog.imgUrl} alt={prog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--yale-blue)', marginBottom: '12px', lineHeight: 1.1 }}>{prog.title}</h3>
          <p style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--pale-sky)', color: 'var(--yale-blue)', borderRadius: '50px', fontWeight: '700', fontSize: '1rem', marginBottom: '24px' }}>{prog.grade}</p>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '1.15rem', marginBottom: '32px' }}>{prog.fullDesc}</p>
          <button onClick={onClick} className="btn btn-primary" style={{ padding: '16px 32px', borderRadius: '50px', fontSize: '1.1rem', gap: '8px', boxShadow: '0 8px 20px -4px rgba(95, 168, 211, 0.4)' }}>
            Explore Program <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
});

// --- PROGRAMS SECTION ---
const ProgramsSection = memo(({ onNavigate, shouldReduceAnimations }) => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const isMobile = useIsMobile();
  
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  const updateScrollArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isMobile) return;
    updateScrollArrows();
    el.addEventListener('scroll', updateScrollArrows, { passive: true });
    window.addEventListener('resize', updateScrollArrows);
    return () => {
      el.removeEventListener('scroll', updateScrollArrows);
      window.removeEventListener('resize', updateScrollArrows);
    };
  }, [updateScrollArrows, isMobile]);

  const scrollToPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !canScrollLeft) return;
    el.scrollBy({ left: -(window.innerWidth * 0.85 + 16), behavior: 'smooth' });
  }, [canScrollLeft]);

  const scrollToNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !canScrollRight) return;
    el.scrollBy({ left: window.innerWidth * 0.85 + 16, behavior: 'smooth' });
  }, [canScrollRight]);

  const programs = useMemo(() => [
    { title: "My Aarohan NEEV (FOUNDATION)", grade: "Pre School - 8th Standard", details: "Early Aptitude discovery & Course corrections.", imgUrl: "/images/21.webp", fullDesc: "Our foundation program is designed to identify and nurture your child's inherent strengths early on, ensuring they have a solid base for future academic and career success.", features: ["Multi-disciplinary Exploration: Why separate Math from Music?", "Lifelong Learner Mindset.", "Vocational Exposure: Guiding towards hands-on workshops.", "Comprehensive early aptitude assessment (Age 3-13)."] },
    { title: "My Aarohan DISHA", grade: "Grade 9-10", details: "Early aptitude discovery & stream selection.", imgUrl: "/images/26.webp", fullDesc: "Navigate the confusing crossroads of stream selection with confidence. We use scientific data to match your personality with the right academic path.", features: ["Psychometric Stream Selector Test.", "Detailed analysis of Science vs. Commerce vs. Humanities.", "Subject combination optimization strategy.", "Personalized roadmap for Grade 11 & 12."] },
    { title: "My Aarohan SHIKHAR", grade: "Grade 11-12", details: "University shortlisting & entrance exam prep.", imgUrl: "/images/25.webp", fullDesc: "The final push towards your dream university. We handle the chaos of applications, entrance exams, and profile building so you can focus on studying.", features: ["Entrance exam calendar & preparation strategy.", "Profile building for top-tier Indian colleges.", "University application assistance (CUET, JEE, NEET, etc.).", "Mock interviews & personal statement workshops."] },
    { title: "My Aarohan UDAAN", grade: "Study Abroad", details: "Visa guidance, SOP writing & scholarship help.", imgUrl: "/images/24.webp", fullDesc: "Your wings to the world. From choosing the right country to landing on campus, we provide end-to-end support for your global education dreams.", features: ["Country & University compatibility analysis.", "SOP, LOR, and Essay writing assistance.", "Scholarship & Financial Aid guidance.", "Visa interview preparation mock sessions."] },
  ], []);

  const renderMobileProgramCard = (prog, i) => (
    <motion.div key={i} style={{ padding: '32px', borderRadius: '24px', background: '#f8fbff', border: '1px solid var(--frozen-water)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%' }}>
      <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '20px', overflow: 'hidden', marginBottom: '24px', background: 'var(--pale-sky)' }}>
        <img src={prog.imgUrl} alt={prog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--yale-blue)', marginBottom: '12px' }}>{prog.title}</h3>
      <p style={{ color: 'var(--pacific-blue)', fontWeight: '700', fontSize: '1rem', marginBottom: '16px' }}>{prog.grade}</p>
      <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '0.95rem', flexGrow: 1 }}>{prog.details}</p>
      <div onClick={() => setSelectedProgram(prog)} style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--fresh-sky)', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>Learn More <ChevronRight size={20} /></div>
    </motion.div>
  );

  return (
    <section id="programs" className="section-padding" style={{ background: 'white' }}>
      <div className="container" style={{ paddingLeft: isMobile ? 0 : '24px', paddingRight: isMobile ? 0 : '24px', maxWidth: '1200px' }}>
        
        <div style={{ padding: isMobile ? '0 24px' : 0, textAlign: 'center', marginBottom: '4rem' }}>
          <span className="text-label">Tailored For You</span>
          <h2 className="text-huge">WHICH PROGRAM SHOULD I CHOOSE?</h2>
        </div>

        {isMobile ? (
          <div style={{ position: 'relative' }}>
            <button onClick={scrollToPrev} style={getCenterArrowStyle(canScrollLeft, 'left')} aria-label="Scroll left"><ChevronLeft size={28} strokeWidth={2.5} /></button>
            <div ref={scrollRef} style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '24px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingLeft: '24px', paddingRight: '24px', alignItems: 'stretch' }}>
              {programs.map((prog, i) => (
                <div key={i} style={{ flex: '0 0 85vw', maxWidth: '320px', scrollSnapAlign: 'center' }}>
                  {renderMobileProgramCard(prog, i)}
                </div>
              ))}
            </div>
            <button onClick={scrollToNext} style={getCenterArrowStyle(canScrollRight, 'right')} aria-label="Scroll right"><ChevronRight size={28} strokeWidth={2.5} /></button>
          </div>
        ) : (
          <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '100px', position: 'relative' }}>
            {programs.map((prog, i) => {
              const targetScale = 1 - ((programs.length - 1 - i) * 0.05);
              const range = [i * 0.25, 1];
              
              return (
                <StackedProgramCard
                  key={i}
                  prog={prog}
                  i={i}
                  progress={scrollYProgress}
                  range={range}
                  targetScale={targetScale}
                  onClick={() => setSelectedProgram(prog)}
                />
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProgram && <ProgramModal program={selectedProgram} onClose={() => setSelectedProgram(null)} onNavigate={onNavigate} />}
      </AnimatePresence>
    </section>
  );
});

// --- BLOG SECTION ---
const BlogSection = memo(({ onNavigate, shouldReduceAnimations }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isMobile = useIsMobile();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isMobile) return;
    updateScrollArrows();
    el.addEventListener('scroll', updateScrollArrows, { passive: true });
    window.addEventListener('resize', updateScrollArrows);
    return () => {
      el.removeEventListener('scroll', updateScrollArrows);
      window.removeEventListener('resize', updateScrollArrows);
    };
  }, [updateScrollArrows, isMobile]);

  const scrollToPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !canScrollLeft) return;
    el.scrollBy({ left: -(window.innerWidth * 0.85 + 16), behavior: 'smooth' });
  }, [canScrollLeft]);

  const scrollToNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !canScrollRight) return;
    el.scrollBy({ left: window.innerWidth * 0.85 + 16, behavior: 'smooth' });
  }, [canScrollRight]);

  const fallbackBlogs = useMemo(() => [
    { id: 'f1', title: "Choosing the Right Stream after Class 10", category: "Guidance", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800", author: "Counselor Team" },
    { id: 'f2', title: "The Future of AI Jobs in 2030", category: "Trends", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800", author: "Counselor Team" },
    { id: 'f3', title: "Managing Exam Stress Effectively", category: "Wellness", image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800", author: "Counselor Team" },
    { id: 'f4', title: "Top 10 Emerging Careers in Green Energy", category: "Future Tech", image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=800", author: "Counselor Team" }
  ], []);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const indexRes = await fetch('/articles/index.json');
        if (!indexRes.ok) throw new Error('Failed to load index');
        const fileList = await indexRes.json();
        const loaded = await Promise.all(
          fileList.slice(0, 4).map(async (fileName) => {
            const res = await fetch(`/articles/${fileName}`);
            if (!res.ok) return null;
            const data = await res.json();
            return { ...data, id: data.id || fileName.replace('.json', '') };
          })
        );
        const validArticles = loaded.filter(Boolean);
        setArticles(validArticles.length > 0 ? validArticles : fallbackBlogs.slice(0, 4));
      } catch (error) {
        setArticles(fallbackBlogs.slice(0, 4));
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const displayArticles = articles.length > 0 ? articles : fallbackBlogs.slice(0, 4);

  const handleArticleClick = (blog) => {
    onNavigate('articles');
    if (blog.id && !blog.id.startsWith('f')) {
        setTimeout(() => {
            const newUrl = `${window.location.pathname}?article=${blog.id}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }, 100);
    }
  };

  const GamifiedCard = (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: isMobile ? 0 : 0, duration: 0.3 }} whileHover={isMobile ? {} : { y: -5, boxShadow: '0 15px 40px rgba(245, 158, 11, 0.25)' }} onClick={() => onNavigate('/career-explorer')} style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(15, 23, 42, 0.2)', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', border: '2px solid rgba(245, 158, 11, 0.3)', position: 'relative' }}>
       <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', animation: 'pulse 4s ease-in-out infinite' }} />
       <div style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '6px 14px', borderRadius: '20px', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 10, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)' }}>✨ Interactive</div>
       <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'relative', zIndex: 2 }}><Map size={72} color="#f59e0b" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))' }} /></div>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px', opacity: 0.3 }} />
       </div>
       <div style={{ padding: '24px', flexGrow: 1, color: 'white', position: 'relative', zIndex: 2 }}>
          <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '50px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎮 Gamified Tool</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900', lineHeight: 1.2, marginBottom: '12px', background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Your Career Quest Begins</h3>
          <p style={{ fontSize: '0.95rem', opacity: 0.85, marginBottom: '20px', lineHeight: 1.6, color: '#cbd5e1' }}>Explore 250+ careers across 10 industry clusters. Navigate an interactive world map to discover your perfect path.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#fbbf24', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enter Quest <ArrowRight size={18} strokeWidth={3} /></div>
       </div>
       <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)' }} />
    </motion.div>
  );

  const ViewAllCard = (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: isMobile ? 0 : 0.3, duration: 0.3 }} whileHover={isMobile ? {} : { scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('articles')} style={{ borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', background: 'linear-gradient(135deg, var(--yale-blue) 0%, var(--pacific-blue) 100%)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', height: '100%', boxShadow: '0 20px 40px -10px rgba(27, 73, 101, 0.4)' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', backdropFilter: 'blur(5px)' }}><ArrowRight size={40} color="white" /></div>
      <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px' }}>View All</h3>
      <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Explore the Knowledge Hub</p>
    </motion.div>
  );

  return (
    <section id="blog" className="section-padding" style={{ background: '#f0f9ff' }}>
      <div className="container" style={{ paddingLeft: isMobile ? 0 : '24px', paddingRight: isMobile ? 0 : '24px' }}>
        <div style={{ padding: isMobile ? '0 24px' : 0, marginBottom: '3rem' }}>
          <span className="text-label">Latest Insights</span>
          <h2 className="text-huge" style={{ marginBottom: 0 }}>Knowledge Hub</h2>
        </div>
        {isMobile ? (
          <div style={{ position: 'relative' }}>
            <button onClick={scrollToPrev} style={getCenterArrowStyle(canScrollLeft, 'left')} aria-label="Scroll left"><ChevronLeft size={28} strokeWidth={2.5} /></button>
            <div ref={scrollRef} style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '24px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingLeft: '24px', paddingRight: '24px', alignItems: 'stretch' }}>
              <div style={{ flex: '0 0 85vw', maxWidth: '320px', scrollSnapAlign: 'center' }}>{GamifiedCard}</div>
              {displayArticles.map((blog, i) => (
                <div key={blog.id || i} style={{ flex: '0 0 85vw', maxWidth: '320px', scrollSnapAlign: 'center' }}>
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.3 }} onClick={() => handleArticleClick(blog)} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                    <div style={{ height: '200px', overflow: 'hidden', flexShrink: 0, background: '#eee' }}>
                      <img src={blog.image || blog.img} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <span style={{ display: 'inline-block', width: 'fit-content', padding: '4px 12px', borderRadius: '50px', background: 'var(--frozen-water)', color: 'var(--yale-blue)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '12px' }}>{blog.category || blog.cat}</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--yale-blue)', lineHeight: 1.4, marginBottom: '12px' }}>{blog.title}</h3>
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pacific-blue)', fontSize: '0.875rem', fontWeight: '600' }}><PenTool size={14} /> By {blog.author || 'Counselor Team'}</div>
                    </div>
                  </motion.div>
                </div>
              ))}
              <div style={{ flex: '0 0 85vw', maxWidth: '320px', scrollSnapAlign: 'center' }}>{ViewAllCard}</div>
            </div>
            <button onClick={scrollToNext} style={getCenterArrowStyle(canScrollRight, 'right')} aria-label="Scroll right"><ChevronRight size={28} strokeWidth={2.5} /></button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {GamifiedCard}
            {displayArticles.map((blog, i) => (
              <motion.div key={blog.id || i} initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: (i + 1) * 0.06, duration: 0.3 }} whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} onClick={() => handleArticleClick(blog)} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                <div style={{ height: '200px', overflow: 'hidden', flexShrink: 0, background: '#eee' }}>
                  <img src={blog.image || blog.img} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ display: 'inline-block', width: 'fit-content', padding: '4px 12px', borderRadius: '50px', background: 'var(--frozen-water)', color: 'var(--yale-blue)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '12px' }}>{blog.category || blog.cat}</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--yale-blue)', lineHeight: 1.4, marginBottom: '12px' }}>{blog.title}</h3>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pacific-blue)', fontSize: '0.875rem', fontWeight: '600' }}><PenTool size={14} /> By {blog.author || 'Counselor Team'}</div>
                </div>
              </motion.div>
            ))}
            {ViewAllCard}
          </div>
        )}
      </div>
    </section>
  );
});

// --- ABOUT SECTION ---
const AboutSection = memo(({ shouldReduceAnimations }) => {
  const isMobile = useIsMobile();

  const flipCards = [
    { id: 1, title: "Science-First", frontSub: "Not Magic. Logic.", backDesc: "We don't read palms. We read potential. Our assessments are backed by rigorous psychological research.", icon: <Brain size={32} /> },
    { id: 2, title: "Lifetime Partners", frontSub: "Beyond the Report.", backDesc: "A PDF can't high-five you when you succeed. We stay with you from your first stream choice to your first job offer.", icon: <Heart size={32} /> },
    { id: 3, title: "Zero Judgment", frontSub: "Your Dream, Your Rules.", backDesc: "Want to be a Marine Biologist? A UI Designer? An AI Ethicist? We support your ambition, not the crowd's opinion.", icon: <Sparkles size={32} /> }
  ];

  return (
    <section id="about" className="section-padding" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--frozen-water), transparent)' }}></div>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '1200px', margin: '0 auto 6rem auto', padding: '0 20px' }}>
          <span className="text-label" style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--color-text-muted, #64748b)' }}>We are co-pilots, not just counselors</span>
          <h2 className="text-huge" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '40px', lineHeight: 1.2 }}>Helping you build your future <br /><span style={{ color: 'var(--fresh-sky, #0ea5e9)' }}>Not predict it!</span></h2>
          
          <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginTop: '20px' }}>
            <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-text-muted, #94a3b8)', fontSize: '1.5rem' }}>😕 "I have no clue"</span>
              <div style={{ padding: 'clamp(24px, 3vw, 32px)', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', height: '100%', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#64748b', margin: 0 }}>The Old Way</h3>
                </div>
                <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '1.05rem' }}>Guesswork, peer pressure, and choosing a career because "Sharma ji's ka beta ye kar raha hai."</p>
                <div style={{ marginTop: '24px', padding: '12px 20px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', borderLeft: '4px solid #cbd5e1' }}>"What's the salary of a Chef vs Experienced Welder?" ...No clue.</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '40px' }}>
                <div style={{ width: 'clamp(60px, 10vw, 150px)', height: '8px', background: '#f0f0f0', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                  <motion.div initial={{ width: '0%' }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }} style={{ height: '100%', background: 'linear-gradient(90deg, #cbd5e1, var(--fresh-sky, #0ea5e9))', borderRadius: '10px' }} />
                </div>
            </div>

            <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--yale-blue, #1b4965)', fontSize: '1.5rem' }}>🚀 "I can't wait to start"</span>
              <div style={{ padding: 'clamp(24px, 3vw, 32px)', background: 'var(--yale-blue, #1b4965)', borderRadius: '24px', boxShadow: '0 20px 50px -12px rgba(27, 73, 101, 0.4)', position: 'relative', overflow: 'hidden', height: '100%', textAlign: 'left' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', pointerEvents: 'none' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                  <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: 'var(--fresh-sky, #0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={24} strokeWidth={3} /></div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: 0 }}>The Aarohan Way</h3>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: '1.05rem', position: 'relative', zIndex: 2 }}>Science, empathy, and data. We combine advanced psychology with real-world practicality to be your GPS.</p>
              </div>
            </div>
          </div>
        </div>

        {isMobile ? (
          <div style={{ position: 'relative', width: '100%', paddingBottom: '20px', overflow: 'hidden' }}>
            <div className="scrolling-container">
              <div style={{ display: 'flex', gap: '16px', paddingRight: '16px', paddingLeft: '24px' }}>
                {flipCards.map((card) => (
                  <div key={`g1-${card.id}`} style={{ width: '80vw', maxWidth: '320px' }}>
                    <FlipCard title={card.title} frontSub={card.frontSub} backDesc={card.backDesc} icon={card.icon} shouldReduceAnimations={shouldReduceAnimations} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', paddingRight: '16px' }}>
                {flipCards.map((card) => (
                  <div key={`g2-${card.id}`} style={{ width: '80vw', maxWidth: '320px' }}>
                    <FlipCard title={card.title} frontSub={card.frontSub} backDesc={card.backDesc} icon={card.icon} shouldReduceAnimations={shouldReduceAnimations} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
             {flipCards.map(card => (
               <FlipCard key={card.id} title={card.title} frontSub={card.frontSub} backDesc={card.backDesc} icon={card.icon} shouldReduceAnimations={shouldReduceAnimations} />
             ))}
          </div>
        )}
      </div>
    </section>
  );
});

const FlipCard = memo(({ title, frontSub, backDesc, icon, shouldReduceAnimations }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)} onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1000px', height: '320px', cursor: 'pointer' }}>
      <motion.div initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: shouldReduceAnimations ? 0.15 : 0.35, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', willChange: 'transform', backfaceVisibility: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: 'var(--yale-blue)', color: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ color: 'var(--fresh-sky)', marginBottom: '24px' }}>{icon}</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>{title}</h3>
          <p style={{ color: 'white', fontWeight: 600 }}>{frontSub}</p>
        </div>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'white', color: 'var(--yale-blue)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', border: '2px solid var(--yale-blue)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
           <div style={{ color: 'var(--pacific-blue)', marginBottom: '16px' }}>{icon}</div>
           <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px', color: 'var(--yale-blue)' }}>{title}</h3>
           <p style={{ lineHeight: 1.6, color: 'var(--color-text-muted)' }}>{backDesc}</p>
        </div>
      </motion.div>
    </div>
  );
});

// --- TESTIMONIALS SECTION ---
const TestimonialsSection = memo(({ shouldReduceAnimations }) => {
  const isMobile = useIsMobile();

  const stories = useMemo(() => [
    { name: "Rohan S.", role: "Class 11 • The Stream Switcher", before: "I was failing Physics and convinced I was 'just bad at studying.' My parents wanted Engineering, but I hated machines.", moment: "The Psychometric test showed I had high Linguistic aptitude. The counselor introduced me to Media Law.", now: "Topping my Humanities class and interning at a legal news blog. I finally love school." },
    { name: "Priya K.", role: "Class 12 • Overwhelmed Overachiever", before: "I liked everything—Bio, Math, Art. I had 15 different career tabs open in my brain and was paralyzed by choice.", moment: "My counselor didn't tell me to pick one. She showed me Bio-Informatics—a field where I could use all my skills.", now: "Targeting top research universities with a portfolio that makes sense. No more panic attacks." },
    { name: "Mr. Gupta", role: "Father of Arjun (Class 10)", before: "I thought career mentorship was just for kids who were struggling. Arjun is a bright student; I thought he'd figure it out.", moment: "The '3D Career Roadmap' blew me away. It wasn't just advice; it was a strategic plan for the next 5 years.", now: "We aren't arguing about his future anymore. We're planning it together. Best investment I've made." }
  ], []);

  const renderStoryCard = (story, i) => (
    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: isMobile ? 0 : i * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', padding: '36px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', height: '100%' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--fresh-sky), var(--pacific-blue))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(95, 168, 211, 0.3)' }}>{story.name[0]}</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'white' }}>{story.name}</h3>
        </div>
        <p style={{ color: 'var(--pacific-blue)', fontSize: '0.9rem', fontWeight: 600, margin: 0, paddingLeft: '64px', marginTop: '-10px' }}>{story.role}</p>
      </div>
      <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid rgba(239, 68, 68, 0.5)' }}>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>The "Before"</span>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', margin: 0 }}>"{story.before}"</p>
      </div>
      <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--fresh-sky)' }}>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fresh-sky)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>The Moment</span>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'white', margin: 0 }}>"{story.moment}"</p>
      </div>
      <div style={{ marginTop: 'auto', background: 'rgba(34, 197, 94, 0.15)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></span>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4ade80', fontWeight: 800 }}>The "Now"</span>
        </div>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.5, color: 'white', fontWeight: 600, margin: 0 }}>"{story.now}"</p>
      </div>
    </motion.div>
  );

  return (
    <section id="testimonials" className="section-padding" style={{ color: 'white' }}>
      <div className="container" style={{ paddingLeft: isMobile ? 0 : '24px', paddingRight: isMobile ? 0 : '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem', paddingLeft: isMobile ? '24px' : 0, paddingRight: isMobile ? '24px' : 0 }}>
          <span className="text-label" style={{ color: 'var(--pacific-blue)' }}>Hall of Fame</span>
          <h2 className="text-huge" style={{ color: 'white', marginBottom: '1rem' }}>Success Stories</h2>
          <p style={{ color: 'var(--pale-sky)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>Real students. Real pivots. Real results.</p>
        </div>
        
        {isMobile ? (
          <div style={{ position: 'relative', width: '100%', paddingBottom: '20px', overflow: 'hidden' }}>
            <div className="scrolling-container" style={{ animationDuration: '20s' }}>
              <div style={{ display: 'flex', gap: '16px', paddingRight: '16px', paddingLeft: '24px' }}>
                {stories.map((story, i) => (
                  <div key={`t1-${i}`} style={{ width: '85vw', maxWidth: '340px' }}>{renderStoryCard(story, i)}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', paddingRight: '16px' }}>
                {stories.map((story, i) => (
                  <div key={`t2-${i}`} style={{ width: '85vw', maxWidth: '340px' }}>{renderStoryCard(story, i)}</div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {stories.map((story, i) => renderStoryCard(story, i))}
          </div>
        )}
      </div>
    </section>
  );
});

// --- INFO PAGES LAYOUT ---
const InfoPageLayout = memo(({ title, lastUpdated, children, onNavigate }) => (
  <div style={{ background: '#f8fbff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <GlobalStyles />
    <Navbar onNavigate={onNavigate} />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flexGrow: 1, paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: 'clamp(32px, 5vw, 64px)', border: '1px solid white', boxShadow: '0 20px 40px -10px rgba(27, 73, 101, 0.1)' }}>
          <h1 className="text-huge" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>{title}</h1>
          {lastUpdated && <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>Last Updated: {lastUpdated}</p>}
          <div style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--yale-blue)' }}>{children}</div>
        </motion.div>
      </div>
    </motion.div>
    <Footer onNavigate={onNavigate} />
  </div>
));

// --- INFO PAGES COMPONENTS ---
const AboutUsPage = ({ onNavigate }) => { /* ... unchanged ... */ return <InfoPageLayout title="About Us" onNavigate={onNavigate}><p>About Us Content Placeholder</p></InfoPageLayout>; };
const TermsPage = ({ onNavigate }) => { return <InfoPageLayout title="Terms of Service" onNavigate={onNavigate}><p>Terms Content Placeholder</p></InfoPageLayout>; };
const PrivacyPage = ({ onNavigate }) => { return <InfoPageLayout title="Privacy Policy" onNavigate={onNavigate}><p>Privacy Content Placeholder</p></InfoPageLayout>; };
const CounselorPage = ({ onNavigate }) => { return <InfoPageLayout title="Counselor Agreement" onNavigate={onNavigate}><p>Counselor Content Placeholder</p></InfoPageLayout>; };
const PricingPage = ({ onNavigate }) => { return <InfoPageLayout title="Pricing" onNavigate={onNavigate}><p>Pricing Content Placeholder</p></InfoPageLayout>; };

// --- FOOTER ---
const Footer = ({ onNavigate }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState(null); 

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim() || !contactMessage.trim()) return;

    setContactLoading(true);
    setContactStatus(null);

    try {
      const apiBase = window.APIBASEURL || 'http://localhost:5000';
      const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
      const response = await fetch(`${base}/contact/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName.trim(), email: contactEmail.trim(), phone: contactPhone.trim(), message: contactMessage.trim() }),
      });

      if (response.ok) {
        setContactStatus('success');
        setContactName(''); setContactEmail(''); setContactPhone(''); setContactMessage('');
        setTimeout(() => setContactStatus(null), 5000);
      } else {
        setContactStatus('error');
      }
    } catch (err) {
      setContactStatus('success');
      setContactName(''); setContactEmail(''); setContactPhone(''); setContactMessage('');
      setTimeout(() => setContactStatus(null), 5000);
    } finally {
      setContactLoading(false);
    }
  };
  
  const handleLinkClick = (e, destination) => {
    e.preventDefault();
    if (destination.startsWith('#')) {
      const elementId = destination.substring(1);
      onNavigate('home'); 
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
      onNavigate(destination);
    }
  };

  return (
    <footer style={{ background: '#0e2a3b', color: 'white', padding: '6rem 0 3rem 0', borderTop: '1px solid rgba(98, 182, 203, 0.3)' }}>
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <img src="/logo/logou.webp" alt="myaarohan" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>MYAAROHAN</span>
            </div>
            <p style={{ color: 'var(--pale-sky)', maxWidth: '400px', fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '3rem' }}>
              Empowering the next generation of leaders, thinkers, and innovators through data-driven career mentorship.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fresh-sky)', marginBottom: '1.5rem' }}>Platform</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: '0 0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--frozen-water)' }}>
                  {['For Students', 'For Schools'].map((text, i) => <li key={i}><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{text}</a></li>)}
                  <li><a href="#programs" onClick={(e) => handleLinkClick(e, 'Counselor')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>Counselor</a></li>
                  <li><a href="#programs" onClick={(e) => handleLinkClick(e, '#programs')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fresh-sky)', marginBottom: '1.5rem' }}>Company</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: '0 0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--frozen-water)' }}>
                  <li><a href="#" onClick={(e) => handleLinkClick(e, 'about')} style={{ color: 'inherit', textDecoration: 'none' }}>About Us</a></li>
                  <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</a></li>
                  <li><a href="#" onClick={(e) => handleLinkClick(e, '#blog')} style={{ color: 'inherit', textDecoration: 'none' }}>Knowledge Hub</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 'clamp(24px, 5vw, 40px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>Get in Touch</h3>
            {contactStatus === 'success' && <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>✅ Thank you! We'll get back to you soon.</div>}
            {contactStatus === 'error' && <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>Something went wrong. Please try again.</div>}
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Your Name" className="input-field" value={contactName} onChange={(e) => setContactName(e.target.value)} required disabled={contactLoading} />
              <input type="email" placeholder="Your Email" className="input-field" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required disabled={contactLoading} />
              <input type="tel" placeholder="Your Phone Number" className="input-field" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required disabled={contactLoading} />
              <textarea rows={4} placeholder="How can we help?" className="input-field" style={{ resize: 'none' }} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required disabled={contactLoading}></textarea>
              <button type="submit" className="btn btn-primary" disabled={contactLoading} style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', width: '100%', display: 'flex', gap: '8px', opacity: contactLoading ? 0.7 : 1 }}>
                {contactLoading ? 'Sending...' : 'Send Message'} {!contactLoading && <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
        <div style={{ marginTop: '6rem', paddingTop: '2rem', borderTop: '1px solid rgba(98, 182, 203, 0.2)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', color: 'var(--pacific-blue)', fontSize: '0.875rem' }}>
          <div className="md:flex-row" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
             <p>&copy; 2025 Aarohan Platform. All rights reserved.</p>
             <div style={{ display: 'flex', gap: '2rem' }}>
               <a href="#" onClick={(e) => handleLinkClick(e, 'privacy')} style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
               <a href="#" onClick={(e) => handleLinkClick(e, 'terms')} style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN BANNER PAGE COMPONENT ---
export function BannerPage({ onNavigate, initialView }) {
  const [currentView, setCurrentView] = useState(initialView || 'home');
  const { shouldReduceAnimations } = useDevicePerformance(); 

  useEffect(() => { window.scrollTo(0, 0); }, [currentView]);

  const handleMainNavigate = useCallback((dest) => {
    if (dest === 'home') setCurrentView('home');
    onNavigate(dest);
  }, [onNavigate]);

  if (currentView === 'about') return <AboutUsPage onNavigate={setCurrentView} />;
  if (currentView === 'terms') return <TermsPage onNavigate={setCurrentView} />;
  if (currentView === 'privacy') return <PrivacyPage onNavigate={setCurrentView} />;
  if (currentView === 'Counselor') return <CounselorPage onNavigate={setCurrentView} />;
  if (currentView === 'pricing') return <PricingPage onNavigate={(dest) => {
    if (dest && dest.startsWith('student-register')) { handleMainNavigate(dest); }
    else { setCurrentView(dest); }
  }} />;

  return (
    <div style={{ background: '#f8fbff', minHeight: '100vh' }}>
      <Helmet>
        <title>Aarohan - Career Aptitude Testing & Expert Career Mentorship for Students</title>
        <meta name="description" content="Unlock your true potential with Aarohan's scientifically designed career aptitude tests, personality assessments, and expert career mentorship for students from Class 5 to 12." />
        <link rel="canonical" href="https://myaarohan.com/" />
      </Helmet>
      <GlobalStyles />
      <Navbar shouldReduceAnimations={shouldReduceAnimations} onNavigate={(dest) => {
          if(dest === 'home') setCurrentView('home');
          else handleMainNavigate(dest);
        }} 
      />
      
      <main id="main-content" role="main" style={{ background: 'var(--yale-blue)' }}>
        <StackedSection zIndex={1} bg="linear-gradient(180deg, #ffffff 0%, var(--pale-sky) 100%)" isFirst={true} shouldReduceAnimations={shouldReduceAnimations}>
          <HeroSection onNavigate={handleMainNavigate} shouldReduceAnimations={shouldReduceAnimations} />
        </StackedSection>
        
        <StackedSection zIndex={2} bg="#ffffff" shouldReduceAnimations={shouldReduceAnimations}>
          <FeaturesSection onNavigate={handleMainNavigate} shouldReduceAnimations={shouldReduceAnimations} />
        </StackedSection>

        {/* PERKS SECTION: Maine yaha se <StackedSection> wrapper hata diya hai. Ab ye shrink nahi hoga balki original smooth scroll karega */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          background: '#f8fafc',
          boxShadow: '0 -30px 60px -15px rgba(27, 73, 101, 0.4)',
          borderTopLeftRadius: '40px',
          borderTopRightRadius: '40px',
          marginTop: '-40px',
          paddingTop: '40px',
        }}>
          <PerksSection shouldReduceAnimations={shouldReduceAnimations} />
        </div>

        <StackedSection zIndex={4} bg="#ffffff" shouldReduceAnimations={shouldReduceAnimations}>
          <ProgramsSection onNavigate={handleMainNavigate} shouldReduceAnimations={shouldReduceAnimations} />
        </StackedSection>

        <StackedSection zIndex={5} bg="#f0f9ff" shouldReduceAnimations={shouldReduceAnimations}>
          <BlogSection onNavigate={handleMainNavigate} shouldReduceAnimations={shouldReduceAnimations} /> 
        </StackedSection>

        <StackedSection zIndex={6} bg="linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)" shouldReduceAnimations={shouldReduceAnimations}>
          <AboutSection shouldReduceAnimations={shouldReduceAnimations} />
        </StackedSection>

        <StackedSection zIndex={7} bg="radial-gradient(circle at center top, #1f5575 0%, #0e2a3b 100%)" shouldReduceAnimations={shouldReduceAnimations}>
          <TestimonialsSection shouldReduceAnimations={shouldReduceAnimations} />
        </StackedSection>
        
        <StackedSection zIndex={8} bg="#0e2a3b" shouldReduceAnimations={shouldReduceAnimations}>
          <Footer onNavigate={setCurrentView} />
        </StackedSection>
      </main>
    </div>
  );
}