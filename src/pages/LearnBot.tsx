import React from 'react';
import { LearnBotPanel } from '../components/learnbot/LearnBotPanel';
import { TutorialTracker } from '../components/learnbot/TutorialTracker';
import { InteractiveWalkthrough } from '../components/learnbot/InteractiveWalkthrough';
import { GraduationCap, BookOpen, Target, Award } from 'lucide-react';

const LearnBot: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* LearnBot Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">LearnBot Tutorial System</h1>
                <p className="text-blue-100 text-lg">Master Scout Analytics with AI-guided learning</p>
              </div>
            </div>
            <p className="text-blue-100 max-w-2xl leading-relaxed">
              Your intelligent learning companion for Philippine FMCG retail intelligence. 
              Get step-by-step guidance, track your progress, and unlock achievements as you 
              master dashboard navigation, data analysis, and AI chat assistants.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Powered by</div>
            <div className="font-semibold text-xl">TBWA × InsightPulse AI</div>
            <div className="text-xs text-blue-200 mt-1">Educational Technology</div>
          </div>
        </div>
      </div>

      {/* Learning Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="tbwa-kpi-card text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Interactive Tutorial</h3>
          <p className="text-sm text-gray-600">Step-by-step guided learning with voice narration</p>
        </div>
        
        <div className="tbwa-kpi-card text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Progress Tracking</h3>
          <p className="text-sm text-gray-600">Monitor your learning journey with detailed analytics</p>
        </div>
        
        <div className="tbwa-kpi-card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Achievements</h3>
          <p className="text-sm text-gray-600">Unlock rewards as you master new skills</p>
        </div>
        
        <div className="tbwa-kpi-card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Expert Certification</h3>
          <p className="text-sm text-gray-600">Become a Scout Analytics power user</p>
        </div>
      </div>

      {/* Main Learning Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutorial Panel - Takes up 2/3 of the space */}
        <div className="lg:col-span-2">
          <LearnBotPanel 
            stepsSource="ai/learnbot_steps.md"
            enableCodeWalkthrough={true}
            enableVoiceMode={true}
            tutorialTheme="tbwa"
            autoProgress={false}
            completionTracking={true}
          />
        </div>

        {/* Progress Tracker - Takes up 1/3 of the space */}
        <div className="lg:col-span-1">
          <TutorialTracker
            linkedTo="learnbot_panel"
            showCompletionPercentage={true}
            showStepIndicators={true}
            achievementsEnabled={true}
          />
        </div>
      </div>

      {/* Interactive Walkthrough */}
      <div className="grid grid-cols-1">
        <InteractiveWalkthrough
          tourConfig="ai/walkthrough_config.json"
          highlightElements={true}
          showTooltips={true}
          enableSpotlight={true}
          voiceNarration={true}
        />
      </div>

      {/* Learning Path Recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">📚 Recommended Learning Path</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="font-medium text-blue-800">Dashboard Basics</h4>
            </div>
            <p className="text-sm text-blue-700">
              Learn navigation, KPI interpretation, and basic filtering. Essential foundation for all users.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <h4 className="font-medium text-green-800">Advanced Analytics</h4>
            </div>
            <p className="text-sm text-green-700">
              Master complex filtering, regional analysis, and competitive intelligence features.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <h4 className="font-medium text-purple-800">AI Mastery</h4>
            </div>
            <p className="text-sm text-purple-700">
              Become expert with Yummy Intelligence and Scout AI for strategic insights.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Actions */}
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-6 border border-accent/20">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-primary mb-2">🚀 Ready to Start Learning?</h3>
          <p className="text-gray-600 mb-4">
            Choose your learning style and begin mastering Scout Analytics today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="tbwa-btn-primary">
              📖 Start Interactive Tutorial
            </button>
            <button className="tbwa-btn-secondary">
              🎯 Begin Guided Walkthrough
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              📊 Explore Dashboard First
            </button>
          </div>
        </div>
      </div>

      {/* Learning Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-800 mb-3">💡 Learning Tips for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
          <div>
            <strong>🎧 Use voice narration:</strong> Enable audio for hands-free learning while you follow along.
          </div>
          <div>
            <strong>🎯 Practice as you learn:</strong> Try each feature immediately after learning about it.
          </div>
          <div>
            <strong>📱 Mobile friendly:</strong> Tutorial adapts to all screen sizes for learning anywhere.
          </div>
          <div>
            <strong>🏆 Collect achievements:</strong> Unlock badges to track your progress and stay motivated.
          </div>
          <div>
            <strong>⏱️ Take your time:</strong> No rush - learn at your own pace with pause/resume features.
          </div>
          <div>
            <strong>🔄 Repeat sections:</strong> Go back to any step to reinforce your understanding.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnBot;