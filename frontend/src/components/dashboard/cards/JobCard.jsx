import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiBuilding2Line, RiMapPinLine, RiTimeLine } from 'react-icons/ri';

const JobCard = ({ job, onClick }) => {
  const navigate = useNavigate();

  const handleJobClick = () => {
    if (onClick) {
      onClick(job);
    } else if (job.id) {
      navigate(`/super-admin/job-listings/${job.id}`);
    }
  };

  return (
    <div 
      className="bg-background p-4 rounded-lg mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleJobClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white">
          {job.company?.logo ? (
            <img
              src={job.company.logo}
              alt={job.company.name}
              className="w-full h-full rounded-lg object-contain"
              onError={(e) => {
                // Replace with icon instead of default image
                const parent = e.target.parentElement;
                if (parent) {
                  // Replace the img with an icon
                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center">
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" class="text-gray-400">
                      <path d="M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z"></path>
                      <path d="M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z"></path>
                    </svg>
                  </div>`;
                }
              }}
            />
          ) : (
            <RiBuilding2Line size={24} className="text-muted" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <div className="text-sm text-muted flex items-center gap-4">
            <span className="flex items-center gap-1">
              <RiBuilding2Line /> {job.company?.name}
            </span>
            <span className="flex items-center gap-1">
              <RiMapPinLine /> {job.locationOptions?.join(", ")}
            </span>
            <span className="flex items-center gap-1">
              <RiTimeLine /> {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="badge badge-ghost">{job.type}</span>
            <span className="badge badge-ghost">{job.mode}</span>
            <span className="badge badge-ghost">{job.batch}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;