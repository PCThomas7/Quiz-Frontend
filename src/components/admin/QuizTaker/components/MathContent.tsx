import React from 'react';
import katex from 'katex';

interface MathContentProps {
  text: string;
}

export function MathContent({ text }: MathContentProps) {
  return (
    <>
      {text.split(/(\$\$[^\$]+\$\$|\$[^\$]+\$)/).map((part, index) => {
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
      })}
    </>
  );
}