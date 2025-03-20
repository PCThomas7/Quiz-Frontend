import katex from 'katex';

export const renderMathText = (text: string): string => {
  try {
    // First, handle display mode math ($$...$$)
    let processedText = text.replace(/\$\$([^\$]+)\$\$/g, (math) => {
      return katex.renderToString(math.trim(), {
        throwOnError: false,
        displayMode: true,
        output: 'htmlAndMathml',
        strict: false,
        trust: true,
        macros: {
          '\\V': '\\vec',
          '\\E': '\\vec{E}',
          '\\B': '\\vec{B}'
        }
      });
    });

    // Then handle inline math ($...$)
    processedText = processedText.replace(/\$([^\$]+)\$/g, (math) => {
      return katex.renderToString(math.trim(), {
        throwOnError: false,
        displayMode: false,
        output: 'htmlAndMathml',
        strict: false,
        trust: true,
        macros: {
          '\\V': '\\vec',
          '\\E': '\\vec{E}',
          '\\B': '\\vec{B}'
        }
      });
    });

    return processedText;
  } catch (error) {
    console.error('Math rendering error:', error);
    return text;
  }
};

export const renderMathInText = (text: string): string => {
  let processedText = text.replace(/\$\$([^\$]+)\$\$/g, (_: string, math: string) => {
    // Process display math
    return katex.renderToString(math, { displayMode: true });
  });

  processedText = processedText.replace(/\$([^\$]+)\$/g, (_: string, math: string) => {
    // Process inline math
    return katex.renderToString(math, { displayMode: false });
  });

  return processedText;
};