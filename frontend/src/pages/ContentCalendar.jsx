import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Plus, Users, Cpu } from 'lucide-react';

export default function ContentCalendar() {
  const [selectedDay, setSelectedDay] = useState(15);
  
  const daysInMonth = 31;
  const startDay = 3; // Wednesday
  
  // Dummy data representing content pills
  const contentMap = {
    5: [{ id: 1, type: 'tech', title: 'Tech Agent: AI UX Trends' }],
    8: [{ id: 2, type: 'marketing', title: 'Marketing: Weekly Newsletter' }],
    12: [{ id: 3, type: 'tech', title: 'Tech Agent: API Guide' }, { id: 4, type: 'marketing', title: 'Marketing: Social Blast' }],
    15: [{ id: 5, type: 'tech', title: 'Tech Agent: The Future of AI Design' }],
    20: [{ id: 6, type: 'marketing', title: 'Marketing: SEO Optimization' }],
    25: [{ id: 7, type: 'tech', title: 'Tech Agent: Next.js 14 Overview' }],
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d0e12] text-white p-6 relative overflow-hidden font-sans">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#6200EE]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#81ecff]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] relative z-10">
        
        {/* Main Calendar Area */}
        <div className="flex-1 bg-[#121318]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight font-['Manrope']">Content Calendar</h1>
            <div className="flex items-center gap-4">
              <div className="flex bg-[#18191e] rounded-xl border border-white/5 p-1">
                <button className="px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors"><ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                <div className="px-4 py-2 text-sm font-bold flex items-center">October 2026</div>
                <button className="px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors"><ChevronRight className="w-5 h-5 text-gray-400 hover:text-white" /></button>
              </div>
              <button className="group relative bg-[#18191e] border border-white/5 hover:border-[#6200EE]/50 px-5 py-2.5 rounded-xl transition-all duration-300 overflow-hidden flex items-center gap-2">
                 <div className="absolute inset-0 bg-gradient-to-r from-[#9ba8ff]/10 to-[#8999ff]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <Plus className="w-4 h-4 text-[#81ecff]" />
                 <span className="font-semibold text-sm">New Campaign</span>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col h-full ring-1 ring-white/5 rounded-2xl overflow-hidden bg-[#000000]/20">
            <div className="grid grid-cols-7 border-b border-white/5 bg-[#1e1f25]/50 backdrop-blur-md">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-[1px] bg-white/5">
              {/* Empty placeholder days */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-[#121318]/80 backdrop-blur-md p-2"></div>
              ))}
              
              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                const content = contentMap[day] || [];
                
                return (
                  <div 
                    key={day} 
                    onClick={() => setSelectedDay(day)}
                    className={`bg-[#0d0e12]/80 backdrop-blur-xl p-2 md:p-3 relative cursor-pointer transition-all duration-300 hover:bg-[#18191e] ${isSelected ? 'ring-2 ring-inset ring-[#6200EE] bg-[#1e1f25]' : ''}`}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-[#6200EE]/10 to-[#81ecff]/10 pointer-events-none"></div>}
                    <span className={`text-sm font-bold ${isSelected ? 'text-[#81ecff]' : 'text-gray-400'}`}>{day}</span>
                    
                    <div className="mt-2 space-y-1.5 overflow-hidden">
                      {content.map(item => (
                        <div key={item.id} className={`text-[10px] sm:text-xs px-2 py-1.5 rounded-md truncate border font-medium transition-all ${
                          item.type === 'tech' 
                            ? 'bg-[#003840]/30 border-[#00d4ec]/20 text-[#81ecff]' 
                            : 'bg-[#3b00a0]/30 border-[#a68cff]/20 text-[#d8caff]'
                        }`}>
                          {item.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sliding Details Panel (Right Side) */}
        <div className="w-full lg:w-96 bg-[#18191e]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
           {/* Decorative Edge Glow */}
           <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-[#81ecff]/30 to-transparent"></div>
           
           <h2 className="text-xl font-bold mb-1 font-['Manrope'] text-white">October {selectedDay}, 2026</h2>
           <p className="text-sm text-gray-500 mb-8">Daily Content Workflow</p>

           <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             
             {/* Scheduled Posts */}
             <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#81ecff]" /> Scheduled Posts
                </h3>
                {contentMap[selectedDay] ? (
                  <div className="space-y-3">
                    {contentMap[selectedDay].map(item => (
                      <div key={item.id} className="bg-[#24252b]/50 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                            item.type === 'tech' ? 'bg-[#003840] text-[#81ecff]' : 'bg-[#3b00a0] text-[#d8caff]'
                          }`}>{item.type === 'tech' ? 'Tech Agent' : 'Marketing Agent'}</span>
                          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">Drafting</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-[#121318] p-4 rounded-2xl border border-white/5 text-center">No posts scheduled.</div>
                )}
             </div>

             {/* Agent Suggestions */}
             <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#a68cff]" /> Agent Suggestions
                </h3>
                <div className="bg-gradient-to-br from-[#25006b]/20 to-transparent border border-[#591adc]/30 rounded-2xl p-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9ba8ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-sm text-gray-300 mb-3 relative z-10">I noticed a gap in engagement on Wednesdays. Would you like me to draft a quick 'Mid-week Tech Tip'?</p>
                  <button className="text-xs font-bold text-[#81ecff] flex items-center gap-1 hover:text-white transition-colors relative z-10">
                    Generate Draft <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
             </div>

             {/* Approval Workflow */}
             <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Approval Workflow
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-[#121318] border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     </div>
                     <div>
                       <p className="text-sm text-white font-medium">Idea Generation</p>
                       <p className="text-xs text-gray-500">Completed by Tech Agent</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 relative">
                     <div className="absolute top-[-20px] left-[15px] w-[2px] h-[16px] bg-white/10"></div>
                     <div className="w-8 h-8 rounded-full bg-[#121318] border border-[#a68cff]/50 flex items-center justify-center flex-shrink-0 relative">
                        <div className="absolute inset-[-4px] border border-[#a68cff]/20 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 rounded-full bg-[#a68cff]"></div>
                     </div>
                     <div>
                       <p className="text-sm text-white font-medium">Drafting Content</p>
                       <p className="text-xs text-[#a68cff]">In progress...</p>
                     </div>
                  </div>
                </div>
             </div>

           </div>
        </div>
      </div>
    </div>
  );
}
