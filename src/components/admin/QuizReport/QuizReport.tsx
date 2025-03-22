import React, { useMemo } from "react";
import { Quiz, Question } from "../../../types/types";
import { MathContent } from "../QuizTaker/components/MathContent";

interface QuizReportProps {
  quiz: Quiz;
  userAnswers: Record<string, string[]>;
  onRetake?: () => void;
  onBackToDashboard: () => void;
}

interface QuestionResult {
  question: {
    id: string;
    question_text: string;
    image_url?: string;
    options: {
      id: string;
      text: string;
      image_url?: string;
    }[];
    correct_answers: string[];
    score?: number;
    negative_mark?: number;
  };
  userAnswer: string[];
  isCorrect: boolean;
  correctAnswer: string[];
  attempted: boolean;
}

export function QuizReport({ quiz, userAnswers, onRetake, onBackToDashboard }: QuizReportProps) {
  // Calculate results for each question
  const results = useMemo(() => {
    const allResults: QuestionResult[] = [];
    
    if (!quiz?.sections) {
      return allResults;
    }
    
    quiz.sections.forEach(section => {
      if (section?.questions) {
        section.questions.forEach(question => {
          // Map QuestionBank format to our question format
          const questionOptions = [
            { id: 'a', text: question.option_a, image_url: question.option_a_image_url },
            { id: 'b', text: question.option_b, image_url: question.option_b_image_url },
            { id: 'c', text: question.option_c, image_url: question.option_c_image_url },
            { id: 'd', text: question.option_d, image_url: question.option_d_image_url },
          ];

          const userAnswer = userAnswers[question.id] || [];
          // Convert correct_answer string to array if it's not already
          const correctAnswer = Array.isArray(question.correct_answer) 
            ? question.correct_answer 
            : [question.correct_answer];
          
          const isCorrect = JSON.stringify([...userAnswer].sort()) === 
                           JSON.stringify([...correctAnswer].sort());
          const attempted = userAnswer.length > 0;
          
          allResults.push({
            question: {
              id: question.id,
              question_text: question.question_text,
              image_url: question.image_url,
              options: questionOptions,
              correct_answers: correctAnswer,
              score: section.marks || 4,
              negative_mark: section.negativeMarks || 1
            },
            userAnswer,
            isCorrect,
            correctAnswer,
            attempted
          });
        });
      }
    });
    
    return allResults;
  }, [quiz, userAnswers]);
  
  // Calculate summary statistics
  const summary = useMemo(() => {
    const correct = results.filter(r => r.isCorrect).length;
    const incorrect = results.filter(r => r.attempted && !r.isCorrect).length;
    const unattempted = results.filter(r => !r.attempted).length;
    const totalQuestions = results.length;
    
    // Calculate score based on marks and negative marking
    let totalScore = 0;
    results.forEach(result => {
      const marks = result.question.score || 4; // Default to 4 if not specified
      const negativeMark = result.question.negative_mark || 1; // Default to 1 if not specified
      
      if (result.isCorrect) {
        totalScore += marks;
      } else if (result.attempted) {
        totalScore -= negativeMark;
      }
    });
    
    // Calculate maximum possible score
    const maxScore = results.reduce((sum, result) => sum + (result.question.score || 4), 0);
    
    // Calculate percentage
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    return {
      correct,
      incorrect,
      unattempted,
      totalQuestions,
      totalScore,
      maxScore,
      percentage
    };
  }, [results]);

  // Add a check for quiz title
  const quizTitle = quiz?.title || "Quiz";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Report Header */}
        <div className="bg-white shadow rounded-lg mb-6 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{quizTitle} - Results</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-blue-800">Score</h2>
              <p className="text-3xl font-bold text-blue-900">{summary.totalScore} / {summary.maxScore}</p>
              <p className="text-blue-700">{summary.percentage}%</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-green-800">Correct Answers</h2>
              <p className="text-3xl font-bold text-green-900">{summary.correct}</p>
              <p className="text-green-700">out of {summary.totalQuestions}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-red-800">Incorrect Answers</h2>
              <p className="text-3xl font-bold text-red-900">{summary.incorrect}</p>
              <p className="text-red-700">{summary.unattempted} unattempted</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            {onRetake && (
              <button 
                onClick={onRetake}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Retake Quiz
              </button>
            )}
            <button 
              onClick={onBackToDashboard}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        {/* Detailed Results */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Results</h2>
          
          {results.length === 0 ? (
            <div className="p-4 bg-yellow-50 rounded-lg text-yellow-700">
              No question data available for this quiz.
            </div>
          ) : (
            <div className="space-y-8">
              {results.map((result, index) => (
                <div 
                  key={result.question.id} 
                  className={`p-4 rounded-lg border ${
                    result.isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : result.attempted 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-medium">Question {index + 1}</h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : result.attempted 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.isCorrect 
                        ? 'Correct' 
                        : result.attempted 
                          ? 'Incorrect' 
                          : 'Not Attempted'}
                    </span>
                  </div>
                  
                  <div className="prose max-w-none mb-4">
                    <MathContent text={result.question.question_text} />
                    {result.question.image_url && (
                      <img 
                        src={result.question.image_url} 
                        alt="Question" 
                        className="mt-2 max-w-full h-auto rounded-lg"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-700">Options:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.question.options.map((option) => (
                        <div 
                          key={option.id} 
                          className={`p-2 rounded border ${
                            result.correctAnswer.includes(option.id) && result.userAnswer.includes(option.id)
                              ? 'bg-green-100 border-green-300'
                              : result.correctAnswer.includes(option.id)
                                ? 'bg-green-50 border-green-200'
                                : result.userAnswer.includes(option.id)
                                  ? 'bg-red-100 border-red-300'
                                  : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-2">
                              {result.correctAnswer.includes(option.id) ? (
                                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : result.userAnswer.includes(option.id) ? (
                                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ) : (
                                <span className="h-5 w-5 block"></span>
                              )}
                            </div>
                            <div>
                              <MathContent text={option.text} />
                              {option.image_url && (
                                <img 
                                  src={option.image_url} 
                                  alt={`Option ${option.id}`} 
                                  className="mt-2 max-w-full h-auto rounded-lg"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {!result.isCorrect && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-1">Correct Answer:</h4>
                      <p className="text-blue-700">
                        {result.correctAnswer.map(id => 
                          result.question.options.find(o => o.id === id)?.text
                        ).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}