import React, { useState, useEffect } from 'react';
import { Question, TagSystem, DifficultyLevel, QuestionType } from '../../types';
import Papa, { ParseResult } from 'papaparse';
import { tagService } from '../../../services/tagService';

interface TagManagerProps {
  tagSystem: TagSystem;
  questions: Question[];
  onUpdateTagSystem: (newTagSystem: TagSystem) => void;
}

interface EditingTag {
  category: keyof TagSystem;
  oldValue: string | DifficultyLevel | QuestionType;
  newValue: string;
}

const TagManager: React.FC<TagManagerProps> = ({
  tagSystem,
  questions,
  onUpdateTagSystem,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  const [newTag, setNewTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof TagSystem | ''>('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  // Add these new state variables
  const [missingRows, setMissingRows] = useState<Array<{ row: number; fields: string[] }>>([]);
  const [importedCount, setImportedCount] = useState({
    exam_types: 0,
    subjects: 0,
    chapters: 0,
    topics: 0
  });

  // Categories that cannot be modified at all
  const IMMUTABLE_CATEGORIES = new Set<keyof TagSystem>([
    'difficulty_levels',
    'question_types'
  ]);

  // Categories that can only be added to, not modified or deleted
  const APPEND_ONLY_CATEGORIES = new Set<keyof TagSystem>([
    'exam_types',
    'subjects',
    'sources'
  ]);

  const isImmutableCategory = (category: keyof TagSystem) => {
    return IMMUTABLE_CATEGORIES.has(category);
  };

  const isAppendOnlyCategory = (category: keyof TagSystem) => {
    return APPEND_ONLY_CATEGORIES.has(category);
  };

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  interface TagUsageInfo {
    isInUse: boolean;
    questionCount: number;
    isModification: boolean;
    reason?: string;
  }

  const getTagUsageInfo = (
    category: keyof TagSystem, 
    value: string | DifficultyLevel | QuestionType,
    operation: 'add' | 'edit' | 'delete'
  ): TagUsageInfo => {
    // Block all modifications to immutable categories
    if (isImmutableCategory(category) && operation !== 'add') {
      return {
        isInUse: true,
        questionCount: 0,
        isModification: true,
        reason: `${formatCategoryName(category)} cannot be modified`
      };
    }

    // For append-only categories, allow adding but block editing/deleting existing ones
    if (isAppendOnlyCategory(category) && operation !== 'add') {
      const exists = category === 'subjects' 
        ? Object.values(tagSystem.subjects).some(subjects => subjects.includes(value as string))
        : (tagSystem[category] as string[]).includes(value as string);
      
      if (exists) {
        return {
          isInUse: true,
          questionCount: 0,
          isModification: true,
          reason: `Existing ${formatCategoryName(category)} cannot be modified`
        };
      }
    }

    // For chapters and topics, check if they're used in questions
    const matchingQuestions = questions.filter(q => {
      if (category === 'subjects') {
        return q.tags.subject === value;
      }
      if (category === 'chapters') {
        return q.tags.chapter === value;
      }
      if (category === 'topics') {
        return q.tags.topic === value;
      }
      if (category === 'difficulty_levels') {
        return q.tags.difficulty_level === value;
      }
      if (category === 'question_types') {
        return q.tags.question_type === value;
      }
      return false;
    });

    const isUsed = matchingQuestions.length > 0;
    
    return {
      isInUse: isUsed,
      questionCount: matchingQuestions.length,
      isModification: operation !== 'add' && isUsed,
      reason: isUsed ? `Used by ${matchingQuestions.length} question${matchingQuestions.length !== 1 ? 's' : ''}` : undefined
    };
  };

  // const isTagInUse = (category: keyof TagSystem, value: string | DifficultyLevel | QuestionType) => {
  //   return getTagUsageInfo(category, value, 'edit').isInUse;
  // };

  const validateNewTag = (category: keyof TagSystem, value: string): boolean => {
    switch (category) {
      case 'difficulty_levels':
        return ['Easy', 'Medium', 'Hard'].includes(value) && isValidDifficultyLevel(value);
      case 'question_types':
        return ['MCQ', 'Numeric', 'MMCQ'].includes(value) && isValidQuestionType(value);
      default:
        return true;
    }
  };

  const isValidDifficultyLevel = (value: string): value is DifficultyLevel => {
    return ['Easy', 'Medium', 'Hard'].includes(value as DifficultyLevel);
  };

  const isValidQuestionType = (value: string): value is QuestionType => {
    return ['MCQ', 'Numeric', 'MMCQ'].includes(value as QuestionType);
  };

  const downloadTagTemplate = () => {
    const headers = [
      'exam_type', 'subject', 'chapter', 'topic'
    ];
    const examples = [
      'JEE,Physics,Mechanics,Newton\'s Laws',
      'NEET,Biology,Botany,Plant Physiology'
    ];
    const csvContent = headers.join(',') + '\n' + examples.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tag_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleTagFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    setMissingRows([]);
    setImportedCount({ exam_types: 0, subjects: 0, chapters: 0, topics: 0 });

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.toLowerCase().trim(),
      complete: async (results: ParseResult<{
        exam_type: string;
        subject: string;
        chapter: string;
        topic: string;
      }>) => {
        try {
          // Validate required columns
          const requiredColumns = ['exam_type', 'subject', 'chapter', 'topic'];
          const headers = results.meta.fields || [];
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }

          // Find invalid rows but don't throw error
          const validRows: typeof results.data = [];
          const skippedRows: number[] = [];

          results.data.forEach((row, index) => {
            if (!row.exam_type || !row.subject || !row.chapter || !row.topic ||
                row.chapter.startsWith('[') || row.chapter.startsWith('{')) {
              skippedRows.push(index + 2); // Add 2 to account for header row and 0-based index
            } else {
              validRows.push(row);
            }
          });

          if (validRows.length === 0) {
            throw new Error('No valid data found in CSV');
          }

          // Send valid data to backend through tagService
          const result = await tagService.uploadTagsCsv(validRows);
          
          if (result.success) {
            setImportedCount(result.counts || {
              exam_types: 0,
              subjects: 0,
              chapters: 0,
              topics: 0
            });
            const updatedTags = await tagService.getAllTags();
            onUpdateTagSystem(updatedTags);
            let successMessage = `Successfully imported ${validRows.length} rows`;
            if (skippedRows.length > 0) {
              successMessage += `\nSkipped rows: ${skippedRows.join(', ')}`;
            }
            setSuccess(successMessage);
          } else {
            setError(result.message || 'Failed to upload tags');
          }
        } catch (error) {
          console.error('Upload error:', error);
          setError(error instanceof Error ? error.message : 'Error uploading file');
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setError('Failed to parse CSV file');
      }
    });

    // Reset file input
    event.target.value = '';
  };

  // Add useEffect to fetch tags when component mounts
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setError(null);
        const updatedTags = await tagService.getAllTags();
        onUpdateTagSystem(updatedTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setError('Failed to fetch tags from server');
      }
    };

    fetchTags();
  }, [onUpdateTagSystem]);

  const handleAddTag = async () => {
    if (!selectedCategory || !newTag.trim()) {
      setError('Please select a category and enter a tag name');
      return;
    }

    if (selectedCategory === 'subjects' && !selectedExamType) {
      setError('Please select an exam type first');
      return;
    }

    if (selectedCategory === 'chapters' && !selectedSubject) {
      setError('Please select a subject first');
      return;
    }

    if (selectedCategory === 'topics' && !selectedChapter) {
      setError('Please select a chapter first');
      return;
    }

    if (!validateNewTag(selectedCategory, newTag)) {
      setError(`Invalid value for ${selectedCategory}`);
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      // Prepare data for API call
      const data: { examType?: string; subject?: string; chapter?: string; tag: string } = {
        tag: newTag
      };
      
      if (selectedCategory === 'subjects') {
        data.examType = selectedExamType;
      } else if (selectedCategory === 'chapters') {
        data.subject = selectedSubject;
      } else if (selectedCategory === 'topics') {
        data.chapter = selectedChapter;
      }
      
      // Call API to add tag
      await tagService.addTag(selectedCategory, data);
      
      // Refresh tags from server
      const updatedTags = await tagService.getAllTags();
      onUpdateTagSystem(updatedTags);
      
      setNewTag('');
      setSuccess('Tag added successfully');
    } catch (error) {
      console.error('Error adding tag:', error);
      setError(error instanceof Error ? error.message : 'Failed to add tag');
    }
  };

  const handleEditTag = async (category: keyof TagSystem, oldValue: string | DifficultyLevel | QuestionType) => {
    if (editingTag) {
      if (!editingTag.newValue.trim()) {
        setError('Tag name cannot be empty');
        return;
      }

      if (!validateNewTag(category, editingTag.newValue)) {
        setError(`Invalid value for ${category}`);
        return;
      }

      const usage = getTagUsageInfo(category, oldValue, 'edit');
      if (usage.isModification) {
        setError(usage.reason || `Cannot edit tag "${oldValue}"`);
        return;
      }

      try {
        setError(null);
        setSuccess(null);
        
        // Call API to update tag
        await tagService.updateTag(category, oldValue.toString(), editingTag.newValue);
        
        // Refresh tags from server
        const updatedTags = await tagService.getAllTags();
        onUpdateTagSystem(updatedTags);
        
        setEditingTag(null);
        setSuccess('Tag updated successfully');
      } catch (error) {
        console.error('Error updating tag:', error);
        setError(error instanceof Error ? error.message : 'Failed to update tag');
      }
    } else {
      setEditingTag({
        category,
        oldValue,
        newValue: oldValue.toString()
      });
    }
  };

  const handleDeleteTag = async (category: keyof TagSystem, value: string | DifficultyLevel | QuestionType) => {
    const usage = getTagUsageInfo(category, value, 'delete');
    if (usage.isModification) {
      setError(usage.reason || `Cannot delete tag "${value}"`);
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      // Call API to delete tag
      await tagService.deleteTag(category, value.toString());
      
      // Refresh tags from server
      const updatedTags = await tagService.getAllTags();
      onUpdateTagSystem(updatedTags);
      
      setSuccess('Tag deleted successfully');
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete tag');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tag Management</h2>
        
        {/* Bulk Upload Tags */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Bulk Upload Tags</h3>
          <div className="space-y-4">
            <div>
              <button
                onClick={downloadTagTemplate}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Download Template
              </button>
              <p className="mt-2 text-sm text-gray-600">
                Download a CSV template to bulk upload exam types, subjects, chapters, and topics.
                Fill in the template and upload it below.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Tags CSV
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleTagFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Add New Tag */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Add New Tag</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as keyof TagSystem)}
                className="input-field"
              >
                <option value="">Select Category</option>
                <option value="exam_types">Exam Types</option>
                <option value="subjects">Subjects</option>
                <option value="chapters">Chapters</option>
                <option value="topics">Topics</option>
                <option value="difficulty_levels">Difficulty Levels</option>
                <option value="question_types">Question Types</option>
                <option value="sources">Sources</option>
              </select>

              {selectedCategory === 'subjects' && (
                <select
                  value={selectedExamType}
                  onChange={e => setSelectedExamType(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Exam Type</option>
                  {tagSystem.exam_types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              )}

              {selectedCategory === 'chapters' && (
                <>
                  <select
                    value={selectedExamType}
                    onChange={e => {
                      setSelectedExamType(e.target.value);
                      setSelectedSubject('');
                    }}
                    className="input-field"
                  >
                    <option value="">Select Exam Type</option>
                    {tagSystem.exam_types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {selectedExamType && (
                    <select
                      value={selectedSubject}
                      onChange={e => setSelectedSubject(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select Subject</option>
                      {tagSystem.subjects[selectedExamType]?.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  )}
                </>
              )}

              {selectedCategory === 'topics' && (
                <>
                  <select
                    value={selectedExamType}
                    onChange={e => {
                      setSelectedExamType(e.target.value);
                      setSelectedSubject('');
                      setSelectedChapter('');
                    }}
                    className="input-field"
                  >
                    <option value="">Select Exam Type</option>
                    {tagSystem.exam_types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {selectedExamType && (
                    <select
                      value={selectedSubject}
                      onChange={e => {
                        setSelectedSubject(e.target.value);
                        setSelectedChapter('');
                      }}
                      className="input-field"
                    >
                      <option value="">Select Subject</option>
                      {tagSystem.subjects[selectedExamType]?.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  )}
                  {selectedSubject && (
                    <select
                      value={selectedChapter}
                      onChange={e => setSelectedChapter(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select Chapter</option>
                      {tagSystem.chapters[selectedSubject]?.map(chapter => (
                        <option key={chapter} value={chapter}>{chapter}</option>
                      ))}
                    </select>
                  )}
                </>
              )}

              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="New tag name"
                className="input-field"
              />

              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Current Tags */}
        <div className="space-y-6">
          {/* Exam Types */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Exam Types</h3>
            <div className="flex flex-wrap gap-2">
              {tagSystem.exam_types.map(tag => (
                <div key={tag} className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  getTagUsageInfo('exam_types', tag, 'edit').isInUse ? 'bg-gray-100' : 'bg-blue-50'
                }`}>
                  {editingTag?.category === 'exam_types' && editingTag.oldValue === tag ? (
                    <input
                      type="text"
                      value={editingTag.newValue}
                      onChange={e => setEditingTag({ ...editingTag, newValue: e.target.value })}
                      className="w-24 px-2 py-1 text-sm border rounded"
                    />
                  ) : (
                    <span className="text-sm text-blue-800">
                      {tag}
                      {(() => {
                        const usage = getTagUsageInfo('exam_types', tag, 'edit');
                        if (usage.isInUse) {
                          return (
                            <span className="ml-2 text-xs text-gray-500">
                              ({usage.questionCount} question{usage.questionCount !== 1 ? 's' : ''})
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditTag('exam_types', tag)}
                      className={`${
                        getTagUsageInfo('exam_types', tag, 'edit').isModification 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                      title={getTagUsageInfo('exam_types', tag, 'edit').isModification ? 'Cannot edit tag in use' : 'Edit tag'}
                    >
                      {editingTag?.category === 'exam_types' && editingTag.oldValue === tag ? '✓' : '✎'}
                    </button>
                    <button
                      onClick={() => handleDeleteTag('exam_types', tag)}
                      className={`${
                        getTagUsageInfo('exam_types', tag, 'delete').isModification 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-800'
                      }`}
                      title={getTagUsageInfo('exam_types', tag, 'delete').isModification ? 'Cannot delete tag in use' : 'Delete tag'}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects by Exam Type */}
          {tagSystem.exam_types.map(examType => (
            <div key={examType}>
              <h3 className="text-md font-medium text-gray-900 mb-4">Subjects for {examType}</h3>
              <div className="flex flex-wrap gap-2">
                {tagSystem.subjects[examType]?.map(tag => (
                  <div key={tag} className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    getTagUsageInfo('subjects', tag, 'edit').isInUse ? 'bg-gray-100' : 'bg-green-50'
                  }`}>
                    {editingTag?.category === 'subjects' && editingTag.oldValue === tag ? (
                      <input
                        type="text"
                        value={editingTag.newValue}
                        onChange={e => setEditingTag({ ...editingTag, newValue: e.target.value })}
                        className="w-24 px-2 py-1 text-sm border rounded"
                      />
                    ) : (
                      <span className="text-sm text-green-800">
                        {tag}
                        {(() => {
                          const usage = getTagUsageInfo('subjects', tag, 'edit');
                          if (usage.isInUse) {
                            return (
                              <span className="ml-2 text-xs text-gray-500">
                                ({usage.questionCount} question{usage.questionCount !== 1 ? 's' : ''})
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </span>
                    )}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditTag('subjects', tag)}
                        className={`${
                          getTagUsageInfo('subjects', tag, 'edit').isModification 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                        title={getTagUsageInfo('subjects', tag, 'edit').isModification ? 'Cannot edit tag in use' : 'Edit tag'}
                      >
                        {editingTag?.category === 'subjects' && editingTag.oldValue === tag ? '✓' : '✎'}
                      </button>
                      <button
                        onClick={() => handleDeleteTag('subjects', tag)}
                        className={`${
                          getTagUsageInfo('subjects', tag, 'delete').isModification 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-800'
                        }`}
                        title={getTagUsageInfo('subjects', tag, 'delete').isModification ? 'Cannot delete tag in use' : 'Delete tag'}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Other Tag Categories */}
          {(['difficulty_levels', 'question_types', 'sources'] as const).map(category => (
            <div key={category}>
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tagSystem[category].map(tag => (
                  <div key={tag} className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    getTagUsageInfo(category, tag, 'edit').isInUse ? 'bg-gray-100' : 'bg-purple-50'
                  }`}>
                    {editingTag?.category === category && editingTag.oldValue === tag ? (
                      <input
                        type="text"
                        value={editingTag.newValue}
                        onChange={e => setEditingTag({
                          ...editingTag,
                          newValue: e.target.value
                        })}
                        className="w-24 px-2 py-1 text-sm border rounded"
                      />
                    ) : (
                      <span className="text-sm text-purple-800">
                        {tag}
                        {(() => {
                          const usage = getTagUsageInfo(category, tag, 'edit');
                          if (usage.isInUse) {
                            return (
                              <span className="ml-2 text-xs text-gray-500">
                                ({usage.questionCount} question{usage.questionCount !== 1 ? 's' : ''})
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </span>
                    )}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditTag(category, tag)}
                        className={`${
                          getTagUsageInfo(category, tag, 'edit').isModification 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-purple-600 hover:text-purple-800'
                        }`}
                        title={getTagUsageInfo(category, tag, 'edit').isModification ? 'Cannot edit tag in use' : 'Edit tag'}
                      >
                        {editingTag?.category === category && editingTag.oldValue === tag ? '✓' : '✎'}
                      </button>
                      <button
                        onClick={() => handleDeleteTag(category, tag)}
                        className={`${
                          getTagUsageInfo(category, tag, 'delete').isModification 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-800'
                        }`}
                        title={getTagUsageInfo(category, tag, 'delete').isModification ? 'Cannot delete tag in use' : 'Delete tag'}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagManager;
