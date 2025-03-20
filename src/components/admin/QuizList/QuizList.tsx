import { useState } from 'react';

import { Quiz } from '../../../types/types';
import { PrintView } from '../PrintView/PrintView';
import './QuizList.css';

interface QuizListProps {
  quizzes: Quiz[];
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onDuplicateQuiz: (quiz: Quiz) => void;
  onTakeQuiz: (quiz: Quiz) => void;
  onCreateQuiz: () => void; // Add this for tab switching
}

export function QuizList({ 
  quizzes, 
  onEditQuiz, 
  onDeleteQuiz, 
  onDuplicateQuiz, 
  onTakeQuiz,
  onCreateQuiz
}: QuizListProps) {
  const [selectedQuizForPrint, setSelectedQuizForPrint] = useState<Quiz | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);

  const handlePrintQuiz = (quiz: Quiz) => {
    setSelectedQuizForPrint(quiz);
    setShowPrintView(true);
    // Hide the navbar when showing print view
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }
  };

  const handleBack = () => {
    setShowPrintView(false);
    setSelectedQuizForPrint(null);
    // Show the navbar when returning to list view
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'flex';
    }
  };

  if (showPrintView && selectedQuizForPrint) {
    return (
      <div className="print-container">
        <div className="print-controls fixed top-4 right-4 flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Print
          </button>
          <button
            onClick={handleBack}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>

        <PrintView
          quiz={selectedQuizForPrint}
          instituteDetails={{
            name: selectedQuizForPrint.header?.[0] || "PROF. P.C.THOMAS CLASSES & CHAITHANYA CLASSES",
            tagline: "To God, through Education",
          }}
          testDetails={{
            title: selectedQuizForPrint.title,
            batch: `${selectedQuizForPrint.title} - ${new Date(selectedQuizForPrint.createdAt).toLocaleDateString('en-GB')}`,
            date: new Date(selectedQuizForPrint.createdAt).toLocaleDateString('en-GB'),
            subject: selectedQuizForPrint.sections[0].name
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Quizzes</h1>
              <p className="mt-2 text-sm text-gray-700">A list of all quizzes in your question bank.</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                onClick={onCreateQuiz}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Create Quiz
              </button>
            </div>
          </div>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Title
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Duration
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Total Marks
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Sections
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {quiz.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {quiz.totalDuration} minutes
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {quiz.totalMarks}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {quiz.sections.length}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handlePrintQuiz(quiz)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Print Quiz
                            </button>
                            <button
                              onClick={() => onTakeQuiz(quiz)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Take Quiz
                            </button>
                            <button
                              onClick={() => onEditQuiz(quiz)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDuplicateQuiz(quiz)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() => onDeleteQuiz(quiz.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
          </div>
  );
}
