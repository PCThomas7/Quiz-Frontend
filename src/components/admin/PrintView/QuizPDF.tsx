import { Document, Page, Text, View, StyleSheet, Image,} from '@react-pdf/renderer';
import { Quiz } from '../../types';
import katex from 'katex';

// Import or redefine the ExtendedQuiz interface
interface ExtendedQuiz extends Quiz {
  watermark?: {
    enabled: boolean;
    text?: string;
  };
  instructions?: string[];
  footer?: string;
}

// Update the component props to use ExtendedQuiz
interface QuizPDFProps {
  quiz: ExtendedQuiz;
  instituteDetails: {
    name: string;
    tagline: string;

  };
  testDetails: {
    title: string;
    batch: string;
    date: string;
  };
}

const renderMathEquation = (text: string) => {
  if (!text) return null;

  try {
    // Function to convert KaTeX HTML to plain text with Unicode math symbols
    const convertKaTeXToUnicode = (katexHtml: string) => {
      return katexHtml
        // Basic cleanup
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        // Handle percentages
        .replace(/\\%/g, '%')
        // Handle fractions
        .replace(/\\frac{([^}]+)}{([^}]+)}/g, (_, num, den) => {
          // Convert numerator and denominator to superscript/subscript
          return `(${num})/(${den})`;
        })
        // Handle complex exponents with fractions
        .replace(/\^{([^}]+)}/g, (_, exp) => {
          const superscriptMap: Record<string, string> = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
            '-': '⁻', '+': '⁺', '/': '∕', ' ': ' '
          };
          // Handle fraction in exponent
          if (exp.includes('/')) {
            const [num, den] = exp.split('/');
            return '⁽' + num.split('').map(char => superscriptMap[char] || char).join('') + 
                   '∕' + den.split('').map(char => superscriptMap[char] || char).join('') + '⁾';
          }
          return exp.split('').map(char => superscriptMap[char] || char).join('');
        })
        // Handle variables and commas
        .replace(/([A-Z]),/g, '$1, ')
        // Handle spaces around math operators
        .replace(/\\,/g, ' ')
        .replace(/\\ /g, ' ')
        // Clean up multiple spaces
        .replace(/\s+/g, ' ')
        .trim();
    };

    const parts = text.split(/(\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\))/g);
    
    return parts.map((part, index) => {
      if (part.match(/^\$.*\$$/) || part.match(/^\\\[.*\\\]$/) || part.match(/^\\\(.*\\\)$/)) {
        // Remove delimiters
        const equation = part.replace(/^\$|\$|\\\[|\\\]|\\\(|\\\)$/g, '');
        try {
          // Render with KaTeX and convert to Unicode
          const katexHtml = katex.renderToString(equation, {
            throwOnError: false,
            output: 'html'
          });
          const unicodeMath = convertKaTeXToUnicode(katexHtml);
          return <Text key={index} style={styles.mathEquation}>{unicodeMath}</Text>;
        } catch (error) {
          console.warn('KaTeX rendering error:', error);
          return <Text key={index} style={styles.mathEquation}>{equation}</Text>;
        }
      }
      return <Text key={index}>{part}</Text>;
    });
  } catch (error) {
    console.warn('Math processing error:', error);
    return <Text>{text}</Text>;
  }
};

const styles = StyleSheet.create({
  page: {
    padding: '15mm',
    fontFamily: 'Times-Roman',
    fontSize: 10,
    position: 'relative',
  },
  header: {
    marginBottom: '10mm',
    textAlign: 'center',
  },
  instituteName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: '3mm',
  },
  physics: {
    fontSize: 11,
    marginBottom: '2mm',
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: '15mm',
  },
  column: {
    width: '48%',
  },
  sectionTitle: {
    marginBottom: '8mm',
    marginTop: '8mm',
    fontWeight: 'bold',
    width: '100%',
  },
  questionContainer: {
    marginBottom: '8mm',
  },
  question: {
    flexDirection: 'row',
    marginBottom: '3mm',
  },
  questionNumber: {
    width: '15pt',
    marginRight: '5pt',
  },
  questionContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionsGrid: {
    marginLeft: '20pt',
    marginTop: '2mm',
  },
  option: {
    flexDirection: 'row',
    marginBottom: '2mm',
  },
  optionLabel: {
    width: '15pt',
  },
  optionContent: {
    flex: 1,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 10,
    color: 'grey',
  },
  footer: {
    position: 'absolute',
    bottom: '25mm',
    left: '30pt',
    right: '30pt',
    textAlign: 'center',
    fontSize: 8,
    paddingRight: '40pt',
  },
  mathEquation: {
    fontFamily: 'Times-Roman',
    fontStyle: 'italic',
    letterSpacing: 0.8,
    paddingHorizontal: 2,
    lineHeight: 1.2,
    fontSize: 10,
  },
  answerKey: {
    marginTop: '10mm',
    paddingTop: '5mm',
    borderTop: '1pt solid #000',
  },
  answerSection: {
    marginBottom: '5mm',
    width: '100%',
  },
  answer: {
    width: '40pt',
    marginRight: '5pt',
    marginBottom: '2mm',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '20%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 20,
    color: 'red',
    opacity: 0.1,
    zIndex: -1,
  },
});

const getStartingQuestionNumber = (sectionIndex: number, quiz: Quiz): number => {
  let questionCount = 0;
  for (let i = 0; i < sectionIndex; i++) {
    questionCount += quiz.sections[i].questions.length;
  }
  return questionCount + 1;
};

export const QuizPDF: React.FC<QuizPDFProps> = ({ quiz, instituteDetails }) => {
  console.log('Quiz data:', quiz);
  console.log('Sections:', quiz.sections);
  
  const splitQuestionsIntoColumns = (questions: any[]) => {
    const firstColumn: any[] = [];
    const secondColumn: any[] = [];
    
    questions.forEach((question, index) => {
      // For questions that are part of a selection
      if (question.selectionGroup) {
        // If this is the first question in the selection, add to first column
        if (question.selectionGroupIndex === 0) {
          firstColumn.push(question);
        } 
        // If this is the last question in the selection, add to second column
        else if (question.selectionGroupIndex === question.selectionGroupTotal - 1) {
          secondColumn.push(question);
        }
        // Otherwise distribute based on position
        else {
          if (firstColumn.length <= secondColumn.length) {
            firstColumn.push(question);
          } else {
            secondColumn.push(question);
          }
        }
      } 
      // For regular questions (not part of selection)
      else {
        if (index < Math.ceil(questions.length / 2)) {
          firstColumn.push(question);
        } else {
          secondColumn.push(question);
        }
      }
    });

    return [firstColumn, secondColumn];
  };

  const renderOptions = (options: any) => {
    if (!options) return null;
    
    return (
      <View style={styles.optionsGrid}>
        {['A', 'B', 'C', 'D'].map((letter) => {
          const optionKey = `option_${letter.toLowerCase()}`;
          const optionText = options[optionKey];
          
          if (!optionText) return null;
          
          return (
            <View key={letter} style={styles.option}>
              <Text style={styles.optionLabel}>{letter})</Text>
              <View style={styles.optionContent}>
                {renderMathEquation(optionText)}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Calculate how many questions per page (adjust these numbers as needed)
  const QUESTIONS_PER_PAGE = 8; // Adjust based on your layout needs
  
  // Split sections into pages
  const createPages = () => {
    let pages = [];
    let currentPage = [];
    let questionCount = 0;
    
    quiz.sections.forEach((section) => {
      // Start new page if this is a new section and there are already questions on the current page
      if (questionCount > 0 && questionCount + section.questions.length > QUESTIONS_PER_PAGE) {
        pages.push(currentPage);
        currentPage = [];
        questionCount = 0;
      }
      
      currentPage.push(section);
      questionCount += section.questions.length;
      
      // If we've exceeded questions per page, start a new page
      if (questionCount >= QUESTIONS_PER_PAGE) {
        pages.push(currentPage);
        currentPage = [];
        questionCount = 0;
      }
    });
    
    // Add any remaining content
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    
    return pages;
  };

  const pages = createPages();

  return (
    <Document>
      {/* Questions Pages */}
      {pages.map((pageSections, pageIndex) => (
        <Page 
          key={`questions-${pageIndex}`}
          size="A4" 
          style={styles.page}
        >
          {/* Add Watermark */}
          {quiz?.watermark?.enabled && (
            <Text style={styles.watermark}>
              {quiz?.watermark?.text}
            </Text>
          )}

          {/* Header (only on first page) */}
          {pageIndex === 0 && (
            <View style={styles.header}>
              <Text style={styles.instituteName}>{instituteDetails.name}</Text>
              <Text style={styles.physics}>{quiz.title} - {quiz.createdAt.split('T')[0].split('-').reverse().join('-')}</Text>
              <Text style={styles.physics}>Instructions: </Text>
              {quiz.instructions?.map((item,index)=>{
                return <Text style={styles.physics} key={index}>{item}</Text>
              })}
            </View>
          )}

          {/* Questions */}
          {pageSections.map((section, sectionIndex) => (
            <View key={sectionIndex}>
              <Text style={styles.sectionTitle}>
                {section.name} ({section.marks} marks each)
              </Text>
              
              <View style={styles.contentContainer}>
                {/* Left Column */}
                <View style={styles.column}>
                  {splitQuestionsIntoColumns(section.questions)[0].map((question, questionIndex) => {
                    const startingNumber = getStartingQuestionNumber(quiz.sections.indexOf(section), quiz);
                    const questionNumber = startingNumber + questionIndex;
                    return (
                      <View key={questionIndex} style={styles.questionContainer}>
                        <View style={styles.question}>
                          <Text style={styles.questionNumber}>{questionNumber}.</Text>
                          <View style={styles.questionContent}>
                            {renderMathEquation(question.question_text)}
                            {question.image_url && (
                              <Image
                                src={question.image_url}
                                style={{ maxWidth: '150pt', marginTop: '3mm' }}
                              />
                            )}
                          </View>
                        </View>
                        {renderOptions(question)}
                      </View>
                    );
                  })}
                </View>

                {/* Right Column */}
                <View style={styles.column}>
                  {splitQuestionsIntoColumns(section.questions)[1].map((question, questionIndex) => {
                    const startingNumber = getStartingQuestionNumber(quiz.sections.indexOf(section), quiz);
                    const questionNumber = startingNumber + splitQuestionsIntoColumns(section.questions)[0].length + questionIndex;
                    return (
                      <View key={questionIndex} style={styles.questionContainer}>
                        <View style={styles.question}>
                          <Text style={styles.questionNumber}>{questionNumber}.</Text>
                          <View style={styles.questionContent}>
                            {renderMathEquation(question.question_text)}
                            {question.image_url && (
                              <Image
                                src={question.image_url}
                                style={{ maxWidth: '150pt', marginTop: '3mm' }}
                              />
                            )}
                          </View>
                        </View>
                        {renderOptions(question)}
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          ))}

          {/* Footer */}
          <View fixed style={styles.footer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>{instituteDetails.tagline}</Text>
              {quiz.footer ? (
                <Text>{quiz.footer}</Text>
              ) : (
                <View>
                  <Text>Prof. P.C.Thomas Classes, TC-6-1417, East Fort, Thrissur-5 </Text>
                  <Text>Chaithanya Classes, Sankarayya Road, West Fort, Thrissur-4</Text>
                </View>
              )}
            </View>
          </View>
        </Page>
      ))}

      {/* Answer Key Page */}
      <Page
        size="A4"
        style={styles.page}
      >
        {/* Add Watermark on answer key page if enabled */}
        {quiz?.watermark?.enabled && (
          <Text style={styles.watermark}>
            {quiz?.watermark?.text}
          </Text>
        )}

        <View style={styles.answerKey}>
          <Text style={[styles.sectionTitle, { marginBottom: '10mm' }]}>Answer Key - {quiz.title}</Text>
          <View style={styles.contentContainer}>
            {quiz.sections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.answerSection}>
                <Text style={{ fontWeight: 'bold', marginBottom: '2mm' }}>{section.name}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {section.questions.map((question, qIndex) => {
                    const startingNumber = getStartingQuestionNumber(sectionIndex, quiz);
                    const questionNumber = startingNumber + qIndex;
                    return (
                      <Text key={qIndex} style={styles.answer}>
                        {questionNumber}. {question.correct_answer?.toUpperCase() || '-'}{' '}
                      </Text>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer on answer key page */}
        <View fixed style={styles.footer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{instituteDetails.tagline}</Text>
            {quiz.footer ? (
              <Text>{quiz.footer}</Text>
            ) : (
              <View>
                <Text>Prof. P.C.Thomas Classes, TC-6-1417, East Fort, Thrissur-5 </Text>
                <Text>Chaithanya Classes, Sankarayya Road, West Fort, Thrissur-4</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}