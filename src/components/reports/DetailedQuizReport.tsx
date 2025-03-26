import React, { useState } from 'react';
import { DetailedQuizReport as DetailedQuizReportType } from '../../types/reportTypes';
import { OverallPerformanceSummary } from './OverallPerformanceSummary';
import { SubjectWisePerformanceChart } from './SubjectWisePerformance';
import { ChapterWisePerformanceChart } from './ChapterWisePerformance';
import { TopicWisePerformanceChart } from './TopicWisePerformance';
import { DifficultyWisePerformanceChart } from './DifficultyWisePerformance';
import { QuestionTypePerformanceChart } from './QuestionTypePerformance';

interface DetailedQuizReportProps {
  report: DetailedQuizReportType;
  quizTitle: string;
}

export const DetailedQuizReport: React.FC<DetailedQuizReportProps> = ({ report, quizTitle }) => {
  const [activeTab, setActiveTab] = useState('overall');

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">{quizTitle} - Detailed Report</h1>
      
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
            
            {report.subjectWisePerformance.length > 0 && (
              <button
                onClick={() => setActiveTab('subject')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subject'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Subject-wise
              </button>
            )}
            
            {report.chapterWisePerformance.length > 0 && (
              <button
                onClick={() => setActiveTab('chapter')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chapter'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chapter-wise
              </button>
            )}
            
            {report.difficultyWisePerformance.length > 0 && (
              <button
                onClick={() => setActiveTab('difficulty')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'difficulty'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Difficulty-wise
              </button>
            )}
            
            {report.questionTypePerformance.length > 0 && (
              <button
                onClick={() => setActiveTab('questionType')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questionType'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Question Type
              </button>
            )}
            
            {report.topicWisePerformance.length > 0 && (
              <button
                onClick={() => setActiveTab('topic')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'topic'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Topic-wise
              </button>
            )}
          </nav>
        </div>
      </div>
      
      <div className="mt-8">
        {activeTab === 'overall' && (
          <OverallPerformanceSummary report={report} />
        )}
        
        {activeTab === 'subject' && report.subjectWisePerformance.length > 0 && (
          <SubjectWisePerformanceChart subjectData={report.subjectWisePerformance} />
        )}
        
        {activeTab === 'chapter' && report.chapterWisePerformance.length > 0 && (
          <ChapterWisePerformanceChart chapterData={report.chapterWisePerformance} />
        )}
        
        {activeTab === 'difficulty' && report.difficultyWisePerformance.length > 0 && (
          <DifficultyWisePerformanceChart difficultyData={report.difficultyWisePerformance} />
        )}
        
        {activeTab === 'questionType' && report.questionTypePerformance.length > 0 && (
          <QuestionTypePerformanceChart questionTypeData={report.questionTypePerformance} />
        )}
        
        {activeTab === 'topic' && report.topicWisePerformance.length > 0 && (
          <TopicWisePerformanceChart topicData={report.topicWisePerformance} />
        )}
        
        {/* Fallback if no data is available for the selected tab */}
        {((activeTab === 'subject' && report.subjectWisePerformance.length === 0) ||
          (activeTab === 'chapter' && report.chapterWisePerformance.length === 0) ||
          (activeTab === 'topic' && report.topicWisePerformance.length === 0) ||
          (activeTab === 'difficulty' && report.difficultyWisePerformance.length === 0) ||
          (activeTab === 'questionType' && report.questionTypePerformance.length === 0)) && (
          <div className="text-center py-8">
            <p className="text-gray-500">No data available for this category.</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-right">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Print Report
        </button>
      </div>
    </div>
  );
};