import React, { useState, useMemo, useEffect } from "react";
import {
  Question,
  Quiz,
  QuizSection,
  TagSystem,
  DifficultyLevel,
  QuestionType,
  ChapterDistribution,
  TopicDistribution,
} from "../../../types/types";
// import { generateFullQuiz } from '../../src/utils/quizGenerator';

interface QuizGeneratorWizardProps {
  questions: Question[];
  tagSystem: TagSystem;
  onGenerate: (sections: QuizSection[]) => void;
  onCancel: () => void;
  usedQuestions?: Set<string>; // Track questions already used in other sections
}

// First, update the SectionSetup interface to include marks and negativeMarks
interface SectionSetup {
  id: string;
  subject: string;
  questionCount: number;
  difficultyDistribution: Record<DifficultyLevel, number>;
  typeDistribution: Record<QuestionType, number>;
  chapterDistribution: ChapterDistribution[];
  marks: number; // Add this
  negativeMarks: number; // Add this
  TotalQuestion: number; // Add this field
}

type Step = "exam" | "sections" | "filters";

export const QuizGeneratorWizard: React.FC<QuizGeneratorWizardProps> = ({
  questions,
  tagSystem,
  onGenerate,
  onCancel,
  usedQuestions = new Set(),
}) => {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<Step>("exam");
  const [examType, setExamType] = useState("");
  const [sections, setSections] = useState<SectionSetup[]>([]);
  const [generationErrors, setGenerationErrors] = useState<string[]>([]);
  // Add near the top with other state declarations
  const [totalQ, setTotalQ] = useState<number>(0);
  // Available subjects for selected exam type
  const availableSubjects = useMemo(
    () => tagSystem.subjects[examType] || [],
    [examType, tagSystem.subjects]
  );

  // Get available chapters for a subject
  const getAvailableChapters = (subject: string): string[] =>
    tagSystem.chapters[subject] || [];

  // Get available topics for a chapter
  const getAvailableTopics = (chapter: string): string[] =>
    tagSystem.topics[chapter] || [];

  // Add a new function to track used questions across all sections
  const getUsedQuestionsInAllSections = (): Set<string> => {
    const usedQuestionIds = new Set<string>();
    
    sections.forEach(section => {
      section.chapterDistribution.forEach(chapter => {
        const chapterQuestions = questions.filter(q => 
          q.tags.chapter === chapter.chapter &&
          q.tags.subject === section.subject &&
          q.tags.exam_type === examType
        );

        // Add questions used in topics
        chapter.topics.forEach(topic => {
          const topicQuestions = chapterQuestions
            .filter(q => q.tags.topic === topic.topic)
            .slice(0, topic.count);
          topicQuestions.forEach(q => usedQuestionIds.add(q.id));
        });

        // Add questions used directly in chapters (without topics)
        if (!chapter.topics.length) {
          chapterQuestions
            .slice(0, chapter.count)
            .forEach(q => usedQuestionIds.add(q.id));
        }
      });
    });

    return usedQuestionIds;
  };

  // Add this function to track used questions across all sections and topics
  const getUsedQuestionsMap = (): Map<string, Set<string>> => {
    const usedQuestionsMap = new Map<string, Set<string>>();
    
    sections.forEach(section => {
      const sectionUsed = new Set<string>();
      section.chapterDistribution.forEach(chapter => {
        chapter.topics.forEach(topic => {
          // Get available questions for this topic
          const topicQuestions = questions.filter(q => 
            q.tags.subject === section.subject &&
            q.tags.exam_type === examType &&
            q.tags.chapter === chapter.chapter &&
            q.tags.topic === topic.topic
          ).slice(0, topic.count);
          
          // Add to used questions
          topicQuestions.forEach(q => sectionUsed.add(q.id));
        });
      });
      usedQuestionsMap.set(section.id, sectionUsed);
    });
    
    return usedQuestionsMap;
  };

  // Modify the getFilteredQuestions function
  const getFilteredQuestions = (
    section: SectionSetup,
    chapter?: string,
    excludeIds: Set<string> = new Set()
  ): Question[] => {
    if (!section.subject || !examType) return [];

    // Get all used questions from all sections
    const allUsedQuestions = new Set<string>();
    
    // Add questions used in all sections
    sections.forEach(s => {
      if (s.id !== section.id) { // Skip current section
        s.chapterDistribution.forEach(ch => {
          // Add questions used in topics
          ch.topics.forEach(topic => {
            const topicQuestions = questions.filter(q => 
              q.tags.subject === s.subject &&
              q.tags.exam_type === examType &&
              q.tags.chapter === ch.chapter &&
              q.tags.topic === topic.topic
            ).slice(0, topic.count);
            topicQuestions.forEach(q => allUsedQuestions.add(q.id));
          });

          // Add questions used directly in chapters (without topics)
          if (!ch.topics.length) {
            const chapterQuestions = questions.filter(q =>
              q.tags.subject === s.subject &&
              q.tags.exam_type === examType &&
              q.tags.chapter === ch.chapter
            ).slice(0, ch.count);
            chapterQuestions.forEach(q => allUsedQuestions.add(q.id));
          }
        });
      }
    });

    // Add external used questions
    usedQuestions.forEach(id => allUsedQuestions.add(id));
    excludeIds.forEach(id => allUsedQuestions.add(id));

    return questions.filter((q) => {
      // Skip if question is already used
      if (allUsedQuestions.has(q.id)) {
        return false;
      }

      const matchesExamType = q.tags.exam_type === examType;
      const matchesSubject = q.tags.subject === section.subject;
      const matchesChapter = chapter
        ? q.tags.chapter === chapter
        : section.chapterDistribution.some(cd => cd.chapter === q.tags.chapter);

      return matchesExamType && matchesSubject && matchesChapter;
    });
  };

  // Add this helper function to get available questions for a topic
  const getAvailableQuestionsForTopic = (
    section: SectionSetup,
    chapter: string,
    topic: string
  ): Question[] => {
    return getFilteredQuestions(section, chapter).filter(q => q.tags.topic === topic);
  };

  // Get total questions count from chapter distribution
  const getTotalQuestions = (chapterDist: ChapterDistribution[]): number => {
    return chapterDist.reduce(
      (total: number, chapter) => total + chapter.count,
      0
    );
  };

  // Update calculateInitialDistributions to use tags
  const calculateInitialDistributions = (section: SectionSetup) => {
    const availableQuestions = getFilteredQuestions(section);

    // Count questions by difficulty and type
    const difficultyCount = {
      Easy: availableQuestions.filter((q) => q.tags.difficulty_level === "Easy")
        .length,
      Medium: availableQuestions.filter(
        (q) => q.tags.difficulty_level === "Medium"
      ).length,
      Hard: availableQuestions.filter((q) => q.tags.difficulty_level === "Hard")
        .length,
    };

    const typeCount = {
      MCQ: availableQuestions.filter((q) => q.tags.question_type === "MCQ")
        .length,
      MMCQ: availableQuestions.filter((q) => q.tags.question_type === "MMCQ")
        .length,
      Numeric: availableQuestions.filter(
        (q) => q.tags.question_type === "Numerical"
      ).length,
    };

    const totalQuestions = availableQuestions.length;

    console.log("Available questions:", {
      total: totalQuestions,
      byDifficulty: difficultyCount,
      byType: typeCount,
    });

    if (totalQuestions === 0) {
      return {
        difficultyDistribution: section.difficultyDistribution || {
          Easy: 30,
          Medium: 50,
          Hard: 20,
        },
        typeDistribution: section.typeDistribution || {
          MCQ: 60,
          MMCQ: 20,
          Numeric: 20,
        },
      };
    }

    // Calculate percentages
    const calculatePercentages = (counts: Record<string, number>) => {
      const total = Object.values(counts).reduce(
        (sum, count) => sum + count,
        0
      );
      if (total === 0) return null;

      const distribution = Object.fromEntries(
        Object.entries(counts).map(([key, count]) => [
          key,
          Math.round((count / total) * 100),
        ])
      );

      // Adjust to ensure 100% total
      const distTotal = Object.values(distribution).reduce(
        (sum, val) => sum + val,
        0
      );
      if (distTotal !== 100) {
        const maxKey = Object.entries(distribution).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];
        distribution[maxKey] += 100 - distTotal;
      }

      return distribution;
    };

    return {
      difficultyDistribution:
        calculatePercentages(difficultyCount) || section.difficultyDistribution,
      typeDistribution:
        calculatePercentages(typeCount) || section.typeDistribution,
    };
  };

  // Update the handleAddSection function
  // Update handleAddSection to include default values
  const handleAddSection = () => {
    const newSection: SectionSetup = {
      id: crypto.randomUUID(),
      subject: "",
      questionCount: 10,
      difficultyDistribution: {
        Easy: 30,
        Medium: 50,
        Hard: 20,
      },
      typeDistribution: {
        MCQ: 60,
        MMCQ: 20,
        Numeric: 20,
      },
      chapterDistribution: [],
      marks: 1, // Add default mark
      negativeMarks: 0, // Add default negative mark
      TotalQuestion: 0, // Initialize with 0
    };
    setSections((prev) => [...prev, newSection]);
  };

  // Update chapter distribution
  const handleUpdateChapterDistribution = (
    sectionIndex: number,
    chapter: string,
    count: number,
    topics?: TopicDistribution[]
  ): void => {
    setSections((prev) => {
      const newSections = [...prev];
      const section = newSections[sectionIndex];
      const availableQuestions = getFilteredQuestions(section, chapter);

      // Limit count to available questions
      const validCount = Math.min(count, availableQuestions.length);

      const chapterIndex = section.chapterDistribution.findIndex(
        (d) => d.chapter === chapter
      );

      if (chapterIndex >= 0) {
        section.chapterDistribution[chapterIndex] = {
          chapter,
          count: validCount,
          topics: topics || section.chapterDistribution[chapterIndex].topics,
        };
      } else {
        section.chapterDistribution.push({
          chapter,
          count: validCount,
          topics: topics || [],
        });
      }

      // Update total question count based on chapter distribution
      section.questionCount = getTotalQuestions(section.chapterDistribution);
      return newSections;
    });
  };

  // Update handleUpdateTopicDistribution to use filtered questions
  const handleUpdateTopicDistribution = (
    sectionIndex: number,
    chapter: string,
    topic: string,
    count: number
  ): void => {
    setSections(prev => {
      const newSections = [...prev];
      const section = newSections[sectionIndex];
      const chapterDist = section.chapterDistribution.find(d => d.chapter === chapter);

      if (chapterDist) {
        // Get available questions for this topic excluding already used ones
        const availableTopicQuestions = getFilteredQuestions(section, chapter).filter(q => 
          q.tags.topic === topic
        );

        // Limit count to available questions
        const validCount = Math.min(count, availableTopicQuestions.length);

        const topicIndex = chapterDist.topics.findIndex(t => t.topic === topic);
        if (topicIndex >= 0) {
          chapterDist.topics[topicIndex] = { topic, count: validCount };
        } else {
          chapterDist.topics.push({ topic, count: validCount });
        }
      }

      return newSections;
    });
  };

  // Update a section
  const handleUpdateSection = (
    index: number,
    updates: Partial<SectionSetup>
  ): void => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === index
          ? {
              ...section,
              ...updates,
              // Ensure distributions total 100%
              difficultyDistribution:
                updates.difficultyDistribution ||
                section.difficultyDistribution,
              typeDistribution:
                updates.typeDistribution || section.typeDistribution,
            }
          : section
      )
    );
  };

  // Remove a section
  const handleRemoveSection = (index: number): void => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation functions for each step
  const validateExamStep = (): string[] => {
    if (!examType) return ["Please select an exam type"];
    return [];
  };

  // Update getAvailableQuestionsByDifficulty to use tags
  const getAvailableQuestionsByDifficulty = (
    section: SectionSetup
  ): Record<DifficultyLevel, number> => {
    const filteredQuestions = getFilteredQuestions(section);

    return {
      Easy: filteredQuestions.filter((q) => q.tags.difficulty_level === "Easy")
        .length,
      Medium: filteredQuestions.filter(
        (q) => q.tags.difficulty_level === "Medium"
      ).length,
      Hard: filteredQuestions.filter((q) => q.tags.difficulty_level === "Hard")
        .length,
    };
  };

  // Update getAvailableQuestionsByType to use tags
  const getAvailableQuestionsByType = (
    section: SectionSetup
  ): Record<QuestionType, number> => {
    const filteredQuestions = getFilteredQuestions(section);

    return {
      MCQ: filteredQuestions.filter((q) => q.tags.question_type === "MCQ")
        .length,
      MMCQ: filteredQuestions.filter((q) => q.tags.question_type === "MMCQ")
        .length,
      Numeric: filteredQuestions.filter(
        (q) => q.tags.question_type === "Numeric"
      ).length,
    };
  };

  // Update validateTopicDistribution to check chapter question availability
  const validateTopicDistribution = (
    chapterDist: ChapterDistribution,
    availableQuestions: Question[]
  ): string[] => {
    const errors: string[] = [];

    // Check if chapter has enough questions
    if (availableQuestions.length < chapterDist.count) {
      errors.push(
        `Not enough questions available (need ${chapterDist.count}, have ${availableQuestions.length})`
      );
      return errors; // Return early since we can't validate topics without enough chapter questions
    }

    const topicsTotal = chapterDist.topics.reduce((sum, t) => sum + t.count, 0);

    if (topicsTotal > chapterDist.count) {
      errors.push(
        `Total topic questions (${topicsTotal}) exceeds chapter count (${chapterDist.count})`
      );
    }

    // Validate each topic has enough questions
    const usedQuestionIds = new Set<string>();
    chapterDist.topics.forEach((topic) => {
      const topicQuestions = availableQuestions.filter(
        (q) => q.tags.topic === topic.topic && !usedQuestionIds.has(q.id)
      );

      if (topicQuestions.length < topic.count) {
        errors.push(
          `Not enough questions for topic "${topic.topic}" ` +
            `(need ${topic.count}, have ${topicQuestions.length})`
        );
      } else {
        // Track used questions
        topicQuestions
          .slice(0, topic.count)
          .forEach((q) => usedQuestionIds.add(q.id));
      }
    });

    return errors;
  };

  // Update validateSectionsStep to include topic distribution validation
  const validateSectionsStep = (): string[] => {
    const errors: string[] = [];

    sections.forEach((section, index) => {
      if (!section.subject) {
        errors.push(`Section ${index + 1}: Please select a subject`);
        return;
      }

      // Add total questions validation
    if (totalQ > 0) {
      const sectionTotal = getTotalQuestions(section.chapterDistribution);
      if(totalQ === 0) {
        errors.push(`Section ${index + 1}: Please set total required questions`); 
      } else if (sectionTotal !== totalQ) {
        errors.push(
          `Section ${index + 1}: Total questions (${sectionTotal}) must match required amount (${totalQ})`
        );
      }
    }

      // Validate each chapter's topic distribution
      section.chapterDistribution.forEach((chapterDist) => {
        const chapterQuestions = getFilteredQuestions(
          section,
          chapterDist.chapter
        );
        const topicErrors = validateTopicDistribution(
          chapterDist,
          chapterQuestions
        );

        topicErrors.forEach((error) => {
          errors.push(`Section ${index + 1}, ${chapterDist.chapter}: ${error}`);
        });
      });

      // Get available questions for this section
      const availableQuestions = getFilteredQuestions(section);
      console.log("Available questions for validation:", availableQuestions);

      // Calculate required counts based on percentages and total questions
      const totalQuestionsNeeded = section.chapterDistribution.reduce(
        (sum, chapter) => sum + chapter.count,
        0
      );

      // Validate difficulty distribution
      const availableByDifficulty = {
        Easy: availableQuestions.filter(
          (q) => q.tags.difficulty_level === "Easy"
        ).length,
        Medium: availableQuestions.filter(
          (q) => q.tags.difficulty_level === "Medium"
        ).length,
        Hard: availableQuestions.filter(
          (q) => q.tags.difficulty_level === "Hard"
        ).length,
      };

      Object.entries(section.difficultyDistribution).forEach(
        ([difficulty, percentage]) => {
          const neededCount = Math.ceil(
            (percentage / 100) * totalQuestionsNeeded
          );
          const availableCount =
            availableByDifficulty[difficulty as DifficultyLevel];

          console.log(`${difficulty} validation:`, {
            needed: neededCount,
            available: availableCount,
            percentage,
            totalNeeded: totalQuestionsNeeded,
          });

          if (neededCount > availableCount) {
            errors.push(
              `Section ${
                index + 1
              }: Not enough ${difficulty} questions available. ` +
                `Need ${neededCount} (${percentage}%), but only have ${availableCount}`
            );
          }
        }
      );

      // Validate type distribution
      const availableByType = {
        MCQ: availableQuestions.filter((q) => q.tags.question_type === "MCQ")
          .length,
        MMCQ: availableQuestions.filter((q) => q.tags.question_type === "MMCQ")
          .length,
        Numeric: availableQuestions.filter(
          (q) => q.tags.question_type === "Numeric"
        ).length,
      };

      Object.entries(section.typeDistribution).forEach(([type, percentage]) => {
        const neededCount = Math.ceil(
          (percentage / 100) * totalQuestionsNeeded
        );
        const availableCount = availableByType[type as QuestionType];

        console.log(`${type} validation:`, {
          needed: neededCount,
          available: availableCount,
          percentage,
          totalNeeded: totalQuestionsNeeded,
        });

        if (neededCount > availableCount) {
          errors.push(
            `Section ${index + 1}: Not enough ${type} questions available. ` +
              `Need ${neededCount} (${percentage}%), but only have ${availableCount}`
          );
        }
      });
    });

    return errors;
  };

  const validateFiltersStep = (): string[] => {
    const errors: string[] = [];
    sections.forEach((section, index) => {
      const availableQuestions = getFilteredQuestions(section);
      if (availableQuestions.length < section.questionCount) {
        errors.push(
          `Section ${index + 1}: Not enough questions available (need ${
            section.questionCount
          }, have ${availableQuestions.length})`
        );
      }
    });
    return errors;
  };

  // Real-time validation
  useEffect(() => {
    let errors: string[] = [];
    switch (currentStep) {
      case "exam":
        errors = validateExamStep();
        break;
      case "sections":
        errors = validateSectionsStep();
        break;
      case "filters":
        errors = validateFiltersStep();
        break;
    }
    setGenerationErrors(errors);
  }, [currentStep, examType, sections]);

  // Check if can proceed to next step
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case "exam":
        return examType !== "";
      case "sections":
        return (
          sections.length > 0 &&
          sections.every(
            (section) =>
              section.subject &&
              section.chapterDistribution.length > 0 &&
              Object.values(section.difficultyDistribution).reduce(
                (sum, val) => sum + val,
                0
              ) === 100 &&
              Object.values(section.typeDistribution).reduce(
                (sum, val) => sum + val,
                0
              ) === 100 &&
              (section.TotalQuestion === 0 || getTotalQuestions(section.chapterDistribution) === section.TotalQuestion) // Add this condition
          )
          
          
        );
      case "filters":
        return sections.every((section) => {
          const availableQuestions = getFilteredQuestions(section);
          return availableQuestions.length >= section.questionCount;
        });
      default:
        return false;
    }
  }, [currentStep, examType, sections, totalQ]);

  // Handle next step
  const handleNext = () => {
    if (!canProceed) return;

    switch (currentStep) {
      case "exam":
        setCurrentStep("sections");
        setGenerationErrors([]); // Clear errors when moving to next step
        break;
      case "sections":
        setCurrentStep("filters");
        setGenerationErrors([]); // Clear errors when moving to next step
        break;
      case "filters":
        handleGenerate();
        break;
    }
  };

  // Handle back
  const handleBack = () => {
    switch (currentStep) {
      case "sections":
        setCurrentStep("exam");
        break;
      case "filters":
        setCurrentStep("sections");
        break;
    }
  };

  // Generate quiz sections
  // Update the handleGenerate function to include marks in the generated sections
  const handleGenerate = () => {
    if (!canProceed) return;

    const generatedSections: QuizSection[] = sections.map((setup) => {
      const sectionQuestions: Question[] = [];
      const usedQuestionIds = new Set<string>();

      // Get questions according to chapter distribution
      setup.chapterDistribution.forEach((chapter) => {
        // Get available questions for this chapter
        const chapterQuestions = getFilteredQuestions(setup, chapter.chapter)
          .filter(q => !usedQuestionIds.has(q.id));

        // First, handle topic-based selections
        if (chapter.topics && chapter.topics.length > 0) {
          const topicQuestionsCount = chapter.topics.reduce((sum, topic) => sum + topic.count, 0);
          
          // Add topic-selected questions
          chapter.topics.forEach((topic) => {
            const topicQuestions = chapterQuestions.filter(q => 
              q.tags.topic === topic.topic && 
              !usedQuestionIds.has(q.id)
            );
            
            const shuffled = [...topicQuestions].sort(() => Math.random() - 0.5);
            const selectedQuestions = shuffled.slice(0, topic.count);
            
            selectedQuestions.forEach(q => usedQuestionIds.add(q.id));
            sectionQuestions.push(...selectedQuestions);
          });

          // If topic selections don't meet chapter total, randomly select remaining questions
          if (topicQuestionsCount < chapter.count) {
            const remainingCount = chapter.count - topicQuestionsCount;
            const remainingQuestions = chapterQuestions
              .filter(q => !usedQuestionIds.has(q.id))
              .sort(() => Math.random() - 0.5)
              .slice(0, remainingCount);

            remainingQuestions.forEach(q => usedQuestionIds.add(q.id));
            sectionQuestions.push(...remainingQuestions);
          }
        } else {
          // If no topics selected, randomly select all chapter questions
          const shuffled = [...chapterQuestions].sort(() => Math.random() - 0.5);
          const selectedQuestions = shuffled.slice(0, chapter.count);
          
          selectedQuestions.forEach(q => usedQuestionIds.add(q.id));
          sectionQuestions.push(...selectedQuestions);
        }
      });

      // Ensure questions meet difficulty and type distributions
      const finalQuestions = balanceDistributions(
        sectionQuestions,
        setup.difficultyDistribution,
        setup.typeDistribution
      );

      return {
        id: setup.id,
        name: `${setup.subject} Section`,
        timerEnabled: false,
        marks: setup.marks,
        negativeMarks: setup.negativeMarks,
        questions: finalQuestions,
      };
    });

    onGenerate(generatedSections);
  };

  // Add helper function to balance distributions
  const balanceDistributions = (
    questions: Question[],
    difficultyDist: Record<DifficultyLevel, number>,
    typeDist: Record<QuestionType, number>
  ): Question[] => {
    const totalQuestions = questions.length;
    
    // Calculate target counts
    const targetDifficulty = Object.fromEntries(
      Object.entries(difficultyDist).map(([diff, percent]) => [
        diff,
        Math.round((percent / 100) * totalQuestions)
      ])
    );
    
    const targetType = Object.fromEntries(
      Object.entries(typeDist).map(([type, percent]) => [
        type,
        Math.round((percent / 100) * totalQuestions)
      ])
    );

    // Sort questions to match distributions as closely as possible
    return questions.sort((a, b) => {
      const aDiff = targetDifficulty[a.tags.difficulty_level];
      const bDiff = targetDifficulty[b.tags.difficulty_level];
      const aType = targetType[a.tags.question_type];
      const bType = targetType[b.tags.question_type];
      
      return (bDiff + bType) - (aDiff + aType);
    });
  };

  // Update the effect to recalculate distributions when needed
  useEffect(() => {
    // Create a stable reference for section changes
    const sectionsToUpdate = sections.filter(
      (section) => section.subject && section.chapterDistribution.length > 0
    );

    // Only update if distributions need to be recalculated
    sectionsToUpdate.forEach((section, index) => {
      const { difficultyDistribution, typeDistribution } =
        calculateInitialDistributions(section);

      // Check if distributions have actually changed before updating
      const hasDistributionChanged =
        JSON.stringify(section.difficultyDistribution) !==
          JSON.stringify(difficultyDistribution) ||
        JSON.stringify(section.typeDistribution) !==
          JSON.stringify(typeDistribution);

      if (hasDistributionChanged) {
        handleUpdateSection(index, {
          difficultyDistribution,
          typeDistribution,
        });
      }
    });
  }, [examType]); // Only depend on examType changes

  // Add this near other useEffect hooks
  useEffect(() => {
    // Force re-render of available questions when distributions change
    sections.forEach((section, index) => {
      if (section.subject) {
        const availableQuestions = getFilteredQuestions(section);
        if (availableQuestions.length !== section.questionCount) {
          handleUpdateSection(index, { 
            questionCount: availableQuestions.length 
          });
        }
      }
    });
  }, [sections, examType]);

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(["exam", "sections", "filters"] as Step[]).map((step, index) => (
            <button
              key={step}
              onClick={() => {
                if (
                  index < ["exam", "sections", "filters"].indexOf(currentStep)
                ) {
                  setCurrentStep(step);
                }
              }}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${
                  currentStep === step
                    ? "border-blue-500 text-blue-600"
                    : index <
                      ["exam", "sections", "filters"].indexOf(currentStep)
                    ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    : "border-transparent text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {index + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Step Content */}
      <div className="mt-6">
        {currentStep === "exam" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Exam Type
              </label>
              <select
                value={examType}
                onChange={(e) => {
                  setExamType(e.target.value);
                  setGenerationErrors([]); // Clear errors on change
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select an exam type</option>
                {tagSystem.exam_types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentStep === "sections" && (
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={section.id} className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Section {index + 1}
                      </h3>
                      <button
                        onClick={() => handleRemoveSection(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Subject
                        </label>
                        <select
                          value={section.subject}
                          onChange={(e) => {
                            handleUpdateSection(index, {
                              subject: e.target.value,
                              chapterDistribution: [], // Reset chapter distribution when subject changes
                            });
                            setGenerationErrors([]); // Clear errors on change
                          }}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="">Select a subject</option>
                          {availableSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* // Add after the Subject selector and before the Chapter
                      Distribution */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Existing subject selector */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Total Questions Required
                          </label>
                          <input
                            type="number"
                            value={section.TotalQuestion}
                            onChange={(e) => {
                              const value = Math.max(
                                0,
                                parseInt(e.target.value) || 0
                              );
                              handleUpdateSection(index, {
                                TotalQuestion: value
                              });
                            }}
                            min="0"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          />
                        </div>
                      </div>
                      {/* Add this validation message */}
                      <div className="mt-4">
                        <div
                          className={`flex items-center ${
                            section.TotalQuestion > 0 &&
                            getTotalQuestions(section.chapterDistribution) ===
                              section.TotalQuestion
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {section.TotalQuestion > 0
                              ? getTotalQuestions(
                                  section.chapterDistribution
                                ) === section.TotalQuestion
                                ? "✓ Correct: Total questions match required amount"
                                : `❌ Error: Selected ${getTotalQuestions(
                                    section.chapterDistribution
                                  )} questions, need exactly ${section.TotalQuestion}`
                              : "Please set total required questions"}
                        </span>
                        </div>
                      </div>
                    </div>
                    {/* Add the marks inputs in the section setup UI
                    Find the grid containing subject selector and add these inputs: */}
                    {section.subject && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Marks per Question
                          </label>
                          <input
                            type="number"
                            value={section.marks}
                            onChange={(e) =>
                              handleUpdateSection(index, {
                                marks: parseFloat(e.target.value) || 0,
                              })
                            }
                            min="0"
                            step="0.5"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Negative Marks
                          </label>
                          <input
                            type="number"
                            value={section.negativeMarks}
                            onChange={(e) =>
                              handleUpdateSection(index, {
                                negativeMarks: parseFloat(e.target.value) || 0,
                              })
                            }
                            min="0"
                            step="0.25"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {section.subject && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chapter Distribution
                        </label>
                        <div className="space-y-4">
                          {getAvailableChapters(section.subject).map(
                            (chapter) => {
                              const chapterDist =
                                section.chapterDistribution.find(
                                  (d) => d.chapter === chapter
                                );
                              const availableQuestions = getFilteredQuestions(
                                section,
                                chapter
                              );
                              const hasEnoughQuestions =
                                (chapterDist?.count || 0) <=
                                availableQuestions.length;

                              return (
                                <div
                                  key={chapter}
                                  className="border rounded-md p-4"
                                >
                                  <div className="flex items-center gap-4 mb-2">
                                    <span className="font-medium">
                                      {chapter}
                                    </span>
                                    <input
                                      type="number"
                                      value={chapterDist?.count || 0}
                                      onChange={(e) => {
                                        const count =
                                          parseInt(e.target.value) || 0;
                                        handleUpdateChapterDistribution(
                                          index,
                                          chapter,
                                          count
                                        );
                                      }}
                                      min="0"
                                      max={availableQuestions.length}
                                      className={`w-24 px-2 py-1 border rounded-md ${
                                        hasEnoughQuestions
                                          ? "border-gray-300"
                                          : "border-red-300"
                                      }`}
                                    />
                                    <span className="text-sm text-gray-500">
                                      questions
                                    </span>
                                    <span
                                      className={`text-sm ${
                                        hasEnoughQuestions
                                          ? "text-gray-500"
                                          : "text-red-600"
                                      }`}
                                    >
                                      (Available: {availableQuestions.length})
                                    </span>
                                  </div>

                                  {!hasEnoughQuestions && (
                                    <div className="text-sm text-red-600 mb-2">
                                      Not enough questions available for this
                                      chapter
                                    </div>
                                  )}

                                  {chapterDist && chapterDist.count > 0 && (
                                    <div className="ml-4 border-l pl-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Topic Distribution (Optional)
                                      </label>
                                      <div className="space-y-2">
                                        {getAvailableTopics(chapter).map(
                                          (topic) => {
                                            const topicDist =
                                              chapterDist.topics.find(
                                                (t) => t.topic === topic
                                              );
                                            const availableTopicQuestions = getAvailableQuestionsForTopic(
                                              section,
                                              chapter,
                                              topic
                                            );
                                            const topicsTotal = chapterDist.topics.reduce(
                                              (sum, t) => sum + (t.topic === topic ? 0 : t.count),
                                              0
                                            );
                                            const maxAllowed = chapterDist.count - topicsTotal;
                                
                                            return (
                                              <div key={topic} className="flex items-center gap-4">
                                                <span className="text-sm">{topic}</span>
                                                <input
                                                  type="number"
                                                  value={topicDist?.count || 0}
                                                  onChange={(e) => {
                                                    const requestedCount = parseInt(e.target.value) || 0;
                                                    const validCount = Math.min(
                                                      requestedCount,
                                                      maxAllowed,
                                                      availableTopicQuestions.length
                                                    );
                                                    handleUpdateTopicDistribution(
                                                      index,
                                                      chapter,
                                                      topic,
                                                      validCount
                                                    );
                                                  }}
                                                  min="0"
                                                  max={Math.min(maxAllowed, availableTopicQuestions.length)}
                                                  className={`w-20 px-2 py-1 border rounded-md ${
                                                    (topicDist?.count || 0) > availableTopicQuestions.length
                                                      ? "border-red-300"
                                                      : "border-gray-300"
                                                  }`}
                                                />
                                                <span className="text-sm text-gray-500">
                                                  (Available: {availableTopicQuestions.length})
                                                </span>
                                              </div>
                                            );
                                          }
                                        )}
                                        <div className={`text-sm ${
                                          chapterDist.topics.reduce((sum, t) => sum + t.count, 0) <= chapterDist.count
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}>
                                          Selected: {chapterDist.topics.reduce((sum, t) => sum + t.count, 0)} / {chapterDist.count}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Difficulty Distribution (%)
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(section.difficultyDistribution).map(
                            ([difficulty, percentage]) => {
                              const availableByDifficulty =
                                getAvailableQuestionsByDifficulty(section);
                              const requestedCount = Math.ceil(
                                (percentage / 100) * section.questionCount
                              );
                              const availableCount =
                                availableByDifficulty[
                                  difficulty as DifficultyLevel
                                ];
                              const isValid = requestedCount <= availableCount;

                              return (
                                <div key={difficulty} className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <label className="w-20 text-sm">
                                      {difficulty}
                                    </label>
                                    <input
                                      type="number"
                                      value={percentage}
                                      onChange={(e) => {
                                        const newValue =
                                          parseInt(e.target.value) || 0;
                                        handleUpdateSection(index, {
                                          difficultyDistribution: {
                                            ...section.difficultyDistribution,
                                            [difficulty]: newValue,
                                          },
                                        });
                                      }}
                                      min="0"
                                      max="100"
                                      className="w-20 px-2 py-1 text-sm border-gray-300 rounded-md"
                                    />
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      isValid ? "text-gray-500" : "text-red-600"
                                    }`}
                                  >
                                    Available: {availableCount} questions
                                    {!isValid && ` (Need ${requestedCount})`}
                                  </div>
                                </div>
                              );
                            }
                          )}
                          <div
                            className={`text-sm ${
                              Object.values(
                                section.difficultyDistribution
                              ).reduce((sum, val) => sum + val, 0) === 100
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            Total:{" "}
                            {Object.values(
                              section.difficultyDistribution
                            ).reduce((sum, val) => sum + val, 0)}
                            %
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Question Type Distribution (%)
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(section.typeDistribution).map(
                            ([type, percentage]) => {
                              const availableByType =
                                getAvailableQuestionsByType(section);
                              const requestedCount = Math.ceil(
                                (percentage / 100) * section.questionCount
                              );
                              const availableCount =
                                availableByType[type as QuestionType];
                              const isValid = requestedCount <= availableCount;

                              return (
                                <div key={type} className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <label className="w-20 text-sm">
                                      {type}
                                    </label>
                                    <input
                                      type="number"
                                      value={percentage}
                                      onChange={(e) => {
                                        const newValue =
                                          parseInt(e.target.value) || 0;
                                        handleUpdateSection(index, {
                                          typeDistribution: {
                                            ...section.typeDistribution,
                                            [type]: newValue,
                                          },
                                        });
                                      }}
                                      min="0"
                                      max="100"
                                      className="w-20 px-2 py-1 text-sm border-gray-300 rounded-md"
                                    />
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      isValid ? "text-gray-500" : "text-red-600"
                                    }`}
                                  >
                                    Available: {availableCount} questions
                                    {!isValid && ` (Need ${requestedCount})`}
                                  </div>
                                </div>
                              );
                            }
                          )}
                          <div
                            className={`text-sm ${
                              Object.values(section.typeDistribution).reduce(
                                (sum, val) => sum + val,
                                0
                              ) === 100
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            Total:{" "}
                            {Object.values(section.typeDistribution).reduce(
                              (sum, val) => sum + val,
                              0
                            )}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            ))}
            <div>
              {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Question
              </label>
              <input
                type="number"
                value={TotalQuestions || 0}
                onChange={(e) =>{
                  const value = parseInt(e.target.value) || 0;
                // Limit total questions to available questions count
                 const maxQuestions = questions.length;
                  const validValue = Math.min(value, maxQuestions);
                  onChange({
                    ...quiz,
                    TotalQuestion: validValue || 0,
                  })
                }
                }
                min="0"
                max={availableQuestions.length}
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div> */}
              <button
                onClick={handleAddSection}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Section
              </button>
            </div>
          </div>
        )}

        {currentStep === "filters" && (
          <div className="space-y-6">
            {sections.map((section, index) => {
              const filteredQuestions = getFilteredQuestions(section);
              return (
                <div key={section.id} className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {section.subject} - Section {index + 1}
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Chapter Distribution
                        </h4>
                        {section.chapterDistribution.map((chapter) => (
                          <div key={chapter.chapter} className="ml-4">
                            <div className="font-medium">
                              {chapter.chapter}: {chapter.count} questions
                            </div>
                            {chapter.topics.length > 0 && (
                              <div className="ml-4 text-sm text-gray-600">
                                {chapter.topics.map((topic) => (
                                  <div key={topic.topic}>
                                    {topic.topic}: {topic.count} questions
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div
                        className={`text-sm ${
                          filteredQuestions.length >= section.questionCount
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        Available Questions: {filteredQuestions.length}
                        {filteredQuestions.length < section.questionCount &&
                          ` (need ${section.questionCount})`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Error Messages */}
      {generationErrors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside">
                  {generationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <div className="space-x-4">
          {currentStep !== "exam" && (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {currentStep === "filters" ? "Generate Quiz" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};