import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { StudentAnalytics } from '../../types/analyticsTypes';
import { OverallAnalyticsSummary } from '../../components/analytics/OverallAnalyticsSummary';
import { SubjectAnalyticsChart } from '../../components/analytics/SubjectAnalyticsChart';
import { DifficultyAnalyticsChart } from '../../components/analytics/DifficultyAnalyticsChart';
import { QuestionTypeAnalyticsChart } from '../../components/analytics/QuestionTypeAnalyticsChart';
import { PerformanceTrendChart } from '../../components/analytics/PerformanceTrendChart';
import { TimeAnalyticsChart } from '../../components/analytics/TimeAnalyticsChart';
import toast from 'react-hot-toast';

export default function StudentAnalyticsPage() {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsService.getStudentAnalytics();
        setAnalytics(response.analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700">No analytics data available</h2>
        <p className="text-gray-500 mt-2">Complete some quizzes to see your performance analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Performance Analytics</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overall')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overall'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overall Performance
            </button>
            
            <button
              onClick={() => setActiveTab('subjects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subjects'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subject Analysis
            </button>
            
            <button
              onClick={() => setActiveTab('difficulty')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'difficulty'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Difficulty Analysis
            </button>
            
            <button
              onClick={() => setActiveTab('questionTypes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questionTypes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Question Types
            </button>
            
            <button
              onClick={() => setActiveTab('trends')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trends'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance Trends
            </button>
            
            <button
              onClick={() => setActiveTab('time')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'time'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Time Analysis
            </button>
          </nav>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'overall' && <OverallAnalyticsSummary analytics={analytics} />}
        {activeTab === 'subjects' && <SubjectAnalyticsChart subjectData={analytics.subjectPerformance} />}
        {activeTab === 'difficulty' && <DifficultyAnalyticsChart difficultyData={analytics.difficultyPerformance} />}
        {activeTab === 'questionTypes' && <QuestionTypeAnalyticsChart questionTypeData={analytics.questionTypePerformance} />}
        {activeTab === 'trends' && <PerformanceTrendChart performanceData={analytics.recentPerformance} />}
        {activeTab === 'time' && <TimeAnalyticsChart timeData={analytics.timeSpentAnalysis} totalQuizzes={analytics.totalAttempts} />}
      </div>
    </div>
  );
}