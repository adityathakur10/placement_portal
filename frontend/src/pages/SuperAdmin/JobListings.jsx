import React, { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Toast } from "@/components/ui/toast";
import DashboardLayout from "../../components/layouts/Dashboard";
import { useRecoilValue } from "recoil";
import { authState } from "../../store/atoms/authAtom";
import { Navigate, useNavigate } from "react-router-dom";

import FilterBar from "../../components/job/FilterBar";
import JobCard from "../../components/job/JobCard";
import AssignAdminModal from "@/components/job/AssignAdminModal";
import DeleteJobModal from "@/components/job/DeleteJobModal"; // Import new component
import ApproveJobModal from "@/components/job/ApproveJobModal"; // Import new component

const JobListings = () => {
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const queryClient = useQueryClient();
  const [sortOrder, setSortOrder] = useState("newest");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [expandedTimelines, setExpandedTimelines] = useState({});

  // Job Listing Data Fetching
  const {
    data: jobsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["job-listings"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/job-listings/admins/`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // console.log("API Response:", response.data);

        return {
          activeJobs:
            response.data.data?.map((job) => ({
              id: job.id,
              company:
                typeof job.Company === "object"
                  ? job.Company.name || `Company #${job.companyId || ""}`
                  : typeof job.company === "object"
                  ? job.company.name
                  : job.company || `Company #${job.companyId || ""}`,
              position: job.title || job.position,
              companyId: job.companyId,
              logo: job.Company?.logo
                ? `${import.meta.env.VITE_URI}${job.Company.logo}`
                : null,
              createdAt: job.createdAt,
              hr: job.addedBy?.email || "Not Assigned",
              locationOptions: job.locationOptions || [],
              remoteWork: job.remoteWork || false,
              salary: `${job.ctc || 0} LPA`,
              status: job.Review?.status || "pending",
              assignedAdmin:
                job.Review?.InternallyAssignedTo?.[0]?.fullName || null,
              role: job.role || null,
              minCgpa: job.Branches?.[0]?.JobBranch?.minCgpa || null,
              applicationDeadline: job.applicationDeadline || null,
              HiringProcesses: job.HiringProcesses,
              workflowData:
                job.HiringProcesses?.map((process) => {
                  const processDetails =
                    process.Interview ||
                    process.GroupDiscussion ||
                    process.CodingRound ||
                    process.PPT ||
                    {};

                  return {
                    id: process.id,
                    index: process.index || 0,
                    type: process.type,
                    title: process.title || "Hiring Round",
                    startDateTime: process.startDateTime
                      ? new Date(process.startDateTime).toISOString()
                      : new Date().toISOString(),
                    endDateTime: process.endDateTime
                      ? new Date(process.endDateTime).toISOString()
                      : new Date().toISOString(),
                    venue: processDetails.venue,
                    link: processDetails.link,
                    topic: processDetails.topic,
                    interviewType: processDetails.type,
                  };
                }) || [],
            })) || [],
          inactiveJobs: [],
          metrics: {},
        };
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!auth.token,
  });

  //Companies Data
  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_URI}/super-admin/company`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: !!auth.token,
  });

  const enhancedJobs = React.useMemo(() => {
    if (!jobsData?.activeJobs || !companiesData)
      return jobsData?.activeJobs || [];

    return jobsData.activeJobs.map((job) => {
      const company = companiesData.find((c) => c.id === job.companyId);
      return {
        ...job,
        Company: company,
        company: company?.name || job.company,
        logo: company?.logo
          ? `${import.meta.env.VITE_URI}${company.logo}`
          : null,
      };
    });
  }, [jobsData?.activeJobs, companiesData]);

  // All jobs combined
  const allJobs = React.useMemo(() => {
    if (!jobsData) return [];
    return [...(enhancedJobs || []), ...(jobsData.inactiveJobs || [])];
  }, [enhancedJobs, jobsData?.inactiveJobs]);

  // Sort jobs based on sort order
  const sortedJobs = React.useMemo(() => {
    return [...allJobs].sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [allJobs, sortOrder]);

  // Filter jobs based on active tab
  React.useEffect(() => {
    if (activeTab === "all") setFilteredJobs(sortedJobs);
    else if (activeTab === "active")
      setFilteredJobs(sortedJobs.filter((job) => job.status === "approved"));
    else if (activeTab === "inactive")
      setFilteredJobs(
        sortedJobs.filter(
          (job) =>
            job.status === "pending" ||
            job.status === "changes_requested" ||
            job.status === "rejected"
        )
      );
    else if (activeTab === "unassigned")
      setFilteredJobs(sortedJobs.filter((job) => !job.assignedAdmin));
    else setFilteredJobs(sortedJobs);
  }, [sortedJobs, activeTab]);

  // Handle loading states
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (auth.loading || isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <p className="text-red-500">
          {error.response?.data?.message || "Error loading job listings"}
        </p>
      </div>
    );
  }

  if (!auth.user || !auth.user.fullName) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <p className="text-red-500">Error loading user data</p>
      </div>
    );
  }
  
  const handleAssignAdmin = async (admin) => {
    try {
      Toast.info("Assigning admin...");
      await axios.post(
        `${import.meta.env.VITE_URI}/job-listings/admins/${
          selectedJob.id
        }/perm/`,
        {
          admins: [{ email: admin.email, id: admin.id }],
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const adminName = `${admin.firstName || ""} ${
        admin.lastName || ""
      }`.trim();
      const updatedJobs = [...filteredJobs];
      const jobIndex = updatedJobs.findIndex(
        (job) => job.id === selectedJob.id
      );

      if (jobIndex !== -1) {
        updatedJobs[jobIndex] = {
          ...updatedJobs[jobIndex],
          assignedAdmin: adminName,
        };
        setFilteredJobs(updatedJobs);
      }

      await queryClient.invalidateQueries(["job-listings"]);
      setShowAssignModal(false);
      setSelectedJob(null);
      await queryClient.refetchQueries(["job-listings"], { force: true });

      Toast.success("Admin assigned successfully");
    } catch (error) {
      console.error("Assignment error:", error);
      Toast.error(error.response?.data?.message || "Failed to assign admin");
    }
  };

  const handleStatusChange = async (jobId, status, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      // If status is "approved", show modal instead of window.confirm
      if (status === "approved") {
        setSelectedJob({ id: jobId });
        setShowApproveModal(true);
        return; // Exit early, actual approval handled by another function
      }

      Toast.info(`Updating status to ${status.replace("_", " ")}...`);
      
      // FIXED: Using the correct endpoint and HTTP method
      const response = await axios.patch(
        `${import.meta.env.VITE_URI}/job-listings/admins/status/${jobId}`,
        {
          status,
          statusReason: `Status changed to ${status} by ${auth.user.fullName}`,
          sendToStudents: false,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Status change response:', response.data);

      if (response.status === 200) {
        // Update UI and refetch data
        const updatedJobs = [...filteredJobs];
        const jobIndex = updatedJobs.findIndex((job) => job.id === jobId);
        if (jobIndex !== -1) {
          updatedJobs[jobIndex] = {
            ...updatedJobs[jobIndex],
            status: status,
          };
          setFilteredJobs(updatedJobs);
        }
        
        await queryClient.invalidateQueries(["job-listings"]);
        await queryClient.refetchQueries(["job-listings"], { force: true });
        
        Toast.success(`Job listing ${status.replace("_", " ")} successfully`);
      } 
    } catch (error) {
      console.error("Status change error:", error);
      Toast.error(error.response?.data?.message || "Failed to update status");
      
      await queryClient.invalidateQueries(["job-listings"]);
      await queryClient.refetchQueries(["job-listings"], { force: true });
    }
  };

  // New function to handle job approval from modal
  const handleJobApproval = async (sendToStudents) => {
    if (!selectedJob) return;
    
    try {
      Toast.info(`Approving job listing...`);
      
      const response = await axios.patch(
        `${import.meta.env.VITE_URI}/job-listings/admins/status/${selectedJob.id}`,
        {
          status: "approved",
          statusReason: `Status changed to approved by ${auth.user.fullName}`,
          sendToStudents,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update UI after confirmed success
        const updatedJobs = [...filteredJobs];
        const jobIndex = updatedJobs.findIndex((job) => job.id === selectedJob.id);
        if (jobIndex !== -1) {
          updatedJobs[jobIndex] = {
            ...updatedJobs[jobIndex],
            status: "approved",
            visibleToStudents: sendToStudents,
          };
          setFilteredJobs(updatedJobs);
        }
        
        await queryClient.invalidateQueries(["job-listings"]);
        await queryClient.refetchQueries(["job-listings"], { force: true });
        
        Toast.success(
          sendToStudents
            ? "Job listing approved and published to students"
            : "Job listing approved (not yet visible to students)"
        );
      }
    } catch (error) {
      console.error("Job approval error:", error);
      Toast.error(error.response?.data?.message || "Failed to approve job listing");
      
      await queryClient.invalidateQueries(["job-listings"]);
      await queryClient.refetchQueries(["job-listings"], { force: true });
    } finally {
      setShowApproveModal(false);
      setSelectedJob(null);
    }
  };

  const handleDeleteClick = (job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    
    try {
      Toast.info("Deleting job listing...");
      await axios.delete(
        `${import.meta.env.VITE_URI}/job-listings/admins/${selectedJob.id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      setFilteredJobs((prev) => prev.filter((job) => job.id !== selectedJob.id));
      queryClient.invalidateQueries(["job-listings"]);
      Toast.success("Job listing deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      Toast.error(
        error.response?.data?.message || "Failed to delete job listing"
      );
    } finally {
      setShowDeleteModal(false);
      setSelectedJob(null);
    }
  };

  const handleJobCardClick = (job) => {
    navigate(`/super-admin/job-listings/${job.id}`);
  };

  const handleToggleTimeline = (jobId) => {
    setExpandedTimelines((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const handleAssignClick = (job) => {
    setSelectedJob(job);
    setShowAssignModal(true);
  };

  return (
    <DashboardLayout>
      <div className="w-full h-[80vh] overflow-hidden bg-white rounded-xl p-7 flex flex-col">
        {/* Filter */}
        <FilterBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          totalJobs={filteredJobs.length}
        />

        {/* Job Listing Cards - Add overflow-x-hidden to prevent horizontal scrolling */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="grid grid-cols-1 gap-4 pb-4 w-full">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isTimelineExpanded={expandedTimelines[job.id]}
                onToggleTimeline={handleToggleTimeline}
                onNavigate={navigate}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
                onAssignAdmin={handleAssignClick}
                onClick={handleJobCardClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Assign Admin Modal */}
      {showAssignModal && (
        <AssignAdminModal
          jobId={selectedJob?.id}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedJob(null);
          }}
          onAssign={handleAssignAdmin}
        />
      )}
      
      {/* Delete Job Modal */}
      <DeleteJobModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteJob}
        jobTitle={selectedJob?.title || selectedJob?.position}
      />
      
      {/* Approve Job Modal */}
      <ApproveJobModal 
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onApprove={handleJobApproval}
      />
    </DashboardLayout>
  );
};

export default JobListings;
