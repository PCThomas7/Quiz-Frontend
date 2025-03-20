import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import _ from "lodash";

interface StudentAnalyticsProps {
  studentId: string;
}

interface Question {
  id: string;
  question_text: string;
  tags: {
    exam_type: string;
    subject: string;
    chapter: string;
    topic: string;
    question_type: string;
    source: string;
    difficulty: "Easy" | "Medium" | "Hard";
  };
}

interface QuizResult {
  quiz_id: string;
  quiz_title: string;
  date_taken: string;
  score: number;
  max_score: number;
  answers: {
    question_id: string;
    selected_answers: string[];
    correct_answers: string[];
    is_correct: boolean;
  }[];
}

interface AnalyticsDimension {
  id: string;
  name: string;
  field: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#6BD4FF"];
const PERFORMANCE_COLORS = {
  strong: "#4CAF50",  // Green
  average: "#FFC107", // Amber
  weak: "#F44336",    // Red
};

// Helper function to determine performance category
const getPerformanceCategory = (accuracy: number): "strong" | "average" | "weak" => {
  if (accuracy >= 70) return "strong";
  if (accuracy >= 40) return "average";
  return "weak";
};

export const StudentAnalyticsDashboard: React.FC<StudentAnalyticsProps> = ({ studentId }) => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string>("exam_type");
  const [timeframe, setTimeframe] = useState<string>("all");

  // Available dimensions for analysis
  const dimensions: AnalyticsDimension[] = [
    { id: "exam_type", name: "Exam Type", field: "tags.exam_type" },
    { id: "subject", name: "Subject", field: "tags.subject" },
    { id: "chapter", name: "Chapter", field: "tags.chapter" },
    { id: "topic", name: "Topic", field: "tags.topic" },
    { id: "question_type", name: "Question Type", field: "tags.question_type" },
    { id: "source", name: "Source", field: "tags.source" },
    { id: "difficulty", name: "Difficulty Level", field: "tags.difficulty" },
  ];

  // Fetch student quiz results and questions
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, these would be API calls
        // Simulating API calls with dummy data
        const results = await fetchQuizResults(studentId, timeframe);
        
        // Get all question IDs from results
        const questionIds = _.uniq(results.flatMap(result => 
          result.answers.map(answer => answer.question_id)
        ));
        
        // Fetch question details for all IDs
        const questionDetails = await fetchQuestionDetails(questionIds);
        
