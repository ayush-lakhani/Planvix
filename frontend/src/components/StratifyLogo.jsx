// Style 1: Minimal Pulse (ChatGPT-like)
export function MinimalPulseLogo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizes[size]} relative`}>
      {/* Outer pulse ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 animate-ping opacity-20"></div>
      
      {/* Main circle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 animate-pulse-slow shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-black" style={{ 
            fontSize: size === 'xl' ? '2.5rem' : size === 'lg' ? '1.75rem' : size === 'md' ? '1.25rem' : '0.875rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            S
          </span>
        </div>
      </div>
      
      {/* Subtle glow */}
      <div className="absolute inset-[-20%] rounded-full bg-primary-500/20 blur-xl animate-pulse-slow"></div>
    </div>
  );
}

// Style 2: Rotating Hexagon (GitHub Copilot-like)
export function HexagonLogo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizes[size]} relative`}>
      {/* Rotating hexagon */}
      <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '12s' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <polygon 
            points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" 
            fill="url(#hexGrad)"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>
      
      {/* Center S */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-black z-10" style={{ 
          fontSize: size === 'xl' ? '2rem' : size === 'lg' ? '1.5rem' : size === 'md' ? '1rem' : '0.75rem',
          textShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>
          S
        </span>
      </div>
    </div>
  );
}

// Style 3: Gradient Orb (Perplexity-like)
export function GradientOrbLogo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizes[size]} relative`}>
      {/* Floating orb with gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 via-accent-500 to-pink-600 animate-float shadow-2xl"
           style={{ 
             boxShadow: '0 10px 40px rgba(124, 58, 237, 0.4), inset 0 -20px 40px rgba(0,0,0,0.2), inset 0 20px 40px rgba(255,255,255,0.2)'
           }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-black" style={{ 
            fontSize: size === 'xl' ? '2.5rem' : size === 'lg' ? '1.75rem' : size === 'md' ? '1.25rem' : '0.875rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            S
          </span>
        </div>
      </div>
      
      {/* Glow layers */}
      <div className="absolute inset-[-10%] rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 blur-xl animate-pulse-slow"></div>
    </div>
  );
}

// Style 4: Spinning Ring (Claude-like)
export function SpinningRingLogo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizes[size]} relative`}>
      {/* Spinning ring */}
      <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ animationDuration: '10s' }}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 via-accent-500 to-pink-500 opacity-90"
             style={{ 
               clipPath: 'polygon(0% 0%, 100% 0%, 100% 30%, 0% 30%)',
               boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)'
             }}>
        </div>
      </div>
      
      {/* Inner circle */}
      <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-primary-600 to-accent-600 shadow-xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-black" style={{ 
            fontSize: size === 'xl' ? '2rem' : size === 'lg' ? '1.5rem' : size === 'md' ? '1rem' : '0.75rem',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}>
            S
          </span>
        </div>
      </div>
    </div>
  );
}

// Style 5: Ethereal Architect (Aether Flux Theme)
export function EtherealArchitectLogo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizes[size]} relative group`}>
      {/* Outer Glow Bloom */}
      <div className="absolute inset-[-20%] rounded-full bg-gradient-to-br from-[#81ecff]/40 to-[#6200EE]/40 blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
      
      {/* Glassmorphic Base */}
      <div className="absolute inset-0 rounded-2xl bg-[#0d0e12]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(98,0,238,0.4)] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
        
        {/* Inner glowing element */}
        <div className="absolute inset-[2px] rounded-xl bg-gradient-to-br from-[#9ba8ff]/20 to-transparent"></div>
        
        <span className="relative text-transparent bg-clip-text bg-gradient-to-br from-[#81ecff] to-[#a68cff] font-black" style={{ 
          fontSize: size === 'xl' ? '2.5rem' : size === 'lg' ? '1.75rem' : size === 'md' ? '1.25rem' : '0.875rem',
          letterSpacing: '-0.05em'
        }}>
          P
        </span>
      </div>
    </div>
  );
}

// Style 6: Prism Planner Logo (Planvx)
export function PrismPlannerLogo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizes[size]} relative group flex items-center justify-center`}>
      {/* Outer Glow Bloom */}
      <div className="absolute inset-[-20%] rounded-full bg-gradient-to-br from-[#81ecff]/30 to-[#6200EE]/30 blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
      
      {/* Container to prevent overflow for beams */}
      <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        
        {/* White Light Beam Entering */}
        <div className="absolute left-[-20%] top-[40%] w-[140%] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent -translate-x-1/2 -rotate-12 opacity-80 z-0 select-none pointer-events-none group-hover:w-[160%] transition-all duration-700"></div>
        
        {/* Main Glass Prism (Hexagonal or Diamond shape) */}
        <div className="w-[85%] h-[85%] bg-white/5 backdrop-blur-xl border border-white/20 rotate-45 transform flex items-center justify-center overflow-hidden rounded-lg shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] z-10">
           {/* Inner Refraction */}
           <div className="absolute inset-0 bg-gradient-to-br from-[#81ecff]/40 to-[#a68cff]/40 mix-blend-screen opacity-50"></div>
           <div className="absolute inset-0 bg-gradient-to-tl from-[#6200EE]/20 to-transparent"></div>
        </div>

        {/* Scattered Color Beams Exiting */}
        <div className="absolute right-[-30%] top-[30%] w-[80%] h-[2px] bg-gradient-to-r from-[#81ecff] to-transparent rotate-[15deg] opacity-90 shadow-[0_0_8px_#81ecff] z-0 pointer-events-none group-hover:right-[-40%] transition-all duration-500"></div>
        <div className="absolute right-[-30%] top-[50%] w-[80%] h-[2px] bg-gradient-to-r from-[#a68cff] to-transparent rotate-[-5deg] opacity-90 shadow-[0_0_8px_#a68cff] z-0 pointer-events-none group-hover:right-[-40%] transition-all duration-700"></div>
        <div className="absolute right-[-30%] bottom-[30%] w-[80%] h-[2px] bg-gradient-to-r from-[#6200EE] to-transparent rotate-[25deg] opacity-90 shadow-[0_0_8px_#6200EE] z-0 pointer-events-none group-hover:right-[-40%] transition-all duration-500 delay-75"></div>

        {/* The 'P' */}
        <span className="absolute text-white font-black drop-shadow-lg z-20" style={{ 
          fontSize: size === 'xl' ? '2.5rem' : size === 'lg' ? '1.75rem' : size === 'md' ? '1.25rem' : '0.875rem',
          letterSpacing: '-0.05em'
        }}>
          P
        </span>
      </div>
    </div>
  );
}

// Main export - you can switch between styles
export default PrismPlannerLogo; // Used for Planvx





