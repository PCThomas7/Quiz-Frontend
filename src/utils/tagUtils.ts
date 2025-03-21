import { TagSystem, TagHierarchy } from '../types/types';

/**
 * Processes a tag system response from the backend to ensure proper structure
 * @param tagSystemData The raw tag system data from the backend
 * @returns Processed tag system data
 */
export function processTagSystemData(tagSystemData: any): TagSystem {
  // Create a copy to avoid mutating the original
  const processedData = { ...tagSystemData };
  
  // Ensure topics is an object if it's undefined or null
  if (!processedData.topics) {
    processedData.topics = {};
    console.warn('Topics was undefined in tag system data, initializing as empty object');
  }
  
  // Ensure subjects is an object if it's undefined or null
  if (!processedData.subjects) {
    processedData.subjects = {};
    console.warn('Subjects was undefined in tag system data, initializing as empty object');
  }
  
  // Ensure chapters is an object if it's undefined or null
  if (!processedData.chapters) {
    processedData.chapters = {};
    console.warn('Chapters was undefined in tag system data, initializing as empty object');
  }
  
  // Ensure hierarchy is an object if it's undefined or null
  if (!processedData.hierarchy) {
    processedData.hierarchy = {};
    console.warn('Hierarchy was undefined in tag system data, initializing as empty object');
  }
  
  // Log the processed data structure
  console.log('Processed tag system data:', {
    exam_types: processedData.exam_types?.length || 0,
    subjects: Object.keys(processedData.subjects).length,
    chapters: Object.keys(processedData.chapters).length,
    topics: Object.keys(processedData.topics).length,
    hierarchy: Object.keys(processedData.hierarchy).length
  });
  
  return processedData as TagSystem;
}

/**
 * Gets topics for a specific chapter from the tag system
 * @param tagSystem The tag system
 * @param chapter The chapter name
 * @returns Array of topics for the chapter
 */
export function getTopicsForChapter(tagSystem: TagSystem, chapter: string): string[] {
  if (!tagSystem || !chapter) return [];
  
  // Try to get topics from the topics object
  const topics = tagSystem.topics[chapter];
  
  if (topics && Array.isArray(topics)) {
    return topics;
  }
  
  // If not found in topics object, try to find in hierarchy
  for (const examType in tagSystem.hierarchy) {
    for (const subject in tagSystem.hierarchy[examType]) {
      if (tagSystem.hierarchy[examType][subject][chapter]) {
        return tagSystem.hierarchy[examType][subject][chapter];
      }
    }
  }
  
  return [];
}