        setQuizResults(results);
        setQuestions(questionDetails);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load student analytics data");
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, timeframe]);

  // Process data for the selected dimension
  const dimensionAnalysis = useMemo(() => {
    if (!quizResults.length || !Object.keys(questions).length) return [];

    // Combine all answers from all quizzes
    const allAnswers = quizResults.flatMap(quiz => quiz.answers);
    
    // Group by the selected dimension
    const grouped = _.groupBy(allAnswers, answer => {
      const question = questions[answer.question_id];
      if (!question) return "Unknown";
      
      return _.get(question, `tags.${selectedDimension}`, "Unknown");
    });

    // Calculate metrics for each group
    return Object.entries(grouped).map(([key, answers]) => {
      const totalQuestions = answers.length;
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const incorrectAnswers = answers.filter(a => !a.is_correct).length;
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      return {
        name: key,
        total: totalQuestions,
        correct: correctAnswers,
        incorrect: incorrectAnswers,
        unattempted: 0, // We're assuming all questions in results were attempted
        accuracy: parseFloat(accuracy.toFixed(1)),
        performance: getPerformanceCategory(accuracy)
      };
    }).sort((a, b) => b.total - a.total);
  }, [quizResults, questions, selectedDimension]);

  // Calculate overall performance metrics
  const overallMetrics = useMemo(() => {
    if (!quizResults.length) return null;

    const allAnswers = quizResults.flatMap(quiz => quiz.answers);
    const totalQuestions = allAnswers.length;
    const correctAnswers = allAnswers.filter(a => a.is_correct).length;
    const incorrectAnswers = allAnswers.filter(a => !a.is_correct).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    return {
      totalQuizzes: quizResults.length,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unattempted: 0, // Assuming all questions were attempted
      accuracy: parseFloat(accuracy.toFixed(1))
    };
  }, [quizResults]);

  // Generate recommendations based on analysis
  const recommendations = useMemo(() => {
    if (!dimensionAnalysis.length) return [];

    // Find weakest areas (lowest accuracy)
    const weakAreas = dimensionAnalysis
      .filter(item => item.total >= 5) // Only consider areas with enough questions
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return weakAreas.map(area => ({
      area: area.name,
      dimension: dimensions.find(d => d.id === selectedDimension)?.name || selectedDimension,
      accuracy: area.accuracy,
      recommendation: `Focus on improving your ${selectedDimension === 'exam_type' ? 'performance in' : 'understanding of'} ${area.name}. Your current accuracy is ${area.accuracy}%.`
    }));
  }, [dimensionAnalysis, selectedDimension, dimensions]);

  // Time trend analysis
  const timeTrendData = useMemo(() => {
    if (!quizResults.length) return [];
    
    // Sort quizzes by date
    const sortedQuizzes = [...quizResults].sort((a, b) => 
      new Date(a.date_taken).getTime() - new Date(b.date_taken).getTime()
    );
    
    return sortedQuizzes.map(quiz => {
      const accuracy = quiz.score / quiz.max_score * 100;
      return {
        date: new Date(quiz.date_taken).toLocaleDateString(),
        accuracy: parseFloat(accuracy.toFixed(1)),
        score: quiz.score,
        maxScore: quiz.max_score,
        title: quiz.quiz_title
      };
    });
  }, [quizResults]);

  // Strength-weakness radar data
  const radarData = useMemo(() => {
    if (!dimensionAnalysis.length) return [];
    
    // Take top 5-7 categories for readability
    return dimensionAnalysis
      .filter(item => item.total >= 3) // Only include items with enough data
      .slice(0, 7)
      .map(item => ({
        subject: item.name,
        accuracy: item.accuracy
      }));
  }, [dimensionAnalysis]);

  if (isLoading) return <div className="flex justify-center p-10">Loading student analytics...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Student Performance Analytics</h1>
        
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <div>
              <label htmlFor="dimension-select" className="block text-sm font-medium text-gray-700">
                Analyze by
              </label>
              <select
                id="dimension-select"
                value={selectedDimension}
                onChange={(e) => setSelectedDimension(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {dimensions.map((dimension) => (
                  <option key={dimension.id} value={dimension.id}>
                    {dimension.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="timeframe-select" className="block text-sm font-medium text-gray-700">
                Time Period
              </label>
              <select
                id="timeframe-select"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Time</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
              </select>
            </div>
          </div>
          
          {overallMetrics && (
            <div className="flex flex-wrap gap-3">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-500">Quizzes</div>
                <div className="text-xl font-semibold">{overallMetrics.totalQuizzes}</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-500">Questions</div>
                <div className="text-xl font-semibold">{overallMetrics.totalQuestions}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-500">Accuracy</div>
                <div className="text-xl font-semibold">{overallMetrics.accuracy}%</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Performance by Selected Dimension */}
          <div className="bg-white rounded-lg shadow col-span-1 lg:col-span-2 p-4">
            <h2 className="text-lg font-semibold mb-4">
              Performance by {dimensions.find(d => d.id === selectedDimension)?.name || selectedDimension}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dimensionAnalysis}
                  margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis yAxisId="left" orientation="left" label={{ value: 'Questions', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Accuracy %', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="correct" name="Correct" stackId="a" fill="#4CAF50" />
                  <Bar yAxisId="left" dataKey="incorrect" name="Incorrect" stackId="a" fill="#F44336" />
                  <Bar yAxisId="right" dataKey="accuracy" name="Accuracy %" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Answer Distribution */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Overall Answer Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Correct', value: overallMetrics?.correctAnswers || 0 },
                      { name: 'Incorrect', value: overallMetrics?.incorrectAnswers || 0 },
                      { name: 'Unattempted', value: overallMetrics?.unattempted || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#4CAF50" />
                    <Cell fill="#F44336" />
                    <Cell fill="#9E9E9E" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4">
              <div className="flex items-center mx-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span className="text-sm">Correct</span>
              </div>
              <div className="flex items-center mx-2">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span className="text-sm">Incorrect</span>
              </div>
              <div className="flex items-center mx-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-1"></div>
                <span className="text-sm">Unattempted</span>
              </div>
            </div>
          </div>
          
          {/* Strengths and Weaknesses */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Strengths & Weaknesses</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Accuracy" dataKey="accuracy" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Performance Over Time */}
          <div className="bg-white rounded-lg shadow col-span-1 lg:col-span-2 p-4">
            <h2 className="text-lg font-semibold mb-4">Performance Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis yAxisId="left" orientation="left" label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Accuracy %', angle: 90, position: 'insideRight' }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="score" name="Score" fill="#4CAF50" />
                  <Bar yAxisId="right" dataKey="accuracy" name="Accuracy %" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recommended Focus Areas */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Recommended Focus Areas</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-3 py-2">
                    <div className="font-medium">{rec.area}</div>
                    <div className="text-sm text-gray-600">Current accuracy: {rec.accuracy}%</div>
                    <div className="text-sm mt-1">{rec.recommendation}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recommendations available. Continue practicing!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock API functions - These would be replaced with real API calls
async function fetchQuizResults(studentId: string, timeframe: string): Promise<QuizResult[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // This would be an API call in real implementation
  // Return mock data for demonstration
  return [
    {
      quiz_id: "q1",
      quiz_title: "Physics Fundamentals",
      date_taken: "2025-02-15",
      score: 80,
      max_score: 100,
      answers: [
        { question_id: "q1_1", selected_answers: ["A"], correct_answers: ["A"], is_correct: true },
        { question_id: "q1_2", selected_answers: ["B"], correct_answers: ["C"], is_correct: false },
        // More answers
      ]
    },
    {
      quiz_id: "q2",
      quiz_title: "Chemistry Basics",
      date_taken: "2025-02-28",
      score: 75,
      max_score: 100,
      answers: [
        { question_id: "q2_1", selected_answers: ["A"], correct_answers: ["A"], is_correct: true },
        { question_id: "q2_2", selected_answers: ["B"], correct_answers: ["B"], is_correct: true },
        // More answers
      ]
    },
    // More quiz results
  ];
}

async function fetchQuestionDetails(questionIds: string[]): Promise<Record<string, Question>> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // This would be an API call in real implementation
  // Return mock data for demonstration
  const questions: Record<string, Question> = {
    "q1_1": {
      id: "q1_1",
      question_text: "What is Newton's first law?",
      tags: {
        exam_type: "JEE Advanced",
        subject: "Physics",
        chapter: "Laws of Motion",
        topic: "Newton's Laws",
        question_type: "MCQ",
        source: "NCERT",
        difficulty: "Medium"
      }
    },
    "q1_2": {
      id: "q1_2",
      question_text: "Calculate the acceleration due to gravity at the surface of the Earth.",
      tags: {
        exam_type: "JEE Advanced",
        subject: "Physics",
        chapter: "Gravitation",
        topic: "Gravitational Force",
        question_type: "Numerical",
        source: "Reference Book",
        difficulty: "Hard"
      }
    },
    "q2_1": {
      id: "q2_1",
      question_text: "What is the electronic configuration of Carbon?",
      tags: {
        exam_type: "NEET",
        subject: "Chemistry",
        chapter: "Atomic Structure",
        topic: "Electronic Configuration",
        question_type: "MCQ",
        source: "NCERT",
        difficulty: "Easy"
      }
    },
    "q2_2": {
      id: "q2_2",
      question_text: "Balance the following chemical equation: H2 + O2 -> H2O",
      tags: {
        exam_type: "NEET",
        subject: "Chemistry",
        chapter: "Chemical Reactions",
        topic: "Balancing Equations",
        question_type: "MCQ",
        source: "NCERT",
        difficulty: "Medium"
      }
    },
    // More questions
  };
  
  return questionIds.reduce((acc, id) => {
    if (questions[id]) {
      acc[id] = questions[id];
    }
    return acc;
  }, {} as Record<string, Question>);
}

export default StudentAnalyticsDashboard;
