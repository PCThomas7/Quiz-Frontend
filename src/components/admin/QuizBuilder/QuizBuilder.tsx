import React, { useState, useEffect } from "react";
import { Quiz, Question, TagSystem } from "../../../types/types";
import { QuizSectionBuilder } from "./QuizSectionBuid";
import { QuizGeneratorWizard } from "./QuizGeneratorWizard";
import { QuizPreview } from "../QuizPreview/QuizPreview";
import { Modal } from "./Modal";
import { toast } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { quizService } from "../../../services/quizService";
import { tagService } from "../../../services/tagService";
import { questionService } from "../../../services/questionService";
import { HeaderSection } from "./components/HeaderSection/HeaderSection";
import { useQuizBuilder } from "./hooks/useQuizBuilder";
import { InstructionSection } from "./components/InstructionSection/InstructionSection";
import { FooterSection } from "./components/FooterSection/FooterSection";
import { WatermarkSettings } from "./components/WatermarkSettings/WatermarkSettings";
import { useAuth } from "../../../contexts/AuthContext";
import { BatchSelector } from "./components/BatchSelector/BatchSelector";

interface QuizBuilderProps {
  questions: Question[];
  tagSystem: TagSystem;
  onSave: (quiz: Quiz, updatedQuestions?: Question[]) => void;
  initialQuiz?: Quiz;
  quizzes: Quiz[];
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  questions: initialQuestions,
  tagSystem: initialTagSystem,
  onSave,
  initialQuiz,
  quizzes,
}) => {
  const { user } = useAuth();
  const {
    quiz,
    setQuiz,
    newHeader,
    setNewHeader,
    newInstruction,
    setNewInstruction,
    newFooter,
    setNewFooter,
  } = useQuizBuilder(initialQuiz);

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  // Add state for batch assignment
  const [batchAssignment, setBatchAssignment] = useState<string>(
    initialQuiz?.batchAssignment || "NONE"
  );
  const [selectedBatches, setSelectedBatches] = useState<string[]>(
    initialQuiz?.assignedBatches || []
  );

  const [tagSystem, setTagSystem] = useState<TagSystem>(
    initialTagSystem || {
      exam_types: [],
      subjects: [],
      topics: [],
      difficulties: [],
      question_types: [],
    }
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showGeneratorWizard, setShowGeneratorWizard] =
    useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Add helper function to get available questions
  const getAvailableQuestions = (sectionId: string) => {
    if (!quiz?.sections) return [];

    return questions.filter((question) => {
      // Check if question is used in any section except the current one
      return !quiz.sections.some(
        (section) =>
          section.id !== sectionId &&
          section.questions.some((q) => q.id === question.id)
      );
    });
  };

  // Add useEffect to fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadingError(null);

      try {
        // Fetch tag system with error handling
        const tagsResponse = await tagService.getAllTags();

        setTagSystem({
          ...(tagSystem || {}),
          ...tagsResponse,
        });

        // Fetch questions
        const questionsResponse = await questionService.fetchQuestions({
          page: 1,
          limit: 1000,
          filters: {},
          searchQuery: "",
        });
        setQuestions(questionsResponse.data.questions);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingError("Failed to fetch data from server");
        toast.error("Failed to fetch data from server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    // Validate title
    if (!quiz.title || quiz.title.trim() === "") {
      toast.error("Please enter a quiz title");
      return;
    }

    // Validate sections
    if (quiz.sections.length === 0) {
      toast.error("Please add at least one section");
      return;
    }

    setIsSaving(true);
    try {
      const updatedQuiz = {
        ...quiz,
        batchAssignment,
        assignedBatches: batchAssignment === "SPECIFIC" ? selectedBatches : [],
        createdBy: user?.id || "",
        updatedAt: new Date().toISOString(),
      };

      // Save quiz to backend
      const response = quiz._id
        ? await quizService.updateQuiz(quiz.id, updatedQuiz)
        : await quizService.createQuiz(updatedQuiz);

      // Get the correct quiz ID from response
      const quizIdToUse = response.data?.quiz?.id || response.data?.id || quiz.id;
      
      if (!quizIdToUse) {
          throw new Error('Failed to get quiz ID from response');
      }

      // Update questions with the NEW quiz ID
      const updatedQuestions = questions.map((q) => {
          const isUsedInThisQuiz = quiz.sections.some((section) =>
              section.questions.some((sq) => sq.id === q.id)
          );

          if (isUsedInThisQuiz) {
              const usedInQuizzes = new Set(q.usedInQuizzes || []);
              usedInQuizzes.add(quizIdToUse);
              return {
                  ...q,
                  usedInQuizzes: Array.from(usedInQuizzes),
              };
          }
          return q;
      });

      // Update questions in backend
      try {
          const usedQuestionIds = quiz.sections
              .flatMap(section => section.questions.map(q => q.id));
          
          await questionService.updateQuizUsage(quizIdToUse, usedQuestionIds);
      } catch (error) {
          console.error("Failed to update questions:", error);
          toast.error("Quiz saved but question usage tracking failed");
      }

      toast.success("Quiz saved successfully!");
      onSave({ ...response.data.quiz , id: quizIdToUse }, updatedQuestions);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save quiz");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratedSections = (sections: any[]) => {
    setQuiz((prev) => ({
      ...prev,
      sections: [...prev.sections, ...sections],
    }));
    setShowGeneratorWizard(false);
  };

  // Add the missing function declaration
  const getUsedQuestions = (sectionId: string) => {
    return new Set(
      quiz.sections
        .filter((section) => section.id !== sectionId)
        .flatMap((section) => section.questions.map((q) => q.id))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Quiz Title
          </label>
          <input
            type="text"
            id="title"
            value={quiz.title}
            onChange={(e) =>
              setQuiz((prev) => ({ ...prev, title: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <HeaderSection
          headerItems={quiz.header || quiz.metadata?.header || []}
          newHeader={newHeader}
          onAddHeader={(header) => {
            if (header.trim()) {
              setQuiz((prev) => ({
                ...prev,
                header: [...prev.header || [], header],
              }));
              setNewHeader("");
            }
          }}
          onRemoveHeader={(index) => {
            setQuiz((prev) => ({
              ...prev,
              header: prev.header.filter((_, i) => i !== index),
            }));
          }}
          onHeaderChange={setNewHeader}
        />

        {/* Duration */}
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700"
          >
            Total Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            value={quiz.total_duration || quiz.timeLimit}
            onChange={(e) =>
              setQuiz((prev) => ({
                ...prev,
                total_duration: parseInt(e.target.value) || 0,
              }))
            }
            min="0"
            className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* Instructions */}
        <InstructionSection
          instructions={quiz.instructions || quiz.metadata?.instructions}
          newInstruction={newInstruction}
          onAddInstruction={(instruction) => {
            if (instruction.trim()) {
              setQuiz((prev) => ({
                ...prev,
                instructions: [...prev.instructions, instruction],
              }));
              setNewInstruction("");
            }
          }}
          onRemoveInstruction={(index) => {
            setQuiz((prev) => ({
              ...prev,
              instructions: prev.instructions.filter((_, i) => i !== index),
            }));
          }}
          onInstructionChange={setNewInstruction}
        />

        {/* Footer */}
        <FooterSection
          footerItems={quiz.footer || quiz.metadata?.footer}
          newFooter={newFooter}
          onAddFooter={(footer) => {
            if (footer.trim()) {
              setQuiz((prev) => ({
                ...prev,
                footer: [...prev.footer, footer],
              }));
              setNewFooter("");
            }
          }}
          onRemoveFooter={(index) => {
            setQuiz((prev) => ({
              ...prev,
              footer: prev.footer.filter((_, i) => i !== index),
            }));
          }}
          onFooterChange={setNewFooter}
        />

        {/* Watermark Settings */}
        <WatermarkSettings
          watermark={quiz.watermark}
          onWatermarkChange={(watermark) => {
            setQuiz((prev) => ({
              ...prev,
              watermark,
            }));
          }}
        />

        {/* Batch Assignment  */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Batch Assignment
          </h3>
          <BatchSelector
            batchAssignment={batchAssignment}
            selectedBatches={selectedBatches}
            onChange={(assignment, batches) => {
              setBatchAssignment(assignment);
              setSelectedBatches(batches);
            }}
          />
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Sections</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGeneratorWizard(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Auto Generate
              </button>
              <button
                onClick={() =>
                  setQuiz((prev) => ({
                    ...prev,
                    sections: [
                      ...prev.sections,
                      {
                        id: crypto.randomUUID(),
                        name: `Section ${prev.sections.length + 1}`,
                        timerEnabled: false,
                        marks: 1,
                        negativeMarks: 0,
                        questions: [],
                        isAutogenerated: false,
                      },
                    ],
                  }))
                }
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                Add Section
              </button>
            </div>
          </div>

          {quiz.sections.map((section, index) => (
            <QuizSectionBuilder
              key={index}
              section={section}
              questions={getAvailableQuestions(section.id)}
              tagSystem={tagSystem}
              usedQuestions={new Set<string>()}
              quizzes={quizzes}
              onChange={(updatedSection) =>
                setQuiz((prev) => ({
                  ...prev,
                  sections: prev.sections.map((s) =>
                    s.id === updatedSection.id ? updatedSection : s
                  ),
                }))
              }
              onDelete={() =>
                setQuiz((prev) => ({
                  ...prev,
                  sections: prev.sections.filter((s) => s.id !== section.id),
                }))
              }
            />
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
          <div className="text-sm text-gray-600">
            <div>Total Duration: {quiz.total_duration  || quiz.timeLimit} minutes</div>
            <div>Total Marks: {quiz.total_marks}</div>
            <div>
              Total Questions:{" "}
              {quiz.sections.reduce(
                (sum, section) => sum + section.questions.length,
                0
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 text-white text-sm font-medium rounded-md ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>

      {/* Quiz Generator Wizard Modal */}
      {showGeneratorWizard && (
        <ErrorBoundary
          fallback={<div>Error loading quiz generator wizard</div>}
        >
          <Modal onClose={() => setShowGeneratorWizard(false)}>
            <QuizGeneratorWizard
              questions={questions || []}
              tagSystem={tagSystem}
              onGenerate={(sections) => {
                // Modify sections to include isAutogenerated flag
                const sectionsWithAutoFlag = sections.map((section) => ({
                  ...section,
                  isAutogenerated: true,
                }));
                handleGeneratedSections(sectionsWithAutoFlag);
              }}
              onCancel={() => setShowGeneratorWizard(false)}
              usedQuestions={getUsedQuestions("")}
            />
          </Modal>
        </ErrorBoundary>
      )}

      {/* Quiz Preview Modal */}
      {showPreview && (
        <QuizPreview quiz={quiz} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};
