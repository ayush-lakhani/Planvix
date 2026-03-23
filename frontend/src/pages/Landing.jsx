import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, Cpu, Zap, ArrowRight, CheckCircle2, Globe, Shield, Activity } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Landing() {
  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#06070a] text-white selection:bg-[#81ecff]/30 overflow-hidden font-sans">
      
      {/* Background Ambient Effects (Aether Flux aesthetic) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Right Prism Glow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-[#81ecff]/20 to-[#6200EE]/20 blur-[120px] rounded-full mix-blend-screen opacity-70"></div>
        {/* Bottom Left Deep Purple */}
        <div className="absolute -bottom-60 -left-40 w-[800px] h-[800px] bg-gradient-to-tr from-[#3b00a0]/30 to-transparent blur-[150px] rounded-full mix-blend-screen opacity-80"></div>
        {/* Center Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMzloNDBNMzkgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"></div>
      </div>

      <div className="relative z-10 w-full">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          
          <div 
            data-aos="fade-down"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <Sparkles className="w-4 h-4 text-[#81ecff]" />
            <span className="text-sm font-semibold tracking-wide text-slate-300">Introducing Planvx Multi-Agent Architecture</span>
          </div>

          <h1 
            data-aos="fade-up" data-aos-delay="100"
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8"
          >
            The Orchestrator of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81ecff] via-white to-[#a68cff] drop-shadow-[0_0_30px_rgba(129,236,255,0.3)]">
              Premium Content
            </span>
          </h1>

          <p 
            data-aos="fade-up" data-aos-delay="200"
            className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed"
          >
            Empower your strategy with a symphony of autonomous AI agents. Planvx delegates research, 
            drafting, and SEO optimization to specialized models, delivering high-converting content at lightspeed.
          </p>

          <div 
            data-aos="fade-up" data-aos-delay="300"
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
          >
            <Link 
              to="/signup"
              className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#6200EE] to-[#3b00a0] rounded-xl text-white font-bold text-lg overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(98,0,238,0.5)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span>Start Orchestrating Free</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/login"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md rounded-xl text-white font-bold text-lg transition-all"
            >
              <Globe className="w-5 h-5 mr-2 text-slate-400" />
              <span>View Live Demo</span>
            </Link>
          </div>
        </section>

        {/* FEATURES / AGENTS SECTION */}
        <section className="py-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-5xl font-black mb-6">A Network of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a68cff] to-[#81ecff]">Specialized Minds</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">Why rely on one model when you can deploy an entire agency? Our specialized agents work in tandem to execute complex content strategies.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Agent 1 */}
              <div data-aos="fade-up" data-aos-delay="100" className="group relative bg-[#0d0e12]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-[#1a1b23]/80 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#81ecff]/10 blur-3xl rounded-full group-hover:bg-[#81ecff]/20 transition-all"></div>
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Database className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Tech Researcher</h3>
                <p className="text-slate-400 leading-relaxed mb-6">Scours the web for the latest data, API changes, and technical literature to ensure your content is factually flawless.</p>
                <div className="flex items-center text-sm font-semibold text-emerald-400 bg-emerald-500/10 w-max px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Data Validated
                </div>
              </div>

              {/* Agent 2 */}
              <div data-aos="fade-up" data-aos-delay="200" className="group relative bg-[#0d0e12]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-[#1a1b23]/80 transition-all duration-500 overflow-hidden shadow-[0_0_30px_rgba(98,0,238,0.1)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#a68cff]/10 blur-3xl rounded-full group-hover:bg-[#a68cff]/20 transition-all"></div>
                <div className="w-14 h-14 bg-[#6200EE]/20 border border-[#6200EE]/30 rounded-2xl flex items-center justify-center mb-6">
                  <Cpu className="w-7 h-7 text-[#a68cff]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Master Copywriter</h3>
                <p className="text-slate-400 leading-relaxed mb-6">Synthesizes research into engaging, human-sounding prose tailored perfectly to your brand's unique tone of voice.</p>
                <div className="flex items-center text-sm font-semibold text-[#a68cff] bg-[#6200EE]/20 w-max px-3 py-1 rounded-full">
                  <Zap className="w-4 h-4 mr-1.5" /> High Conversion
                </div>
              </div>

              {/* Agent 3 */}
              <div data-aos="fade-up" data-aos-delay="300" className="group relative bg-[#0d0e12]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-[#1a1b23]/80 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-all"></div>
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Activity className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">SEO Analyst</h3>
                <p className="text-slate-400 leading-relaxed mb-6">Injects semantic keywords, optimizes headers, and structures the final output to dominate search engine rankings.</p>
                <div className="flex items-center text-sm font-semibold text-amber-400 bg-amber-500/10 w-max px-3 py-1 rounded-full">
                  <Shield className="w-4 h-4 mr-1.5" /> Rank Optimized
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PERFORMANCE / METRICS SECTION */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-[#12131a] to-[#0a0b0f] border border-white/5 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
              
              {/* Metric Background flare */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#6200EE]/20 blur-[100px] rounded-[100%] pointer-events-none mix-blend-screen"></div>

              <div className="w-full md:w-1/2 relative z-10" data-aos="fade-right">
                <h2 className="text-3xl md:text-5xl font-black mb-6">Unprecedented <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#81ecff]">Velocity</span></h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Companies using Planvx experience a paradigm shift in content production. 
                  Reduce drafting time from days to minutes without sacrificing quality.
                </p>
                <ul className="space-y-4">
                  {[
                    "Generate 10x more content per week",
                    "Maintain 100% brand voice consistency",
                    "Automated SEO optimization pre-publish"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full md:w-1/2 relative z-10" data-aos="fade-left">
                <div className="bg-[#0d0e12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                   <div className="flex items-center justify-between mb-6">
                     <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Average ROI</span>
                     <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                       +314%
                     </span>
                   </div>
                   <div className="text-6xl font-black text-white mb-2 tracking-tight">$12.4k</div>
                   <p className="text-slate-400 text-sm mb-8">Value generated per month on Pro tier.</p>
                   
                   {/* Decorative Chart Line */}
                   <div className="h-24 w-full flex items-end gap-2">
                     {[30, 45, 25, 60, 40, 75, 55, 90, 80, 100].map((h, i) => (
                       <div key={i} className="relative w-full bg-white/5 rounded-t-sm overflow-hidden" style={{ height: '100%' }}>
                         <div 
                           className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#6200EE] to-[#81ecff] rounded-t-sm" 
                           style={{ height: `${h}%` }}
                           data-aos="slide-up"
                           data-aos-delay={i * 50}
                         ></div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 relative text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-[radial-gradient(ellipse_at_center,rgba(98,0,238,0.2),transparent_70%)] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4" data-aos="zoom-y-out">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">Ready to upgrade your workflow?</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Join elite teams scaling their content operations with Planvx's Multi-Agent architecture.</p>
            <Link 
              to="/signup"
              className="inline-flex items-center justify-center px-10 py-5 bg-white text-black rounded-full font-black text-xl hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
             <Bot className="w-5 h-5" />
             <span className="font-bold tracking-widest uppercase">Planvx © 2026</span>
          </div>
          <p>Powered by Advanced Generative AI Models.</p>
        </footer>

      </div>
    </div>
  );
}

// Dummy lucide icon Database import substitution to prevent crash
function Database(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
