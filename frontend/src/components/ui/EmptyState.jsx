import React from 'react';
import { RiBriefcaseLine } from 'react-icons/ri';

const EmptyJobsState = ({ 
  searchQuery, 
  activeFilter, 
  onShowAllJobs, 
  onClearSearch 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="w-40 h-40 mb-4 text-gray-200">
        <RiBriefcaseLine size={160} className="mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-500 mb-2">
        No Job Listings Found
      </h3>
      <p className="text-gray-400 mb-6">
        {searchQuery
          ? `No results found for "${searchQuery}"`
          : activeFilter === "eligible"
          ? "Try including all jobs or adjusting your search criteria"
          : "Try adjusting your search criteria"}
      </p>
      {activeFilter === "eligible" && !searchQuery && (
        <button
          className="btn btn-primary"
          onClick={onShowAllJobs}
        >
          Show All Jobs
        </button>
      )}
      {searchQuery && (
        <button
          className="btn btn-outline"
          onClick={onClearSearch}
        >
          Clear Search
        </button>
      )}
    </div>
  );
};

export default EmptyJobsState;