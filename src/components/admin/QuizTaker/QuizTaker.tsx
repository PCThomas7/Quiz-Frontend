import { useState, useEffect, useCallback, useRef } from "react";
import { Quiz, Question } from "../../../types/types";
import Logo1 from "../../../assets/img/Logo1.png";
import Logo2 from "../../../assets/img/Logo2.png";
import Logo3 from "../../../assets/img/Logo3.png";
import Logo4 from "../../../assets/img/Logo4.png";
import Logo5 from "../../../assets/img/Logo5.png";
import down from "../../../assets/img/down.png";
import up from "../../../assets/img/up.png";
import { Instructions } from "./components/Instructions";
import { Options } from "./components/Options";
import { MathContent } from "./components/MathContent";
import { QuizReport } from "../QuizReport/QuizReport";
import { useNavigate } from "react-router-dom";
import { quizService } from "../../../services/quizService";

interface QuestionStatus {
  visited: boolean;
  answered: boolean;
  markedForReview: boolean;
  selectedAnswers: string[];
}
interface QuizTakerProps {
  quiz: Quiz;
  onSubmit: (answers: Record<string, string[]>) => void;
  onBackToDashboard?: () => void;
}

export function QuizTaker({ quiz, onSubmit, onBackToDashboard }: QuizTakerProps) {
  const navigate = useNavigate();
  // View states
  const [view, setView] = useState<"instructions" | "quiz" | "report">("instructions");
  const [acceptedInstructions, setAcceptedInstructions] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, string[]>>({});
  // Quiz state
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(quiz.total_duration * 60);
  const [questionStatus, setQuestionStatus] = useState<
    Record<string, QuestionStatus>
  >({});
  const [tempAnswers, setTempAnswers] = useState<Record<string, string[]>>({});

  // Refs
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const questionContainerRef = useRef<HTMLDivElement>(null);

  // Scroll handlers
  const handleScroll = (direction: "up" | "down") => {
    if (!questionContainerRef.current) return;

    const container = questionContainerRef.current;
    const containerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const currentScroll = container.scrollTop;

    // Calculate scroll amount as percentage of visible container height
    const scrollPercentage = 0.33; // Scroll by 1/3 of the visible height
    const scrollAmount = Math.floor(containerHeight * scrollPercentage);

    let targetScroll;
    if (direction === "down") {
      targetScroll = Math.min(
        currentScroll + scrollAmount,
        scrollHeight - containerHeight
      );
    } else {
      targetScroll = Math.max(currentScroll - scrollAmount, 0);
    }

    container.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  // Get continuous question number
  const getQuestionNumber = useCallback(
    (sectionIndex: number, questionIndex: number): number => {
      let number = questionIndex;
      for (let i = 0; i < sectionIndex; i++) {
        number += quiz.sections[i].questions.length;
      }
      return number + 1;
    },
    [quiz.sections]
  );

  // Initialize question status
  useEffect(() => {
    const initialStatus: Record<string, QuestionStatus> = {};
    quiz.sections.forEach((section) => {
      section.questions.forEach((question) => {
        initialStatus[question.id] = {
          visited: false,
          answered: false,
          markedForReview: false,
          selectedAnswers: [],
        };
      });
    });
    setQuestionStatus(initialStatus);
    setTempAnswers({});

    if (quiz.sections[0]?.questions[0]) {
      const firstQuestionId = quiz.sections[0].questions[0].id;
      setQuestionStatus((prev) => ({
        ...prev,
        [firstQuestionId]: {
          ...prev[firstQuestionId],
          visited: true,
        },
      }));
    }
  }, [quiz]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    const currentSectionQuestions = quiz.sections[currentSection].questions;
    const currentQuestionId = currentSectionQuestions[currentQuestion].id;

    // Save the answer when clicking "Save & Next"
    if (tempAnswers[currentQuestionId]) {
      setQuestionStatus((prev) => ({
        ...prev,
        [currentQuestionId]: {
          ...prev[currentQuestionId],
          answered: tempAnswers[currentQuestionId].length > 0,
          selectedAnswers: tempAnswers[currentQuestionId],
        },
      }));
      setTempAnswers((prev) => {
        const newTemp = { ...prev };
        delete newTemp[currentQuestionId];
        return newTemp;
      });
    }

    if (currentQuestion < currentSectionQuestions.length - 1) {
      const nextQuestionId = currentSectionQuestions[currentQuestion + 1].id;
      setQuestionStatus((prev) => ({
        ...prev,
        [nextQuestionId]: {
          ...prev[nextQuestionId],
          visited: true,
        },
      }));
      setCurrentQuestion((prev) => prev + 1);
    } else if (currentSection < quiz.sections.length - 1) {
      const nextSectionFirstQuestionId =
        quiz.sections[currentSection + 1].questions[0].id;
      setQuestionStatus((prev) => ({
        ...prev,
        [nextSectionFirstQuestionId]: {
          ...prev[nextSectionFirstQuestionId],
          visited: true,
        },
      }));
      setCurrentSection((prev) => prev + 1);
      setCurrentQuestion(0);
    }
  }, [currentQuestion, currentSection, quiz.sections, tempAnswers]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
      setCurrentQuestion(
        quiz.sections[currentSection - 1].questions.length - 1
      );
    }
  }, [currentQuestion, currentSection, quiz.sections]);

  const handleAnswerChange = useCallback(
    (questionId: string, answers: string[]) => {
      // Only store in tempAnswers, don't update questionStatus yet
      setTempAnswers((prev) => ({
        ...prev,
        [questionId]: answers,
      }));
    },
    []
  );

  const handleMarkForReview = useCallback(
    (questionId: string) => {
      // Save the answer when clicking "Mark for Review & Next"
      if (tempAnswers[questionId]) {
        setQuestionStatus((prev) => ({
          ...prev,
          [questionId]: {
            ...prev[questionId],
            answered: tempAnswers[questionId].length > 0,
            selectedAnswers: tempAnswers[questionId],
            markedForReview: !prev[questionId].markedForReview,
          },
        }));
        setTempAnswers((prev) => {
          const newTemp = { ...prev };
          delete newTemp[questionId];
          return newTemp;
        });
      } else {
        setQuestionStatus((prev) => ({
          ...prev,
          [questionId]: {
            ...prev[questionId],
            markedForReview: !prev[questionId].markedForReview,
          },
        }));
      }
      handleNext();
    },
    [handleNext, tempAnswers]
  );

  const handleClearResponse = useCallback((questionId: string) => {
    // Clear both temporary and saved answers
    setTempAnswers((prev) => ({
      ...prev,
      [questionId]: [],
    }));
    setQuestionStatus((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answered: false,
        selectedAnswers: [],
      },
    }));
  }, []);

  const handleJumpToQuestion = useCallback(
    (sectionIndex: number, questionIndex: number, questionId: string) => {
      // If there are unsaved changes in the current question, discard them
      setTempAnswers({});

      setCurrentSection(sectionIndex);
      setCurrentQuestion(questionIndex);
      setQuestionStatus((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          visited: true,
        },
      }));
    },
    []
  );

  // Update the handleSubmit function to save the attempt to the backend
  // Update the handleSubmit function to include userId
  const handleSubmit = useCallback(async () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    const answers: Record<string, string[]> = {};
    Object.entries(questionStatus).forEach(([questionId, status]) => {
      answers[questionId] = status.selectedAnswers;
    });
    
    // Save the answers for the report
    setSubmittedAnswers(answers);
    
    try {
      // Get userId from localStorage or context
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = userInfo.id || userInfo._id;
      
      // Submit the quiz attempt to the backend with userId
      await quizService.submitQuizAttempt(quiz.id, {
        answers,
        timeSpent: quiz.total_duration * 60 - timeRemaining,
        completed: true,
        userId // Add userId to the request
      });
      
      // Navigate to the report page
      navigate(`/quiz-report/${quiz.id}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      // If there's an error, still show the local report
      setView("report");
    }
    console.log("Submitted answers:", answers);
    // Also call the original onSubmit callback
    onSubmit(answers);
  }, [questionStatus, onSubmit, quiz.id, quiz.total_duration, timeRemaining, navigate]);

  // Add a handler for retaking the quiz
  const handleRetakeQuiz = useCallback(() => {
    // Reset all state
    setView("instructions");
    setAcceptedInstructions(false);
    setCurrentSection(0);
    setCurrentQuestion(0);
    setTimeRemaining(quiz.total_duration * 60);
    setQuestionStatus({});
    setTempAnswers({});
    setSubmittedAnswers({});
    startTimeRef.current = null;
  }, [quiz.total_duration]);

  // Timer effect
  useEffect(() => {
    if (view !== "quiz") return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const updateTimer = () => {
      if (!startTimeRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, quiz.total_duration * 60 - elapsed);

      if (remaining === 0) {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
        handleSubmit();
      } else {
        setTimeRemaining(remaining);
      }
    };

    timerRef.current = window.setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [view, quiz.total_duration, handleSubmit]);

  // Status counters
  const getStatusCounts = useCallback(() => {
    return quiz.sections.reduce(
      (counts, section) => {
        section.questions.forEach((question) => {
          const status = questionStatus[question.id];
          if (!status?.visited) counts.notVisited++;
          else if (status.markedForReview && status.answered)
            counts.answeredAndMarked++;
          else if (status.markedForReview) counts.markedForReview++;
          else if (status.answered) counts.answered++;
          else counts.notAnswered++;
        });
        return counts;
      },
      {
        notVisited: 0,
        notAnswered: 0,
        answered: 0,
        markedForReview: 0,
        answeredAndMarked: 0,
      }
    );
  }, [questionStatus, quiz.sections]);

  const renderMathContent = (text: string) => {
    return <MathContent text={text} />;
  };

  // Render functions
  const renderInstructions = () => (
    <Instructions
      quiz={quiz}
      acceptedInstructions={acceptedInstructions}
      onAcceptChange={setAcceptedInstructions}
      onStartQuiz={() => setView("quiz")}
    />
  );

  const renderOptions = (question: Question) => {
    const status = questionStatus[question.id];
    const tempAnswer = tempAnswers[question.id];
    const selectedAnswers = tempAnswer || status?.selectedAnswers || [];

    return (
      <Options
        question={question}
        selectedAnswers={selectedAnswers}
        onAnswerChange={(answers) => handleAnswerChange(question.id, answers)}
      />
    );
  };

  const renderQuiz = () => {
    const section = quiz.sections[currentSection];
    const question = section.questions[currentQuestion];
    const status = questionStatus[question.id];
    const statusCounts = getStatusCounts();

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Institute Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {/* Placeholder for institute logo */}
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
                    // Discard any unsaved changes when switching sections
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
                      {renderMathContent(question.question_text)}
                      {question.image_url && (
                        <img
                          src={question.image_url}
                          alt="Question"
                          className="mt-4 max-w-full h-auto rounded-lg"
                        />
                      )}
                    </div>
                    {renderOptions(question)}
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
                  // Calculate the continuous question number
                  const questionNum = getQuestionNumber(currentSection, qIndex);
                  let statusImage = Logo1; // Not Visited
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
  };


  const renderReport = () => (
    <QuizReport 
      quiz={quiz}
      userAnswers={submittedAnswers}
      onRetake={handleRetakeQuiz}
      onBackToDashboard={onBackToDashboard || (() => {})}
    />
  );

  // Update the return statement to include the report view
  if (view === "instructions") {
    return renderInstructions();
  } else if (view === "quiz") {
    return renderQuiz();
  } else {
    console.log("submittedAnswers", submittedAnswers);
    console.log("quiz", quiz);
    return renderReport();
  }

  // return view === "instructions" ? renderInstructions() : renderQuiz();
}
