import { useState } from 'react';
import { FileText, Search, Calendar, Download, RefreshCw, Copy, Check } from 'lucide-react';
import ShareButtons from './ShareButtons';

export default function StrategyResults({ strategy, onReset }) {
  // Defensive check - prevent crashes if strategy is undefined
  if (!strategy) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading strategy...</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('blueprint');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'blueprint', label: 'Strategic Overview', icon: FileText },
    { id: 'keywords', label: 'Keywords & SEO', icon: Search },
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'posts', label: 'Content Pillars', icon: FileText },
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(strategy, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content-strategy.json';
    link.click();
  };

  // Debug logging - helps diagnose data structure issues
  console.log('[STRATEGY RESULTS] Full strategy object:', strategy);
  console.log('[STRATEGY RESULTS] Strategy keys:', Object.keys(strategy));
  console.log('[STRATEGY RESULTS] Has strategic_overview?', !!strategy?.strategic_overview);
  console.log('[STRATEGY RESULTS] Has content_pillars?', !!strategy?.content_pillars);
  console.log('[STRATEGY RESULTS] Has content_calendar?', !!strategy?.content_calendar);
  console.log('[STRATEGY RESULTS] Has keywords?', !!strategy?.keywords);
  console.log('[STRATEGY RESULTS] Has roi_prediction?', !!strategy?.roi_prediction);

  return (
    <div className="animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Content Strategy
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            New Strategy
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass-card p-8">
        {/* Strategic Overview Tab */}
        {activeTab === 'blueprint' && (
          <div className="animate-slide-up space-y-6">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              📋 Strategic Overview
            </h3>
            
            {strategy?.strategic_overview ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-l-4 border-blue-500">
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Growth Objective</h4>
                  <p className="text-gray-700 dark:text-gray-300">{strategy.strategic_overview.growth_objective}</p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border-l-4 border-green-500">
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">Target Persona</h4>
                  <p className="text-gray-700 dark:text-gray-300">{strategy.strategic_overview.target_persona_snapshot}</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border-l-4 border-purple-500">
                  <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Positioning Angle</h4>
                  <p className="text-gray-700 dark:text-gray-300">{strategy.strategic_overview.positioning_angle}</p>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border-l-4 border-orange-500">
                  <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2">Competitive Edge</h4>
                  <p className="text-gray-700 dark:text-gray-300">{strategy.strategic_overview.competitive_edge}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">No strategic overview available</p>
              </div>
            )}
            
            {/* ROI Prediction */}
            {strategy?.roi_prediction && (
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-6 rounded-xl border-2 border-primary-200 dark:border-primary-800 mt-6">
                <h4 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-4">💰 Expected ROI</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Traffic Lift</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{strategy.roi_prediction.traffic_lift_percentage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                    <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{strategy.roi_prediction.engagement_boost_percentage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Reach</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{strategy.roi_prediction.estimated_monthly_reach}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{strategy.roi_prediction.conversion_rate_estimate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === 'keywords' && (
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">SEO & Discovery Pack</h3>
            
            {strategy?.keywords ? (
              <div className="space-y-6">
                {/* Primary Keywords */}
                {strategy.keywords.primary && strategy.keywords.primary.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-l-4 border-blue-500">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3">Primary Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {strategy.keywords.primary.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Long-tail Keywords */}
                {strategy.keywords.long_tail && strategy.keywords.long_tail.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border-l-4 border-green-500">
                    <h4 className="font-bold text-green-900 dark:text-green-100 mb-3">Long-tail Phrases</h4>
                    <ul className="space-y-2">
                      {strategy.keywords.long_tail.map((phrase, i) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">• {phrase}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Hashtags */}
                {strategy.keywords.hashtags && strategy.keywords.hashtags.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border-l-4 border-purple-500">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-3">Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {strategy.keywords.hashtags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">No keyword data available</p>
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Content Calendar</h3>
            {strategy?.content_calendar && strategy.content_calendar.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategy.content_calendar.map((item, index) => (
                  <div key={index} className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-6 rounded-xl border border-primary-200 dark:border-primary-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">Day {item.day}</span>
                      <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300">{item.format}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{item.theme}</h4>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">No calendar data available</p>
              </div>
            )}
          </div>
        )}

        {/* Content Pillars Tab */}
        {activeTab === 'posts' && (
          <div className="animate-slide-up">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Content Pillars & Sample Posts</h3>
            
            {strategy?.content_pillars && strategy.content_pillars.length > 0 ? (
              <div className="space-y-8">
                {strategy.content_pillars.map((pillar, pillarIndex) => (
                  <div key={pillarIndex} className="glass-card p-6">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{pillar.pillar_name}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{pillar.why_it_works}</p>
                    
                    {pillar.sample_posts && pillar.sample_posts.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pillar.sample_posts.map((post, postIndex) => (
                          <div key={postIndex} className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-6 rounded-xl">
                            <div className="mb-4">
                              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{post.format}</span>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Hook</span>
                                <p className="text-gray-900 dark:text-white font-medium">{post.hook}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Structure</span>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">{post.script_or_structure}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Caption</span>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">{post.caption}</p>
                              </div>
                              
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">CTA</span>
                                <p className="text-primary-600 dark:text-primary-400 font-medium">{post.cta}</p>
                              </div>
                              
                              {post.image_prompt && (
                                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Visual Idea</span>
                                  <p className="text-gray-600 dark:text-gray-400 text-xs italic">{post.image_prompt}</p>
                                </div>
                              )}
                              
                              <button
                                onClick={() => handleCopy(`${post.hook}\n\n${post.script_or_structure}\n\n${post.caption}\n\n${post.cta}`)}
                                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy Post'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">No content pillars available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share Buttons */}
      <ShareButtons strategy={strategy} />
    </div>
  );
}
