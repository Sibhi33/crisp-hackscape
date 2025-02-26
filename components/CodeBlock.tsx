import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    setCopied(true);
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="code-block rounded-md overflow-hidden">
      <div className="code-block-header">
        <span>{language}</span>
        <button 
          onClick={copyToClipboard} 
          className="copy-button"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;