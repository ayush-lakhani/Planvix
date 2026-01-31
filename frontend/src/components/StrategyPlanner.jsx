import { useState } from 'react';
import { strategyAPI } from '../api';
import { Sparkles, Loader2, TrendingUp, Target, Users, Zap } from 'lucide-react';

const INDUSTRIES = [
  'SaaS', 'Fitness', 'F&B', 'E-commerce', 'Consulting', 'Real Estate',
  'Education', 'Healthcare', 'Finance', 'Marketing', 'Design', 'Technology',
  'Fashion', 'Beauty', 'Travel', 'Gaming', 'Coaching', 'Agency', 'Other'
];

const PLATFORMS = ['Instagram', 'LinkedIn', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];
const CONTENT_TYPES = ['Reels', 'Posts', 'Stories', 'Carousels', 'Videos', 'Articles'];

export default function StrategyPlanner() {
  const [formData, setFormData] = useState({
    goal: '',
    audience: '',
    industry: 'SaaS',
    platform: 'Instagram',
    contentType: 'Reels',
    experience: 'beginner',
    topic: '' // Will be auto-generated from goal
  });

  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleGoalChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setFormData({ ...formData, goal: value, topic: value.substring(0, 50) });
      setCharCount(value.length);
    }
  };

  const handleGenerate = async () => {
    if (!formData.goal.trim() || formData.goal.length < 10) {
      setError('Please enter a business goal (minimum 10 characters)');
      return;
    }

    if (!formData.audience.trim()) {
      setError('Please describe your target audience');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await strategyAPI.generateStrategy(formData);
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

  const getExperienceBadgeColor = () => {
    switch (formData.experience) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-blue-500';
      case 'expert': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-primary-600 via-accent-600 to-pink-600 bg-clip-text text-transparent">
            AI Strategy Planner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Experience-Based Content Strategy Generator
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 rounded-2xl mb-8 space-y-6">
          
          {/* Business Goal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Business Goal *
            </label>
            <textarea
              value={formData.goal}
              onChange={handleGoalChange}
              placeholder="e.g., Increase fitness app downloads by 500/month through Instagram Reels"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="3"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Minimum 10 characters</span>
              <span className={`text-xs ${charCount > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount}/500
              </span>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Target Audience *
            </label>
            <input
              type="text"
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              placeholder="e.g., Working professionals 25-35, time-starved, seeking quick fitness solutions"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Industry & Platform Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Primary Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {PLATFORMS.map(plat => (
                  <option key={plat} value={plat}>{plat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Content Type
            </label>
            <select
              value={formData.contentType}
              onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {CONTENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Experience Level - CRITICAL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Experience Level *
            </label>
            <div className="space-y-3">
              
              {/* Beginner */}
              <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"
                style={{ borderColor: formData.experience === 'beginner' ? '#10B981' : '' }}>
                <input
                  type="radio"
                  name="experience"
                  value="beginner"
                  checked={formData.experience === 'beginner'}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Total Beginner</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">iPhone + templates, copy-paste scripts, step-by-step guides</div>
                </div>
              </label>

              {/* Intermediate */}
              <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                style={{ borderColor: formData.experience === 'intermediate' ? '#3B82F6' : '' }}>
                <input
                  type="radio"
                  name="experience"
                  value="intermediate"
                  checked={formData.experience === 'intermediate'}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Intermediate</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Canva + editing skills, batch workflows, optimization strategies</div>
                </div>
              </label>

              {/* Expert */}
              <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10"
                style={{ borderColor: formData.experience === 'expert' ? '#8B5CF6' : '' }}>
                <input
                  type="radio"
                  name="experience"
                  value="expert"
                  checked={formData.experience === 'expert'}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Expert</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CapCut + viral frameworks, A/B testing, data-driven optimization</div>
                </div>
              </label>

            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                5 Agents Analyzing Your Experience Level...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate My Strategy
              </>
            )}
          </button>

        </div>

        {/* Strategy Output */}
        {strategy && (
          <div className="glass-card p-8 rounded-2xl">
            
            {/* Experience Badge */}
            <div className={`${getExperienceBadgeColor()} text-white px-6 py-3 rounded-xl font-bold text-center mb-6`}>
              {formData.experience.toUpperCase()} MODE ACTIVATED
            </div>

            {/* Strategy Content */}
            <div 
              className="strategy-output prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: strategy.content }}
            />

            {/* Branding Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Generated by AgentForge</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      5 Live Research Agents | {strategy.generation_time || '28 seconds'}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  AGENTS BUILD STRATEGY
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
