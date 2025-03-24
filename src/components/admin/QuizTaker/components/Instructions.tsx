import React from 'react';
import { Quiz } from '../../../../types/types';
import Logo1 from '../../../../assets/img/Logo1.png';
import Logo2 from '../../../../assets/img/Logo2.png';
import Logo3 from '../../../../assets/img/Logo3.png';
import Logo4 from '../../../../assets/img/Logo4.png';
import Logo5 from '../../../../assets/img/Logo5.png';
import down from '../../../../assets/img/down.png';
import up from '../../../../assets/img/up.png';

interface InstructionsProps {
  quiz: Quiz;
  acceptedInstructions: boolean;
  onAcceptChange: (accepted: boolean) => void;
  onStartQuiz: () => void;
}

export function Instructions({
  quiz,
  acceptedInstructions,
  onAcceptChange,
  onStartQuiz,
}: InstructionsProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-2xl font-bold mb-6">
          Please read the instructions carefully
        </h1>
      </div>
      <div>
        <h1 className="text-xl font-bold underline mb-6">
          General Instructions:
        </h1>
        <div>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-800">
                  Total duration of {quiz.title} is {quiz.timeLimit} min.
                </li>
              </ul>
            </li>
            <li className="text-gray-800">
              The clock will be set at the server. The countdown timer in the
              top right corner of screen will display the remaining time
              available for you to complete the examination. When the timer
              reaches zero, the examination will end by itself. You will not be
              required to end or submit your examination.
            </li>
            <li>
              <p className="mb-2 text-gray-800">
                The Questions Palette displayed on the right side of screen will
                show the status of each question using one of the following
                symbols:
              </p>
              <ol className="list-decimal pl-8 space-y-2">
                <li className="flex items-center gap-2">
                  <img src={Logo1} alt="Not visited" className="h-5 w-5" />{" "}
                  <span className="text-gray-800">
                    You have not visited the question yet.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <img src={Logo2} alt="Not answered" className="h-5 w-5" />{" "}
                  <span className="text-gray-800">
                    You have not answered the question.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <img src={Logo3} alt="Answered" className="h-5 w-5" />{" "}
                  <span className="text-gray-800">
                    You have answered the question.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src={Logo4}
                    alt="Marked for review"
                    className="h-5 w-5"
                  />{" "}
                  <span className="text-gray-800">
                    You have NOT answered the question, but have marked the
                    question for review.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src={Logo5}
                    alt="Answered and marked"
                    className="h-5 w-5"
                  />{" "}
                  <span className="text-gray-800">
                    The question(s) "Answered and Marked for Review" will be
                    considered for evalution.
                  </span>
                </li>
              </ol>
            </li>
            <li className="text-gray-800">
              You can click on the "&gt;" arrow which apperes to the left of
              question palette to collapse the question palette thereby
              maximizing the question window. To view the question palette
              again, you can click on "&lt;" which appears on the right side of
              question window.
            </li>
            <li className="text-gray-800">
              You can click on your "Profile" image on top right corner of your
              screen to change the language during the exam for entire question
              paper. On clicking of Profile image you will get a drop-down to
              change the question content to the desired language.
            </li>
            <li className="flex items-center gap-2 text-gray-800">
              You can click on{" "}
              <img src={down} alt="Scroll down" className="h-5 w-5" /> to
              navigate to the bottom and{" "}
              <img src={up} alt="Scroll up" className="h-5 w-5" /> to navigate
              to top of the question are, without scrolling.
            </li>
          </ol>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold underline mb-6">
          Navigating to a Question:
        </h1>
        <div>
          <ol className="list-decimal pl-6 space-y-4" start={7}>
            <li className="text-gray-800">
              To answer a question, do the following:
              <ol className="list-[lower-alpha] pl-6 mt-2 space-y-2">
                <li>
                  Click on the question number in the Question Palette at the
                  right of your screen to go to that numbered question directly.
                  Note that using this option does NOT save your answer to the
                  current question.
                </li>
                <li>
                  Click on <strong>Save &amp; Next</strong> to save your answer
                  for the current question and then go to the next question.
                </li>
                <li>
                  Click on <strong>Mark for Review &amp; Next</strong> to save
                  your answer for the current question, mark it for review, and
                  then go to the next question.
                </li>
              </ol>
            </li>
          </ol>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold underline mb-6">
          Answering a Question:
        </h1>
        <div>
          <ol className="list-decimal pl-6 space-y-4" start={8}>
            <li>
              Procedure for answering a multiple choice type question:
              <ol className="list-[lower-alpha] pl-6 mt-2 space-y-2">
                <li>
                  To select your answer, click on the button of one of the
                  options.
                </li>
                <li>
                  To deselect your chosen answer, click on the button of the
                  chosen option again or click on the{" "}
                  <strong>Clear Response</strong> button
                </li>
                <li>
                  To change your chosen answer, click on the button of another
                  option
                </li>
                <li>
                  To save your answer, you MUST click on the Save &amp; Next
                  button.
                </li>
                <li>
                  To mark the question for review, click on the Mark for Review
                  &amp; Next button.
                </li>
              </ol>
            </li>
            <li>
              To change your answer to a question that has already been
              answered, first select that question for answering and then follow
              the procedure for answering that type of question.
            </li>
          </ol>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold underline mb-6">
          Navigating through sections:
        </h1>
        <div>
          <ol className="list-decimal pl-6 space-y-4" start={10}>
            <li>
              Sections in this question paper are displayed on the top bar of
              the screen. Questions in a section can be viewed by clicking on
              the section name. The section you are currently viewing is
              highlighted.
            </li>
            <li>
              After clicking the Save &amp; Next button on the last question for
              a section, you will automatically be taken to the first question
              of the next section.
            </li>
            <li>
              You can shuffle between sections and questions anytime during the
              examination as per your convenience only during the time
              stipulated.
            </li>
            <li>
              Candidate can view the corresponding section summary as part of
              the legend that appears in every section above the question
              palette.
            </li>
          </ol>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        {quiz.instructions?.map((instruction, index) => (
          <p key={index}>{instruction}</p>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-8 border-b-1 border-t-1 border-gray-300 py-4">
        <input
          type="checkbox"
          id="accept-instructions"
          checked={acceptedInstructions}
          onChange={(e) => onAcceptChange(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="accept-instructions">
          I have read and understood the instructions. All computer hardware
          allotted to me are in proper working condition. I declare that I am
          not in possession of / not wearing / not carrying any prohibited
          gadget like mobile phone, bluetooth devices etc. /any prohibited
          material with me into the Examination Hall.I agree that in case of not
          adhering to the instructions, I shall be liable to be debarred from
          this Test and/or to disciplinary action, which may include ban from
          future Tests / Examinations
        </label>
      </div>
      <button
        onClick={onStartQuiz}
        disabled={!acceptedInstructions}
        className={`px-6 py-2 rounded ${
          acceptedInstructions
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Proceed
      </button>
    </div>
  );
}