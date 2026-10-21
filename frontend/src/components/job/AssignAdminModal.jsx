import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/atoms/authAtom';
import axios from 'axios';
import { Toast } from '@/components/ui/toast';
import { User, X } from 'react-feather';

const AssignAdminModal = ({ onClose, onAssign, jobId }) => {
  const auth = useRecoilValue(authState);
  const queryClient = useQueryClient();
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentAssignedAdmins, setCurrentAssignedAdmins] = useState([]);

  // Fetch all admin team members
  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/super-admin/admin/`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        const allMembers = [
          ...(response.data.admins || []),
          ...(response.data.superAdmins || []),
        ];
        return allMembers;
      } catch (error) {
        Toast.error(error.response?.data?.message || 'Failed to fetch team members');
        throw error;
      }
    },
  });

  // Fetch current assigned admins for this job
  const { data: assignedAdmins, isLoading: isAssignedLoading } = useQuery({
    queryKey: ['assigned-admins', jobId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/job-listings/admins/${jobId}/perm`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        return response.data.data || [];
      } catch (error) {
        Toast.error(error.response?.data?.message || 'Failed to fetch assigned admins');
        return [];
      }
    },
  });

  // Update local state when assigned admins are fetched
  useEffect(() => {
    if (assignedAdmins) {
      setCurrentAssignedAdmins(assignedAdmins);
    }
  }, [assignedAdmins]);

  // Mutation for removing an admin
  const removeAdminMutation = useMutation({
    mutationFn: async (adminId) => {
      await axios.delete(
        `${import.meta.env.VITE_URI}/job-listings/admins/${jobId}/perm/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
    },
    onSuccess: () => {
      Toast.success('Admin removed successfully');
      queryClient.invalidateQueries(['assigned-admins', jobId]);
      queryClient.invalidateQueries(['job-detail', jobId]);
      queryClient.invalidateQueries(['job-listings']);
    },
    onError: (error) => {
      Toast.error(error.response?.data?.message || 'Failed to remove admin');
    },
  });

  const handleRemoveAdmin = (adminId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this admin?')) {
      removeAdminMutation.mutate(adminId);
    }
  };

  const handleAssign = () => {
    if (!selectedAdmin) {
      Toast.error('Please select an admin');
      return;
    }

    // Format the admin data to match what's expected
    const adminData = {
      email: selectedAdmin.email,
      firstName: selectedAdmin.firstName,
      lastName: selectedAdmin.lastName,
      id: selectedAdmin.id
    };

    onAssign(adminData);
  };

  const isLoading = isTeamLoading || isAssignedLoading;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold">Manage Admins</h2>
          <button onClick={onClose} className="text-red bg-dark rounded-full p-1 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-8 w-8 border-4 border-red border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 pr-2 scrollbar-hide">
            {currentAssignedAdmins.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Currently Assigned</h3>
                <div className="space-y-3">
                  {currentAssignedAdmins.map((admin) => (
                    <div key={admin.email} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{`${admin.firstName || ''} ${admin.lastName || ''}`}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleRemoveAdmin(admin.email, e)}
                        className="p-1.5 bg-red/10 rounded-full hover:bg-red/20 text-red"
                        title="Remove admin"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <h3 className="text-lg font-semibold mb-3">Assign New Admin</h3>
            <div className="space-y-4">
              {teamData?.map((member) => (
                <div
                  key={member.User.email}
                  onClick={() => setSelectedAdmin(member.User)}
                  className={`p-4 rounded-lg cursor-pointer flex items-center gap-3 border-2 transition-colors
                    ${selectedAdmin?.email === member.User.email 
                      ? 'border-red bg-red/10' 
                      : 'border-transparent hover:bg-gray-50'
                    }`}
                >
                  <div className="bg-white p-2 rounded-full">
                    <User size={20} className="text-dark" />
                  </div>
                  <div>
                    <div className="font-medium">{`${member.User.firstName} ${member.User.lastName}`}</div>
                    <div className="text-sm text-gray-500">{member.User.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-dark text-red rounded-lg hover:bg-dark"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedAdmin || isLoading}
            className="px-4 py-2 bg-red opacity-90 text-white rounded-lg hover:opacity-100 disabled:opacity-50 flex items-center gap-2"
          >
            Assign Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAdminModal;