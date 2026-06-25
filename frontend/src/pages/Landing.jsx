import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { 
  Bot, Sparkles, Cpu, Zap, ArrowRight, CheckCircle2, Globe, Shield, Activity,
  Menu, X, Database, TrendingUp, Trophy, Calendar, Users, Search, Lock,
  Plus, Check, ChevronDown, Play, Briefcase, Clock, Settings, AlertCircle,
  ArrowUpRight, BarChart3, HelpCircle, RefreshCw, Layers, Terminal, Send
} from 'lucide-react';

// Brand SVG Icons
const Brands = [
  {
    name: 'Stripe',
    icon: () => (
      <svg className="h-6 text-slate-500 hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.962 10.3c0-1.042.827-1.44 2.183-1.44 1.566 0 3.102.508 4.293 1.25V5.558C19.167 4.98 17.587 4.7 15.932 4.7c-3.69 0-6.177 1.942-6.177 5.176 0 5.378 7.378 4.5 7.378 6.84 0 1.157-.96 1.565-2.43 1.565-1.802 0-3.69-.648-5.06-1.505v4.618c1.55.672 3.454.986 5.253.986 3.826 0 6.425-1.92 6.425-5.269 0-5.69-7.38-4.708-7.38-6.816z" />
      </svg>
    )
  },
  {
    name: 'Vercel',
    icon: () => (
      <svg className="h-5 text-slate-500 hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 22.525H0L12 1.475L24 22.525Z" />
      </svg>
    )
  },
  {
    name: 'Linear',
    icon: () => (
      <svg className="h-5 text-slate-500 hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    )
  },
  {
    name: 'Framer',
    icon: () => (
      <svg className="h-5 text-slate-500 hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h12v12H0V0zm0 12h12v12L0 12zm12 0H0v12h12V12z" />
      </svg>
    )
  },
  {
    name: 'Notion',
    icon: () => (
      <svg className="h-5 text-slate-500 hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 4v12h16V6H4zm3 2h2v4H7V8zm4 0h2v8h-2V8zm4 0h2v4h-2V8z" />
      </svg>
    )
  },
  {
    name: 'OpenAI',
    icon: () => (
      <svg className="h-5 text-slate-500 hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.3 11.2c.1-.4.2-.8.2-1.2 0-2.2-1.8-4-4-4-.5 0-.9.1-1.3.3C15.3 4.5 13.5 3 11.5 3c-1.8 0-3.3 1.2-3.8 2.8-.5-.3-.9-.4-1.4-.4-2.2 0-4 1.8-4 4 0 .4.1.8.2 1.2C1.5 12.3.5 14.1.5 16.1c0 2.2 1.8 4 4 4 .5 0 1-.1 1.4-.3 1 1.4 2.6 2.3 4.5 2.3 2 0 3.7-1.5 4.1-3.4.4.2.9.3 1.3.3 2.2 0 4-1.8 4-4 .1-.4 0-.8-.1-1.2 1.2-1.1 2.2-2.9 2.2-4.9.1-2.1-1.1-3.9-2.7-4.7z" />
      </svg>
    )
  }
];

// Custom Animated Cursor
function CustomCursor() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const cursorSize = useMotionValue(16);
  const [hovered, setHovered] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [ripples, setRipples] = useState([]);

  const springConfig = { damping: 30, stiffness: 450, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        setHovered(true);
        const text = target.getAttribute('data-cursor-text') || "";
        setCursorText(text);
        cursorSize.set(text ? 72 : 44);
      } else {
        const isClickable = e.target.closest('a, button, [role="button"], input, select, textarea');
        if (isClickable) {
          setHovered(true);
          setCursorText("");
          cursorSize.set(36);
        } else {
          setHovered(false);
          setCursorText("");
          cursorSize.set(16);
        }
      }
    };

    const handleMouseDown = (e) => {
      setRipples((prev) => [...prev, { id: Date.now(), x: e.clientX, y: e.clientY }]);
      cursorSize.set(cursorText ? 64 : 24);
    };

    const handleMouseUp = () => {
      cursorSize.set(hovered ? (cursorText ? 72 : 44) : 16);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [hovered, cursorText, mouseX, mouseY, cursorSize]);

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden lg:flex items-center justify-center text-black font-black text-[9px] uppercase tracking-wider text-center"
        style={{
          x: cursorX,
          y: cursorY,
          width: cursorSize,
          height: cursorSize,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: hovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.8)",
          boxShadow: hovered ? "0 0 20px rgba(255, 255, 255, 0.5)" : "none",
        }}
      >
        {cursorText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-1 text-[8px] tracking-widest text-slate-900"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>

      {!hovered && (
        <motion.div
          className="fixed top-0 left-0 w-7 h-7 rounded-full border border-white/20 pointer-events-none z-[9998] mix-blend-difference hidden lg:block"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />
      )}

      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="fixed w-10 h-10 rounded-full border border-indigo-500 pointer-events-none z-[9997]"
          style={{
            left: ripple.x,
            top: ripple.y,
            translateX: "-50%",
            translateY: "-50%",
          }}
          initial={{ opacity: 0.8, scale: 0.2 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

// 3D Canvas Node Simulator
function Canvas3DNodes() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const numNodes = 45;
    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 450,
        y: (Math.random() - 0.5) * 450,
        z: (Math.random() - 0.5) * 450,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.2,
        color: i % 3 === 0 ? '#81ecff' : i % 3 === 1 ? '#a68cff' : '#6200EE',
      });
    }

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = canvasRef.current.offsetWidth;
      height = canvasRef.current.height = canvasRef.current.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouseRef.current.targetX = (clientX - width / 2) * 0.08;
      mouseRef.current.targetY = (clientY - height / 2) * 0.08;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      angleY = mouseRef.current.x * 0.003;
      angleX = mouseRef.current.y * 0.003;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const fov = 380;
      const cameraZ = 450;

      const projected = nodes.map((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        const limit = 220;
        if (Math.abs(node.x) > limit) node.vx *= -1;
        if (Math.abs(node.y) > limit) node.vy *= -1;
        if (Math.abs(node.z) > limit) node.vz *= -1;

        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.z * cosY + node.x * sinY;

        let y1 = node.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.y * sinX;

        const depth = z2 + cameraZ;
        const scale = fov / (depth > 0 ? depth : 1);
        const screenX = x1 * scale + width / 2;
        const screenY = y1 * scale + height / 2;

        return {
          x: screenX,
          y: screenY,
          z: z2,
          scale,
          color: node.color,
          radius: node.radius * scale * 0.5,
        };
      });

      // Draw Connection Lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const n1 = projected[i];
          const n2 = projected[j];

          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.18;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(166, 140, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw Spherical Nodes
      projected.forEach((p) => {
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.radius, 0.4), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        if (p.radius > 1.8) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
          gradient.addColorStop(0, p.color + '33');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-45 dark:opacity-75" />;
}

export default function Landing() {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulated Dashboard Tab state
  const [simActiveTab, setSimActiveTab] = useState('planner');
  const [simLoading, setSimLoading] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simLogs, setSimLogs] = useState([]);
  const [simGenerated, setSimGenerated] = useState(false);
  const [consoleInput, setConsoleInput] = useState('');
  const [simData, setSimData] = useState({
    goal: 'Launch content strategy to acquire enterprise marketing clients',
    platform: 'LinkedIn',
    industry: 'SaaS (Software as a Service)',
    contentType: 'Educative',
    strategyMode: 'bold'
  });

  // Pricing Toggle state
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  // FAQ Active Index
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  // Background spotlight position tracking
  const heroRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    mouseX.set(x - width / 2);
    mouseY.set(y - height / 2);
  };

  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 200 });

  // Handle Page Scroll Behaviors
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section tracking
      const sections = ['hero', 'problem', 'agents', 'demo', 'timeline', 'pricing', 'faq'];
      const current = sections.find((sect) => {
        const el = document.getElementById(sect);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 160 && rect.bottom >= 160;
        }
        return false;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth Scroll Trigger
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Run Strategy Builder Simulation
  const handleSimulateGeneration = () => {
    if (simLoading) return;
    setSimLoading(true);
    setSimGenerated(false);
    setSimProgress(0);
    setSimActiveTab('agents'); // Switch to agent logging console
    setSimLogs([]);

    const messages = [
      { t: 200, text: '❯ [SYSTEM] Booting planvIx Multi-Agent Content Synthesizer v2.6.4...' },
      { t: 400, text: `❯ [SYSTEM] Ingesting Parameters: Goal: "${simData.goal}" | Platform: ${simData.platform} | Mode: ${simData.strategyMode.toUpperCase()}` },
      { t: 750, text: '❯ [RESEARCHER] Google Search API connected. Searching academic papers and industry reports...' },
      { t: 1000, text: '❯ [RESEARCHER] Analysing competitors: Found 12 keyword vectors with low density but high search intent.' },
      { t: 1300, text: '❯ [RESEARCHER] Factual synthesis complete. Compiled 4 structured insight records. Passing to Writer.' },
      { t: 1650, text: `❯ [COPYWRITER] Model loaded: Claude 3.5 Sonnet. Persona set to: "${simData.strategyMode === 'bold' ? 'Authority Visionary' : 'Data-Driven Expert'}"` },
      { t: 1900, text: '❯ [COPYWRITER] Content drafted. Hook: "Why SaaS platforms leak 30% of pipeline at checkout (and how to patch it)"' },
      { t: 2200, text: '❯ [COPYWRITER] Tailored for LinkedIn structure: Dual-line hook, bulleted insights, CTA node.' },
      { t: 2500, text: '❯ [SEO ANALYST] Tokenizer initialized. Parsing copy for semantic keyword injections...' },
      { t: 2800, text: '❯ [SEO ANALYST] SEO optimization complete. Keywords embedded: #SaaSMarketing, #ConversionOptimization. SEO rank rating: 98/100.' },
      { t: 3000, text: '❯ [SYSTEM] Strategy compilation successful. Transferring payload structures to dashboard workspace...' }
    ];

    messages.forEach((msg) => {
      setTimeout(() => {
        setSimLogs((prev) => [...prev, msg.text]);
        setSimProgress((curr) => Math.min(curr + 10, 100));
      }, msg.t);
    });

    setTimeout(() => {
      setSimLoading(false);
      setSimGenerated(true);
      setSimActiveTab('dashboard'); // Auto-switch to compiled dashboard view
    }, 3300);
  };

  const handleConsoleSubmit = (e) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.trim().toLowerCase();
    let reply = `Command not recognized: "${cmd}". Type "/help" for details.`;

    if (cmd === '/help') {
      reply = 'Available commands: /agents (status), /clear (wipe console), /generate (trigger simulation), /uptime (system specs)';
    } else if (cmd === '/clear') {
      setSimLogs([]);
      setConsoleInput('');
      return;
    } else if (cmd === '/agents') {
      reply = '[AGENTS STATUS]: Tech Researcher (ACTIVE/14 APIs), Master Copywriter (IDLE/Claude-3.5), SEO Analyst (ACTIVE/Semantic Engine)';
    } else if (cmd === '/uptime') {
      reply = '[SYSTEM SPECS]: SLA 99.99% | Queue: PRIORITY | Latency: 42ms | Swarm Status: ONLINE';
    } else if (cmd === '/generate') {
      setConsoleInput('');
      handleSimulateGeneration();
      return;
    }

    setSimLogs((prev) => [...prev, `❯ ${consoleInput}`, `❯ [CONSOLE] ${reply}`]);
    setConsoleInput('');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-[#81ecff]/20 overflow-x-hidden font-sans relative antialiased">
      
      {/* Animated Custom Cursor */}
      <CustomCursor />

      {/* Global Ambient Flare & Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Aurora Sphere 1 */}
        <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 blur-[120px] aurora-sphere-1 mix-blend-screen" />
        {/* Animated Aurora Sphere 2 */}
        <div className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-cyan-500/10 to-indigo-500/5 blur-[150px] aurora-sphere-2 mix-blend-screen" />
        {/* Bottom Ambient Purple */}
        <div className="absolute bottom-[-10%] left-[10%] w-[70vw] h-[40vw] rounded-full bg-[#6200EE]/5 blur-[160px]" />
        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-bg-overlay" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">

        {/* ==================== FLOATING GLASS NAVBAR ==================== */}
        <header className={`fixed top-6 z-[99] max-w-5xl w-[90%] mx-auto transition-all duration-300 ${
          scrolled ? 'top-4' : 'top-6'
        }`}>
          <div className="w-full bg-[#090d16]/60 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8)]">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6200EE] to-[#81ecff] flex items-center justify-center shadow-[0_0_15px_rgba(98,0,238,0.4)] group-hover:scale-105 transition-transform duration-300">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  planvIx
                </span>
              </Link>
            </div>

            {/* Nav Links - Center */}
            <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
              {[
                { id: 'hero', label: 'Home' },
                { id: 'problem', label: 'Approach' },
                { id: 'agents', label: 'AI Agents' },
                { id: 'demo', label: 'Sandbox' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'pricing', label: 'Pricing' }
              ].map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-white/10 rounded-full border border-white/10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Nav Actions - Right */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors duration-300"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="relative group overflow-hidden px-5 py-2 rounded-full bg-gradient-to-r from-[#6200EE] to-[#3b00a0] text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(98,0,238,0.4)] hover:shadow-[0_0_30px_rgba(129,236,255,0.4)] transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

          {/* Mobile slide-over menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-16 left-0 right-0 bg-[#090d16]/95 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl backdrop-blur-lg"
              >
                {[
                  { id: 'hero', label: 'Home' },
                  { id: 'problem', label: 'Approach' },
                  { id: 'agents', label: 'AI Agents' },
                  { id: 'demo', label: 'Sandbox' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'pricing', label: 'Pricing' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full text-left py-2 px-4 rounded-xl text-sm font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="h-[1px] bg-white/10 my-2" />
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#6200EE] to-[#3b00a0] text-xs font-black uppercase tracking-wider text-white transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>


        {/* ==================== CINEMATIC HERO SECTION ==================== */}
        <section
          id="hero"
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          className="relative min-h-screen w-full flex flex-col items-center justify-center pt-32 pb-20 px-4 max-w-7xl mx-auto overflow-hidden"
        >
          {/* Spotlight follow mouse cursor (Parallax depth) */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full bg-[#6200EE]/10 blur-[150px] pointer-events-none mix-blend-screen z-0"
            style={{
              x: smoothMouseX,
              y: smoothMouseY,
            }}
          />

          {/* 3D Node Grid Layer */}
          <Canvas3DNodes />

          <div className="relative z-10 w-full flex flex-col items-center text-center">
            
            {/* Spotlight Label Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#81ecff] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">
                Multi-Agent Content Swarms v2.0
              </span>
            </motion.div>

            {/* Massive Display Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[1.05] max-w-5xl mb-8"
            >
              Orchestrate a Swarm of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81ecff] via-white to-[#a68cff] text-glow">
                Autonomous AI Minds
              </span>
            </motion.h1>

            {/* Refined Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-sm sm:text-base md:text-lg text-slate-400 max-w-3xl mb-12 leading-relaxed px-4"
            >
              Delegate research, drafting, and real-time SEO intelligence to specialized autonomous agents working in parallel. Compile complete, publisher-ready marketing strategy blueprints in 2 minutes.
            </motion.p>

            {/* Interactive CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center px-4 mb-20"
            >
              <Link 
                to="/signup"
                data-cursor
                data-cursor-text="Try Swarm"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
              >
                <span>Orchestrate Free</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <button
                onClick={() => scrollToSection('demo')}
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md rounded-full text-white font-bold transition-all duration-300"
              >
                <Play className="w-4 h-4 mr-2 text-slate-400" />
                <span>Launch Sandbox</span>
              </button>
            </motion.div>

          </div>
        </section>


        {/* ==================== TRUSTED BY LOGO TICKER ==================== */}
        <section className="w-full bg-[#050811]/60 border-y border-white/5 py-10 relative overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">
              Empowering Elite Content Operations Worldwide
            </p>
            
            {/* Infinite scrolling brand marquee */}
            <div className="marquee-container">
              <div className="marquee-content">
                {/* Regular set */}
                {Brands.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 px-8">
                    <b.icon />
                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{b.name}</span>
                  </div>
                ))}
                {/* Cloned set for loop */}
                {Brands.map((b, i) => (
                  <div key={`clone-${i}`} className="flex items-center gap-2 px-8">
                    <b.icon />
                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>


        {/* ==================== THE CHAOS / COMPARISON SECTION ==================== */}
        <section id="problem" className="py-32 w-full max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider mb-6">
              The Friction
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
              Marketing Ops are Leaking <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-500 text-glow">Value</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Traditional content production cycles take 7-14 days, drain budgets, and fail search rankings. Here is how Planvix collapses the loop.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* The Chaos Panel */}
            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -30 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-[#0b0f19]/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full" />
              <h3 className="text-xl font-black text-rose-400 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Traditional Agency / Writer Path
              </h3>
              
              <div className="space-y-6">
                {[
                  { title: "Excessive Turnaround Time", desc: "Average article takes 5-7 days from brief to first draft." },
                  { title: "High Cost & Overhead", desc: "Paying upwards of $150-$300 per optimized blog post." },
                  { title: "Brand Voice Mismatch", desc: "Freelancers struggle to align with your product language guidelines." },
                  { title: "Delayed SEO Auditing", desc: "Keyword research is done in isolation, requiring manual rewriting." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold flex-shrink-0">
                      ✕
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* The Planvix Way Panel */}
            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 30 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-gradient-to-br from-[#0c1224]/80 to-[#080b13] border border-[#6200EE]/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_-10px_rgba(98,0,238,0.2)] group hover:border-[#81ecff]/40 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
              <h3 className="text-xl font-black text-[#81ecff] mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#81ecff] animate-pulse" /> The planvIx Multi-Agent Swarm
              </h3>
              
              <div className="space-y-6">
                {[
                  { title: "Under 2 Minutes Output", desc: "Specialized agents execute research, writing, and SEO in a parallel stream." },
                  { title: "90% Reduction in TCO", desc: "Generate unlimited conversion-optimized strategies for the cost of one tool." },
                  { title: "100% Brand-Locked Consistency", desc: "Fine-tune agent parameters to stay strictly aligned to your style guides." },
                  { title: "Autonomic Keyword Engineering", desc: "SEO analyst evaluates keyword density & ranks score pre-publish." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </section>


        {/* ==================== MULTI-AGENT ARCHITECTURE MAP ==================== */}
        <section id="agents" className="py-32 w-full bg-[#050811]/45 border-y border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#a68cff] text-[10px] font-black uppercase tracking-wider mb-6">
                The Engine
              </div>
              <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
                A Swarm of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81ecff] to-[#a68cff] text-glow">Specialized Agents</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                Each task is auto-delegated to a dedicated model with a distinct system instructions context. Hover over each node to view their active toolkit.
              </p>
            </div>

            {/* Interactive Node Map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              
              {/* Connecting glowing wires decor (Desktop only) */}
              <div className="hidden md:block absolute top-[44%] left-[28%] right-[28%] h-[2px] bg-gradient-to-r from-emerald-500/20 via-[#6200EE]/30 to-amber-500/20 z-0 pointer-events-none" />

              {/* Agent 1: Tech Researcher */}
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-[#0b0f1a]/80 border border-emerald-500/20 rounded-3xl p-8 relative z-10 group transition-all duration-300"
                data-cursor
                data-cursor-text="Factual Engine"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Database className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tech Researcher Agent</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Queries web search indexes and crawls provided URLs. Extracts raw fact vectors, API parameters, and technical literature.
                </p>
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Active Tools:</span>
                  <div className="flex flex-wrap gap-2">
                    {['Google Search API', 'Cheerio Web Crawler', 'Wikipedia Search'].map((t, idx) => (
                      <span key={idx} className="text-[9px] font-semibold bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Agent 2: Copywriter */}
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-[#0b0f1a]/80 border border-[#6200EE]/30 rounded-3xl p-8 relative z-10 group transition-all duration-300 shadow-[0_0_30px_rgba(98,0,238,0.15)]"
                data-cursor
                data-cursor-text="Prose Engine"
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl border border-[#6200EE]/30 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Cpu className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Master Copywriter Agent</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Consumes fact reports. Formulates outlines, adapts to selected brand voices, and writes prose that sounds natural and conversion-centric.
                </p>
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Active Tools:</span>
                  <div className="flex flex-wrap gap-2">
                    {['Claude 3.5 Sonnet', 'Brand Voice Matcher', 'Draft Outliner'].map((t, idx) => (
                      <span key={idx} className="text-[9px] font-semibold bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Agent 3: SEO Analyst */}
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-[#0b0f1a]/80 border border-amber-500/20 rounded-3xl p-8 relative z-10 group transition-all duration-300"
                data-cursor
                data-cursor-text="SEO Optimization"
              >
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">SEO Analyst Agent</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Evaluates keyword density and headings hierarchy. Re-injects semantic synonyms to boost organic index rankings pre-publish.
                </p>
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Active Tools:</span>
                  <div className="flex flex-wrap gap-2">
                    {['Semantic Density Check', 'Header Validator', 'Rank Prediction'].map((t, idx) => (
                      <span key={idx} className="text-[9px] font-semibold bg-amber-500/5 text-amber-400 border border-amber-500/10 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>

          </div>
        </section>


        {/* ==================== LIVE PRODUCT EXPERIENCE SANDBOX ==================== */}
        <section id="demo" className="py-32 w-full max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-wider mb-6">
              Interactive
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
              Test Drive the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#81ecff] text-glow">Agent Workspace</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Experience the Planvix workspace dashboard right here. Fill in the parameters and click "Orchestrate Swarm" to run a live mockup generation loop.
            </p>
          </div>

          {/* Core Simulated App Mockup Frame */}
          <div className="bg-[#090d16] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.8)] relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row h-[600px]">
            
            {/* Simulated App Sidebar */}
            <div className="w-full md:w-56 bg-[#06090f] border-r border-white/5 flex flex-col justify-between p-4 flex-shrink-0 h-auto md:h-full">
              
              <div className="space-y-6">
                {/* Mock User Details */}
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-black text-white">
                    U
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate w-32">sandbox_guest</h4>
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-500">Free Sandbox</span>
                  </div>
                </div>

                {/* Simulated Tabs Menu */}
                <div className="space-y-1">
                  {[
                    { id: 'planner', label: 'Strategy Planner', icon: Sparkles },
                    { id: 'agents', label: 'Agent Console', icon: Terminal, badge: simLoading ? 'RUN' : null },
                    { id: 'dashboard', label: 'Live Dashboard', icon: Layers },
                    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
                    { id: 'analytics', label: 'Metrics', icon: BarChart3 }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = simActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSimActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                          active 
                            ? 'bg-white/5 text-[#81ecff] border-l-2 border-[#81ecff]' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-bold">{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md font-black animate-pulse">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar bottom indicator */}
              <div className="hidden md:block">
                <div className="bg-[#0b0f19] border border-white/5 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Agent Load</p>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '18%' }} />
                  </div>
                  <span className="text-[8px] text-emerald-400 mt-1 block">Queue Latency: 42ms</span>
                </div>
              </div>

            </div>

            {/* Simulated App Workspace Area */}
            <div className="flex-1 bg-[#090d16] p-6 overflow-y-auto flex flex-col h-full">
              
              {/* Tab: Strategy Planner Form */}
              {simActiveTab === 'planner' && (
                <div className="space-y-6 my-auto max-w-lg mx-auto w-full">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400" /> Start Content Strategy Swarm
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Configure your goal. The swarm will generate a tailored strategy blueprint.</p>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Goal input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500">Primary Objective Goal</label>
                      <input
                        type="text"
                        value={simData.goal}
                        onChange={(e) => setSimData({ ...simData, goal: e.target.value })}
                        placeholder="e.g. Promote our SaaS tool to SaaS founders"
                        className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#6200EE] transition-colors"
                      />
                    </div>

                    {/* Platform & Industry grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-500">Target Channel</label>
                        <select
                          value={simData.platform}
                          onChange={(e) => setSimData({ ...simData, platform: e.target.value })}
                          className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#6200EE] transition-colors"
                        >
                          {['LinkedIn', 'Twitter/X', 'Instagram', 'YouTube'].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-500">Industry Vertical</label>
                        <select
                          value={simData.industry}
                          onChange={(e) => setSimData({ ...simData, industry: e.target.value })}
                          className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#6200EE] transition-colors"
                        >
                          {['SaaS (Software as a Service)', 'AI & Machine Learning', 'E-commerce', 'Financial Services'].map((ind) => (
                            <option key={ind} value={ind}>{ind}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500">Strategy Engine Mode</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'conservative', label: 'Balanced (Highly Factual)' },
                          { id: 'bold', label: 'Visionary (High Engagement)' }
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setSimData({ ...simData, strategyMode: mode.id })}
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                              simData.strategyMode === mode.id
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                : 'bg-[#0d1321] border-white/5 text-slate-500 hover:border-white/10'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSimulateGeneration}
                      disabled={simLoading}
                      className="w-full py-4 bg-gradient-to-r from-[#6200EE] to-[#3b00a0] rounded-xl text-white font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(98,0,238,0.5)] transition-all flex items-center justify-center gap-2"
                    >
                      {simLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Swarm Blueprint ({simProgress}%)</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Orchestrate Agent Swarm</span>
                        </>
                      )}
                    </button>

                  </div>
                </div>
              )}

              {/* Tab: Agent Console / Terminal */}
              {simActiveTab === 'agents' && (
                <div className="flex-1 flex flex-col bg-[#050811] rounded-2xl border border-white/5 p-4 font-mono text-[11px] text-emerald-400 relative overflow-hidden">
                  
                  {/* Console Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-sans"> planvIx Multi-Agent Console</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Console Log Body */}
                  <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-thin">
                    {simLogs.length === 0 && (
                      <p className="text-slate-500">Terminal ready. Run a strategy simulation or type command like "/help".</p>
                    )}
                    {simLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                        {log}
                      </div>
                    ))}
                    {simLoading && (
                      <div className="flex items-center gap-1.5 text-slate-400 mt-2">
                        <span className="w-1.5 h-3.5 bg-emerald-400 animate-pulse" />
                        <span>agent pipeline working...</span>
                      </div>
                    )}
                  </div>

                  {/* Console Input */}
                  <form onSubmit={handleConsoleSubmit} className="flex gap-2 border-t border-white/5 pt-3">
                    <span className="text-slate-500">guest@planvix:~$</span>
                    <input
                      type="text"
                      value={consoleInput}
                      onChange={(e) => setConsoleInput(e.target.value)}
                      placeholder='Type command (e.g. "/agents", "/help")...'
                      className="flex-1 bg-transparent border-none outline-none text-emerald-300"
                    />
                  </form>

                </div>
              )}

              {/* Tab: Simulated Dashboard */}
              {simActiveTab === 'dashboard' && (
                <div className="space-y-6 my-auto">
                  {!simGenerated ? (
                    <div className="text-center py-12 text-slate-500">
                      <Lock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <h4 className="font-bold text-sm text-slate-400">Dashboard Locked</h4>
                      <p className="text-[11px] mt-1 max-w-xs mx-auto">Go to "Strategy Planner" tab and click generate to populate dashboard.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      
                      {/* Metric KPI cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'SEO Rank Score', val: '98/100', color: 'text-emerald-400' },
                          { label: 'Injected Keywords', val: '14 keys', color: 'text-indigo-400' },
                          { label: 'Audience Reach', val: '145K Est.', color: 'text-cyan-400' },
                          { label: 'Engagement Rate', val: '8.7%', color: 'text-amber-400' }
                        ].map((kpi, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3.5 shadow-sm">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">{kpi.label}</span>
                            <span className={`text-base font-black ${kpi.color} mt-1 block`}>{kpi.val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Mock Post Preview */}
                      <div className="bg-[#0b0f19] border border-[#6200EE]/30 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider">
                          <Check className="w-3 h-3" /> SEO Optimized Blueprint
                        </div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-500 mb-2">LinkedIn Post Copy Preview</h4>
                        <h3 className="text-sm font-black text-white mb-3">"Why SaaS platforms leak 30% of pipeline at checkout (and how to patch it)"</h3>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                          Traditional monolithic LLMs are bottlenecked. When you ask a single agent to handle deep competitor research, high-converting copywriting, and strict semantic SEO densities, quality fractures. The future belongs to orchestras of specialized agents working in tandem. 
                        </p>
                      </div>

                      {/* Info bar */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Compiled by: 3 Autonomous Agents</span>
                        <span>Time taken: 2.8 seconds</span>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Tab: Content Calendar */}
              {simActiveTab === 'calendar' && (
                <div className="space-y-6 my-auto">
                  {!simGenerated ? (
                    <div className="text-center py-12 text-slate-500">
                      <Lock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <h4 className="font-bold text-sm text-slate-400">Calendar Locked</h4>
                      <p className="text-[11px] mt-1 max-w-xs mx-auto">Go to "Strategy Planner" tab and click generate to build strategy.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Simulated Week Blueprint</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { day: 'Mon', time: '10:00 AM', title: 'The Factual Analysis of Checkout Leaks', status: 'Approved' },
                          { day: 'Wed', time: '02:30 PM', title: 'A Swarm Approach vs Single Model LLM', status: 'Pending Review' },
                          { day: 'Fri', time: '09:00 AM', title: 'SEO Blueprint: Key Indicators in 2026', status: 'Scheduled' }
                        ].map((day, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-32 relative">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase font-black text-[#81ecff]">{day.day}</span>
                                <span className="text-[8px] text-slate-500 font-bold">{day.time}</span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight">{day.title}</h4>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full w-max mt-2">
                              {day.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Metrics / Charts */}
              {simActiveTab === 'analytics' && (
                <div className="space-y-6 my-auto flex flex-col justify-center items-center">
                  {!simGenerated ? (
                    <div className="text-center py-12 text-slate-500">
                      <Lock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <h4 className="font-bold text-sm text-slate-400">Metrics Locked</h4>
                      <p className="text-[11px] mt-1 max-w-xs mx-auto">Go to "Strategy Planner" tab and click generate to evaluate reach.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 w-full animate-fade-in">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Organic reach growth forecast</h3>
                      
                      {/* Animated SVG Chart */}
                      <div className="relative w-full h-48 bg-white/5 border border-white/5 rounded-2xl p-4 overflow-hidden flex items-end">
                        <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {/* Grid lines */}
                          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          
                          {/* Graph Path */}
                          <motion.path
                            d="M 0 90 Q 20 80 40 60 T 80 20 L 100 10"
                            fill="none"
                            stroke="url(#chartGrad)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                          />
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#6200EE" />
                              <stop offset="100%" stopColor="#81ecff" />
                            </linearGradient>
                          </defs>
                        </svg>

                        {/* Month labels */}
                        <div className="flex justify-between w-full text-[9px] font-bold text-slate-500 uppercase tracking-widest relative z-10 px-2 mt-auto">
                          <span>Jan</span>
                          <span>Mar</span>
                          <span>May</span>
                          <span>Jul</span>
                          <span>Sep</span>
                          <span>Nov</span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </section>


        {/* ==================== THE STORYTELLING TIMELINE ==================== */}
        <section id="timeline" className="py-32 w-full bg-[#050811]/45 border-y border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-6">
                The Narrative
              </div>
              <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
                The Journey of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-glow">Scale</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                How a content goal evolves from a simple brief into structured, high-performing organic traffic growth.
              </p>
            </div>

            {/* Timeline Tree */}
            <div className="max-w-4xl mx-auto relative space-y-16">
              
              {/* Vertical line indicator */}
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 z-0" />

              {[
                {
                  num: '01',
                  title: 'Define Intent',
                  desc: 'Input your marketing goal, audience characteristics, and channel. Choose balanced or visionary agent parameters.',
                  badge: 'Goal Node'
                },
                {
                  num: '02',
                  title: 'Deep Competitor Ingestion',
                  desc: 'Our Tech Researcher connects to the web search API and crawls competitor channels to find keyword vectors.',
                  badge: 'Research Node'
                },
                {
                  num: '03',
                  title: 'Synthesize & Inject Keywords',
                  desc: 'The Master Copywriter drafts engaging prose while the SEO analyst reviews heading densities in real-time.',
                  badge: 'Orchestration Node'
                },
                {
                  num: '04',
                  title: 'Schedule & Publish',
                  desc: 'Export approved strategy blueprints directly into the calendar layout or sync with Buffer, Hubspot, or Notion.',
                  badge: 'Published Output'
                }
              ].map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <motion.div
                    key={idx}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 25 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`flex flex-col sm:flex-row items-start relative z-10 ${
                      isEven ? 'sm:flex-row-reverse' : ''
                    }`}
                  >
                    
                    {/* Left/Right content block */}
                    <div className="w-full sm:w-1/2 flex justify-start sm:justify-center px-8">
                      <div className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-6 w-full max-w-sm hover:border-indigo-500/20 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                          <span className="text-xl font-black text-slate-600">{item.num}</span>
                        </div>
                        <h4 className="font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    {/* Circle Node */}
                    <div className="absolute left-4 sm:left-1/2 top-4 transform -translate-x-1/2 w-8 h-8 rounded-full bg-[#030712] border-2 border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-black" />

                    {/* Spacer for structure */}
                    <div className="w-full sm:w-1/2" />

                  </motion.div>
                );
              })}

            </div>

          </div>
        </section>


        {/* ==================== PRICING SECTION ==================== */}
        <section id="pricing" className="py-32 w-full max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6200EE]/10 border border-[#6200EE]/20 text-[#a68cff] text-[10px] font-black uppercase tracking-wider mb-6">
              The Investment
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
              Premium Tiering for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a68cff] to-[#81ecff] text-glow">Elite Swarms</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              All plans include priority queuing. Start orchestrating strategies for free, upgrade when you require unlimited agent capacity.
            </p>

            {/* Monthly / Annual toggle */}
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white/15 border-white/10 text-white'
                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`relative px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-white/15 border-white/10 text-white'
                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full font-black border border-emerald-500/20">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Free Tier Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-[#0b0f19]/40 border border-white/5 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group hover:border-white/10"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Standard Layer</span>
                  <span className="text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-0.5 rounded-full font-black uppercase">
                    Free Sandbox
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black text-white">₹0</span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">/ lifetime</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-8 border-b border-white/5 pb-6">
                  Perfect for testing autonomous agent pipelines and designing strategy blueprints.
                </p>

                <ul className="space-y-4 mb-10">
                  {[
                    "Limit of 3 content strategy compiles",
                    "Standard multi-agent orchestrator queue",
                    "Factual web crawler capability",
                    "Interactive content calendar preview",
                    "Basic strategy analytics tracking"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-xs text-slate-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/signup"
                className="w-full text-center py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Pro Tier Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-b from-[#0c1224] to-[#080b13] border border-[#6200EE] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_0_50px_rgba(98,0,238,0.25)] transition-all duration-300 group hover:border-[#81ecff]/40"
            >
              {/* Highlight glowing flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6200EE]/10 blur-3xl rounded-full" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Enterprise Pro</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-black uppercase animate-pulse">
                    Popular
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black text-white">
                    {billingCycle === 'monthly' ? '₹3,999' : '₹3,199'}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">/ month</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-8 border-b border-white/5 pb-6">
                  Built for marketing teams, SaaS agencies, and enterprise growth teams scaling reach.
                </p>

                <ul className="space-y-4 mb-10">
                  {[
                    "Unlimited strategy generation queries",
                    "Priority scheduling with 60fps latency",
                    "Real SEO keyword intelligence integration",
                    "Interactive collaborative workflow canvas",
                    "Dedicated support and custom agent fine-tuning",
                    "Export directly to Notion, Webflow, and Buffer"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-xs text-slate-200 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#81ecff] flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/signup"
                className="w-full text-center py-4 bg-gradient-to-r from-[#6200EE] to-[#3b00a0] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_4px_25px_rgba(98,0,238,0.4)] hover:shadow-[0_0_35px_rgba(129,236,255,0.4)] transition-all hover:scale-[1.02]"
              >
                Activate Pro License
              </Link>
            </motion.div>

          </div>

        </section>


        {/* ==================== TESTIMONIALS & TRUST METRICS ==================== */}
        <section className="py-32 w-full bg-[#050811]/45 border-y border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-6">
                Verification
              </div>
              <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
                Enterprise Uptime & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-glow">Trust Signals</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                Planvix is trusted by modern growth operations. Here are our verified platform metrics and customer feedback.
              </p>
            </div>

            {/* Trust Badges KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {[
                { title: 'System SLA Uptime', value: '99.99%', desc: 'Monitored across global worker clusters.', icon: Shield },
                { title: 'Content Yield Ratio', value: '10x Speedup', desc: 'Reduce drafting from 7 days to 2 minutes.', icon: TrendingUp },
                { title: 'Average Strategy Rating', value: '4.8 / 5', desc: 'Based on feedback from 1.2M+ compiles.', icon: Trophy }
              ].map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/20 transition-all duration-300">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">{badge.title}</span>
                    <span className="text-3xl font-black text-white mt-1 block">{badge.value}</span>
                    <span className="text-xs text-slate-400 mt-2 block">{badge.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  quote: "Planvix has completely collapsed our content publishing timelines. We went from outputting one long-form strategy checklist a week to generating five tailored briefs in under ten minutes.",
                  author: "Siddharth Mehta",
                  role: "Head of Marketing, CloudScale Solutions"
                },
                {
                  quote: "Having specialized agent bots collaborating in parallel is a game changer. The factual researcher gathers search parameters and passes them cleanly, while the copywriter adapts hooks perfectly.",
                  author: "Elena Rostova",
                  role: "Growth Director, FintechLabs"
                }
              ].map((test, idx) => (
                <div key={idx} className="bg-[#0b0f1a]/80 border border-white/5 rounded-3xl p-8 relative flex flex-col justify-between">
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                    "{test.quote}"
                  </p>
                  <div className="flex items-center gap-3 mt-6 border-t border-white/5 pt-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {test.author[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{test.author}</h4>
                      <span className="text-[10px] text-slate-500">{test.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ==================== FAQ ACCORDION SECTION ==================== */}
        <section id="faq" className="py-32 w-full max-w-3xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-6">
              Support
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Have questions about how autonomous agent swarms compile campaigns? Here are quick answers.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {[
              {
                q: "What makes multi-agent systems better than regular LLM tools?",
                a: "A single LLM prompt often suffers from model drift when forced to perform research, writing, and keyword parsing simultaneously. Planvix delegates these distinct tasks to three coordinate engines (Researcher, Copywriter, SEO Optimizer) using custom instruction prompts, yielding factually accurate and search-optimized copy."
              },
              {
                q: "Can I customize the system parameters to lock my brand voice?",
                a: "Yes! The copywriter agent utilizes fine-tuning style overrides. You can supply custom product descriptions, rules, and example paragraphs, forcing the writer bot to match your tone guide 100% of the time."
              },
              {
                q: "How does the factual search integration work?",
                a: "The Tech Researcher agent links directly to a live web search index wrapper. It performs real-time queries on the topic keyword, grabs verified links, filters raw HTML text, and returns structured data payload JSONs containing recent metrics."
              },
              {
                q: "What integrations do you support on the Pro Tier?",
                a: "Pro licenses unlock direct API integrations to schedule and publish copy directly to Buffer, Hubspot, Webflow, Notion databases, and social media channels."
              }
            ].map((faq, idx) => {
              const isOpen = faqOpenIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#0b0f1a]/80 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-5 border-t border-white/5 pt-3"
                      >
                        <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </section>


        {/* ==================== FINAL CTA SECTION ==================== */}
        <section className="py-32 w-full max-w-5xl mx-auto px-6 relative z-10 text-center">
          
          <div className="relative bg-gradient-to-br from-[#0c1224] to-[#050811]/90 border border-white/10 rounded-[3rem] p-12 md:p-20 overflow-hidden shadow-[0_0_60px_-10px_rgba(98,0,238,0.3)]">
            {/* Background glowing flares */}
            <div className="absolute top-[-30%] left-[-20%] w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 text-white leading-tight">
                Upgrade Your Content Velocity <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81ecff] to-[#a68cff] text-glow">Today</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
                Connect your platforms, deploy your first automated swarm, and start scaling organic conversion channels.
              </p>
              
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-10 py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300"
              >
                Orchestrate Free Now
              </Link>
            </div>
          </div>

        </section>


        {/* ==================== PREMIUM FOOTER ==================== */}
        <footer className="w-full border-t border-white/5 bg-[#03060d]/80 py-16 relative z-10 text-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6200EE] to-[#81ecff] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black tracking-tight text-white">
                planvIx
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-md">
              Powered by autonomous agent clusters compiling factual reports, vision brand prose, and semantic SEO tags in parallel.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase font-black tracking-widest text-slate-500 mt-4">
              <button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => scrollToSection('problem')} className="hover:text-white transition-colors">Approach</button>
              <button onClick={() => scrollToSection('agents')} className="hover:text-white transition-colors">AI Agents</button>
              <button onClick={() => scrollToSection('demo')} className="hover:text-white transition-colors">Sandbox</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button>
            </div>

            <div className="h-[1px] bg-white/5 w-full max-w-3xl my-4" />

            <div className="text-[10px] text-slate-600 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between w-full max-w-3xl">
              <span>© 2026 planvIx Research Platform. All rights reserved.</span>
              <span className="flex gap-4 justify-center">
                <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
                <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              </span>
            </div>

          </div>
        </footer>

      </div>

    </div>
  );
}
