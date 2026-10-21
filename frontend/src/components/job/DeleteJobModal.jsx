import React from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

const DeleteJobModal = ({ isOpen, onClose, onConfirm, jobTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
            <RiErrorWarningLine size={32} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Delete Job Listing</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this job listing{jobTitle ? ` for "${jobTitle}"` : ''}? 
            This action cannot be undone.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors min-w-[120px]"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-w-[120px]"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteJobModal;