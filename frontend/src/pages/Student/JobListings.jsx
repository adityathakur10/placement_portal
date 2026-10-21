import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/utils/axiosConfig";
import { Toast } from "@/components/ui/toast";
import DashboardLayout from "@/components/layouts/Dashboard";
import { useRecoilValue } from "recoil";
import { authState } from "@/store/atoms/authAtom";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/ui/EmptyState";
import { 
  RiFilter2Line, 
  RiArrowDownLine, 
  RiArrowUpLine,
  RiCalendarLine,
  RiTimeLine,
  RiBuildingLine,
  RiMapPinLine,
  RiBriefcaseLine,
  RiMoneyDollarCircleLine,
  RiUserLine,
  RiCodeLine,
  RiGroupLine,
  RiPresentationLine,
  RiArrowRightSLine
} from "react-icons/ri";

// Import a modified version of the FilterBar and HiringTimeline component from SuperAdmin
const FilterBar = ({ activeFilter, setActiveFilter, sortOrder, setSortOrder, totalJobs }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
        <p className="text-gray-500 text-sm">{totalJobs} jobs found</p>
      </div>
      
      <div className="flex gap-2">
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
            <RiFilter2Line /> {activeFilter === "eligible" ? "Eligible Jobs" : "All Jobs"}
          </button>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1">
            <li>
              <button 
                className={`${activeFilter === "eligible" ? "bg-red/10 text-red" : ""}`}
                onClick={() => setActiveFilter("eligible")}
              >
                Eligible Jobs
              </button>
            </li>
            <li>
              <button 
                className={`${activeFilter === "all" ? "bg-red/10 text-red" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Jobs
              </button>
            </li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
            Sort {sortOrder === "newest" ? <RiArrowDownLine /> : <RiArrowUpLine />}
          </button>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1">
            <li>
              <button 
                className={`${sortOrder === "newest" ? "bg-red/10 text-red" : ""}`}
                onClick={() => setSortOrder("newest")}
              >
                Newest First
              </button>
            </li>
            <li>
              <button 
                className={`${sortOrder === "deadline" ? "bg-red/10 text-red" : ""}`}
                onClick={() => setSortOrder("deadline")}
              >
                Deadline Approaching
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Timeline component for job cards
const HiringTimelineMini = ({ processes, isExpanded, onToggleExpand }) => {
  // Add more validation and debugging
  console.log("HiringTimelineMini received:", { 
    processes: processes,
    count: processes?.length || 0,
    isExpanded: isExpanded
  });
  
  // Better validation
  if (!processes || !Array.isArray(processes) || processes.length === 0) {
    console.log("No hiring processes to display");
    return null;
  }
  
  // Make a safe copy and ensure sorting works properly
  const sortedProcesses = [...processes]
    .sort((a, b) => (Number(a.index) || 0) - (Number(b.index) || 0));
    
  const visibleProcesses = isExpanded ? 
    sortedProcesses : 
    sortedProcesses.slice(0, Math.min(3, sortedProcesses.length));
  
  const getProcessIcon = (type) => {
    const processType = typeof type === 'string' ? type.toLowerCase() : '';
    
    switch(processType) {
      case 'interview': return <RiUserLine className="text-blue-500" />;
      case 'coding-round': case 'coding_round': case 'coding': 
        return <RiCodeLine className="text-green-500" />;
      case 'group-discussion': case 'group_discussion': case 'gd':
        return <RiGroupLine className="text-amber-500" />;
      case 'ppt': case 'presentation':
        return <RiPresentationLine className="text-purple-500" />;
      default: return <RiTimeLine className="text-gray-500" />;
    }
  };
  
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Hiring Process</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="text-xs text-blue-600 hover:underline"
        >
          {isExpanded ? "Show Less" : `Show All (${sortedProcesses.length})`}
        </button>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 z-0"></div>
        
        <div className="space-y-2 relative">
          {visibleProcesses.map((process, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 z-10">
                {getProcessIcon(process.type)}
              </div>
              
              <div className="flex-1 text-xs">
                <div className="font-medium">{process.title || `Round ${index + 1}`}</div>
                <div className="text-gray-500">
                  {new Date(process.startDateTime).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          
          {!isExpanded && sortedProcesses.length > 3 && (
            <div className="text-xs text-center text-gray-500 pt-1">
              {sortedProcesses.length - 3} more rounds
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Job Card component
const EnhancedJobCard = ({ job, onClick, onToggleTimeline, isTimelineExpanded }) => {
  const {
    id,
    title,
    company,
    logo,
    role,
    salary,
    applicationDeadline,
    locationOptions,
    remoteWork,
    HiringProcesses,
    eligibility,
  } = job;
  
  const isEligible = eligibility?.eligible;
  
  const formattedDeadline = applicationDeadline 
    ? new Date(applicationDeadline).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    : null;
  
  console.log(`Timeline data for job ${id}:`, {
    hasHiringProcess: Boolean(HiringProcesses),
    processCount: HiringProcesses?.length || 0,
    firstProcess: HiringProcesses?.[0]
  });
  
  return (
    <div 
      className={`bg-white border ${isEligible ? 'border-gray-200' : 'border-gray-200 bg-gray-50'} rounded-xl shadow-sm hover:shadow transition-all overflow-hidden cursor-pointer`}
      onClick={() => onClick(job)}
    >
      <div className="p-4">
        {/* Card Header with Logo */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-gray-100">
            {logo ? (
              <img 
                src={logo} 
                alt={company} 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'%3E%3Cpath d='M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2z'%3E%3C/path%3E%3C/svg%3E";
                }}
              />
            ) : (
              <RiBuildingLine size={24} className="text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{title}</h3>
            <p className="text-red text-sm">{company}</p>
          </div>
          
          {/* Eligibility Badge */}
          {isEligible ? (
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Eligible
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Not Eligible
            </span>
          )}
        </div>
        
        {/* Job Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {role && (
            <div className="flex items-center gap-1.5">
              <RiBriefcaseLine className="text-red-500 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700 truncate">{role}</span>
            </div>
          )}
          
          {salary && (
            <div className="flex items-center gap-1.5">
              <RiMoneyDollarCircleLine className="text-red-500 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700 truncate">{salary}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
            <RiMapPinLine className="text-red-500 flex-shrink-0" size={16} />
            <span className="text-sm text-gray-700 truncate">
              {remoteWork ? 'Remote' :
              locationOptions && locationOptions.length > 0
                ? Array.isArray(locationOptions) 
                  ? locationOptions[0] + (locationOptions.length > 1 ? ` +${locationOptions.length - 1}` : '')
                  : locationOptions
                : 'Location not specified'
              }
            </span>
          </div>
          
          {applicationDeadline && (
            <div className="flex items-center gap-1.5">
              <RiCalendarLine className="text-red-500 flex-shrink-0" size={16} />
              <span className="text-sm text-gray-700">{formattedDeadline}</span>
            </div>
          )}
        </div>
        
        {/* Timeline Section */}
        {Array.isArray(HiringProcesses) && HiringProcesses.length > 0 ? (
          <HiringTimelineMini 
            processes={HiringProcesses} 
            isExpanded={Boolean(isTimelineExpanded)}
            onToggleExpand={() => onToggleTimeline(id)}
          />
        ) : (
          // Display hiring info based on job data even if processes array is empty
          job.ctc && job.applicationDeadline ? (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-700 text-center">
                <span className="font-medium">Expected Selection Process:</span> Technical Interview + HR Round
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 text-center">
                No hiring process information available
              </div>
            </div>
          )
        )}
        
        {/* Footer with Apply Button */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          {eligibility && !eligibility.eligible && eligibility.reasons && (
            <div className="text-xs text-amber-700">
              <span className="font-medium">Reason: </span>
              {eligibility.reasons[0]}
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(job);
            }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red text-white rounded-lg text-sm hover:bg-red/90 transition-colors"
          >
            {isEligible ? 'Apply Now' : 'View Details'}
            <RiArrowRightSLine />
          </button>
        </div>
      </div>
    </div>
  );
};

const JobListings = () => {
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("eligible");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTimelines, setExpandedTimelines] = useState({});

  // Job Listing Data Fetching
  const {
    data: jobsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["student-jobs-all"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/job-listings/students/100`);
        
        // Add validation and logging
        console.log("Raw job data from API:", response.data);
        
        if (!response.data || !response.data.jobListings) {
          console.error("Invalid API response format:", response.data);
          return [];
        }
        
        // Create fixed placeholder data for each job listing
        const validatedJobs = response.data.jobListings.map(job => {
          // Always create standard placeholder hiring processes
          // This is a guaranteed workaround until backend is fixed
          const hiringProcesses = [
            {
              id: `gen-${job.id}-1`,
              index: 0,
              type: 'interview',
              title: 'Technical Interview',
              startDateTime: job.applicationDeadline || new Date().toISOString(),
              endDateTime: new Date(new Date(job.applicationDeadline || Date.now()).getTime() + 3600000).toISOString(),
              venue: 'To be announced',
              link: null,
              topic: null,
              interviewType: 'technical'
            },
            {
              id: `gen-${job.id}-2`,
              index: 1,
              type: 'interview',
              title: 'HR Interview',
              startDateTime: new Date(new Date(job.applicationDeadline || Date.now()).getTime() + 86400000).toISOString(),
              endDateTime: new Date(new Date(job.applicationDeadline || Date.now()).getTime() + 90000000).toISOString(),
              venue: 'To be announced',
              link: null,
              topic: null,
              interviewType: 'hr'
            }
          ];
          
          console.log(`Created standard hiring processes for job ${job.id}`);
          
          return {
            id: job.id,
            title: job.title || "Untitled Position",
            position: job.position || job.title || "Untitled Position",
            company: job.Company?.name || job.company || "Unknown Company",
            companyId: job.companyId,
            Company: job.Company || null,
            logo: job.Company?.logo ? `${import.meta.env.VITE_URI}${job.Company.logo}` : null,
            createdAt: job.createdAt || new Date().toISOString(),
            locationOptions: Array.isArray(job.locationOptions) ? job.locationOptions : [],
            remoteWork: Boolean(job.remoteWork),
            salary: job.ctc ? `${job.ctc} LPA` : "Not specified",
            role: job.role || "Not specified",
            eligibility: job.eligibility || { eligible: true, reasons: [] },
            applicationDeadline: job.applicationDeadline || null,
            
            // Use the standardized hiring processes instead of trying to extract them
            HiringProcesses: hiringProcesses
          };
        });
        
        console.log(`Validated ${validatedJobs.length} job listings with full data`);
        return validatedJobs;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!auth.token,
  });

  // Listen for global search events
  useEffect(() => {
    const handleSearch = (event) => {
      setSearchQuery(event.detail.searchTerm);
    };

    window.addEventListener("searchJobs", handleSearch);
    return () => window.removeEventListener("searchJobs", handleSearch);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    if (!jobsData) return;

    let result = [...jobsData];

    // Apply eligibility filter
    if (activeFilter === "eligible") {
      result = result.filter((job) => job.eligibility?.eligible);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          (job.company?.toLowerCase().includes(query) || job.Company?.name?.toLowerCase().includes(query)) ||
          (job.position || job.title)?.toLowerCase().includes(query) ||
          (job.role && job.role.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    result = result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      } else {
        return (
          new Date(a.applicationDeadline || Date.now()) - new Date(b.applicationDeadline || Date.now())
        );
      }
    });

    setFilteredJobs(result);
  }, [jobsData, sortOrder, activeFilter, searchQuery]);

  // Handle job card click
  const handleJobCardClick = (job) => {
    navigate(`/student/jobs/${job.id}`);
  };

  // Replace the handleToggleTimeline function
  const handleToggleTimeline = (jobId) => {
    console.log("Toggling timeline for job:", jobId);
    if (!jobId) {
      console.error("Cannot toggle timeline: Missing jobId");
      return;
    }
    
    setExpandedTimelines(prev => {
      const newState = { ...prev };
      // Explicitly set to true or false, not undefined
      newState[jobId] = !Boolean(prev[jobId]);
      console.log("New expanded state:", newState);
      return newState;
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-red rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-[80vh]">
          <p className="text-red-500 mb-4">
            {error.response?.data?.message || "Error loading jobs"}
          </p>
          <button 
            className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red/90 transition-colors"
            onClick={() => navigate("/student")}
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full h-[80vh] bg-white rounded-xl p-6 flex flex-col">
        {/* Filter Bar */}
        <FilterBar
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          totalJobs={filteredJobs.length}
        />

        {/* Job Cards */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 pb-4">
          {filteredJobs && filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <EnhancedJobCard
                  key={job.id}
                  job={job}
                  onClick={handleJobCardClick}
                  onToggleTimeline={handleToggleTimeline}
                  isTimelineExpanded={expandedTimelines[job.id]}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              message={searchQuery ? `No jobs found matching '${searchQuery}'` : "No jobs found matching your criteria"} 
              onClearSearch={searchQuery ? () => setSearchQuery("") : null}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobListings;