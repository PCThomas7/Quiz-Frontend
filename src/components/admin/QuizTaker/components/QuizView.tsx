import React from 'react';
import { Quiz, Question } from "../../../../types/types";
import { MathContent } from "./MathContent";
import { Options } from "./Options";
import Logo1 from "../../../../assets/img/Logo1.png";
import Logo2 from "../../../../assets/img/Logo2.png";
import Logo3 from "../../../../assets/img/Logo3.png";
import Logo4 from "../../../../assets/img/Logo4.png";
import Logo5 from "../../../../assets/img/Logo5.png";
import down from "../../../../assets/img/down.png";
import up from "../../../../assets/img/up.png";

interface QuizViewProps {
  quiz: Quiz;
  currentSection: number;
  currentQuestion: number;
  questionStatus: Record<string, any>;
  statusCounts: {
    notVisited: number;
    notAnswered: number;
    answered: number;
    markedForReview: number;
    answeredAndMarked: number;
  };
  timeRemaining: number;
  isCompactView: boolean;
  questionContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: (direction: "up" | "down") => void;
  handleClearResponse: (questionId: string) => void;
  handleMarkForReview: (questionId: string) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleJumpToQuestion: (sectionIndex: number, questionIndex: number, questionId: string) => void;
  handleSubmit: () => void;
  setIsCompactView: (value: boolean) => void;
  getQuestionNumber: (sectionIndex: number, questionIndex: number) => number;
  handleAnswerChange: (questionId: string, answers: string[]) => void; // Add this line
}

export function QuizView({
  quiz,
  currentSection,
  currentQuestion,
  questionStatus,
  statusCounts,
  timeRemaining,
  isCompactView,
  questionContainerRef,
  handleScroll,
  handleClearResponse,
  handleMarkForReview,
  handlePrevious,
  handleNext,
  handleJumpToQuestion,
  handleSubmit,
  setIsCompactView,
  getQuestionNumber,
  handleAnswerChange // Add this line
}: QuizViewProps) {
  const section = quiz.sections[currentSection];
  const question = section.questions[currentQuestion];
  const status = questionStatus[question.id];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Institute Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-xl">PC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Prof. P. C. Thomas & Chaithanya Classes
                </h1>
                <h2 className="text-lg text-gray-600">{quiz.title}</h2>
              </div>
            </div>
            <div className="text-lg font-medium">
              Time Left: {Math.floor(timeRemaining / 60)}:
              {String(timeRemaining % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4">
            {quiz.sections.map((s, index) => (
              <button
                key={s.id}
                onClick={() => {
                  setTempAnswers({});
                  setCurrentSection(index);
                  setCurrentQuestion(0);
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  currentSection === index
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 ${
          isCompactView ? "" : "grid grid-cols-4 gap-6"
        }`}
      >
        {/* Question Area */}
        <div
          className={`${
            isCompactView ? "max-w-3xl mx-auto" : "col-span-3"
          } bg-white shadow rounded-lg p-6 relative`}
        >
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">
                  Question Type: {question.tags.question_type}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-600">Marks: +4.00</span>
                  <span className="text-red-600">Negative: -1.00</span>
                </div>
              </div>
              <div className="text-lg font-medium mb-4">
                Question {currentQuestion + 1}:
              </div>
              <div className="relative">
                {/* Down scroll button at top */}
                <button
                  onClick={() => handleScroll("down")}
                  className="absolute -top-8 right-0 p-2 hover:bg-gray-100 rounded-full"
                >
                  <img src={down} alt="Scroll down" className="h-5 w-5" />
                </button>

                <div
                  ref={questionContainerRef}
                  className="relative max-h-[400px] overflow-y-auto"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#4B5563 #E5E7EB",
                    scrollbarGutter: "stable",
                    paddingRight: "16px",
                  }}
                >
                  <div className="prose max-w-none">
                    <MathContent text={question.question_text} />
                    {question.image_url && (
                      <img
                        src={question.image_url}
                        alt="Question"
                        className="mt-4 max-w-full h-auto rounded-lg"
                      />
                    )}
                  </div>
                  <Options
                    question={question}
                    selectedAnswers={status.selectedAnswers}
                    onAnswerChange={(answers) => handleAnswerChange(question.id, answers)} // Ensure this line uses handleAnswerChange
                  />
                </div>

                {/* Up scroll button at bottom */}
                <button
                  onClick={() => handleScroll("up")}
                  className="absolute -bottom-8 right-0 p-2 hover:bg-gray-100 rounded-full"
                >
                  <img src={up} alt="Scroll up" className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <div className="space-x-4">
              <button
                onClick={() => handleClearResponse(question.id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Clear Response
              </button>
              <button
                onClick={() => handleMarkForReview(question.id)}
                className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded hover:bg-purple-200"
              >
                {status?.markedForReview
                  ? "Unmark for Review"
                  : "Mark for Review & Next"}
              </button>
            </div>
            <div className="space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentSection === 0 && currentQuestion === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Question Grid */}
        {!isCompactView && (
          <div className="col-span-1 bg-white shadow rounded-lg p-6 pt-12 flex flex-col gap-4">
            {/* Status Counters */}
            <div className="mt-6 space-y-2 text-sm border-1 border-gray-500 border-dotted p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img src={Logo1} alt="not-visited" className="w-6 h-6" />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">
                      {statusCounts.notVisited}
                    </span>
                  </div>
                  <span>Not Visited</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img src={Logo2} alt="not-answered" className="w-6 h-6" />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">
                      {statusCounts.notAnswered}
                    </span>
                  </div>
                  <span>Not Answered</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img src={Logo3} alt="Answered" className="w-6 h-6" />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">
                      {statusCounts.answered}
                    </span>
                  </div>
                  <span>Answered</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={Logo4}
                      alt="Marked for Review"
                      className="w-6 h-6"
                    />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white">
                      {statusCounts.markedForReview}
                    </span>
                  </div>
                  <span>Marked for Review</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={Logo5}
                      alt="Answered & Marked for Review"
                      className="w-6 h-6"
                    />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white">
                      {statusCounts.answeredAndMarked}
                    </span>
                  </div>
                  <span>Answered & Marked for Review</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quiz.sections[currentSection].questions.map((q, qIndex) => {
                const qStatus = questionStatus[q.id];
                const questionNum = getQuestionNumber(currentSection, qIndex);
                let statusImage = Logo1;
                let textColor = "text-black";

                if (qStatus?.visited) {
                  if (qStatus.markedForReview && qStatus.answered) {
                    statusImage = Logo5;
                    textColor = "text-white";
                  } else if (qStatus.markedForReview) {
                    statusImage = Logo4;
                    textColor = "text-white";
                  } else if (qStatus.answered) {
                    statusImage = Logo3;
                  } else {
                    statusImage = Logo2;
                  }
                }

                return (
                  <button
                    key={q.id}
                    onClick={() =>
                      handleJumpToQuestion(currentSection, qIndex, q.id)
                    }
                    className={`p-2 rounded relative ${
                      currentSection === currentSection &&
                      currentQuestion === qIndex
                        ? "ring-2 ring-blue-500"
                        : ""
                    } hover:opacity-90`}
                  >
                    <img
                      src={statusImage}
                      alt="question status"
                      className="w-full h-full absolute top-0 left-0"
                    />
                    <span className={`relative z-10 ${textColor}`}>
                      {questionNum}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full mt-6 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              Submit Exam
            </button>
          </div>
        )}

        {/* Toggle View Button */}
        <button
          onClick={() => setIsCompactView(!isCompactView)}
          className={`fixed ${
            isCompactView ? "right-4" : "right-80"
          } top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-300`}
        >
          {isCompactView ? "←" : "→"}
        </button>
      </main>
    </div>
  );
}