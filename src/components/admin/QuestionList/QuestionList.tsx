import React, { useState, useEffect } from "react";
import { Question, Tags, TagSystem, Quiz } from "../../../types/types";
import { TagSelector } from "../TagSelector/TagSelector";
import { PaginationControls } from "../PaginationControls/PaginationControls";
import { exportQuestions } from "../../../utils/export";
import katex from "katex";
import { DeleteConfirmationModal } from '../DeleteConfirmationModal/DeleteConfirmationModal';
import { questionService } from '../../../services/questionService';
import { tagService } from '../../../services/tagService';

interface QuestionListProps {
  onEditQuestion: (question: Question) => void;
  quizzes: Quiz[];
}

export const QuestionList: React.FC<QuestionListProps> = ({
  onEditQuestion,
  quizzes,
}) => {
  // State variables
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tagSystem, setTagSystem] = useState<TagSystem | null>(null);
  const [filters, setFilters] = useState<Partial<Tags>>({});
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(() => {
    const saved = localStorage.getItem("questionsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tag system
  useEffect(() => {
    const fetchTagSystem = async () => {
      try {
        const data = await tagService.getAllTags();
        setTagSystem(data);
      } catch (error) {
        console.error('Error fetching tag system:', error);
        setError('Failed to load tag system');
      }
    };
    
    fetchTagSystem();
  }, []);

  // Fetch questions from backend
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await questionService.fetchQuestions({
        page: currentPage,
        limit: questionsPerPage,
        filters,
        searchQuery
      });
      
      if (response.success) {
        setQuestions(response.data.questions);
        setTotalQuestions(response.data.pagination.totalQuestions);
      } else {
        setError('Failed to fetch questions');
      }
    } catch (error) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions when component mounts or dependencies change
  useEffect(() => {
    fetchQuestions();
  }, [currentPage, questionsPerPage, filters, searchQuery]);

  // Save questionsPerPage preference to localStorage
  useEffect(() => {
    localStorage.setItem("questionsPerPage", questionsPerPage.toString());
  }, [questionsPerPage]);

  // Handle question deletion
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await questionService.deleteQuestion(questionId);
      fetchQuestions(); // Refresh the list
      
      // Remove from selected IDs if it was selected
      if (selectedQuestionIds.has(questionId)) {
        const newSelected = new Set(selectedQuestionIds);
        newSelected.delete(questionId);
        setSelectedQuestionIds(newSelected);
      }
    } catch (error) {
      setError('Failed to delete question');
      console.error('Error deleting question:', error);
    }
  };

  // Handle batch deletion
  const handleBatchDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmBatchDelete = async () => {
    try {
      const deletePromises = Array.from(selectedQuestionIds).map(id => 
        questionService.deleteQuestion(id)
      );
      await Promise.all(deletePromises);
      setSelectedQuestionIds(new Set());
      setIsDeleteModalOpen(false);
      fetchQuestions(); // Refresh the list
    } catch (error) {
      setError('Failed to delete selected questions');
      console.error('Error in batch delete:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newTags: Tags) => {
    setFilters(newTags);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const renderMathContent = (text: string) => {
    return text.split(/(\$\$[^\$]+\$\$|\$[^\$]+\$)/).map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        try {
          const math = part.slice(2, -2);
          return (
            <span
              key={index}
              className="block my-2"
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(math, { displayMode: true }),
              }}
            />
          );
        } catch (error) {
          return (
            <span key={index} className="text-red-500">
              {part}
            </span>
          );
        }
      } else if (part.startsWith("$") && part.endsWith("$")) {
        try {
          const math = part.slice(1, -1);
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(math, { displayMode: false }),
              }}
            />
          );
        } catch (error) {
          return (
            <span key={index} className="text-red-500">
              {part}
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderTags = (tags: Tags, question: Question) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.entries(tags).map(
        ([key, value]) =>
          value && (
            <span
              key={key}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {key.replace("_", " ")}: {value}
            </span>
          )
      )}
      {question.usedInQuizzes && question.usedInQuizzes.length > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Used in:{" "}
          {question.usedInQuizzes
            .map((quizId) => {
              const quiz = quizzes.find((q) => q.id === quizId);
              return quiz?.title;
            })
            .filter(Boolean)
            .join(", ")}
        </span>
      )}
    </div>
  );

  // If tag system is not loaded yet, show loading
  if (!tagSystem) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DeleteConfirmationModal
      isOpen={isDeleteModalOpen}
      itemCount={selectedQuestionIds.size}
      onConfirm={confirmBatchDelete}
      onCancel={() => setIsDeleteModalOpen(false)}
    >
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Search and Export */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-2 ml-4">
              {selectedQuestionIds.size > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Selected ({selectedQuestionIds.size})
                </button>
              )}
              <button
                onClick={() => {
                  const blob = exportQuestions(questions, "csv");
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "questions.csv";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Export CSV
              </button>
              <button
                onClick={() => {
                  const blob = exportQuestions(questions, "json");
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "questions.json";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Export JSON
              </button>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Filter Questions
          </h3>
          <TagSelector
            tags={filters as Tags}
            tagSystem={tagSystem}
            onChange={handleFilterChange}
            onNewTag={() => {}} // Filter view doesn't need to create new tags
            onNewHierarchicalTag={() => {}} // Filter view doesn't need to create new tags
          />
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalQuestions > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalItems={totalQuestions}
              itemsPerPage={questionsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setQuestionsPerPage(value);
                setCurrentPage(1);
              }}
            />
          )}

          {/* Select All Checkbox */}
          {!loading && questions.length > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={selectedQuestionIds.size === questions.length && questions.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedQuestionIds(new Set(questions.map(q => q._id)));
                  } else {
                    setSelectedQuestionIds(new Set());
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">
                Select all on this page
              </span>
            </div>
          )}

          {/* Questions */}
          {!loading && questions.map((question) => (
            <div key={question._id} className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedQuestionIds.has(question._id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedQuestionIds);
                      if (e.target.checked) {
                        newSelected.add(question._id);
                      } else {
                        newSelected.delete(question._id);
                      }
                      setSelectedQuestionIds(newSelected);
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="prose max-w-none">
                      {renderMathContent(question.question_text)}
                    </div>
                    {question.image_url && (
                      <img
                        src={question.image_url}
                        alt="Question"
                        className="mt-4 max-w-full h-auto rounded-lg"
                      />
                    )}
                    {renderTags(question.tags, question)}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onEditQuestion(question)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Question details toggle button */}
              <button
                onClick={() =>
                  setExpandedQuestionId(
                    expandedQuestionId === question._id ? null : question._id
                  )
                }
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                {expandedQuestionId === question._id
                  ? "Hide Details"
                  : "Show Details"}
              </button>

              {/* Expanded question details */}
              {expandedQuestionId === question._id && (
                <div className="mt-4 space-y-4">
                  {question.tags.question_type !== "Numeric" && (
                    <div className="grid grid-cols-2 gap-4">
                      {["A", "B", "C", "D"].map((letter) => {
                        const option =
                          `option_${letter.toLowerCase()}` as keyof Question;
                        const imageUrl = `${option}_image_url` as keyof Question;
                        return (
                          <div key={letter}>
                            <span className="label">Option {letter}:</span>
                            <div className="mt-1">
                              {renderMathContent(question[option] as string)}
                              {question[imageUrl] && (
                                <img
                                  src={question[imageUrl] as string}
                                  alt={`Option ${letter} image`}
                                  className="mt-2 max-h-40 rounded-md"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <span className="label">Correct Answer:</span>
                    <div className="mt-1">
                      {Array.isArray(question.correct_answer)
                        ? question.correct_answer.join(", ")
                        : question.correct_answer}
                    </div>
                  </div>

                  <div>
                    <span className="label">Explanation:</span>
                    <div className="mt-1 prose max-w-none">
                      {renderMathContent(question.explanation)}
                      {question.explanation_image_url && (
                        <img
                          src={question.explanation_image_url}
                          alt="Explanation image"
                          className="mt-2 max-h-40 rounded-md"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* No questions message */}
          {!loading && questions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">
                {searchQuery || Object.keys(filters).length > 0
                  ? "No questions found matching your search and filters."
                  : "No questions available."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DeleteConfirmationModal>
  );
};
