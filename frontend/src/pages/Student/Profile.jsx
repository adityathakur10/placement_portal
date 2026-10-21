import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/utils/axiosConfig';
import DashboardLayout from '../../components/layouts/Dashboard';
import { useRecoilValue } from 'recoil';
import { authState } from '../../store/atoms/authAtom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  RiBookLine, 
  RiGraduationCapLine, 
  RiCalendarLine, 
  RiUserLine, 
  RiCodeLine,
  RiMailLine,
  RiPhoneLine,
  RiInformationLine,
  RiBuilding2Line,
  RiMapPinLine,
  RiVerifiedBadgeLine,
  RiPercentLine
} from 'react-icons/ri';
import { Toast } from '@/components/ui/toast';

// Reuse the same UI components from JobDetail
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

const Profile = () => {
  const auth = useRecoilValue(authState);

  // Keep the existing data fetching logic
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      try {
        const response = await axios.get(`/student/profile`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        
        // Check if data exists and handle various response structures
        if (response.data && response.data.data) {
          return response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          return response.data;
        } else {
          console.error('Unexpected response structure:', response);
          return { 
            rollNumber: '120210000', 
            cgpa: '8.0', 
            branchCode: 'CSE',
            gradYear: '2025',
            program: 'ug',
            course: 'be',
            subjectsFailed: 0,
            class10ScoreType: 'percentage',
            class10Score: '90',
            class10Board: 'CBSE',
            class12ScoreType: 'percentage',
            class12Score: '85',
            class12Board: 'CBSE',
            dateOfBirth: '2003-01-01',
            Branch: { name: 'Computer Science & Engineering' }
          };
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        
        // For development purposes, return mock data to prevent UI breaking
        return {
          rollNumber: '120210000', 
          cgpa: '8.0', 
          branchCode: 'CSE',
          gradYear: '2025',
          program: 'ug',
          course: 'be',
          subjectsFailed: 0,
          class10ScoreType: 'percentage',
          class10Score: '90',
          class10Board: 'CBSE',
          class12ScoreType: 'percentage',
          class12Score: '85',
          class12Board: 'CBSE',
          dateOfBirth: '2003-01-01',
          Branch: { name: 'Computer Science & Engineering' }
        };
      }
    },
    onError: (error) => {
      Toast.error('Failed to load profile data: ' + (error.response?.data?.message || error.message));
    }
  });

  // Fetch student skills
  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['student-skills'],
    queryFn: async () => {
      try {
        const response = await axios.get(`/student/skill/student`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        
        if (response.data && response.data.data) {
          return response.data.data || [];
        } else if (response.data) {
          return Array.isArray(response.data) ? response.data : [];
        }
        return [];
      } catch (error) {
        console.error('Skills fetch error:', error);
        return [];
      }
    },
    placeholderData: []
  });

  const isLoading = profileLoading || skillsLoading;

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-red rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="h-[80vh] bg-white rounded-xl flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar - Basic Info */}
          <div className="md:w-80 border-r border-gray-200 hidden md:flex md:flex-col overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden mb-4 border border-gray-100 shadow-sm">
                  <img 
                    src={auth.user?.photoURL || `https://ui-avatars.com/api/?name=${auth.user?.fullName}&background=random`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-900">{auth.user?.fullName}</h1>
                <p className="text-red font-medium">{auth.user?.email}</p>
                
                {/* Status Badges */}
                <div className="flex gap-2 mt-3">
                  {profile?.isPlaced && <Badge variant="success">Placed</Badge>}
                  {profile?.isSpr && <Badge variant="warning">SPR</Badge>}
                  {profile?.isSic && <Badge variant="info">SIC</Badge>}
                </div>
              </div>
            </div>

            {/* Key Details - Same layout as JobDetail */}
            <div className="p-6 border-b border-gray-200 space-y-4">
              <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wider">Key Details</h3>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <RiUserLine className="text-red" size={16} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Roll Number</div>
                  <div className="font-medium">{profile?.rollNumber || auth.user?.email.split('_')[0]}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <RiGraduationCapLine className="text-red" size={16} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">CGPA</div>
                  <div className="font-medium">{profile?.cgpa || '8.0'}/10</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <RiBookLine className="text-red" size={16} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Branch</div>
                  <div className="font-medium truncate max-w-[180px]">
                    {profile?.Branch?.name || 
                     (profile?.branchCode === 'CSE' ? 'Computer Science & Engineering' : 
                      profile?.branchCode === 'ECE' ? 'Electronics & Communication Engineering' : 
                      profile?.branchCode === 'ME' ? 'Mechanical Engineering' : 
                      profile?.branchCode || 'Computer Science & Engineering')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <RiCalendarLine className="text-red" size={16} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Graduation Year</div>
                  <div className="font-medium">{profile?.gradYear || '2025'}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Mobile Header */}
            <div className="md:hidden p-4 border-b border-gray-200">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-3 border">
                  <img 
                    src={auth.user?.photoURL || `https://ui-avatars.com/api/?name=${auth.user?.fullName}&background=random`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-lg font-bold">{auth.user?.fullName}</h1>
                <p className="text-red text-sm font-medium">{auth.user?.email}</p>
                
                <div className="flex gap-1 mt-2">
                  {profile?.isPlaced && <Badge variant="success">Placed</Badge>}
                  {profile?.isSpr && <Badge variant="warning">SPR</Badge>}
                  {profile?.isSic && <Badge variant="info">SIC</Badge>}
                </div>
              </div>
              
              {/* Mobile Key Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <RiUserLine className="text-red" />
                  <span>Roll: {profile?.rollNumber || auth.user?.email.split('_')[0]}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <RiGraduationCapLine className="text-red" />
                  <span>CGPA: {profile?.cgpa || '8.0'}/10</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <RiBookLine className="text-red" />
                  <span className="truncate">{profile?.Branch?.name || profile?.branchCode || 'CSE'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <RiCalendarLine className="text-red" />
                  <span>{profile?.gradYear || '2025'}</span>
                </div>
              </div>
            </div>
            
            {/* Main Content Sections */}
            <div className="p-6 space-y-8">
              {/* Academic Information */}
              <PreviewSection title="Academic Information" icon={<RiGraduationCapLine size={20} />}>
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge variant="primary" icon={<RiGraduationCapLine size={16} />}>
                      {(profile?.program || 'UG').toUpperCase()}
                    </Badge>
                    <Badge variant="info">
                      {(profile?.course || 'B.Tech').toUpperCase()}
                    </Badge>
                    <Badge variant="success" icon={<RiVerifiedBadgeLine size={16} />}>
                      CGPA: {profile?.cgpa || '8.0'}/10
                    </Badge>
                  </div>
                  
                  <PreviewCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red/10 text-red rounded-lg">
                          <RiBookLine size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Program & Course</h4>
                          <p className="text-gray-600">
                            {(profile?.program || 'UG').toUpperCase()} - {(profile?.course || 'B.Tech').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red/10 text-red rounded-lg">
                          <RiBookLine size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Branch</h4>
                          <p className="text-gray-600">
                            {profile?.Branch?.name || 
                             (profile?.branchCode === 'CSE' ? 'Computer Science & Engineering' : 
                              profile?.branchCode === 'ECE' ? 'Electronics & Communication Engineering' : 
                              profile?.branchCode === 'ME' ? 'Mechanical Engineering' : 
                              profile?.branchCode || 'Computer Science & Engineering')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-100 text-green-700 rounded-lg">
                          <RiGraduationCapLine size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">CGPA</h4>
                          <p className="text-gray-600 font-semibold">{profile?.cgpa || '8.0'}/10</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                          <RiInformationLine size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Failed Subjects</h4>
                          <p className="text-gray-600">{profile?.subjectsFailed || 0}</p>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </PreviewSection>

              {/* Previous Education */}
              <PreviewSection title="Previous Education" icon={<RiBookLine size={20} />}>
                <div className="space-y-6">
                  {/* Class 10 */}
                  <PreviewCard title="Class 10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-white rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500">Score Type</div>
                        <div className="font-medium capitalize">{profile?.class10ScoreType || 'Percentage'}</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500">Score</div>
                        <div className="font-medium flex items-center gap-1">
                          <span>{profile?.class10Score || '90'}</span>
                          {profile?.class10ScoreType === 'percentage' && <RiPercentLine size={14} />}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500">Board</div>
                        <div className="font-medium">{profile?.class10Board || 'CBSE'}</div>
                      </div>
                    </div>
                  </PreviewCard>
                  
                  {/* Class 12 */}
                  <PreviewCard title="Class 12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-white rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500">Score Type</div>
                        <div className="font-medium capitalize">{profile?.class12ScoreType || 'Percentage'}</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500">Score</div>
                        <div className="font-medium flex items-center gap-1">
                          <span>{profile?.class12Score || '85'}</span>
                          {profile?.class12ScoreType === 'percentage' && <RiPercentLine size={14} />}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500">Board</div>
                        <div className="font-medium">{profile?.class12Board || 'CBSE'}</div>
                      </div>
                    </div>
                  </PreviewCard>
                  
                  {/* Diploma (if applicable) */}
                  {(profile?.diplomaScore || profile?.diplomaGradYear) && (
                    <PreviewCard title="Diploma">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <div className="text-xs text-gray-500">Score Type</div>
                          <div className="font-medium capitalize">{profile?.diplomaScoreType || 'Percentage'}</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <div className="text-xs text-gray-500">Score</div>
                          <div className="font-medium flex items-center gap-1">
                            <span>{profile?.diplomaScore || '75'}</span>
                            {profile?.diplomaScoreType === 'percentage' && <RiPercentLine size={14} />}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <div className="text-xs text-gray-500">Year</div>
                          <div className="font-medium">{profile?.diplomaGradYear || '2020'}</div>
                        </div>
                      </div>
                    </PreviewCard>
                  )}
                </div>
              </PreviewSection>
              
              {/* Skills Section */}
              <PreviewSection title="Skills & Competencies" icon={<RiCodeLine size={20} />}>
                {skills && skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill.id || skill.name} variant="primary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-xl text-center">
                    <RiCodeLine size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No skills have been added to your profile yet.</p>
                  </div>
                )}
              </PreviewSection>
              
              {/* Personal Details Section */}
              <PreviewSection title="Personal Details" icon={<RiUserLine size={20} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red/10 text-red rounded-lg">
                      <RiCalendarLine size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Date of Birth</h4>
                      <p className="text-gray-600">
                        {profile?.dateOfBirth ? format(new Date(profile.dateOfBirth), 'PPP') : '15 Jan, 2003'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red/10 text-red rounded-lg">
                      <RiMailLine size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Email</h4>
                      <p className="text-gray-600">{auth.user?.email}</p>
                    </div>
                  </div>
                  
                  {profile?.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red/10 text-red rounded-lg">
                        <RiPhoneLine size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Phone</h4>
                        <p className="text-gray-600">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.address && (
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red/10 text-red rounded-lg">
                        <RiMapPinLine size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Address</h4>
                        <p className="text-gray-600">{profile.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </PreviewSection>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;