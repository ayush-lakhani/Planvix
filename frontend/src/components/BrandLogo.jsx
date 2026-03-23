import PrismPlannerLogo from './StratifyLogo';
import { Link } from 'react-router-dom';

export function BrandLogo({ className }) {
  return (
    <Link to="/" className={`flex items-center gap-4 group transition-opacity hover:opacity-90 ${className}`}>
      <PrismPlannerLogo size="xl" />
      <div className="flex flex-col">
        <h1 className="text-4xl font-black bg-gradient-to-r from-white to-[#a68cff] bg-clip-text text-transparent leading-none tracking-tight">
          Planvx
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
          Content Orchestrator
        </p>
      </div>
    </Link>
  );
}

export { BrandLogo as AgentDotsLogo };
export default BrandLogo;

