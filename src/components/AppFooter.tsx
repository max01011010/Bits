import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-sm text-gray-700 dark:text-gray-300 max-w-[250px] text-left">
      <p>Free app by Max Abardo.</p>
      <p>
        Tip me on{' '}
        <a
          href="https://ko-fi.com/maxabardo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Ko-fi
        </a>{' '}
        if you'd like to see more!
      </p>
    </div>
  );
};

export default AppFooter;