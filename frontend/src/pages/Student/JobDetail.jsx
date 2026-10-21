import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';  // Add useQueryClient
import axios from '@/utils/axiosConfig';
import DashboardLayout from '@/components/layouts/Dashboard';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/atoms/authAtom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { 
  RiBriefcaseLine, 
  RiMapPinLine, 
  RiMoneyDollarCircleLine, 
  RiCalendarLine,
  RiArrowLeftLine,
  RiTimeLine,
  RiBuilding2Line,
  RiCodeLine,
  RiGraduationCapLine,
  RiLinkM,
  RiChatHistoryLine,
  RiVerifiedBadgeLine,
  RiCheckLine,
  RiFileDownloadLine,
  RiLinksLine
} from 'react-icons/ri';

// Reusing the same components from PreviewForm for consistency
const PreviewSection = ({ title, children, icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-6"
  >
    <div className="border-b border-gray-100">
      <div className="px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red/10 text-red rounded-lg">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

const PreviewCard = ({ title, children, className }) => (
  <div className={`bg-gray-50 rounded-xl p-5 ${className || ''}`}>
    {title && <h4 className="font-medium text-gray-700 mb-3">{title}</h4>}
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', icon }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-red/10 text-red',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${variants[variant]}`}>
      {icon && <span className="text-sm">{icon}</span>}
      {children}
    </span>
  );
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const queryClient = useQueryClient(); // Add query client for caching updates
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  
  // Add data transformation function from SuperAdmin page
  const transformObjectArrays = (job) => {
    if (!job) return job;
    let transformedJob = { ...job };
    
    // Fix CTC Breakup
    if (job.ctcBreakup) {
      let ctcBreakupData = [];
      try {
        // First attempt - if it's a JSON string
        if (typeof job.ctcBreakup === 'string') {
          ctcBreakupData = JSON.parse(job.ctcBreakup.replace(/'/g, '"'));
        } 
        // Second attempt - if it's an array of "[object Object]" strings
        else if (Array.isArray(job.ctcBreakup) && job.ctcBreakup[0] === '[object Object]') {
          // Create default representation since actual data was lost in serialization
          ctcBreakupData = [
            { name: 'Base Salary', amount: job.ctc * 0.7 },
            { name: 'Benefits & Bonus', amount: job.ctc * 0.3 }
          ];
        }
        // If it's already an array of objects, use it
        else if (Array.isArray(job.ctcBreakup)) {
          ctcBreakupData = job.ctcBreakup;
        }
        
        transformedJob.ctcBreakup = ctcBreakupData;
      } catch (err) {
        console.warn("Error parsing CTC breakup:", err);
        transformedJob.ctcBreakup = [];
      }
    }

    // Fix Web Links
    if (job.webLinks) {
      let webLinksData = [];
      try {
        // First attempt - if it's a JSON string
        if (typeof job.webLinks === 'string') {
          webLinksData = JSON.parse(job.webLinks.replace(/'/g, '"'));
        } 
        // Second attempt - if it's an array of "[object Object]" strings
        else if (Array.isArray(job.webLinks) && job.webLinks[0] === '[object Object]') {
          // Create a placeholder link if data was lost
          webLinksData = [
            { title: 'Company Website', url: job.Company?.website || 'https://example.com' }
          ];
        }
        // If it's already an array of objects, use it
        else if (Array.isArray(job.webLinks)) {
          webLinksData = job.webLinks;
        }
        
        transformedJob.webLinks = webLinksData;
      } catch (err) {
        console.warn("Error parsing web links:", err);
        transformedJob.webLinks = [];
      }
    }
    
    return transformedJob;
  };
  
  // Fetch job details (keep the existing query but update with a callback to transform objects)
  const { data: rawJobData, isLoading, error } = useQuery({
    queryKey: ['job-detail', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`/job-listings/students/get-job/${id}`);
        console.log("Complete Raw API Response:", response);
        
        // Handle both direct data and data wrapped in a response structure
        let jobData = response.data;
        
        // If response has a data property (from respond() function)
        if (response.data && response.data.data) {
          jobData = response.data.data;
        }
        
        console.log("Job data structure:", {
          id: jobData.id,
          title: jobData.title,
          hasHiringProcesses: Boolean(jobData.HiringProcesses),
          hiringProcessCount: jobData.HiringProcesses?.length || 0
        });
        
        return jobData;
      } catch (error) {
        console.error('Failed to load job details:', error);
        throw error;
      }
    },
    enabled: !!id && !!auth.token,
  });
  
  // Transform job data to fix serialization issues
  const job = React.useMemo(() => {
    if (!rawJobData) return null;
    return transformObjectArrays(rawJobData);
  }, [rawJobData]);

  // Process company logo when data is available (keep existing useEffect)
  useEffect(() => {
    if (!job) return;

    let url = null;
    
    // Try to find logo from multiple possible sources
    if (job.Company?.logo) {
      // If it's a relative path, prepend base URL
      if (!job.Company.logo.startsWith('http')) {
        url = `${import.meta.env.VITE_URI || ''}${job.Company.logo}`;
      } else {
        url = job.Company.logo;
      }
    } else if (job.logo) {
      // Direct logo property
      if (!job.logo.startsWith('http')) {
        url = `${import.meta.env.VITE_URI || ''}${job.logo}`;
      } else {
        url = job.logo;
      }
    }
    
    setLogoUrl(url);
    
  }, [job]);

  // Update this function to be more robust
  const processHiringData = (job) => {
    console.log("Processing job for hiring data:", job?.id);
    
    // Handle all possible data structures
    let hiringProcesses = [];
    
    if (job?.HiringProcesses && Array.isArray(job.HiringProcesses)) {
      hiringProcesses = job.HiringProcesses;
    } else if (job?.data?.HiringProcesses && Array.isArray(job.data.HiringProcesses)) {
      hiringProcesses = job.data.HiringProcesses;
    }
    
    console.log(`Found ${hiringProcesses.length} raw hiring processes to process`);
    
    if (hiringProcesses.length === 0) return [];
    
    return hiringProcesses
      .map(process => {
        console.log("Processing hiring process:", process);
        const processDetails = 
          process.Interview || 
          process.GroupDiscussion || 
          process.CodingRound || 
          process.PPT || {};
        
        return {
          id: process.id,
          index: process.index || 0,
          type: process.type || "interview",
          title: process.title || `Round ${process.index + 1 || 1}`,
          startDateTime: process.startDateTime || new Date().toISOString(),
          endDateTime: process.endDateTime || new Date().toISOString(),
          venue: processDetails.venue || "Not specified",
          link: processDetails.link,
          topic: processDetails.topic,
          interviewType: processDetails.type
        };
      })
      .sort((a, b) => a.index - b.index);
  };

  // Use this after you've processed job data
  const hiringProcesses = React.useMemo(() => {
    return processHiringData(job);
  }, [job]);

  // Log the processed hiring data
  console.log("Processed hiring processes:", hiringProcesses);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-red rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-[80vh]">
          <p className="text-red-500 mb-4">
            {error?.response?.data?.message || "Error loading job details"}
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/student/jobs")}>
            Back to Jobs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Determine company name from different possible sources
  const companyName = job.Company?.name || 
                     (typeof job.company === "object" ? job.company.name : job.company) || 
                     "Company";
                     
  // Determine job title from different possible sources
  const jobTitle = job.title || job.position || "Position";

  const isEligible = job.eligibility?.eligible !== false;

  // Handle CTC Breakup data structure issues
  const ctcBreakup = job.ctcBreakup && typeof job.ctcBreakup === 'string' 
    ? JSON.parse(job.ctcBreakup.replace(/'/g, '"')) 
    : job.ctcBreakup;

  // Process web links
  const webLinks = job.webLinks && typeof job.webLinks === 'string'
    ? JSON.parse(job.webLinks.replace(/'/g, '"'))
    : job.webLinks;

  return (
    <DashboardLayout>
      <div className="h-[80vh] bg-white rounded-xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <div className="md:w-80 border-r border-gray-200 hidden md:flex md:flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => navigate('/student/jobs')}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all mb-5"
            >
              <RiArrowLeftLine /> Back to Jobs
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center overflow-hidden mb-4 border border-gray-100 shadow-sm">
                {logoUrl ? (
                  <img 
                    src={logoUrl}
                    alt={companyName}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'%3E%3Cpath d='M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1-1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z'%3E%3C/path%3E%3Cpath d='M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z'%3E%3C/path%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <RiBuilding2Line size={36} className="text-gray-400" />
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{jobTitle}</h1>
              <p className="text-red font-medium">{companyName}</p>
            </div>

            {/* Eligibility Status */}
            <div 
              className={`mt-5 p-4 rounded-xl text-center ${
                isEligible ? "bg-green-50 text-green-700 border border-green-200" : 
                            "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {isEligible ? (
                <div className="flex items-center justify-center gap-2">
                  <RiVerifiedBadgeLine size={18} />
                  <span className="font-medium">Eligible to Apply</span>
                </div>
              ) : (
                <>
                  <div className="font-medium mb-1">Not Eligible</div>
                  {job.eligibility?.reasons && job.eligibility.reasons.length > 0 && (
                    <div className="text-sm mt-1">{job.eligibility.reasons[0]}</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Key Details */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wider">Key Details</h3>
            
            {job.role && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <RiBriefcaseLine className="text-red" size={16} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Role</div>
                  <div className="font-medium">{job.role}</div>
                </div>
              </div>
            )}
            
            {job.ctc && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <RiMoneyDollarCircleLine className="text-red" size={16} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">CTC</div>
                  <div className="font-medium">₹{job.ctc?.toLocaleString() || '0'}</div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <RiMapPinLine className="text-red" size={16} />
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="font-medium truncate max-w-[180px]">
                  {job.locationOptions && job.locationOptions.length > 0
                    ? Array.isArray(job.locationOptions)
                      ? job.locationOptions.join(', ')
                      : job.locationOptions
                    : "Remote"}
                </div>
              </div>
            </div>
            
            {job.applicationDeadline && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <RiCalendarLine className="text-red" size={16} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Apply Before</div>
                  <div className="font-medium text-red">
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
            
            {job.bondInYrs > 0 && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <RiTimeLine className="text-red" size={16} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Bond Period</div>
                  <div className="font-medium">{job.bondInYrs} {job.bondInYrs > 1 ? "Years" : "Year"}</div>
                </div>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <div className="mt-auto p-6 border-t border-gray-200">
            {isEligible ? (
              <button
                onClick={() => navigate(`/student/jobs/${id}/apply`)}
                className="w-full px-5 py-3 bg-red text-white rounded-xl font-medium hover:bg-red/90 transition-all shadow-sm"
              >
                Apply Now
              </button>
            ) : (
              <button
                disabled
                className="w-full px-5 py-3 bg-gray-100 text-gray-400 rounded-xl font-medium cursor-not-allowed"
              >
                Cannot Apply
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden p-4 border-b border-gray-200">
            <button
              onClick={() => navigate('/student/jobs')}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg mb-4"
            >
              <RiArrowLeftLine /> Back
            </button>

            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden mb-3 border">
                {logoUrl ? (
                  <img 
                    src={logoUrl}
                    alt={companyName}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'%3E%3Cpath d='M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1-1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z'%3E%3C/path%3E%3Cpath d='M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z'%3E%3C/path%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <RiBuilding2Line size={24} className="text-gray-400" />
                )}
              </div>
              <h1 className="text-lg font-bold">{jobTitle}</h1>
              <p className="text-red text-sm font-medium">{companyName}</p>
            </div>

            {/* Mobile Key Details */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              {job.role && (
                <div className="flex items-center gap-1">
                  <RiBriefcaseLine className="text-red" />
                  <span>{job.role}</span>
                </div>
              )}
              
              {job.ctc && (
                <div className="flex items-center gap-1">
                  <RiMoneyDollarCircleLine className="text-red" />
                  <span>₹{job.ctc?.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <RiMapPinLine className="text-red" />
                <span className="truncate">
                  {job.locationOptions && job.locationOptions.length > 0
                    ? Array.isArray(job.locationOptions)
                      ? job.locationOptions.join(', ')
                      : job.locationOptions
                    : "Remote"}
                </span>
              </div>
              
              {job.applicationDeadline && (
                <div className="flex items-center gap-1">
                  <RiCalendarLine className="text-red" />
                  <span className="text-red">
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Apply Button */}
            {isEligible ? (
              <button
                onClick={() => navigate(`/student/jobs/${id}/apply`)}
                className="w-full px-4 py-2 bg-red text-white rounded-lg font-medium text-sm"
              >
                Apply Now
              </button>
            ) : (
              <div className="bg-red-50 p-2 rounded-lg border border-red-200 text-center text-xs text-red-700">
                {job.eligibility?.reasons && job.eligibility.reasons.length > 0
                  ? job.eligibility.reasons[0]
                  : "You are not eligible for this position"}
              </div>
            )}
          </div>

          {/* Main Content Sections */}
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <PreviewSection title="Basic Information" icon={<RiBriefcaseLine size={20} />}>
              <div className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  {job.role && (
                    <Badge variant="primary" icon={<RiBriefcaseLine size={16} />}>
                      {job.role}
                    </Badge>
                  )}
                  {job.gradYear && job.gradYear.length > 0 && (
                    <Badge variant="info" icon={<RiGraduationCapLine size={16} />}>
                      Batch {Array.isArray(job.gradYear) ? job.gradYear.join(', ') : job.gradYear}
                    </Badge>
                  )}
                  {job.bondInYrs > 0 && (
                    <Badge variant="warning" icon={<RiTimeLine size={16} />}>
                      {job.bondInYrs} Year Bond
                    </Badge>
                  )}
                </div>
              </div>
            </PreviewSection>

            {/* Job Description */}
            <PreviewSection title="Job Description" icon={<RiFileDownloadLine size={20} />}>
              <div className="space-y-8">
                {job?.descriptionText && (
                  <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                    <div dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(job.descriptionText) 
                    }} />
                  </div>
                )}
                
                {job?.descriptionFile && (
                  <div className="mt-4 flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <RiFileDownloadLine className="text-red" size={24} />
                    <div>
                      <p className="font-medium text-gray-700">Job Description Document</p>
                      <a 
                        href={`${import.meta.env.VITE_URI}${job.descriptionFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Download description document
                      </a>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Requirements */}
                  {job.requirements && (
                    <PreviewCard title="Requirements">
                      {job.requirements.includes("<") ? (
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(job.requirements) 
                        }} />
                      ) : (
                        <ul className="space-y-3">
                          {job.requirements.split('\n').filter(Boolean).map((req, i) => (
                            <li key={i} className="flex gap-3 items-start">
                              <span className="h-6 w-6 rounded-full bg-red/10 text-red flex items-center justify-center flex-shrink-0">
                                <RiCheckLine size={16} />
                              </span>
                              <span className="text-gray-700">{req}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </PreviewCard>
                  )}

                  {/* Responsibilities */}
                  {job.responsibilities && (
                    <PreviewCard title="Responsibilities">
                      {job.responsibilities.includes("<") ? (
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(job.responsibilities) 
                        }} />
                      ) : (
                        <ul className="space-y-3">
                          {job.responsibilities.split('\n').filter(Boolean).map((resp, i) => (
                            <li key={i} className="flex gap-3 items-start">
                              <span className="h-6 w-6 rounded-full bg-red/10 text-red flex items-center justify-center flex-shrink-0">
                                <RiCheckLine size={16} />
                              </span>
                              <span className="text-gray-700">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </PreviewCard>
                  )}
                </div>
              </div>
            </PreviewSection>

            {/* Eligibility Criteria */}
            <PreviewSection title="Eligibility Criteria" icon={<RiGraduationCapLine size={20} />}>
              <div className="space-y-6">
                {/* Branch-wise CGPA */}
                {job.branchWiseMinCgpa && Object.keys(job.branchWiseMinCgpa).length > 0 && (
                  <PreviewCard title="Branch-wise CGPA Requirements">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(job.branchWiseMinCgpa).map(([branch, cgpa]) => (
                        <div key={branch} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <span className="text-gray-700">{branch}</span>
                          <Badge variant="primary">{cgpa} CGPA</Badge>
                        </div>
                      ))}
                    </div>
                  </PreviewCard>
                )}
                
                {/* Other Eligibility Requirements */}
                <div className="flex flex-wrap gap-3">
                  <Badge 
                    variant={job.activeBacklogsAcceptable ? "warning" : "success"}
                    icon={job.activeBacklogsAcceptable ? null : <RiCheckLine size={16} />}
                  >
                    {job.activeBacklogsAcceptable ? 'Active Backlogs Allowed' : 'No Active Backlogs'}
                  </Badge>
                  
                  <Badge variant="info">
                    Max Failed Subjects: {job.failedSubjects || 0}
                  </Badge>
                </div>

                {/* Deadline */}
                {job.applicationDeadline && (
                  <PreviewCard>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red/10 text-red rounded-lg">
                        <RiCalendarLine size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Application Deadline</h4>
                        <p className="text-gray-600">
                          {new Date(job.applicationDeadline).toLocaleString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </PreviewCard>
                )}
                
                {/* Your Eligibility Status */}
                <PreviewCard className={`border ${isEligible ? 'border-green-200' : 'border-red-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${isEligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isEligible ? <RiVerifiedBadgeLine size={20} /> : <RiCodeLine size={20} />}
                    </div>
                    <div>
                      <h4 className={`font-medium ${isEligible ? 'text-green-700' : 'text-red-700'}`}>
                        {isEligible ? 'You are eligible to apply' : 'You are not eligible to apply'}
                      </h4>
                      {!isEligible && job.eligibility?.reasons && job.eligibility.reasons.length > 0 && (
                        <p className="text-red-600 mt-1">{job.eligibility.reasons[0]}</p>
                      )}
                    </div>
                  </div>
                </PreviewCard>
              </div>
            </PreviewSection>

            {/* Compensation Details */}
            {job?.ctc && (
              <PreviewSection title="Location & Compensation" icon={<RiMoneyDollarCircleLine size={20} />}>
                <div className="space-y-6">
                  {/* Locations */}
                  <PreviewCard>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red/10 text-red rounded-lg">
                        <RiMapPinLine size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700">Locations</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.locationOptions && job.locationOptions.length > 0 ? (
                            Array.isArray(job.locationOptions) ? (
                              job.locationOptions.map((location, index) => (
                                <Badge key={index} icon={<RiMapPinLine size={14} />}>
                                  {location}
                                </Badge>
                              ))
                            ) : (
                              <Badge icon={<RiMapPinLine size={14} />}>{job.locationOptions}</Badge>
                            )
                          ) : null}
                          {job.remoteWork && (
                            <Badge variant="success" icon={<RiCheckLine size={14} />}>
                              Remote Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  {/* Compensation */}
                  <PreviewCard>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-red/10 text-red rounded-lg">
                        <RiMoneyDollarCircleLine size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Compensation</h4>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          ₹{job.ctc?.toLocaleString()} <span className="text-sm font-normal text-gray-500">per annum</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* CTC Breakup - IMPROVED */}
                    {job.ctcBreakup && job.ctcBreakup.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">CTC Breakdown</h5>
                        <div className="space-y-2">
                          {job.ctcBreakup.map((item, i) => {
                            // Try to extract component name and amount from different formats
                            const componentName = typeof item === 'object' ? 
                              (item.name || item.component || `Component ${i+1}`) : 
                              `Component ${i+1}`;
                            
                            const amount = typeof item === 'object' ? 
                              (Number(item.amount || item.value) || 0) : 
                              0;
                            
                            return (
                              <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                <span className="text-gray-700">{componentName}</span>
                                <span className="font-medium text-gray-900">₹{amount.toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </PreviewCard>
                </div>
              </PreviewSection>
            )}

            {/* Hiring Process - UPDATED */}
            <PreviewSection title="Hiring Process" icon={<RiTimeLine size={20} />}>
              {hiringProcesses && hiringProcesses.length > 0 ? (
                <div className="relative pb-6 overflow-visible">
                  {/* Timeline line - Fixed position */}
                  <div className="absolute left-6 top-0 bottom-6 w-0.5 bg-gray-100"></div>
                  
                  <div className="space-y-6 relative">
                    {hiringProcesses.map((process, index) => (
                      <div key={process.id || index} className="flex gap-4">
                        {/* Timeline point with higher z-index */}
                        <div className="h-12 w-12 rounded-full bg-red/10 text-red flex items-center justify-center flex-shrink-0 border-4 border-white relative z-10">
                          <span className="font-bold">{index + 1}</span>
                        </div>
                        
                        {/* Content card */}
                        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                            <h4 className="font-medium text-lg text-gray-900">{process.title}</h4>
                            <Badge 
                              variant={
                                process.type === 'interview' ? 'primary' : 
                                process.type === 'coding-round' ? 'info' :
                                process.type === 'group-discussion' ? 'warning' : 'default'
                              }
                            >
                              {process.type.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <RiCalendarLine className="text-red" size={16} />
                              <div className="text-sm">
                                <div>{new Date(process.startDateTime).toLocaleDateString()}</div>
                                <div className="text-gray-500">
                                  {new Date(process.startDateTime).toLocaleTimeString()} - {new Date(process.endDateTime).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-700">
                              <RiMapPinLine className="text-red" size={16} />
                              <span className="capitalize">{process.venue}</span>
                            </div>
                          </div>
                          
                          {/* Additional details */}
                          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {process.interviewType && (
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">Interview Type:</span> {process.interviewType}
                              </div>
                            )}
                            {process.topic && (
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">Topic:</span> {process.topic}
                              </div>
                            )}
                            {process.link && (
                              <div className="col-span-full flex items-center gap-2 text-sm">
                                <RiLinksLine className="text-red" size={16} />
                                <a 
                                  href={process.link} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Meeting Link
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500">No hiring process information available yet.</p>
                </div>
              )}
            </PreviewSection>

            {/* Important Links - UPDATED */}
            {job?.webLinks && job.webLinks.length > 0 && (
              <PreviewSection title="Important Links" icon={<RiLinkM size={20} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.webLinks.map((link, i) => {
                    // Handle different link formats
                    const url = typeof link === 'object' ? 
                      (link.url || link.link || '') : 
                      (typeof link === 'string' ? link : '');
                      
                    const title = typeof link === 'object' ? 
                      (link.title || link.name || `Resource ${i+1}`) : 
                      `Resource ${i+1}`;
                    
                    return url ? (
                      <a 
                        key={i}
                        href={url.startsWith('http') ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <div className="p-2 bg-white rounded-lg">
                          <RiLinkM className="text-red" size={18} />
                        </div>
                        <span className="text-gray-700">{title}</span>
                      </a>
                    ) : null;
                  })}
                </div>
              </PreviewSection>
            )}

            {/* Mobile Apply Button - Fixed to bottom */}
            {isEligible && (
              <div className="md:hidden sticky bottom-0 bg-white py-4 border-t z-10">
                <button
                  onClick={() => navigate(`/student/jobs/${id}/apply`)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm transition-all duration-200"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;