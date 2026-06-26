import React, { useState } from 'react';
import { Target, Users, Briefcase, Share2, Sparkles, FileText, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

export default function StrategyForm({ onGenerate, loading }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goal: '',
    audience: '',
    industry: 'SaaS (Software as a Service)',
    platform: 'Instagram',
    contentType: 'Mixed Content',
    experience: 'beginner',
    strategy_mode: 'conservative'
  });
  
  const [errors, setErrors] = useState({});

  const platforms = ['Instagram', 'LinkedIn', 'TikTok', 'Twitter/X', 'Facebook', 'YouTube'];
  
  const industries = [
    'SaaS (Software as a Service)',
    'AI & Machine Learning',
    'E-commerce',
    'Luxury Goods',
    'F&B (Food & Beverage)',
    'Healthcare & Medical',
    'Education & EdTech',
    'Financial Services',
    'Real Estate',
    'Consulting & Strategy',
    'Entertainment & Events',
    'Travel & Tourism',
    'Automotive',
    'Renewable Energy',
    'Other'
  ];

  const contentTypes = [
    'Mixed Content', 
    'Reels/Short Videos', 
    'Posts/Feed Content', 
    'Stories', 
    'Carousels', 
    'Long-Form Videos', 
    'Blogs/Articles', 
    'Live Streams'
  ];

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (formData.goal.length < 10) {
        newErrors.goal = 'Describe your goal in more detail (at least 10 chars)';
      }
      if (formData.audience.length < 5) {
        newErrors.audience = 'Describe your audience in more detail (at least 5 chars)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    
    if (!validateStep(3)) return;

    const safeData = {
      goal: formData.goal.substring(0, 500),
      audience: formData.audience.substring(0, 200),
      industry: formData.industry.substring(0, 100),
      platform: formData.platform || "Instagram",
      contentType: formData.contentType || "Mixed Content",
      experience: formData.experience || "beginner",
      strategy_mode: formData.strategy_mode || "conservative"
    };

    onGenerate(safeData);
  };

  return (
    <div className="bg-[#090d16]/50 border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden animate-slide-up h-[600px] flex flex-col justify-between">
      
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full" />

      {/* Stepper Header */}
      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">Strategy Swarm Wizard</h2>
          </div>
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
            Step {step} of 3
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-white/5 h-1 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#6200EE] to-[#81ecff] transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps contents */}
      <div className="flex-1 overflow-y-auto pr-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <Input
                label="Primary Business Goal"
                icon={Target}
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="e.g. Acquire 20 active coffee subscriptions"
                error={errors.goal}
                helperText={`${formData.goal.length}/500 characters maximum`}
                required
              />
              <Input
                label="Target Audience Brief"
                icon={Users}
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="e.g. Young professionals in tech aged 25-35"
                error={errors.audience}
                helperText="Specify demographics and user pain points"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <Select
                label="Target Platform"
                icon={Share2}
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              >
                {platforms.map(p => (
                  <option key={p} value={p} className="bg-[#0b0f19] text-white">{p}</option>
                ))}
              </Select>

              <Select
                label="Industry Vertical"
                icon={Briefcase}
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind} className="bg-[#0b0f19] text-white">{ind}</option>
                ))}
              </Select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <Select
                label="Content Blueprint Style"
                icon={FileText}
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
              >
                {contentTypes.map(c => (
                  <option key={c} value={c} className="bg-[#0b0f19] text-white">{c}</option>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                    Audience Experience
                  </label>
                  <div className="flex gap-2">
                    {['beginner', 'intermediate', 'expert'].map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => setFormData({ ...formData, experience: exp })}
                        className={`flex-1 py-3.5 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                          formData.experience === exp
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                            : 'bg-[#0d1321]/45 border-white/10 text-slate-500 hover:border-white/20'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                    Strategy Mode
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'conservative', label: 'Balanced' },
                      { id: 'bold', label: 'Visionary' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, strategy_mode: mode.id })}
                        className={`flex-1 py-3.5 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                          formData.strategy_mode === mode.id
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                            : 'bg-[#0d1321]/45 border-white/10 text-slate-500 hover:border-white/20'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={step === 1 || loading}
          className="flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        {step < 3 ? (
          <Button
            onClick={handleNext}
            className="flex items-center gap-1.5"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={loading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
          >
            <Zap className="w-4 h-4" />
            <span>Generate Strategy</span>
          </Button>
        )}
      </div>

    </div>
  );
}

