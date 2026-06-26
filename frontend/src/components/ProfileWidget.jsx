import React from 'react';
import { Zap, AlertCircle, Sparkles } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export default function ProfileWidget({ usageCount, totalAllowed = 3, tier = 'free', onUpgrade }) {
  const percentage = (usageCount / totalAllowed) * 100;
  const isCritical = usageCount >= 2;
  const strategiesLeft = totalAllowed - usageCount;
  
  if (tier !== 'free') {
    return (
      <div className="w-full p-5 rounded-[2rem] bg-gradient-to-r from-emerald-500/10 to-indigo-500/5 border border-emerald-500/20 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white uppercase tracking-wider">
                  Pro Plan Account
                </h3>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-xs font-semibold text-emerald-400 mt-1">
                ∞ Unlimited Strategy Swarm Generations
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`w-full p-5 rounded-[2rem] backdrop-blur-xl border relative overflow-hidden transition-all duration-300 ${
      isCritical 
        ? 'bg-gradient-to-r from-rose-500/5 to-amber-500/5 border-rose-500/20' 
        : 'bg-[#090d16]/50 border-white/5'
    }`}>
      
      {/* Glow backgrounds */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-40 ${
        isCritical ? 'bg-rose-500/10' : 'bg-indigo-500/10'
      }`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
            isCritical 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
            {isCritical ? (
              <AlertCircle className="w-6 h-6 animate-pulse" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-black text-base text-white uppercase tracking-wider">
              {usageCount} / {totalAllowed} Swarms Compiled
            </h3>
            <p className={`text-xs font-semibold mt-1 ${
              isCritical 
                ? 'text-rose-400' 
                : 'text-indigo-400'
            }`}>
              {isCritical 
                ? '⏳ Quota limit close. Upgrade to Pro for unlimited compilations.' 
                : strategiesLeft === 0 
                  ? '🎯 Standard Quota Full. Upgrade to Pro.' 
                  : `✨ ${strategiesLeft} strategies remaining for this cycle`
              }
            </p>
          </div>
        </div>
        
        {isCritical || strategiesLeft === 0 ? (
          <Button 
            onClick={onUpgrade}
            size="sm"
            className="flex items-center gap-1.5 shrink-0 self-start sm:self-center"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Upgrade Pro</span>
          </Button>
        ) : (
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest bg-white/5 border border-white/5 px-3 py-1 rounded-full shrink-0 w-max">
            {strategiesLeft} swarms left
          </span>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-5">
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              isCritical 
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' 
                : 'bg-gradient-to-r from-indigo-500 to-[#81ecff] shadow-[0_0_10px_rgba(99,102,241,0.3)]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 px-1">
          <span>{percentage.toFixed(0)}% quota consumed</span>
          <span>Resets on 1st of month</span>
        </div>
      </div>
    </div>
  );
}
