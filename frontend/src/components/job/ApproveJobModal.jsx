import React from 'react';
import { RiCheckboxCircleLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

const ApproveJobModal = ({ isOpen, onClose, onApprove }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-5">
            <RiCheckboxCircleLine size={32} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Approve Job Listing</h2>
          <p className="text-gray-600 mb-6">
            Do you want to make this job listing visible to students now?
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onApprove(true)}
              className="flex flex-col items-center justify-center p-4 border-2 border-green-500 rounded-xl hover:bg-green-50 transition-colors"
            >
              <RiEyeLine size={24} className="text-green-500 mb-2" />
              <span className="font-medium text-green-700">Yes, Publish Now</span>
              <span className="text-xs text-gray-500 mt-1">Students can see and apply</span>
            </button>
            
            <button
              onClick={() => onApprove(false)}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RiEyeOffLine size={24} className="text-gray-500 mb-2" />
              <span className="font-medium">Approve Internally</span>
              <span className="text-xs text-gray-500 mt-1">Hidden from students</span>
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors min-w-[120px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveJobModal;