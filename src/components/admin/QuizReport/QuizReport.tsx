import React from 'react';
import { Quiz, QuizAttempt } from '../../../types/types';
import { MathContent } from '../QuizTaker/components/MathContent';

interface QuizReportProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetake: () => void;
  onBackToDashboard: () => void;
}

export const QuizReport: React.FC<QuizReportProps> = ({
  quiz,
  attempt,
  onRetake,
  onBackToDashboard,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Quiz Header */}
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">Quiz Report</p>
          </div>

          {/* Score Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {attempt.score}/{attempt.maxScore}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-2xl font-bold text-green-600">{attempt.correctAnswers}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Incorrect Answers</p>
                <p className="text-2xl font-bold text-red-600">{attempt.incorrectAnswers}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Unattempted</p>
                <p className="text-2xl font-bold text-gray-600">{attempt.unattemptedAnswers}</p>
              </div>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-6">
            {quiz.sections.map((section, sectionIndex) => (
              <div key={section.id} className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">{section.name}</h2>
                {section.questions.map((question, questionIndex) => {
                  const questionId = question._id;
                  const userAnswers = attempt.answers[questionId] || [];
                  // Fix: Use correct_answer instead of correct_answers array
                  const correctAnswer = question.correct_answer;
                  const isCorrect = userAnswers.length === 1 && userAnswers[0] === correctAnswer;

                  return (
                    <div key={questionId} className={`p-4 rounded-lg mb-4 ${
                      isCorrect ? 'bg-green-50' : userAnswers.length ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Question {sectionIndex + 1}.{questionIndex + 1}</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          isCorrect ? 'bg-green-100 text-green-800' : 
                          userAnswers.length ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {isCorrect ? 'Correct' : userAnswers.length ? 'Incorrect' : 'Not Attempted'}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <MathContent text={question.question_text} />
                      </div>

                      <div className="space-y-2">
                        {['A', 'B', 'C', 'D'].map((option) => {
                          const optionText = question[`option_${option.toLowerCase()}`];
                          const isSelected = userAnswers.includes(option);
                          const isCorrectOption = option === correctAnswer;

                          return (
                            <div key={option} className={`p-2 rounded ${
                              isSelected && isCorrectOption ? 'bg-green-100' :
                              isSelected ? 'bg-red-100' :
                              isCorrectOption ? 'bg-green-50' : ''
                            }`}>
                              <MathContent text={`${option}. ${optionText}`} />
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                          <p className="font-medium text-blue-800">Explanation:</p>
                          <MathContent text={question.explanation} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onRetake}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};