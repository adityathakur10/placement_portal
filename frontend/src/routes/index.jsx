import { Navigate, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import StudentRoutes from './student';
import SuperAdminRoutes from './super-admin';
import ProtectedRoute from '@/components/common/ProtectedRoute';


export const routes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/student/*',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentRoutes />
      </ProtectedRoute>
    )
  },
  {
    path: '/super-admin/*',
    element: (
      <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
        <SuperAdminRoutes />
      </ProtectedRoute>
    )
  },

  {
    path: '/',
    element: <Navigate to="/login" replace />
  }
];
