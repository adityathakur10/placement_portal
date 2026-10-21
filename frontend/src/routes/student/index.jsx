import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../../pages/Student/Dashboard';
import Profile from '../../pages/Student/Profile';
import JobListings from '../../pages/Student/JobListings';
import JobDetail from '../../pages/Student/JobDetail';
import JobApplication from '../../pages/Student/JobApplication';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="profile" element={<Profile />} />
      
      {/* Job Listings routes */}
      <Route path="jobs" element={<JobListings />} />
      <Route path="jobs/:id" element={<JobDetail />} />
      <Route path="jobs/:id/apply" element={<JobApplication />} />
      
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default StudentRoutes;