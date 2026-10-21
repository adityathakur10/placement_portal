import React from "react";
import { Link } from "react-router-dom";
import {
  RiBuilding2Line,
  RiMoneyDollarCircleLine,
  RiMapPinLine,
  RiBriefcaseLine,
  RiCheckLine,
  RiCloseLine,
  RiCalendarLine,
  RiAlertLine 
} from "react-icons/ri";

const JobCard = ({ job }) => {
  const isEligible = job.eligibility?.eligible !== false;
  
  return (
    <div className={`bg-background w-full p-4 rounded-lg mb-3 hover:shadow-md transition-shadow ${!isEligible ? "border-red-300 bg-red-50/20" : ""}`}>
      {/* Company and Job Info */}
      <div className="flex items-center w-full justify-between">
        <div className="flex flex-row gap-3">
          <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center border">
            {job.Company?.logo ? (
              <img
                src={`${import.meta.env.VITE_URI}${job.Company.logo}`}
                alt={job.Company?.name}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-company.png";
                }}
              />
            ) : (
              <RiBuilding2Line className="text-gray-400" />
            )}
          </div>
          <div className="flex flex-col font-bold">
            <h3 className="text-lg">{job.title}</h3>
            <div className="text-sm text-muted">{job.Company?.name}</div>
          </div>
        </div>
        
        {/* Eligibility Badge - Show when not eligible */}
        {job.eligibility !== undefined && !job.eligibility?.eligible && (
          <div className="badge badge-error text-white mb-2">
            <span className="flex items-center gap-1">
              <RiCloseLine /> Not Eligible
            </span>
          </div>
        )}
        
        {/* Deadline */}
        <div className="items-center flex justify-items-end gap-2">
          <div className="text-sm font-semibold text-muted">Apply Before -</div>
          <div className="text-md font-bold text-red">
            {new Date(job.applicationDeadline).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="mt-2 flex justify-between text-sm">
        <div className="flex gap-4">
          {job.role && (
            <span className="flex items-center gap-1 text-muted">
              <RiBriefcaseLine />
              {job.role}
            </span>
          )}
          {job.ctc && (
            <span className="flex items-center gap-1 text-muted">
              <RiMoneyDollarCircleLine />
              {job.ctc} LPA
            </span>
          )}
          <span className="flex items-center gap-1 text-muted">
            <RiMapPinLine />
            {Array.isArray(job.locationOptions)
              ? job.locationOptions[0] +
                (job.locationOptions.length > 1
                  ? ` +${job.locationOptions.length - 1}`
                  : "")
              : job.locationOptions || "Remote"}
          </span>
        </div>
        
        <Link
          to={`/student/jobs/${job.id}`}
          className="text-red btn btn-sm bg-white hover:bg-dark px-4"
        >
          {isEligible ? "Apply" : "View Details"}
        </Link>
      </div>
      
      {/* Timeline Section - Add if job has hiring processes */}
      {job.HiringProcesses && job.HiringProcesses.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-500">Hiring Process</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {job.HiringProcesses
              .sort((a, b) => a.index - b.index)
              .map((process, index) => {
                const details = process.Interview || 
                               process.GroupDiscussion || 
                               process.CodingRound || 
                               process.PPT || {};
                
                return (
                  <div key={process.id} className="flex-shrink-0 bg-gray-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span className="text-sm whitespace-nowrap">
                      {process.title || details.title || `Round ${index + 1}`}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      
      {/* Not Eligible Reason */}
      {job.eligibility?.reasons && job.eligibility.reasons.length > 0 && (
        <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs rounded flex items-start gap-1">
          <RiAlertLine className="flex-shrink-0 mt-0.5" />
          <span>{job.eligibility.reasons[0]}</span>
        </div>
      )}
    </div>
  );
};

export default JobCard;
