import React, { useEffect } from 'react';
import { Quiz } from '../../types';

import { MathText } from '../MathText/MathText';
import 'katex/dist/katex.min.css';
import './PrintView.css';

// Define Question type inline since it seems to be missing from imported types
interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer?: string;
  image_url?: string;
  option_a_image_url?: string;
  option_b_image_url?: string;
  option_c_image_url?: string;
  option_d_image_url?: string;
  [key: string]: any;
}

// Extend Quiz type to include watermark, instructions, and footer properties
interface ExtendedQuiz extends Quiz {
  watermark?: {
    enabled: boolean;
    text?: string;
  };
  instructions?: string[];
  footer?: string;
}

interface PrintViewProps {
  quiz: ExtendedQuiz;
  instituteDetails: {
    name: string;
    logo?: string;
    tagline?: string;
  };
  testDetails: {
    title: string;
    batch: string;
    date: string;
    subject?: string;
  };
}

export const PrintView: React.FC<PrintViewProps> = ({
  quiz,
  instituteDetails,
  testDetails,
}) => {
  // Function to create watermark elements that will be placed throughout content
  const renderWatermark = () => {
    if (quiz?.watermark?.enabled) {
      return <div className="watermark">{quiz.watermark.text}</div>;
    }
    return null;
  };
 


  // Auto-print when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000); // Give time for styles and math to render

    return () => clearTimeout(timer);
  }, []);
  
  const getStartingQuestionNumber = (sectionIndex: number): number => {
    let questionCount = 0;
    for (let i = 0; i < sectionIndex; i++) {
      questionCount += quiz.sections[i].questions.length;
    }
    return questionCount + 1;
  };

  return (
    <div className="print-view">
      {/* Main watermark */}
      {renderWatermark()}

      {/* Header - force it to stay on first page */}
      <div className="first-page-content">
        <header className="header">
          <h1 className="institute-name">{instituteDetails.name}</h1>
          <h2 className="test-title">{testDetails.title}</h2>
          <div className="test-meta">
            <span className="batch">{testDetails.batch}</span>
            {/* <span className="date">{testDetails.date}</span> */}
          </div>
        </header>
        
        {/* Instructions - kept with header on first page */}
        {quiz.instructions && (
          <div className="instructions">
            <h3>Instructions:</h3>
            {quiz.instructions.map((instruction: string, index: number) => (
              <p key={index}>{instruction}</p>
            ))}
          </div>
        )}
      </div>
      
      {/* Main content - all questions in one single flowing container */}
      <main className="main-content">
     
        <div className="questions-container " >
      
          {quiz.sections.map((section, sectionIndex) => (
            <React.Fragment key={section.id} >
              {/* Watermark for each section to ensure it appears on each page */}
            
              {/* Section title that flows with the content */}
              <h3 className="section-title">
                {section.marks} marks each {section.negativeMarks > 0 && `(${section.negative_marks} negative marks each)`}
              </h3>
              
              {/* Questions flow naturally in the container */}
              {(section.questions as unknown as Question[]).map((question: Question, qIndex: number) => {
                const questionNumber = getStartingQuestionNumber(sectionIndex) + qIndex;
                return (
                  <div>
                  <div key={question.id} className="question" >
                    <div className="question-header">
                      <span className="question-number">{questionNumber}.</span>
                      <div className="question-text">
                        <MathText text={question.question_text} />
                      </div>
                    </div>
                    
                    <div className="question-content">
                      {question.image_url && (
                        <img 
                          src={question.image_url} 
                          alt="Question" 
                          className="question-image"
                        />
                      )}

                      <div className="options">
                        {[1, 2, 3, 4].map((number, index) => {
                          const letters = ['a', 'b', 'c', 'd'];
                          const letter = letters[index];
                          const optionKey = `option_${letter}`;
                          const imageUrlKey = `${optionKey}_image_url`;
                          const optionText = question[optionKey as keyof Question] as string;
                          const imageUrl = question[imageUrlKey as keyof Question] as string | undefined;
                          
                          return (
                            <div key={number} className="option">
                              <span className="option-label">({number})</span>
                              <div className="option-content">
                                <MathText text={optionText} />
                                {imageUrl && (
                                  <img 
                                    src={imageUrl} 
                                    alt={`Option ${letter}`} 
                                    className="option-image"
                                  />
                                )}
                              </div>
                            </div>
                            
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </main>

      {/* Answer Key */}
      <div className="answer-key">
        {/* Watermark for answer key page */}
        {/* {renderWatermark()} */}
        <h3>Answer Key - {quiz.title}</h3>
        {quiz.sections.map((section, sectionIndex) => (
          <div key={section.id} className="answer-section">
            <h4>{section.name}</h4>
            <div className="answers-grid">
              {section.questions.map((question: any, qIndex: number) => {
                const questionNumber = getStartingQuestionNumber(sectionIndex) + qIndex;
                // Convert letter answer to number for display
                const answerMap: {[key: string]: string} = {
                  'a': '1', 'b': '2', 'c': '3', 'd': '4',
                  'A': '1', 'B': '2', 'C': '3', 'D': '4'
                };
                const formattedAnswer = question.correct_answer ? 
                  answerMap[question.correct_answer] || question.correct_answer : '-';
                
                return (
                  <div key={question.id} className="answer-item">
                    {questionNumber}. {formattedAnswer}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

       
      
      
    </div>
  );
};
