import { useState } from 'react';
import { Quiz } from '../../../../types/types';

export const useQuizBuilder = (initialQuiz?: Quiz) => {
  const [quiz, setQuiz] = useState<Quiz>(
    initialQuiz || {
      id: crypto.randomUUID(),
      title: "",
      header: [],
      instructions: [],
      footer: [],
      sections: [],
      total_duration: 0,
      total_marks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      watermark: {
        enabled: true,
        text: "PROF. P.C. THOMAS & CHAITHANYA CLASSES",
      },
    }
  );

  const [newHeader, setNewHeader] = useState<string>("");
  const [newInstruction, setNewInstruction] = useState<string>("");
  const [newFooter, setNewFooter] = useState<string>("");

  return {
    quiz,
    setQuiz,
    newHeader,
    setNewHeader,
    newInstruction,
    setNewInstruction,
    newFooter,
    setNewFooter
  };
};