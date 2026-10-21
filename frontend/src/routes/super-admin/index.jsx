import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../../pages/SuperAdmin/Dashboard';
import JobListings from '../../pages/SuperAdmin/JobListings';
import TeamMembers from '../../pages/SuperAdmin/TeamMembers';
import Companies from '../../pages/SuperAdmin/Companies';
import CreateJob from '../../pages/SuperAdmin/CreateJob';
import JobDetail from '@/pages/SuperAdmin/JobDetail';
import EditJobListing from '../../pages/SuperAdmin/EditJobListing';

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="job-listings" element={<JobListings />} />
      <Route path="job-listings/:jobId" element={<JobDetail />} />
      <Route path="job-listings/:jobId/edit" element={<EditJobListing />} />
      <Route path="create-job" element={<CreateJob />} />
      <Route path="team-members" element={<TeamMembers />} />
      <Route path="companies" element={<Companies />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default SuperAdminRoutes;