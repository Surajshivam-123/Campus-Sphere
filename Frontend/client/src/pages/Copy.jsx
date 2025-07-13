import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const CopyToClipboard = ({textToCopy}) => {
  const [copySuccess, setCopySuccess] = useState('');
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopySuccess('Copied!');
      })
      .catch(err => {
        setCopySuccess('Failed to copy!');
        console.error('Error copying text: ', err);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <button 
        onClick={handleCopy} 
        className="px-4 py-2 border border-purple-600 text-purple-600 rounded "
      >
        Copy
      </button>
      {copySuccess && (
        <p className="mt-2 text-green-500">{copySuccess}</p>
      )}
    </div>
  );
};

export default CopyToClipboard;
