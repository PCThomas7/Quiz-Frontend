import { useState, useEffect, useCallback, useRef } from "react";
import { Quiz, Question } from "../../../types/types";
import { MathText } from "../MathText/MathText";
import Logo1 from "../../../assets/img/Logo1.png";
import Logo2 from "../../../assets/img/Logo2.png";
import Logo3 from "../../../assets/img/Logo3.png";
import Logo4 from "../../../assets/img/Logo4.png";
import Logo5 from "../../../assets/img/Logo5.png";
import down from "../../../assets/img/down.png";
import up from "../../../assets/img/up.png";
import katex from "katex";
import { Instructions } from "./components/Instructions";
import { Options } from "./components/Options";
import { MathContent } from "./components/MathContent";
import { QuizView } from './components/QuizView';

interface QuestionStatus {
  visited: boolean;
  answered: boolean;
  markedForReview: boolean;
  selectedAnswers: string[];
}

interface QuizTakerProps {
  quiz: Quiz;
  onSubmit: (answers: Record<string, string[]>) => void;
}

export function QuizTaker({ quiz, onSubmit }: QuizTakerProps) {
  // View states
  const [view, setView] = useState<"instructions" | "quiz">("instructions");
  const [acceptedInstructions, setAcceptedInstructions] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);

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

  const handleSubmit = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    const answers: Record<string, string[]> = {};
    Object.entries(questionStatus).forEach(([questionId, status]) => {
      answers[questionId] = status.selectedAnswers;
    });
    onSubmit(answers);
  }, [questionStatus, onSubmit]);

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

  // const renderMathContent = (text: string) => {
  //   return text.split(/(\$\$[^\$]+\$\$|\$[^\$]+\$)/).map((part, index) => {
  //     if (part.startsWith("$$") && part.endsWith("$$")) {
  //       try {
  //         const math = part.slice(2, -2);
  //         return (
  //           <span
  //             key={index}
  //             className="block my-2"
  //             dangerouslySetInnerHTML={{
  //               __html: katex.renderToString(math, { displayMode: true }),
  //             }}
  //           />
  //         );
  //       } catch (error) {
  //         return (
  //           <span key={index} className="text-red-500">
  //             {part}
  //           </span>
  //         );
  //       }
  //     } else if (part.startsWith("$") && part.endsWith("$")) {
  //       try {
  //         const math = part.slice(1, -1);
  //         return (
  //           <span
  //             key={index}
  //             dangerouslySetInnerHTML={{
  //               __html: katex.renderToString(math, { displayMode: false }),
  //             }}
  //           />
  //         );
  //       } catch (error) {
  //         return (
  //           <span key={index} className="text-red-500">
  //             {part}
  //           </span>
  //         );
  //       }
  //     }
  //     return <span key={index}>{part}</span>;
  //   });
  // };

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

 

  

  return view === "instructions" ? renderInstructions() : (
    <QuizView
      quiz={quiz}
      currentSection={currentSection}
      currentQuestion={currentQuestion}
      questionStatus={questionStatus}
      statusCounts={getStatusCounts()}
      timeRemaining={timeRemaining}
      isCompactView={isCompactView}
      questionContainerRef={questionContainerRef}
      handleScroll={handleScroll}
      handleClearResponse={handleClearResponse}
      handleMarkForReview={handleMarkForReview}
      handlePrevious={handlePrevious}
      handleNext={handleNext}
      handleJumpToQuestion={handleJumpToQuestion}
      handleSubmit={handleSubmit}
      setIsCompactView={setIsCompactView}
      getQuestionNumber={getQuestionNumber}
      handleAnswerChange={handleAnswerChange} // Ensure this line is present
    />
  );
}
