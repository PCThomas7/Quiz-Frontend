import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/admin/QuizBuilder/Modal";
import { QuizGeneratorWizard } from "../../components/admin/QuizBuilder/QuizGeneratorWizard";
import { Question, Quiz, QuizSection, TagSystem } from "../../types/types";
import { questionService } from "../../services/questionService";
import { tagService } from "../../services/tagService";
import { quizService } from "../../services/quizService";
import { useAuth } from "../../contexts/AuthContext";

const StudentQuizBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for quiz details
  const [title, setTitle] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // State for data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tagSystem, setTagSystem] = useState<TagSystem>({
    exam_types: [],
    subjects: {},
    chapters: {},
    topics: {},
    difficulties: [],
    question_types: [],
  });
  
  // State for generated quiz
  const [generatedSections, setGeneratedSections] = useState<QuizSection[]>([]);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  
  // Fetch questions and tag system on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tag system
        const tagsResponse = await tagService.getAllTags();
        setTagSystem(tagsResponse);
        
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
        toast.error("Failed to load questions and tags");
      }
    };
    
    fetchData();
  }, []);
  
  // Handle opening the quiz generator wizard
  const handleGenerateQuiz = () => {
    if (!title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }
    
    setShowWizard(true);
  };
  
  // Handle sections generated from the wizard
  const handleSectionsGenerated = (sections: QuizSection[]) => {
    setGeneratedSections(sections);
    setShowWizard(false);
    toast.success("Quiz sections generated successfully!");
  };
  
  // Handle saving the quiz
  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }
    
    if (generatedSections.length === 0) {
      toast.error("Please generate quiz sections first");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Calculate total duration from sections if they have individual timers
      let totalDuration = duration;
      const sectionsHaveTimers = generatedSections.some(s => s.timerEnabled);
      
      if (sectionsHaveTimers) {
        totalDuration = generatedSections.reduce(
          (total, section) => total + (section.duration || 0),
          0
        );
      }
      
      // Create quiz object
      const newQuiz: Quiz = {
        id: crypto.randomUUID(),
        title,
        sections: generatedSections,
        createdBy: user?.id || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        duration: totalDuration,
        isPublished: false,
        batchAssignment: "NONE",
        assignedBatches: [],
        headerNotes: [],
        instructions: [],
        footerNotes: [],
        watermark: false,
        watermarkText: "",
      };
      
      // Save quiz to backend
      await quizService.createQuiz(newQuiz);
      
      // Removed the updateQuizUsage call as it's not needed for student quiz creation
      
      toast.success("Quiz saved successfully!");
      navigate("/student/quizzes");
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Failed to save quiz");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create Your Quiz</h1>
        
        {/* Quiz Basic Details */}
        <div className="space-y-6 mb-8">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quiz title"
            />
          </div>
          
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Duration (minutes)
            </label>
            <input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Generate Quiz Button */}
        <div className="mb-6">
          <button
            onClick={handleGenerateQuiz}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Quiz Questions"}
          </button>
        </div>
        
        {/* Generated Sections Summary */}
        {generatedSections.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Generated Quiz Sections</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <ul className="space-y-2">
                {generatedSections.map((section, index) => (
                  <li key={section.id} className="flex justify-between">
                    <span>
                      <span className="font-medium">Section {index + 1}:</span> {section.title || section.name}
                    </span>
                    <span className="text-gray-600">
                      {section.questions.length} questions
                      {section.timerEnabled && ` • ${section.duration} minutes`}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Questions:</span>
                  <span>
                    {generatedSections.reduce(
                      (total, section) => total + section.questions.length,
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveQuiz}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={isSaving || generatedSections.length === 0}
          >
            {isSaving ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>
      
      {/* Quiz Generator Wizard Modal */}
      {showWizard && (
        <Modal onClose={() => setShowWizard(false)}>
          <QuizGeneratorWizard
            questions={questions}
            tagSystem={tagSystem}
            usedQuestions={new Set()}
            onGenerate={handleSectionsGenerated}
            onCancel={() => setShowWizard(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default StudentQuizBuilderPage;