import React from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightLine, RiHistoryLine } from 'react-icons/ri';
import ApplicationCard from './ApplicationCard';

const ApplicationsSection = ({ applications = [] }) => {
  return (
    <div className="bg-white rounded-xl p-6 h-[45%] flex flex-col shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Applications</h2>
        <Link to="/student/applications" className="btn btn-sm btn-outline flex items-center gap-1">
          View All <RiArrowRightLine />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {applications && applications.length > 0 ? (
          <div className="space-y-3 pr-2">
            {applications.map(application => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-40 h-40 mb-4 text-gray-300">
              <RiHistoryLine size={90} className="mx-auto text-red opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-gray-500">No Applications</h3>
            <p className="text-red/70 mt-2">
              You haven't applied to any jobs yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsSection;