import React from "react";
import { Link } from "react-router-dom";
import { RiArrowRightLine, RiBriefcaseLine } from "react-icons/ri";
import JobCard from "./JobCard";

const JobsSection = ({ jobs = [] }) => {
  return (
    <div className="bg-white rounded-xl p-6 h-[55%] flex flex-col shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">New Opportunities</h2>
        <Link
          to="/student/jobs"
          className="btn btn-sm btn-outline flex items-center gap-1"
        >
          View All <RiArrowRightLine />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {jobs && jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-40 h-40 mb-4 text-gray-300">
              <RiBriefcaseLine size={160} className="mx-auto opacity-30" />
            </div>
            <h3 className="text-xl font-medium text-gray-500">
              No Job Listings
            </h3>
            <p className="text-gray-400 mt-2">
              There are no active job listings available at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsSection;
