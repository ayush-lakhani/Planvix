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
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-6 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-[#6200EE]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 dark:bg-[#81ecff]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-4 sm:gap-6 h-[calc(100vh-8rem)] relative z-10">

        {/* Main Calendar Area */}
        <div className="flex-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent tracking-tight font-['Manrope']">Content Calendar</h1>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 p-1">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white" /></button>
                <div className="px-3 sm:px-4 py-2 text-sm font-bold flex items-center whitespace-nowrap">October 2026</div>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white" /></button>
              </div>
              <button className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-[#6200EE]/50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-300 overflow-hidden flex items-center gap-1 sm:gap-2">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-[#9ba8ff]/10 dark:to-[#8999ff]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-600 dark:text-[#81ecff]" />
                 <span className="font-semibold text-xs sm:text-sm">New Campaign</span>
               </button>
            </div>
          </div>

          {/* Calendar Grid - Horizontal scroll on mobile */}
          <div className="flex-1 flex flex-col min-h-0 ring-1 ring-slate-200 dark:ring-white/5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#000000]/20">
            {/* Day headers - Make them sticky and adjust width */}
            <div className="flex border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md shrink-0">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={day} className="flex-1 min-w-[50px] sm:min-w-0 py-2 sm:py-4 text-center text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">{day}</div>
              ))}
            </div>

            {/* Calendar days - Horizontal scroll container */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="grid grid-cols-7 min-w-[280px] sm:min-w-0 h-full auto-rows-fr gap-[1px] bg-slate-200 dark:bg-white/5">
                {/* Empty placeholder days */}
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md p-1 sm:p-2 min-h-[60px] sm:min-h-0"></div>
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
                      className={`bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-1 sm:p-2 md:p-3 relative cursor-pointer transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-900 min-h-[60px] sm:min-h-0 ${isSelected ? 'ring-2 ring-inset ring-indigo-500 dark:ring-[#6200EE] bg-indigo-50 dark:bg-slate-900' : ''}`}
                    >
                      {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 dark:from-[#6200EE]/10 to-cyan-500/10 dark:to-[#81ecff]/10 pointer-events-none"></div>}
                      <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-indigo-600 dark:text-[#81ecff]' : 'text-slate-500 dark:text-gray-400'}`}>{day}</span>

                      <div className="mt-1 sm:mt-2 space-y-1 overflow-hidden">
                        {content.map(item => (
                          <div key={item.id} className={`text-[9px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded truncate border font-medium ${
                            item.type === 'tech'
                              ? 'bg-cyan-50 dark:bg-[#003840]/30 border-cyan-200 dark:border-[#00d4ec]/20 text-cyan-700 dark:text-[#81ecff]'
                              : 'bg-indigo-50 dark:bg-[#3b00a0]/30 border-indigo-200 dark:border-[#a68cff]/20 text-indigo-700 dark:text-[#d8caff]'
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
        </div>

        {/* Sliding Details Panel (Right Side) - Full width on mobile */}
        <div className="w-full lg:w-80 xl:w-96 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
           {/* Decorative Edge Glow */}
           <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-400/30 dark:via-[#81ecff]/30 to-transparent"></div>

           <h2 className="text-lg sm:text-xl font-bold mb-1 font-['Manrope'] text-slate-900 dark:text-white">October {selectedDay}, 2026</h2>
           <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-500 mb-4 sm:mb-6">Daily Content Workflow</p>

           <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">

              {/* Scheduled Posts */}
              <div>
                 <h3 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                   <Cpu className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-600 dark:text-[#81ecff]" /> Scheduled Posts
                 </h3>
                 {contentMap[selectedDay] ? (
                   <div className="space-y-2 sm:space-y-3">
                     {contentMap[selectedDay].map(item => (
                       <div key={item.id} className="bg-slate-50/50 dark:bg-[#24252b]/50 border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4 hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                         <div className="flex justify-between items-start mb-2">
                           <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2 sm:py-1 rounded-md ${
                             item.type === 'tech' ? 'bg-cyan-100 dark:bg-[#003840] text-cyan-700 dark:text-[#81ecff]' : 'bg-indigo-100 dark:bg-[#3b00a0] text-indigo-700 dark:text-[#d8caff]'
                           }`}>{item.type === 'tech' ? 'Tech Agent' : 'Marketing Agent'}</span>
                           <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">Drafting</span>
                         </div>
                         <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-xs sm:text-sm text-slate-500 dark:text-gray-500 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center">No posts scheduled.</div>
                 )}
              </div>

              {/* Agent Suggestions */}
              <div>
                 <h3 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                   <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 dark:text-[#a68cff]" /> Agent Suggestions
                 </h3>
                 <div className="bg-gradient-to-br from-indigo-50 dark:from-[#25006b]/20 to-transparent border border-indigo-200 dark:border-[#591adc]/30 rounded-2xl p-3 sm:p-4 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 dark:from-[#9ba8ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 mb-2 sm:mb-3 relative z-10">I noticed a gap in engagement on Wednesdays. Would you like me to draft a quick 'Mid-week Tech Tip'?</p>
                   <button className="text-[10px] sm:text-xs font-bold text-cyan-600 dark:text-[#81ecff] flex items-center gap-1 hover:text-cyan-700 dark:hover:text-white transition-colors relative z-10">
                     Generate Draft <ChevronRight className="w-3 h-3" />
                   </button>
                 </div>
              </div>

              {/* Approval Workflow */}
              <div>
                 <h3 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                   <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" /> Approval Workflow
                 </h3>
                 <div className="space-y-3 sm:space-y-4">
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-50 dark:bg-slate-900 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                         <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-medium">Idea Generation</p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">Completed by Tech Agent</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 sm:gap-4 relative">
                      <div className="absolute top-[-16px] left-[14px] sm:left-[18px] w-[2px] h-[16px] bg-slate-200 dark:bg-white/10"></div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-[#a68cff]/50 flex items-center justify-center flex-shrink-0 relative">
                         <div className="absolute inset-[-4px] border border-indigo-300 dark:border-[#a68cff]/20 rounded-full animate-ping"></div>
                         <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500 dark:bg-[#a68cff]"></div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-medium">Drafting Content</p>
                        <p className="text-xs sm:text-sm text-indigo-500 dark:text-[#a68cff]">In progress...</p>
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
