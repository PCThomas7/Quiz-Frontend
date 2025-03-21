import React from 'react';
import { Quiz, Question } from '../../../types/types';
import { MathText } from '../MathText/MathText';
import './QuizReport.css';

interface QuizReportProps {
  quiz: Quiz;
  userAnswers: Record<string, string[]>;
  onRetakeQuiz: () => void;
  onBackToQuizzes: () => void;
}

export function QuizReport({ quiz, userAnswers, onRetakeQuiz, onBackToQuizzes }: QuizReportProps) {
  // Calculate overall score and statistics
  const calculateResults = () => {
    let totalQuestions = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unattempted = 0;
    let totalMarks = 0;
    let earnedMarks = 0;

    // Process each section and question
    quiz.sections.forEach(section => {
      section.questions.forEach(question => {
        totalQuestions++;
        
        // Get user's answer for this question
        const userAnswer = userAnswers[question.id] || [];
        
        // Get correct answer(s) for this question
        const correctAnswer = question.correct_answer ? 
          question.correct_answer.split(',').map(ans => ans.trim()) : 
          [];
        
        // Calculate marks for this question
        const questionMarks = question.marks || section.marks || 0;
        const negativeMarks = section.negativeMarks || 0;
        
        totalMarks += questionMarks;
        
        // Check if question was attempted
        if (userAnswer.length === 0) {
          unattempted++;
        } 
        // Check if answer is correct
        else if (
          // For single choice questions
          (question.tags?.question_type !== 'MMCQ' && 
           userAnswer.length === 1 && 
           correctAnswer.includes(userAnswer[0])) ||
          // For multiple choice questions
          (question.tags?.question_type === 'MMCQ' && 
           userAnswer.length === correctAnswer.length && 
           userAnswer.every(ans => correctAnswer.includes(ans)))
        ) {
          correctAnswers++;
          earnedMarks += questionMarks;
        } 
        // Wrong answer
        else {
          wrongAnswers++;
          earnedMarks -= negativeMarks;
        }
      });
    });

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unattempted,
      totalMarks,
      earnedMarks: Math.max(0, earnedMarks), // Ensure earned marks don't go below 0
      percentage: totalMarks > 0 ? (Math.max(0, earnedMarks) / totalMarks) * 100 : 0
    };
  };

  const results = calculateResults();
  const passingScore = quiz.passingScore || 40;
  const isPassed = results.percentage >= passingScore;

  // Get question result (correct/incorrect/unattempted)
  const getQuestionResult = (question: Question) => {
    const userAnswer = userAnswers[question.id] || [];
    const correctAnswer = question.correct_answer ? 
      question.correct_answer.split(',').map(ans => ans.trim()) : 
      [];
    
    if (userAnswer.length === 0) {
      return 'unattempted';
    } else if (
      (question.tags?.question_type !== 'MMCQ' && 
       userAnswer.length === 1 && 
       correctAnswer.includes(userAnswer[0])) ||
      (question.tags?.question_type === 'MMCQ' && 
       userAnswer.length === correctAnswer.length && 
       userAnswer.every(ans => correctAnswer.includes(ans)))
    ) {
      return 'correct';
    } else {
      return 'incorrect';
    }
  };

  return (
    <div className="quiz-report max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">{quiz.title} - Results</h1>
      
      {/* Summary Card */}
      <div className={`p-6 rounded-lg mb-8 text-white ${isPassed ? 'bg-green-600' : 'bg-red-600'}`}>
        <h2 className="text-xl font-bold mb-2">
          {isPassed ? 'Congratulations! You passed the quiz.' : 'You did not pass the quiz.'}
        </h2>
        <div className="text-lg">
          <p>Your Score: {results.earnedMarks.toFixed(2)} / {results.totalMarks} ({results.percentage.toFixed(2)}%)</p>
          <p>Passing Score: {passingScore}%</p>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-700">{results.correctAnswers}</div>
          <div className="text-sm text-blue-700">Correct Answers</div>
        </div>
        <div className="bg-red-100 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-red-700">{results.wrongAnswers}</div>
          <div className="text-sm text-red-700">Wrong Answers</div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-gray-700">{results.unattempted}</div>
          <div className="text-sm text-gray-700">Unattempted</div>
        </div>
      </div>
      
      {/* Detailed Question Review */}
      <h2 className="text-xl font-bold mb-4">Question Review</h2>
      
      {quiz.sections.map((section, sectionIndex) => (
        <div key={section.id || sectionIndex} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
          
          {section.questions.map((question, questionIndex) => {
            const questionResult = getQuestionResult(question);
            const userAnswer = userAnswers[question.id] || [];
            const correctAnswer = question.correct_answer ? 
              question.correct_answer.split(',').map(ans => ans.trim()) : 
              [];
            
            return (
              <div 
                key={question.id} 
                className={`p-4 mb-4 rounded-lg border ${
                  questionResult === 'correct' ? 'border-green-300 bg-green-50' : 
                  questionResult === 'incorrect' ? 'border-red-300 bg-red-50' : 
                  'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Question {sectionIndex + 1}.{questionIndex + 1}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    questionResult === 'correct' ? 'bg-green-200 text-green-800' : 
                    questionResult === 'incorrect' ? 'bg-red-200 text-red-800' : 
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {questionResult === 'correct' ? 'Correct' : 
                     questionResult === 'incorrect' ? 'Incorrect' : 
                     'Unattempted'}
                  </span>
                </div>
                
                <div className="mb-2">
                  <MathText text={question.question_text} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {[
                    { id: 'A', content: question.option_a },
                    { id: 'B', content: question.option_b },
                    { id: 'C', content: question.option_c },
                    { id: 'D', content: question.option_d }
                  ].map(option => (
                    <div 
                      key={option.id} 
                      className={`p-2 rounded ${
                        correctAnswer.includes(option.id) ? 'bg-green-200' :
                        userAnswer.includes(option.id) && !correctAnswer.includes(option.id) ? 'bg-red-200' :
                        'bg-gray-100'
                      }`}
                    >
                      <span className="font-medium mr-2">{option.id}.</span>
                      <MathText text={option.content} />
                    </div>
                  ))}
                </div>
                
                <div className="text-sm">
                  <div className="font-medium">Your Answer: {userAnswer.length > 0 ? userAnswer.join(', ') : 'Not answered'}</div>
                  <div className="font-medium">Correct Answer: {correctAnswer.join(', ')}</div>
                  {question.explanation && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="font-medium">Explanation:</div>
                      <MathText text={question.explanation} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button 
          onClick={onRetakeQuiz}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retake Quiz
        </button>
        <button 
          onClick={onBackToQuizzes}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
}