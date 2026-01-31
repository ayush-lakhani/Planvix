import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Download, ThumbsUp, ThumbsDown, Zap, TrendingUp, Users, Calendar, Target, BarChart3 } from 'lucide-react';
import { useAuth } from '../App';
import { strategyAPI } from '../api';

export default function StrategyGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await strategyAPI.generateStrategy({ topic });
      setStrategy(response.data);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Monthly limit reached! Upgrade to Pro for unlimited strategies.');
      } else {
        setError(err.response?.data?.detail || 'Failed to generate strategy');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // Simple PDF export using print
    window.print();
  };

  const handleFeedback = async (isPositive) => {
    if (!strategy) return;
    try {
      await strategyAPI.submitFeedback(strategy.id, isPositive ? 1 : -1);
      alert(isPositive ? 'Thanks for the positive feedback!' : 'Thanks! We\'ll improve.');
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 via-accent-600 to-pink-600 bg-clip-text text-transparent">
            AI Content Strategy Generator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get a complete 10-section strategy in 30 seconds
          </p>
        </div>

        {/* Input Section */}
        <div className="glass-card p-8 rounded-3xl mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g., Fitness app launch, Coffee brand Instagram, B2B SaaS webinar"
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-lg"
              disabled={loading}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  5 Agents Researching...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Strategy
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
              {error}
              {error.includes('Upgrade') && (
                <button
                  onClick={() => navigate('/profile')}
                  className="ml-2 underline font-semibold hover:text-red-700"
                >
                  View Profile
                </button>
              )}
            </div>
          )}

          {/* Example Topics */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Try:</span>
            {['Fitness app launch', 'Coffee brand Instagram', 'B2B SaaS webinar'].map((example) => (
              <button
                key={example}
                onClick={() => setTopic(example)}
                className="text-sm px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Output */}
        {strategy && (
          <div className="space-y-6 animate-fade-in">
            {/* Strategy Content */}
            <div className="glass-card p-8 rounded-3xl prose prose-lg dark:prose-invert max-w-none">
              <div 
                className="strategy-content"
                dangerouslySetInnerHTML={{ __html: strategy.content }}
              />
            </div>

            {/* AgentForge Branding Section */}
            <div className="glass-card p-8 rounded-3xl border-2 border-primary-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center text-3xl">
                  🔬
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Generated by AgentForge
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-medium">
                    5 Live Research Agents | {strategy.generation_time || '28 seconds'}
                  </p>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wider uppercase mt-1">
                    AGENTS BUILD STRATEGY
                  </p>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Usage Today</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {strategy.usage?.today || 0}/{user?.tier === 'pro' ? '∞' : '3'}
                  </p>
                </div>
                
                <div className="p-4 bg-accent-50 dark:bg-accent-900/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-accent-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Your Tier</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                    {user?.tier || 'FREE'}
                  </p>
                </div>

                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-pink-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Strategies</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {strategy.usage?.total || 0}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </button>
                
                <button
                  onClick={() => handleFeedback(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-xl font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                >
                  <ThumbsUp className="w-5 h-5" />
                  Valuable
                </button>
                
                <button
                  onClick={() => handleFeedback(false)}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <ThumbsDown className="w-5 h-5" />
                  Improve
                </button>
              </div>

              {/* Pro Upgrade CTA */}
              {user?.tier !== 'pro' && (
                <div className="mt-6 p-6 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold mb-1">Upgrade to Pro</h4>
                      <p className="text-white/90">Unlimited strategies • ₹2,400/month</p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:shadow-xl transition-all"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!strategy && !loading && (
          <div className="glass-card p-12 rounded-3xl text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Generate Your Strategy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter any topic and get a complete 10-section content strategy
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { icon: Users, label: 'Target Audience Analysis' },
                { icon: Calendar, label: '90-Day Content Calendar' },
                { icon: Target, label: 'Conversion Strategy' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
