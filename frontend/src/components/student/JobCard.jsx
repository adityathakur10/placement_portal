import React from 'react';
import { 
  RiBriefcaseLine, 
  RiMoneyDollarCircleLine, 
  RiMapPinLine,
  RiCalendarLine,
  RiAlertLine,
  RiArrowRightLine,
  RiTimeLine
} from 'react-icons/ri';

const CompanyLogo = ({ logo, companyName }) => {
  // Handle different logo formats
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    
    // If logo is already a full URL
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    
    // If it's a relative path, prepend the base URL
    return `${import.meta.env.VITE_URI || ''}${logoPath}`;
  };
  
  const logoUrl = getLogoUrl(logo);
  
  return (
    <div className="w-14 h-14 bg-white flex items-center justify-center rounded-lg border">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={typeof companyName === "object" ? companyName.name : companyName}
          className="rounded-lg w-full h-full object-contain p-1"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loops
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z'%3E%3C/path%3E%3C/svg%3E";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <RiBriefcaseLine size={24} className="text-gray-400" />
        </div>
      )}
    </div>
  );
};

const Timeline = ({ processes }) => {
  // Check all possible sources of hiring process data
  if (!processes || !Array.isArray(processes) || processes.length === 0) {
    console.log("No hiring process data available");
    return null;
  }

  console.log("Found hiring process data:", processes);
  
  // Sort processes by index
  const sortedProcesses = [...processes].sort((a, b) => (a.index || 0) - (b.index || 0));

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <RiTimeLine />
        <span>Hiring Process</span>
      </div>
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {sortedProcesses.map((process, index) => {
          // Handle different data structures
          const processDetails = process.Interview || 
                                process.GroupDiscussion || 
                                process.CodingRound || 
                                process.PPT || {};
          
          const title = process.title || processDetails.title || `Round ${index + 1}`;
          const type = process.type ? String(process.type).replace(/-/g, ' ') : 'Interview';
          
          return (
            <div
              key={process.id || index}
              className="flex-shrink-0 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 min-w-[120px]"
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span className="font-medium text-sm">{title}</span>
              </div>
              <div className="text-xs text-gray-500 capitalize">{type}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StudentJobCard = ({ job, onClick }) => {
  // Extract required job details
  const { 
    id,
    Company,
    company: companyName,
    position,
    title,
    logo: rawLogo,
    role,
    salary,
    ctc,
    locationOptions,
    remoteWork,
    applicationDeadline,
    HiringProcesses,
    workflowData,
    eligibility,
  } = job;

  // Debug the hiring process data
  console.log("Job ID:", id, "HiringProcesses:", HiringProcesses);
  
  // Format of logo path
  const logo = Company?.logo 
    ? `${import.meta.env.VITE_URI || ''}${Company.logo}` 
    : rawLogo;
  
  const isEligible = eligibility?.eligible !== false;
  const displayCompanyName = Company?.name || 
    (typeof companyName === "object" ? companyName.name : companyName);
  
  const displayPosition = title || position;
  const displaySalary = salary || (ctc ? `${ctc} LPA` : null);

  // Use either HiringProcesses or workflowData for the timeline
  const processData = workflowData || HiringProcesses || [];

  // Safely access job properties with fallbacks
  const safeTitle = job.title || job.position || "Untitled Position";
  const safeCompanyName = job.Company?.name || job.company || "Unknown Company";
  const safeSalary = job.salary || job.ctc ? `${job.ctc} LPA` : "Not specified";
  const locations = Array.isArray(job.locationOptions) && job.locationOptions.length > 0 
    ? job.locationOptions.join(", ") 
    : (job.remoteWork ? "Remote" : "Not specified");
  
  // Check if hiring processes exist and are properly structured
  const hasHiringProcesses = Array.isArray(job.HiringProcesses) && job.HiringProcesses.length > 0;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer p-5 
        ${!isEligible ? "border-red-200 bg-red-50/10" : "border-gray-100"}`}
      onClick={() => onClick && onClick(job)}
    >
      {/* Header with company logo and position */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex gap-4">
          <CompanyLogo logo={logo} companyName={displayCompanyName} />
          <div>
            <h3 className="font-bold text-xl">{displayPosition}</h3>
            <p className="text-gray-600">{displayCompanyName}</p>
          </div>
        </div>
        
        {eligibility && !isEligible && (
          <div className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-full border border-red-200">
            Not Eligible
          </div>
        )}
      </div>
      
      {/* Job details */}
      <div className="flex flex-wrap gap-6 mb-4">
        {role && (
          <div className="flex items-center gap-2">
            <RiBriefcaseLine className="text-gray-500" />
            <span>{role}</span>
          </div>
        )}
        
        {displaySalary && (
          <div className="flex items-center gap-2">
            <RiMoneyDollarCircleLine className="text-gray-500" />
            <span>{displaySalary}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <RiMapPinLine className="text-gray-500" />
          <span>
            {(locationOptions && locationOptions.length > 0) 
              ? (Array.isArray(locationOptions) ? locationOptions.join(', ') : locationOptions) 
              : (remoteWork ? 'Remote' : 'Location not specified')}
            {remoteWork && locationOptions && locationOptions.length > 0 && ' + Remote'}
          </span>
        </div>
        
        {applicationDeadline && (
          <div className="flex items-center gap-2">
            <RiCalendarLine className="text-gray-500" />
            <span className="text-red-600 font-medium">
              Apply by: {new Date(applicationDeadline).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      
      {/* Timeline - shows process steps in a scrollable view */}
      <Timeline processes={processData} />
      
      {/* Footer with eligibility message and view button */}
      <div className="mt-4 flex justify-between items-center">
        {!isEligible && eligibility?.reasons && eligibility.reasons.length > 0 && (
          <div className="flex items-start gap-1 text-xs text-red-600">
            <RiAlertLine className="flex-shrink-0 mt-0.5" />
            <span>{eligibility.reasons[0]}</span>
          </div>
        )}
        
        <div className={`flex justify-${!isEligible && eligibility?.reasons ? "end" : "between"} w-full items-center`}>
          <button
            className="btn btn-sm btn-outline gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(job);
            }}
          >
            View Details <RiArrowRightLine />
          </button>
          
          {isEligible && (
            <button
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/student/jobs/${id}/apply`;
              }}
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentJobCard;