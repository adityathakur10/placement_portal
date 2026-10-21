import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/utils/axiosConfig';
import DashboardLayout from '../../components/layouts/Dashboard';
import { useRecoilValue } from 'recoil';
import { authState } from '../../store/atoms/authAtom';
import { Navigate } from 'react-router-dom';

// Import components
import Calendar from '../../components/student/dashboard/Calendar';
import ApplicationsSection from '../../components/student/dashboard/ApplicationsSection';
import JobsSection from '../../components/student/dashboard/JobsSection';
import StatsSection from '../../components/student/dashboard/StatsSection';

const StudentDashboard = () => {
  const auth = useRecoilValue(authState);
  const [date, setDate] = useState(new Date());

  // Fetch job listings
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['student-jobs'],
    queryFn: async () => {
      const response = await axios.get(`/job-listings/students/10`);
      return response.data.jobListings;
    },
    enabled: !!auth.token
  });

  // Fetch applied jobs
  const { data: appliedJobs, isLoading: appliedLoading } = useQuery({
    queryKey: ['applied-jobs'],
    queryFn: async () => {
      const response = await axios.get(`/job-listings/students/applied/5`);
      return response.data;
    },
    enabled: !!auth.token
  });

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (auth.loading || jobsLoading || appliedLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner text-primary"></div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    opportunities: jobsData?.length || 0,
    applications: appliedJobs?.length || 0,
    events: jobsData?.reduce((count, job) => {
      const now = new Date();
      const upcomingProcesses = job.HiringProcesses?.filter(
        p => new Date(p.startDateTime) > now
      ) || [];
      return count + upcomingProcesses.length;
    }, 0) || 0,
    companies: new Set(jobsData?.map(job => job.Company?.id) || []).size
  };

  return (
    <DashboardLayout>
      <div className="flex h-[80vh] gap-6 bg-background">
        {/* Left Column - 70% width */}
        <div className="flex flex-col h-full gap-6 w-[70%]">
          {/* Applications Section */}
          <ApplicationsSection applications={appliedJobs} />
          
          {/* Jobs Section */}
          <JobsSection jobs={jobsData} />
        </div>
        
        {/* Right Column - 30% width */}
        <div className="flex flex-col h-full w-[30%] gap-6">
          {/* Calendar */}
          <div className="rounded-xl overflow-hidden h-[55%] shadow-sm">
            <Calendar date={date} setDate={setDate} />
          </div>
          
          {/* Stats Section */}
          <StatsSection stats={stats} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;