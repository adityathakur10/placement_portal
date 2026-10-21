import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authState } from "@/store/atoms/authAtom";
import { Toast } from "@/components/ui/toast";
import DashboardLayout from "@/components/layouts/Dashboard";
import AssignAdminModal from "@/components/job/AssignAdminModal";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import {
  RiCloseLine,
  RiBuildingLine,
  RiMapPinLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiUserLine,
  RiLinkM,
  RiTimeLine,
  RiBriefcaseLine,
  RiGraduationCapLine,
  RiCodeLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiMoreLine,
  RiUserAddLine,
  RiFileDownloadLine,
  RiLinksLine,
  RiEdit2Line,
  RiDeleteBin6Line
} from "react-icons/ri";

// PreviewSection Component - Reused from Student/JobDetail.jsx
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

// PreviewCard Component - Reused from Student/JobDetail.jsx
const PreviewCard = ({ title, children, className }) => (
  <div className={`bg-gray-50 rounded-xl p-5 ${className || ''}`}>
    {title && <h4 className="font-medium text-gray-700 mb-3">{title}</h4>}
    {children}
  </div>
);

// Badge Component - Reused from Student/JobDetail.jsx
const Badge = ({ children, variant = 'default', icon }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-red/10 text-red',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
    error: 'bg-red-100 text-red-700',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${variants[variant]}`}>
      {icon && <span className="text-sm">{icon}</span>}
      {children}
    </span>
  );
};

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const queryClient = useQueryClient();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);
  
  // Fetch job details
  const {
    data: job,
    isLoading: isJobLoading,
    error,
  } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/job-listings/admins/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        console.log("Job API Response:", response.data);
        
        // Try to find HiringProcesses in different possible locations
        const extractHiringProcesses = (data) => {
          if (Array.isArray(data.HiringProcesses)) {
            return data.HiringProcesses;
          } else if (data.data && Array.isArray(data.data.HiringProcesses)) {
            return data.data.HiringProcesses;
          } else {
            return [];
          }
        };

        const hiringProcesses = extractHiringProcesses(response.data.data);
        
        // Process hiring processes into workflowData
        const workflowData = hiringProcesses.map(process => {
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
        }).sort((a, b) => a.index - b.index);
        
        // Extract the job data with properly formatted fields
        return {
          ...response.data.data,
          // Add the transformed hiring process data
          workflowData: workflowData,
          
          // Rest of your existing transformations...
          logo: response.data.data?.Company?.logo
            ? `${import.meta.env.VITE_URI}${response.data.data.Company.logo}`
            : null,
          company:
            typeof response.data.data.company === "object"
              ? response.data.data.company
              : response.data.data.Company?.name ||
                response.data.data.company ||
                `Company #${response.data.data.companyId || ""}`,
          status: response.data.data.Review?.status || response.data.data.status || "under_review",
          assignedAdmin: extractAdminName(response.data.data)
        };
      } catch (error) {
        console.error("Error fetching job details:", error);
        throw error;
      }
    },
    enabled: !!auth.token && !!jobId,
  });

  // Add this function in your component to properly extract status
  const extractJobStatus = (jobData) => {
    // Check all possible locations for status information
    if (!jobData) return "pending";
    
    // Direct status property
    if (jobData.status && typeof jobData.status === 'string') {
      return jobData.status;
    }
    
    // Check if status is in Review object
    if (jobData.Review && jobData.Review.status) {
      return jobData.Review.status;
    }
    
    // Default fallback
    return "under_review";
  };

  // Effect to extract status properly from job response
  useEffect(() => {
    if (job) {
      const extractedStatus = extractJobStatus(job);
      console.log("Extracted status:", extractedStatus);
      setJobStatus(extractedStatus);
    }
  }, [job]);

  const handleStatusChange = async (status) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_URI}/super-admin/job/${jobId}/review/status`,
        {
          status,
          statusReason: `Status changed to ${status} by ${auth.user.fullName}`,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Toast.success(`Job listing ${status.replace("_", " ")} successfully`);
      queryClient.invalidateQueries(["job-detail", jobId]);
      queryClient.invalidateQueries(["job-listings"]);
    } catch (error) {
      Toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleApproveJob = async () => {
    try {
      setIsLoading(true);

      // Use the existing verify endpoint for approval
      await axios.put(
        `${import.meta.env.VITE_URI}/job-listings/admins/verify/${jobId}`,
        {}, // No body needed, the controller already sets status to APPROVED
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      // Refresh job data after approval
      queryClient.invalidateQueries(["job", jobId]);
      Toast.success("Job listing has been approved");
    } catch (error) {
      console.error("Error approving job:", error);
      Toast.error(
        error.response?.data?.message || "Failed to approve job listing"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAdmin = async (admin) => {
    try {
      Toast.info("Assigning admin...");

      const response = await axios.post(
        `${import.meta.env.VITE_URI}/job-listings/admins/${jobId}/perm/`,
        {
          admins: [
            {
              email: admin.email,
              id: admin.id,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Format admin name from the admin object
      const adminName = `${admin.firstName || ""} ${admin.lastName || ""}`.trim();

      // Create a completely new job object with the updated admin
      const updatedJob = {
        ...job,
        assignedAdmin: adminName,
      };

      // Force replace the entire cache entry
      queryClient.setQueryData(["job-detail", jobId], updatedJob);

      Toast.success("Admin assigned successfully");
      setShowAssignModal(false);

      // Force a complete refetch after the assignment
      queryClient.invalidateQueries(["job-detail", jobId], {
        refetchActive: true,
        refetchInactive: true,
      });
      queryClient.invalidateQueries(["job-listings"], {
        refetchActive: true,
        refetchInactive: true,
      });

      // Force refetch immediately instead of with delay
      queryClient.refetchQueries(["job-detail", jobId], { force: true });
    } catch (error) {
      console.error("Admin assignment error:", error);
      Toast.error(error.response?.data?.message || "Failed to assign admin");
    }
  };

  // Add this function to your JobDetail.jsx component
  const handleRemoveAdmin = async () => {
    try {
      Toast.info("Removing admin...");
      
      // Get the admin information
      const admin = job.Review?.InternallyAssignedTo?.[0];
      console.log("Admin information:", admin);
      
      if (!admin) {
        Toast.error("Admin information not found");
        return;
      }
      
      // Try to use admin ID first, fall back to email
      const adminId = admin.id || admin.email;
      console.log("Using admin identifier:", adminId);
      
      if (!adminId) {
        Toast.error("Admin ID not found");
        return;
      }

      console.log("Making request to:", `${import.meta.env.VITE_URI}/job-listings/admins/${jobId}/perm/${adminId}`);

      // Use the correct endpoint format with adminId in the URL
      const response = await axios.delete(
        `${import.meta.env.VITE_URI}/job-listings/admins/${jobId}/perm/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          }
        }
      );

      console.log("Remove admin response:", response.data);

      // Update local state
      const updatedJob = {
        ...job,
        assignedAdmin: null,
        // Also clear the Review.InternallyAssignedTo property if it exists
        Review: job.Review ? {
          ...job.Review,
          InternallyAssignedTo: []
        } : undefined
      };

      // Update the cache
      queryClient.setQueryData(["job-detail", jobId], updatedJob);
      
      Toast.success("Admin removed successfully");
      
      // Force refetch to ensure data consistency
      queryClient.invalidateQueries(["job-detail", jobId]);
      queryClient.invalidateQueries(["job-listings"]);
      
    } catch (error) {
      console.error("Admin removal error details:", error.response?.data || error);
      Toast.error(error.response?.data?.message || "Failed to remove admin");
    }
  };

  const handleDeleteJob = async () => {
    try {
      if (
        !window.confirm(
          "Are you sure you want to delete this job listing? This action cannot be undone."
        )
      ) {
        return;
      }

      Toast.info("Deleting job listing...");

      await axios.delete(
        `${import.meta.env.VITE_URI}/job-listings/admins/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      Toast.success("Job listing deleted successfully");
      navigate("/super-admin/job-listings");
    } catch (error) {
      console.error("Delete error:", error);
      Toast.error(error.response?.data?.message || "Failed to delete job listing");
    }
  };

  const handleEditJob = () => {
    navigate(`/super-admin/job-listings/${jobId}/edit`);
  };

  // Add this function to transform malformed object strings
  const transformObjectArrays = (job) => {
    // Fix CTC Breakup
    let ctcBreakupData = [];
    if (job.ctcBreakup) {
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
      } catch (err) {
        console.warn("Error parsing CTC breakup:", err);
        ctcBreakupData = [];
      }
    }

    // Fix Web Links
    let webLinksData = [];
    if (job.webLinks) {
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
      } catch (err) {
        console.warn("Error parsing web links:", err);
        webLinksData = [];
      }
    }
    
    return {
      ...job,
      ctcBreakup: ctcBreakupData,
      webLinks: webLinksData
    };
  };

  // Add this useEffect after your data loading
  useEffect(() => {
    if (job) {
      const transformedJob = transformObjectArrays(job);
      console.log("Transformed job data:", transformedJob);
      
      // Use queryClient to update the cached job data with fixed format
      queryClient.setQueryData(["job-detail", jobId], transformedJob);
    }
  }, [job, jobId, queryClient]);

  useEffect(() => {
    if (job) {
      // Debug all available fields to find the description
      console.log("Available job fields:", Object.keys(job));
      console.log("Description fields:", {
        description: job.description,
        descriptionText: job.descriptionText,
        descriptionFile: job.descriptionFile,
      });
      
      // Log hiring process data
      console.log("Hiring Process Data:", {
        HiringProcesses: job.HiringProcesses,
        workflowData: job.workflowData
      });
    }
  }, [job]);

  if (isJobLoading) {
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
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <p className="text-red-500 mb-4">Failed to load job details</p>
          <button
            className="px-5 py-2 bg-red text-white rounded-lg hover:bg-red/90 transition-all"
            onClick={() => navigate("/super-admin/job-listings")}
          >
            Back to Job Listings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <p className="text-red-500 mb-4">Job not found</p>
          <button
            className="px-5 py-2 bg-red text-white rounded-lg hover:bg-red/90 transition-all"
            onClick={() => navigate("/super-admin/job-listings")}
          >
            Back to Job Listings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Process web links
  const webLinks = job.webLinks && typeof job.webLinks === 'string'
    ? JSON.parse(job.webLinks.replace(/'/g, '"'))
    : job.webLinks;

  // Handle CTC Breakup data structure issues
  const ctcBreakup = job.ctcBreakup && typeof job.ctcBreakup === 'string' 
    ? JSON.parse(job.ctcBreakup.replace(/'/g, '"')) 
    : job.ctcBreakup;

  const jobTitle = job.title || job.position || "Position";
  const companyName = typeof job.company === "object" ? job.company.name : job.company;

  // Determine the status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'changes_requested': return 'warning';
      case 'rejected': return 'error';
      default: return 'info';
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid p-0">
        <div className="h-[80vh] bg-white rounded-xl flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar - Fixed width, non-scrollable */}
          <div className="md:w-80 border-r border-gray-200 hidden md:flex md:flex-col overflow-hidden bg-gray-50">
            {/* Back Button */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <button
                onClick={() => navigate("/super-admin/job-listings")}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all mb-5"
              >
                <RiArrowLeftLine /> Back to Jobs
              </button>

              {/* Company Logo and Job Title */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center overflow-hidden mb-4 border border-gray-100 shadow-sm">
                  {job.logo ? (
                    <img
                      src={
                        typeof job.logo === "string" &&
                        job.logo.startsWith("http")
                          ? job.logo
                          : `${import.meta.env.VITE_URI}${job.logo}`
                      }
                      alt={companyName}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'%3E%3Cpath d='M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1-1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z'%3E%3C/path%3E%3Cpath d='M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z'%3E%3C/path%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <RiBuildingLine size={36} className="text-gray-400" />
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{jobTitle}</h1>
                <p className="text-red font-medium">{companyName}</p>
              </div>

              {/* Status Badge - Use the extracted status */}
              <div className="mt-5 mb-4">
                <Badge 
                  variant={getStatusVariant(jobStatus)} 
                  className="w-full justify-center"
                >
                  {jobStatus 
                    ? jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1).toLowerCase().replace("_", " ")
                    : "Pending"}
                </Badge>
              </div>
            </div>

            {/* Assigned Admin Section with Fixed Height */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <h3 className="text-sm text-gray-500 mb-3 uppercase tracking-wider font-medium">Assigned Admin</h3>
              {job.assignedAdmin ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-red/10 flex items-center justify-center">
                      <RiUserLine className="text-red" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{job.assignedAdmin}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveAdmin}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm transition-all"
                  >
                    <RiCloseLine size={16} />
                    Remove Admin
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <RiUserAddLine size={18} />
                  Assign Admin
                </button>
              )}
            </div>

            {/* Key Details Section */}
            <div className="p-6 border-b border-gray-200 space-y-4 bg-white">
              <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wider">Key Details</h3>
              
              {/* Role */}
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
              
              {/* CTC */}
              {job.ctc && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <RiMoneyDollarCircleLine className="text-red" size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">CTC</div>
                    <div className="font-medium">₹{job.ctc?.toLocaleString() || job.salary?.toLocaleString() || '0'}</div>
                  </div>
                </div>
              )}
              
              {/* Location */}
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
              
              {/* Deadline */}
              {job.applicationDeadline && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <RiCalendarLine className="text-red" size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Deadline</div>
                    <div className="font-medium text-red">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Always Visible in Sidebar */}
            <div className="mt-auto p-6 border-t border-gray-200 space-y-3 bg-white">
              <div className="w-full">
                {/* Improved Status Change Button */}
                <div className="dropdown dropdown-top w-full">
                  <button className="w-full px-5 py-3 bg-red text-white rounded-xl font-medium hover:bg-red/90 transition-all shadow-sm">
                    {jobStatus === "approved" ? "Change Status" : "Review Job"}
                  </button>
                  <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                    <li className={jobStatus === "changes_requested" ? "disabled" : ""}>
                      <button
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                        disabled={jobStatus === "changes_requested"}
                        onClick={() => handleStatusChange("changes_requested")}
                      >
                        <RiMoreLine className="text-amber-500" />
                        Request Changes
                      </button>
                    </li>
                    <li className={jobStatus === "approved" ? "disabled" : ""}>
                      <button
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                        disabled={jobStatus === "approved"}
                        onClick={() => handleStatusChange("approved")}
                      >
                        <RiCheckLine className="text-green-500" />
                        Approve Listing
                      </button>
                    </li>
                    <li className={jobStatus === "rejected" ? "disabled" : ""}>
                      <button
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                        disabled={jobStatus === "rejected"}
                        onClick={() => handleStatusChange("rejected")}
                      >
                        <RiCloseLine className="text-red-500" />
                        Reject Listing
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Edit Button */}
              <button 
                onClick={handleEditJob}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                <RiEdit2Line size={18} />
                Edit Job Listing
              </button>
              
              {/* Delete Button */}
              <button 
                onClick={handleDeleteJob}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all"
              >
                <RiDeleteBin6Line size={18} />
                Delete Job Listing
              </button>
            </div>
          </div>

          {/* Right Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Mobile Header - Same as before */}

            {/* Main Content Sections */}
            <div className="p-6 space-y-8">
              {/* Basic Information */}
              <PreviewSection title="Basic Information" icon={<RiBriefcaseLine size={20} />} id="overview">
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

                  {/* HR Contact Info */}
                  {job.hr && (
                    <PreviewCard title="Company Representative">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red/10 text-red rounded-lg">
                          <RiUserLine size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Contact Information</h4>
                          <a 
                            href={`mailto:${job.hr}`} 
                            className="text-blue-600 hover:underline"
                          >
                            {job.hr}
                          </a>
                        </div>
                      </div>
                    </PreviewCard>
                  )}
                </div>
              </PreviewSection>

              {/* Job Description */}
              <PreviewSection title="Job Description" icon={<RiFileDownloadLine size={20} />}>
                <div className="space-y-8">
                  {job.descriptionText && (
                    <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                      <div dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(job.descriptionText) 
                      }} />
                    </div>
                  )}
                  
                  {job.descriptionFile && (
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
                      <PreviewCard title="Requirements" id="requirements">
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
                      <PreviewCard title="Responsibilities" id="responsibilities">
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
              <PreviewSection title="Eligibility Criteria" icon={<RiGraduationCapLine size={20} />} id="eligibility">
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
                </div>
              </PreviewSection>

              {/* Compensation Details */}
              <PreviewSection title="Location & Compensation" icon={<RiMoneyDollarCircleLine size={20} />} id="compensation">
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
                          ₹{job.ctc?.toLocaleString() || job.salary?.toLocaleString() || '0'} 
                          <span className="text-sm font-normal text-gray-500">per annum</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* CTC Breakup */}
                    {ctcBreakup && ctcBreakup.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">CTC Breakdown</h5>
                        <div className="space-y-2">
                          {ctcBreakup.map((item, i) => {
                            // Try to extract component name and amount from different formats
                            const componentName = item.component || item.name || `Component ${i+1}`;
                            const amount = item.value || item.amount || 0;
                            
                            return (
                              <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                <span className="text-gray-700">{componentName}</span>
                                <span className="font-medium text-gray-900">₹{Number(amount).toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </PreviewCard>
                </div>
              </PreviewSection>

              {/* Hiring Process Timeline */}
              <PreviewSection title="Hiring Process" icon={<RiTimeLine size={20} />} id="hiring-process">
                {job.HiringProcesses && job.HiringProcesses.length > 0 ? (
                  <div className="relative pb-6 overflow-visible">
                    {/* Timeline line - Fixed position */}
                    <div className="absolute left-6 top-0 bottom-6 w-0.5 bg-gray-100"></div>
                    
                    <div className="space-y-6 relative">
                      {job.HiringProcesses.sort((a, b) => a.index - b.index).map((process, index) => {
                        // Extract process details based on type
                        const processDetails = 
                          process.Interview || 
                          process.GroupDiscussion || 
                          process.CodingRound || 
                          process.PPT || {};
                          
                        return (
                          <div key={process.id || index} className="flex gap-4">
                            {/* Timeline point with higher z-index */}
                            <div className="h-12 w-12 rounded-full bg-red/10 text-red flex items-center justify-center flex-shrink-0 border-4 border-white relative z-10">
                              <span className="font-bold">{index + 1}</span>
                            </div>
                            
                            {/* Content card */}
                            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                <h4 className="font-medium text-lg text-gray-900">{process.title || `Round ${index + 1}`}</h4>
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
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500">No hiring process information available yet.</p>
                  </div>
                )}
              </PreviewSection>

              {/* Important Links */}
              {webLinks && webLinks.length > 0 && (
                <PreviewSection title="Important Links" icon={<RiLinkM size={20} />} id="resources">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {webLinks.map((link, i) => {
                      // Handle different link formats
                      const url = link.url || link;
                      const title = link.title || `Resource ${i+1}`;
                      
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
            </div>
          </div>
        </div>
      </div>

      {/* Assign Admin Modal */}
      {showAssignModal && (
        <AssignAdminModal
          jobId={jobId}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignAdmin}
        />
      )}
    </DashboardLayout>
  );
};

// Helper to extract admin name from response
const extractAdminName = (jobData) => {
  // Check for InternallyAssignedTo in Review
  if (jobData.Review?.InternallyAssignedTo) {
    const admin = Array.isArray(jobData.Review.InternallyAssignedTo) 
      ? jobData.Review.InternallyAssignedTo[0]
      : jobData.Review.InternallyAssignedTo;
      
    if (admin) {
      return `${admin.firstName || ""} ${admin.lastName || ""}`.trim();
    }
  }
  
  // Fall back to assignedAdmin property
  return jobData.assignedAdmin || null;
};

export default JobDetail;
