import React from 'react';
import { 
  RiBriefcaseLine, 
  RiMoneyDollarCircleLine, 
  RiMapPinLine,
  RiUserLine,
  RiUserAddLine,
  RiAlertLine,
  RiTimeLine
} from 'react-icons/ri';
import HiringTimeline from './HiringTimeline';
import ActionButtons from './ActionButtons';

const CompanyLogo = ({ logo, companyName }) => {
  return (
    <div className="w-14 h-14 bg-white flex items-center justify-center rounded-lg">
      {logo ? (
        <img
          src={logo}
          alt={typeof companyName === "object" ? companyName.name : companyName}
          className="rounded-lg w-full h-full object-contain p-1"
          onError={(e) => {
            const parent = e.target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" class="text-gray-400">
                  <path d="M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1-1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z"></path>
                  <path d="M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z"></path>
                </svg>
              </div>`;
            }
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400"
          >
            <path d="M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1-1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z"></path>
            <path d="M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

const AdminSection = ({ assignedAdmin, onAssignAdmin }) => {
  if (assignedAdmin) {
    return (
      <div className="flex items-center gap-2 p-2 bg-base-100 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <RiUserLine className="text-primary" />
        </div>
        <div>
          <div className="text-xs text-muted">
            Assigned to
          </div>
          <div className="font-medium text-sm">
            {assignedAdmin}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <button
      className="flex items-center border-2 p-2 justify-center rounded-full btn-outline btn-primary w-full gap-2"
      onClick={onAssignAdmin}
    >
      <RiUserAddLine />
      Assign Admin
    </button>
  );
};

const JobCard = ({
  job,
  isTimelineExpanded,
  onToggleTimeline,
  onNavigate,
  onDelete,
  onStatusChange,
  onAssignAdmin,
  onClick
}) => {
  const { 
    id, 
    company, 
    Company, 
    position, 
    companyId, 
    logo, 
    role, 
    salary, 
    locationOptions, 
    remoteWork, 
    location,
    applicationDeadline,
    workflowData
  } = job;
  
  const companyName = Company?.name || 
    (typeof company === "object" ? company.name : company) || 
    `Company #${companyId || ""}`;

  // Check for hiring processes
  const hasHiringProcess = job.HiringProcesses && job.HiringProcesses.length > 0;
  
  return (
    <div
      key={id}
      className="card bg-background hover:shadow-md transition-all"
      onClick={() => onClick(job)}
    >
      <div className="card-body p-6">
        {/* Header: Logo + Company + Admin */}
        <div className="flex justify-between items-start mb-4">
          {/* Left: Logo + Company Name + Position */}
          <div className="flex gap-4 items-center">
            <CompanyLogo logo={logo} companyName={companyName} />
            <div>
              <h2 className="text-xl font-bold">{companyName}</h2>
              <div className="text-lg text-muted font-semibold">{position}</div>
            </div>
          </div>

          {/* Right: Admin Assignment/Status */}
          <div className="flex flex-col gap-2 min-w-[180px]">
            <AdminSection 
              assignedAdmin={job.assignedAdmin} 
              onAssignAdmin={(e) => {
                e.stopPropagation();
                onAssignAdmin(job);
              }}
            />
          </div>
        </div>

        {/* Job Info Row */}
        <div className="flex justify-between items-center mb-4">
          {/* Left: Job Type, Salary, Location (instead of CGPA) */}
          <div className="flex gap-6">
            {role && (
              <div className="flex items-center gap-2">
                <RiBriefcaseLine className="text-muted" />
                <span className="font-medium">{role}</span>
              </div>
            )}

            {salary && salary !== "0 LPA" && (
              <div className="flex items-center gap-2">
                <RiMoneyDollarCircleLine className="text-muted" />
                <span className="font-medium">{salary}</span>
              </div>
            )}

            {/* Show Location */}
            <div className="flex items-center gap-2">
              <RiMapPinLine className="text-muted" />
              <div>
                {(locationOptions && locationOptions.length > 0) ? (
                  <span className="font-medium">
                    {Array.isArray(locationOptions) 
                      ? locationOptions.join(', ') 
                      : locationOptions}
                    {remoteWork && ' + Remote'}
                  </span>
                ) : remoteWork ? (
                  <span className="font-medium">Remote</span>
                ) : location ? (
                  <span className="font-medium">{location}</span>
                ) : (
                  <span className="font-medium">Location not specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Apply Before - only show if there's a deadline */}
          {applicationDeadline && (
            <div className="text-right">
              <div className="text-xs text-muted">Apply Before</div>
              <div className="text-sm font-medium text-red">
                {new Date(applicationDeadline).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Timeline for Hiring Process */}
        <HiringTimeline
          workflowData={workflowData}
          isExpanded={isTimelineExpanded}
          onToggleExpand={(e) => {
            e.stopPropagation();
            onToggleTimeline(id);
          }}
          jobId={id}
        />

        {/* Hiring Processes Info - new section */}
        {hasHiringProcess && (
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <RiTimeLine size={12} />
              <span>{job.HiringProcesses.length} hiring rounds</span>
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {job.HiringProcesses.slice(0, 3).map((process, idx) => (
                <span key={process.id || idx} className="badge badge-xs whitespace-nowrap">
                  {process.title || process.type?.replace(/-/g, ' ') || `Round ${idx+1}`}
                </span>
              ))}
              {job.HiringProcesses.length > 3 && (
                <span className="badge badge-xs whitespace-nowrap">
                  +{job.HiringProcesses.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <ActionButtons
          job={job}
          onNavigate={onNavigate}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
};

export default JobCard;