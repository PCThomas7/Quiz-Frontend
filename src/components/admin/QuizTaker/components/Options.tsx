import React from 'react';
import { Question } from '../../../../types/types';
import { MathText } from '../../MathText/MathText';

interface OptionsProps {
  question: Question;
  selectedAnswers: string[];
  onAnswerChange: (answers: string[]) => void;
}

export function Options({ question, selectedAnswers, onAnswerChange }: OptionsProps) {
  const options = [
    { id: "A", content: question.option_a },
    { id: "B", content: question.option_b },
    { id: "C", content: question.option_c },
    { id: "D", content: question.option_d },
  ];

  return (
    <div className="space-y-4 mt-4">
      {options.map((option) => (
        <div key={option.id} className="flex items-start gap-3">
          <input
            type={question.tags.question_type === "MMCQ" ? "checkbox" : "radio"}
            name={`question-${question.id}`}
            value={option.id}
            checked={selectedAnswers.includes(option.id)}
            onChange={(e) => {
              const value = e.target.value;
              const newAnswers =
                question.tags.question_type === "MMCQ"
                  ? selectedAnswers.includes(value)
                    ? selectedAnswers.filter((a) => a !== value)
                    : [...selectedAnswers, value]
                  : [value];
              onAnswerChange(newAnswers);
            }}
            className="mt-1"
          />
          <label className="flex-1">
            <span className="font-medium mr-2">{option.id}.</span>
            <MathText text={option.content} />
          </label>
        </div>
      ))}
    </div>
  );
}