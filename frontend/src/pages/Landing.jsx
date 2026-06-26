import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, Sparkles, Cpu, Zap, ArrowRight, CheckCircle2, Globe, Shield, 
  Activity, Database, Star, Check, ChevronDown, ChevronUp, Terminal, 
  Users, TrendingUp, HelpCircle, Award, Play 
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Landing() {
  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  // --- Multi-Agent Simulation State ---
  const [simStep, setSimStep] = useState(0);
  const [simRunning, setSimRunning] = useState(true);
  const simInterval = useRef(null);

  const simulationSteps = [
    {
      agent: 'Chief Orchestrator',
      action: 'Decomposing campaign strategy...',
      status: 'active',
      icon: Bot,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      logs: [
        'Analyze goal: "Scale organic signups via LinkedIn"',
        'Identify target audience: B2B Developers & CTOs',
        'Assign tasks to Tech Researcher & Copywriter...'
      ]
    },
    {
      agent: 'Tech Researcher',
      action: 'Scouring web & databases for B2B insights...',
      status: 'pending',
      icon: Database,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      logs: [
        'Searching GitHub trends & developer reports 2026',
        'Extracting key statistics on developer productivity',
        'Verified: "AI workflow saves 14 hrs/week on average"'
      ]
    },
    {
      agent: 'Master Copywriter',
      action: 'Drafting high-conversion B2B copy...',
      status: 'pending',
      icon: Cpu,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      logs: [
        'Apply Framework: Hook -> Value -> Social Proof -> CTA',
        'Drafting Option A: Tech-savvy and direct brand voice',
        'Synthesizing statistics into educational carousel format'
      ]
    },
    {
      agent: 'SEO Analyst',
      action: 'Optimizing semantic relevance & headers...',
      status: 'pending',
      icon: TrendingUp,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      logs: [
        'Inject keywords: "developer workflow", "B2B AI scaling"',
        'Optimized structure: H1, meta desc & keyword density',
        'Estimated organic visibility increase: +42%'
      ]
    },
    {
      agent: 'Security Critic',
      action: 'Verifying brand alignment & compliance...',
      status: 'pending',
      icon: Shield,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      logs: [
        'Running safety filter: No forbidden claims found',
        'Check brand consistency: 98% match with tone guidelines',
        'Verdict: APPROVED for B2B channels'
      ]
    }
  ];

  useEffect(() => {
    if (simRunning) {
      simInterval.current = setInterval(() => {
        setSimStep((prev) => (prev + 1) % (simulationSteps.length + 1));
      }, 3500);
    }
    return () => clearInterval(simInterval.current);
  }, [simRunning]);

  const restartSimulation = () => {
    setSimStep(0);
    setSimRunning(true);
  };

  // --- ROI Calculator State ---
  const [volume, setVolume] = useState(15);
  const [method, setMethod] = useState('freelancer');

  const calculateROI = () => {
    let monthlyCost = 0;
    let timeTaken = 0;
    const planvixCost = 49; // Pro plan equivalent in USD/month

    if (method === 'freelancer') {
      monthlyCost = volume * 120; // $120/post
      timeTaken = volume * 6; // 6 hours coordination/revision
    } else if (method === 'standard_ai') {
      monthlyCost = 20; // $20/month AI tools
      timeTaken = volume * 2.5; // 2.5 hours editing placeholder text
    } else {
      monthlyCost = planvixCost;
      timeTaken = volume * 0.15; // 9 minutes review per post
    }

    const savedCost = Math.max(0, (method === 'freelancer' ? monthlyCost : monthlyCost) - planvixCost);
    const savedTime = Math.max(0, (method === 'freelancer' ? 6 : 2.5) * volume - (0.15 * volume));

    return {
      monthlyCost: monthlyCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).replace('INR', '₹'),
      savedCost: savedCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).replace('INR', '₹'),
      savedTime: Math.round(savedTime),
      roiPercentage: monthlyCost > 0 ? Math.round(((savedCost) / planvixCost) * 100) : 0
    };
  };

  const roi = calculateROI();

  // --- FAQ Accordion State ---
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // --- Features Tabs ---
  const [activeTab, setActiveTab] = useState(0);

  const tabsInfo = [
    {
      title: 'Chief Orchestrator',
      desc: 'The master intelligence that coordinates campaigns, breaks down strategies, and manages downstream agent execution flows.',
      model: 'Llama 3.3 (70B)',
      speed: '0.8s execution',
      metric: '99.4% task delegation success',
      color: 'from-violet-500 to-indigo-600',
      bullets: [
        'Parses goal descriptions and targets',
        'Assigns parallel tasks dynamically to specialized sub-agents',
        'Verifies compliance checks before output delivery'
      ]
    },
    {
      title: 'Tech Researcher',
      desc: 'Connects to live search engines, database queries, and scientific literature to extract verified facts and technical guidelines.',
      model: 'Llama 3.3 (70B) + WebSearch',
      speed: '2.1s search latency',
      metric: '98.7% fact accuracy',
      color: 'from-emerald-400 to-cyan-500',
      bullets: [
        'Real-time web browsing and API document queries',
        'Synthesizes industry statistics and whitepapers',
        'Filters outdated developer documentation'
      ]
    },
    {
      title: 'Master Copywriter',
      desc: 'Crafts conversion-optimized, engaging drafts matching your brand voice guidelines, formatting, and social media specifications.',
      model: 'Llama 3.3 (70B) + Brand Tuned',
      speed: '1.2s generation',
      metric: '94.2% initial-draft approval',
      color: 'from-indigo-400 to-purple-600',
      bullets: [
        'Applies high-conversion marketing frameworks (AIDA/PAS)',
        'Adapts tone (technical, playful, professional) dynamically',
        'Outputs formatted drafts with appropriate code blocks'
      ]
    },
    {
      title: 'SEO & Growth Analyst',
      desc: 'Scrapes keyword competitiveness, structures heading hierarchy, and injects semantic terms for search ranking supremacy.',
      model: 'Llama 3.3 (70B) + SearchRanker',
      speed: '1.5s analysis',
      metric: '42% average traffic uplift',
      color: 'from-amber-400 to-orange-500',
      bullets: [
        'Analyses search intent and recommends optimal tags',
        'Generates metadata and keyword density metrics',
        'Formulates organic distribution recommendations'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Background Lights (Ambient Glassmorphism Grid) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Top Right Glow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/10 to-indigo-500/10 dark:from-[#81ecff]/10 dark:to-indigo-500/10 blur-[130px] rounded-full"></div>
        {/* Left Amethyst Flare */}
        <div className="absolute top-[30%] -left-60 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/5 to-transparent dark:from-purple-500/10 dark:to-transparent blur-[150px] rounded-full"></div>
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMzloNDBNMzkgMHY0MCIgc3Ryb2tlPSJyZ2JhKDAsMCw5MCwwLjAzNSkiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPgo8L3N2Zy4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMzloNDBNMzkgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDI1IiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTM5IDM5aDF2MUgzOXoiIGZpbGw9Im5vbmUiLz4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]"></div>
      </div>

      <div className="relative z-10 w-full">
        
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          
          {/* Badge */}
          <div 
            data-aos="fade-down"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 backdrop-blur-xl mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-[#81ecff]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
              Introducing planvIx Multi-Agent Crew 2.0
            </span>
          </div>

          {/* Heading */}
          <h1 
            data-aos="fade-up" data-aos-delay="100"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8 max-w-5xl"
          >
            The Orchestrator of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500 dark:from-[#81ecff] dark:via-white dark:to-[#a68cff] drop-shadow-[0_0_30px_rgba(129,236,255,0.15)]">
              High-Converting Content
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            data-aos="fade-up" data-aos-delay="200"
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mb-10 leading-relaxed"
          >
            Empower your SaaS strategy with a collaborative crew of autonomous AI agents. planvIx coordinates 
            live web research, SEO auditing, and compliant copy drafting—delivering marketing blueprints at lightspeed.
          </p>

          {/* CTAs */}
          <div 
            data-aos="fade-up" data-aos-delay="300"
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-20"
          >
            <Link 
              to="/signup"
              className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-700 dark:from-indigo-500 dark:to-violet-600 rounded-xl text-white font-bold text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(98,0,238,0.4)] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
            >
              <span>Start Orchestrating Free</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/login"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 backdrop-blur-md rounded-xl text-slate-900 dark:text-white font-semibold text-base transition-all duration-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
            >
              <Globe className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
              <span>View Live Demo</span>
            </Link>
          </div>

          {/* --- Interactive Simulation Dashboard --- */}
          <div 
            data-aos="zoom-in" data-aos-delay="400"
            className="w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden"
          >
            {/* Window controls */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2 tracking-wide font-mono">
                  multi-agent-simulator.log
                </span>
              </div>
              <button 
                onClick={restartSimulation}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20"
              >
                <Play className="w-3 h-3" />
                <span>Re-run Campaign Simulator</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Agent List Pane */}
              <div className="lg:col-span-1 border-r border-transparent lg:border-slate-200 lg:dark:border-slate-800/80 pr-0 lg:pr-6 space-y-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                  Active Agents
                </span>
                
                {simulationSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCurrent = simStep === idx;
                  const isCompleted = simStep > idx;

                  return (
                    <div 
                      key={step.agent}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-500/40 shadow-sm' 
                          : isCompleted 
                            ? 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 opacity-80'
                            : 'bg-transparent border-transparent opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${step.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {step.agent}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {isCurrent ? 'Running...' : isCompleted ? 'Completed' : 'Queued'}
                          </p>
                        </div>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                        {isCurrent && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping flex-shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Terminal Logs Pane */}
              <div className="lg:col-span-2 flex flex-col justify-between min-h-[300px]">
                <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-3 overflow-y-auto flex-1 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-800">
                    <span>Campaign Objective: Scale SaaS Product</span>
                    <span>v2.0</span>
                  </div>

                  {simulationSteps.map((step, idx) => {
                    if (simStep < idx) return null;
                    return (
                      <div key={step.agent} className="space-y-1 animate-fadeIn">
                        <span className="text-[#81ecff] font-semibold">{`planvix@${step.agent.toLowerCase().replace(' ', '-')}:~$`}</span>
                        <span className="text-white ml-2">{step.action}</span>
                        {simStep >= idx && step.logs.map((log, lIdx) => (
                          <div key={lIdx} className="text-slate-400 pl-4 flex items-start gap-1">
                            <span className="text-slate-600 select-none">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  {simStep === 5 && (
                    <div className="text-emerald-400 font-semibold animate-pulse pt-2">
                      [SUCCESS] Full Content Blueprint generated. Exiting process.
                    </div>
                  )}
                </div>

                {/* Simulated Campaign Output View */}
                {simStep === 5 && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        Generated Strategy Blueprint snippet
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Score: 98%</span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Target Title: "How We Saved 14 Hours of Developer Workflow Effort Weekly"
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      Discover the exact steps of multi-agent orchestration. We leverage database scraping, brand tuning, and SEO-guided semantic keywords to maximize LinkedIn and Google organic reach...
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </section>

        {/* LOGO WALL / TRUST */}
        <section className="py-12 border-t border-b border-slate-200 dark:border-slate-900 bg-slate-100/40 dark:bg-slate-950/20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">
              Orchestrating Growth and Brand Authority For Tech Teams Globally
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 dark:opacity-40">
              {/* Grayscale simplified logos */}
              <span className="text-lg md:text-xl font-extrabold text-slate-600 dark:text-slate-300 hover:opacity-100 transition-opacity">Y Combinator</span>
              <span className="text-lg md:text-xl font-extrabold text-slate-600 dark:text-slate-300 hover:opacity-100 transition-opacity">Vercel</span>
              <span className="text-lg md:text-xl font-extrabold text-slate-600 dark:text-slate-300 hover:opacity-100 transition-opacity">Product Hunt</span>
              <span className="text-lg md:text-xl font-extrabold text-slate-600 dark:text-slate-300 hover:opacity-100 transition-opacity">Stripe</span>
              <span className="text-lg md:text-xl font-extrabold text-slate-600 dark:text-slate-300 hover:opacity-100 transition-opacity">Supabase</span>
            </div>
          </div>
        </section>

        {/* INTERACTIVE CAPABILITIES SECTION */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              A Symphony of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-[#a68cff] dark:to-[#81ecff]">Specialized Minds</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
              Why rely on generic ChatGPT prompts when you can employ a cooperative network of expert agents? 
              Each agent works autonomously on their core domain, sharing results to build flawless campaigns.
            </p>
          </div>

          {/* Interactive tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Tab Selectors */}
            <div className="lg:col-span-4 space-y-2">
              {tabsInfo.map((tab, idx) => (
                <button
                  key={tab.title}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none flex items-center justify-between ${
                    activeTab === idx 
                      ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-lg scale-[1.02]' 
                      : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{tab.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{tab.desc}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 transition-transform ${activeTab === idx ? 'translate-x-1' : 'opacity-0'}`} />
                </button>
              ))}
            </div>

            {/* Tab Content Display */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl min-h-[380px] flex flex-col justify-between transition-all duration-300">
              
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full text-white bg-gradient-to-r ${tabsInfo[activeTab].color}`}>
                    Active Deployment
                  </span>
                  <div className="flex gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span>Model: {tabsInfo[activeTab].model}</span>
                    <span>•</span>
                    <span>Latency: {tabsInfo[activeTab].speed}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {tabsInfo[activeTab].title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                    {tabsInfo[activeTab].desc}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Core Capabilities
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tabsInfo[activeTab].bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Performance Metric:
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-lg">
                  {tabsInfo[activeTab].metric}
                </span>
              </div>

            </div>

          </div>
        </section>

        {/* INTERACTIVE ROI CALCULATOR SECTION */}
        <section className="py-24 bg-gradient-to-b from-transparent to-slate-100/50 dark:to-slate-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-16 border border-slate-800 shadow-2xl relative overflow-hidden">
              {/* Radial glow background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 items-center">
                
                {/* Sliders and Selectors */}
                <div className="lg:col-span-6 space-y-8">
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#81ecff]">Value Assessor</span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                      Calculate Your <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81ecff] to-[#a68cff]">Time & Capital ROI</span>
                    </h2>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between font-semibold">
                      <label htmlFor="volume-slider" className="text-sm text-slate-300">Monthly Content Volume</label>
                      <span className="text-lg text-white font-bold">{volume} pieces/month</span>
                    </div>
                    <input 
                      id="volume-slider"
                      type="range" 
                      min="5" 
                      max="100" 
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#81ecff]"
                    />
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>5</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Comparison Method Selector */}
                  <div className="space-y-3">
                    <span className="text-sm font-semibold text-slate-300 block">Compare against current workflow</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setMethod('freelancer')}
                        className={`p-3.5 rounded-xl border text-sm font-bold transition-all ${
                          method === 'freelancer' 
                            ? 'bg-white text-slate-950 border-white shadow-lg' 
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        Freelance Copywriter
                      </button>
                      <button 
                        onClick={() => setMethod('standard_ai')}
                        className={`p-3.5 rounded-xl border text-sm font-bold transition-all ${
                          method === 'standard_ai' 
                            ? 'bg-white text-slate-950 border-white shadow-lg' 
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        Traditional AI Tools
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calculation Results Card */}
                <div className="lg:col-span-6 bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
                    Estimated Net Savings
                  </span>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 block">Current Monthly Spend</span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-300">{roi.monthlyCost}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-emerald-400 block">Money Saved / Month</span>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400">{roi.savedCost}</span>
                    </div>
                  </div>

                  <hr className="border-slate-800" />

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 block">Orchestrator Time Saved</span>
                      <span className="text-2xl sm:text-3xl font-black text-[#81ecff]">{roi.savedTime} hrs</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 block">Equivalent ROI Uplift</span>
                      <span className="text-2xl sm:text-3xl font-black text-violet-400">+{roi.roiPercentage}%</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link 
                      to="/signup"
                      className="w-full inline-flex items-center justify-center py-4 bg-[#81ecff] hover:bg-[#5cdbf2] text-slate-950 font-black rounded-xl text-base transition-colors"
                    >
                      <span>Unlock Pro ROI Savings</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Configured For <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-[#a68cff] dark:to-[#81ecff]">Enterprise Scale</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
              Stateless horizontal scaling and flexible tiers. Switch from local memory fallbacks to high-capacity Redis caching seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Free Tier Card */}
            <div 
              data-aos="fade-right"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col justify-between shadow-xl hover:-translate-y-1 transition-transform"
            >
              <div>
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Standard Layer</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Free Tier</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Perfect for experiencing the multi-agent system and prototyping local strategies.
                </p>
                <div className="text-4xl font-extrabold text-slate-950 dark:text-white mb-6">₹0 <span className="text-xs font-normal text-slate-500">/ forever</span></div>
                
                <hr className="border-slate-100 dark:border-slate-800 mb-6" />

                <ul className="space-y-3.5">
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>2 strategies generated per minute</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Access to Tech Researcher & Copywriter</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-500 opacity-60">
                    <span className="text-xs select-none">✕</span>
                    <span>No priority API speed</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-500 opacity-60">
                    <span className="text-xs select-none">✕</span>
                    <span>No calendar integration</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link 
                  to="/signup"
                  className="w-full inline-flex items-center justify-center py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-slate-900 dark:text-white font-bold text-sm transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Pro Tier Card (Highlighted) */}
            <div 
              data-aos="fade-left"
              className="bg-slate-900 text-white border-2 border-indigo-500 dark:border-indigo-500/80 rounded-[2rem] p-8 flex flex-col justify-between shadow-2xl hover:-translate-y-1 transition-transform relative overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-5 right-5 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-2">Enterprise Layer</span>
                <h3 className="text-3xl font-black mb-4">Pro Tier</h3>
                <p className="text-slate-400 text-sm mb-6">
                  For creators, businesses, and content teams seeking full automation and priority volume.
                </p>
                <div className="text-4xl font-extrabold mb-6">₹1,999 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                
                <hr className="border-slate-800 mb-6" />

                <ul className="space-y-3.5">
                  <li className="flex items-center gap-3 text-sm text-slate-200">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>10 strategies generated per minute</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-200">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>Full 5-Agent crew access</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-200">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>Dynamic Calendar & SEO Audit tools</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-200">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>Stateless horizontal load balancing</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link 
                  to="/signup"
                  className="w-full inline-flex items-center justify-center py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white font-bold text-sm transition-colors shadow-lg hover:shadow-indigo-500/20"
                >
                  Start Pro Plan
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* TESTIMONIALS / TRUST */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-100/30 dark:bg-slate-900/10 border-t border-slate-200/60 dark:border-slate-900/60 rounded-[2.5rem] my-12">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Endorsed by B2B Growth Leaders
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base">
              See how modern SaaS founders and copywriters increase their monthly pipeline using planvIx.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "planvIx decreased our drafting cycles from 3 days to under 10 minutes. The fact verification is incredibly accurate.",
                author: "Ananya Mehta",
                role: "Director of Content, SaaSScale",
                stars: 5,
                tag: "B2B SaaS"
              },
              {
                quote: "The SEO Analyst subagent alone justified our migration. Our organic traffic increased by 314% within two months.",
                author: "Rohan Das",
                role: "Growth Head, DevFlow",
                stars: 5,
                tag: "SEO Growth"
              },
              {
                quote: "Stateless scalability means we can load-balance parallel agent calls without session conflicts. Excellent engineering.",
                author: "Vikram Malhotra",
                role: "VP of Engineering, ContentScale",
                stars: 5,
                tag: "Platform Scale"
              }
            ].map((test, idx) => (
              <div 
                key={idx}
                data-aos="fade-up" data-aos-delay={idx * 100}
                className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {[...Array(test.stars)].map((_, sIdx) => (
                      <Star key={sIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed">
                    "{test.quote}"
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{test.author}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{test.role}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    {test.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACCESSIBLE FAQ ACCORDION */}
        <section className="py-24 max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
              Frequently Answered Questions
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Answers to technical queries regarding security, horizontal scaling, and models.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does the multi-agent architecture work?",
                a: "Instead of calling a single AI prompt, planvIx employs multiple specialized agents in a sequence. The Chief Orchestrator delegates tasks to the Tech Researcher, Master Copywriter, SEO Analyst, and Security Critic, passing context asynchronously to assemble a complete campaign."
              },
              {
                q: "What happens if Redis goes offline?",
                a: "planvIx implements an automatic, production-grade local MemoryStorage fallback. Rate limits and sessions continue operating stateless and failover gracefully without returning HTTP 500 errors to client requests."
              },
              {
                q: "Is client rate limiting IP or API key based?",
                a: "It is fully configurable. planvIx evaluates rate limit metrics dynamically, prioritizing API keys first, followed by authenticated User IDs, and falling back to proxy-aware Client IPs."
              },
              {
                q: "How does trusted proxy forwarding work?",
                a: "We extract original client IPs by validating headers sequentially: CF-Connecting-IP, the first address in X-Forwarded-For, X-Real-IP, and then falling back to request.client.host."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={faqOpen === idx}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                  {faqOpen === idx ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                </button>

                {faqOpen === idx && (
                  <div 
                    id={`faq-answer-${idx}`}
                    className="p-5 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 animate-fadeIn"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 relative text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-[radial-gradient(ellipse_at_center,rgba(98,0,238,0.1),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(98,0,238,0.15),transparent_70%)] pointer-events-none" aria-hidden="true"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-8" data-aos="zoom-y-out">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
              Ready to Upgrade Your Copywriting Workflow?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Join SaaS leaders scaling content conversion organically using planvIx's stateless collaborative multi-agent architecture.
            </p>
            <div className="pt-2">
              <Link 
                to="/signup"
                className="inline-flex items-center justify-center px-10 py-5 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-full font-black text-base sm:text-lg hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-white/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
              >
                <span>Orchestrate Now Free</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 dark:border-slate-900 py-16 text-center text-slate-500 text-sm bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-left">
            <div>
              <h5 className="font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest text-xs mb-4">Product</h5>
              <ul className="space-y-2 text-xs">
                <li><Link to="/signup" className="hover:text-indigo-500 transition-colors">Free Registration</Link></li>
                <li><Link to="/login" className="hover:text-indigo-500 transition-colors">Simulator Demo</Link></li>
                <li><Link to="/upgrade" className="hover:text-indigo-500 transition-colors">Pricing Options</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest text-xs mb-4">Observability</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="http://127.0.0.1:8000/metrics" className="hover:text-indigo-500 transition-colors">Prometheus /metrics</a></li>
                <li><a href="http://127.0.0.1:8000/ready" className="hover:text-indigo-500 transition-colors">Readiness Probe /ready</a></li>
                <li><a href="http://127.0.0.1:8000/live" className="hover:text-indigo-500 transition-colors">Liveness Probe /live</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest text-xs mb-4">DevOps Config</h5>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>Rate Limit: Redis Failover</li>
                <li>Distributed Trace: X-Request-ID</li>
                <li>Security: HSTS / CSP Enabled</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest text-xs mb-4">Legal</h5>
              <ul className="space-y-2 text-xs">
                <li><span className="hover:text-indigo-500 transition-colors cursor-pointer">Security Audits</span></li>
                <li><span className="hover:text-indigo-500 transition-colors cursor-pointer">Terms & SLA</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-4 gap-4">
            <div className="flex items-center gap-2 opacity-60">
              <Bot className="w-5 h-5 text-indigo-600" />
              <span className="font-bold tracking-widest uppercase text-slate-800 dark:text-slate-200">PLANVIX © 2026</span>
            </div>
            <p className="text-xs text-slate-400">
              Powered by Llama 3.3 and planvIx Autonomous Agent Systems.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
