import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

export const Skeleton = ({ className = '' }) => {
  return html`
    <div className=${`animate-pulse bg-gray-200 rounded-xl ${className}`}></div>
  `;
};

export const EmptyState = ({ message = 'Məlumat tapılmadı', icon = html`<svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>` }) => {
  return html`
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-[20px]">
      <div className="mb-4">
        ${icon}
      </div>
      <p className="text-sm font-medium text-gray-500">${message}</p>
    </div>
  `;
};
