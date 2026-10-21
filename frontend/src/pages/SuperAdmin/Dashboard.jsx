import React, { useState } from "react";
import DashboardLayout from "../../components/layouts/Dashboard";
import { useRecoilValue } from "recoil";
import { authState } from "../../store/atoms/authAtom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Import components
import Calendar from "../../components/ui/Calendar";
import ListingRequestsSection from "../../components/dashboard/sections/ListingRequestsSection";
import ActiveListingsSection from "../../components/dashboard/sections/ActiveListingsSection";
import BranchStatsSection from "../../components/dashboard/sections/BranchStatsSection";

// Mock data (could be moved to a separate file)
const mockBranchStats = {
  CSE: {
    totalPlaced: 150,
    placementRate: 85,
    totalCompanies: 25,
  },
  IT: {
    totalPlaced: 120,
    placementRate: 80,
    totalCompanies: 20,
  },
};

const Dashboard = () => {
  const auth = useRecoilValue(authState);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [date, setDate] = useState(new Date());

  const { data: jobData, isLoading } = useQuery({
    queryKey: ["job-listings"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/job-listings/admins/job-page`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        // Transform API response
        return {
          activeJobs: response.data?.activeJobs?.map((job) => ({
            id: job.id,
            title: job.title,
            company: {
              name: job.Company?.name || `Company #${job.companyId}`,
              logo: job.Company?.logo
                ? `${import.meta.env.VITE_URI}${job.Company.logo}`
                : "/company-logos/default.png",
            },
            locationOptions: job.locationOptions || [],
            createdAt: job.createdAt,
            type: job.role || "Full Time",
            mode: job.remoteWork ? "Remote" : "On-site",
            batch: Array.isArray(job.gradYear)
              ? job.gradYear.join(", ")
              : job.gradYear || "2024",
            assignedAdmins: job.Review?.InternallyAssignedTo || [],
          })) || [],

          inactiveJobs: response.data?.inactiveJobs?.map((job) => ({
            id: job.id,
            title: job.title,
            company: {
              name: job.Company?.name || `Company #${job.companyId}`,
              logo: job.Company?.logo
                ? `${import.meta.env.VITE_URI}${job.Company.logo}`
                : "/company-logos/default.png",
            },
            locationOptions: job.locationOptions || [],
            createdAt: job.createdAt,
            type: job.role || "Full Time",
            mode: job.remoteWork ? "Remote" : "On-site",
            batch: Array.isArray(job.gradYear)
              ? job.gradYear.join(", ")
              : job.gradYear || "2024",
            assignedAdmins: job.Review?.InternallyAssignedTo || [],
          })) || [],
        };
      } catch (error) {
        console.error("Error fetching jobs:", error);
        return { activeJobs: [], inactiveJobs: [] };
      }
    },
  });

  // Filter inactive jobs to only show those assigned to current user
  const assignedInactiveJobs = React.useMemo(() => {
    if (!jobData?.inactiveJobs) return [];
    
    return jobData.inactiveJobs.filter(job => 
      job.assignedAdmins?.some(admin => admin.email === auth.user.email)
    );
  }, [jobData?.inactiveJobs, auth.user?.email]);

  const { data: branchStats = mockBranchStats[selectedBranch] } = useQuery({
    queryKey: ["branch-stats", selectedBranch],
    enabled: !!selectedBranch,
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/super-admin/branch/${selectedBranch}/stats`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        return response.data || mockBranchStats[selectedBranch];
      } catch (error) {
        console.error("Error fetching branch stats:", error);
        return mockBranchStats[selectedBranch];
      }
    },
  });

  return (
    <DashboardLayout>
      <div className="flex h-[80vh] gap-6">
        <div className="flex flex-col h-full gap-6 w-[70%]">
          {/* Pending Requests Section - 45% height */}
          <div className="h-[45%]">
            <ListingRequestsSection 
              jobs={assignedInactiveJobs} 
              loading={isLoading} 
            />
          </div>
          
          {/* Active Listings Section - 55% height */}
          <div className="h-[55%]">
            <ActiveListingsSection 
              activeJobs={jobData?.activeJobs} 
              inactiveJobs={jobData?.inactiveJobs}
              loading={isLoading} 
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full w-[30%] gap-6">
          {/* Calendar - 55% height */}
          <div className="rounded-xl overflow-hidden h-[55%] bg-dark">
            <Calendar date={date} setDate={setDate} />
          </div>

          {/* Branch Stats - 45% height */}
          <div className="h-[45%]">
            <BranchStatsSection 
              stats={branchStats} 
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
