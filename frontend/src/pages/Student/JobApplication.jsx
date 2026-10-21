import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/utils/axiosConfig';
import { Toast } from '@/components/ui/toast';
import DashboardLayout from '@/components/layouts/Dashboard';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/atoms/authAtom';
import { 
  RiArrowLeftLine,
  RiSendPlaneLine,
  RiFileLine,
  RiBriefcaseLine,
  RiBuilding2Line,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiUserLine,
  RiMailLine,
  RiGraduationCapLine,
  RiBookLine,
  RiTimeLine,
  RiUpload2Line,
  RiCloseLine,
  RiCheckLine,
  RiFileDownloadLine,
  RiExternalLinkLine,
  RiAddLine
} from 'react-icons/ri';

const JobApplication = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job-application', jobId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/job-listings/students/get-job/${jobId}`);
        
        // Log the complete response data
        console.log('Complete job application data:', response.data);
        
        // Validate hiring processes specifically
        const job = response.data;
        if (job) {
          console.log('Hiring process data:', {
            hasHiringProcesses: Array.isArray(job.HiringProcesses),
            count: Array.isArray(job.HiringProcesses) ? job.HiringProcesses.length : 0,
            firstProcess: Array.isArray(job.HiringProcesses) && job.HiringProcesses.length > 0 ? job.HiringProcesses[0] : null
          });
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to load job details:', error);
        Toast.error('Failed to load job details');
        navigate('/student/jobs');
        throw error;
      }
    },
    enabled: !!jobId && !!auth.token,
  });
  
  // Fetch student's resumes
  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ['student-resumes'],
    queryFn: async () => {
      try {
        const response = await axios.get('/student/resume');
        
        // Check what the actual structure is and handle accordingly
        console.log('Resume API response:', response);
        
        // If response.data contains a data property that's an array, return that
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        // If response.data itself is an array, return it
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        
        // Default to an empty array if none of the above conditions are met
        return [];
      } catch (error) {
        Toast.error('Failed to load resumes');
        throw error;
      }
    },
    enabled: !!auth.token,
  });

  // Add resume upload mutation
  const uploadResumeMutation = useMutation({
    mutationFn: async (formData) => {
      return await axios.post('/student/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (response) => {
      console.log('Resume upload response:', response);
      
      // Handle different response structures
      const resumeData = response.data?.resume || response.data;
      
      if (resumeData) {
        Toast.success('Resume uploaded successfully');
        queryClient.invalidateQueries(['student-resumes']);
        
        // Select the newly uploaded resume
        if (resumeData.id) {
          setSelectedResumeId(resumeData.id);
        }
        
        // Force a refetch instead of just invalidating
        queryClient.refetchQueries(['student-resumes']);
      } else {
        Toast.warning('Resume uploaded but details not returned. Please refresh.');
      }
    },
    onError: (error) => {
      console.error('Resume upload error:', error);
      Toast.error(error.response?.data?.message || 'Failed to upload resume');
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Fetch student profile for pre-filling data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      try {
        const response = await axios.get('/student/profile');
        return response.data;
      } catch (error) {
        console.error('Failed to load student profile:', error);
        return null;
      }
    },
    enabled: !!auth.token,
  });
  
  // Set default resume and email when data is loaded
  useEffect(() => {
    if (resumes && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    }
    
    if (auth.user?.email) {
      setPersonalEmail(auth.user.email);
    }
  }, [resumes, auth.user]);
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      Toast.error('Please upload a PDF file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      Toast.error('Resume size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('resume', file);
    
    uploadResumeMutation.mutate(formData);
  };
  
  // Function to open file picker
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Function to preview resume
  const handlePreviewResume = (resume) => {
    setPreviewResume(resume);
    setShowPreview(true);
  };
  
  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: async (applicationData) => {
      return await axios.post('/job-listings/students/apply-to', applicationData);
    },
    onSuccess: () => {
      Toast.success('Application submitted successfully');
      queryClient.invalidateQueries(['student-applications']);
      navigate('/student/dashboard');
    },
    onError: (error) => {
      Toast.error(error.response?.data?.message || 'Failed to submit application');
    },
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedResumeId) {
      Toast.error('Please select a resume');
      return;
    }
    
    if (!personalEmail) {
      Toast.error('Please provide your personal email');
      return;
    }
    
    applyMutation.mutate({
      jobId,
      resumeId: selectedResumeId,
      coverLetter,
      personalEmail,
    });
  };
  
  const isLoading = jobLoading || resumesLoading || profileLoading || applyMutation.isLoading;
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="loading loading-spinner text-primary"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Check eligibility
  if (job && job.eligibility && !job.eligibility.eligible) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-5xl mx-auto bg-white rounded-xl p-8 shadow-sm my-8">
          <button
            onClick={() => navigate(`/student/jobs/${jobId}`)}
            className="btn btn-sm btn-ghost mb-6 gap-2"
          >
            <RiArrowLeftLine /> Back to Job Details
          </button>
          
          <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">You're not eligible for this position</h2>
            {job.eligibility?.reasons && job.eligibility.reasons.length > 0 && (
              <p className="text-red-600">{job.eligibility.reasons[0]}</p>
            )}
            <button
              onClick={() => navigate('/student/jobs')}
              className="btn btn-primary mt-4"
            >
              Browse Other Jobs
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Get display data
  useEffect(() => {
    if (job) {
      console.log('Processing job data for display:', {
        companyInfo: job.Company,
        title: job.title, 
        position: job.position,
        logoPath: job.Company?.logo
      });
    }
  }, [job]);
  
  const studentData = profile || {};
  const companyName = job?.Company?.name || job?.companyName || "Company";
  const jobTitle = job?.title || job?.position || "Position";
  const logoUrl = job?.Company?.logo 
    ? `${import.meta.env.VITE_URI || ''}${job.Company.logo.startsWith('/') ? job.Company.logo : '/' + job.Company.logo}` 
    : null;
  
  // Log what we're using
  console.log('Display values:', { companyName, jobTitle, logoUrl });
  
  return (
    <DashboardLayout>
      <div className="h-[80vh] flex bg-white rounded-xl overflow-hidden">
        {/* Left Sidebar - Company Details */}
        <div className="w-64 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => navigate(`/student/jobs/${jobId}`)}
              className="btn btn-sm btn-ghost gap-2 mb-4"
            >
              <RiArrowLeftLine /> Back
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden mb-4 border">
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
                  <RiBuilding2Line size={36} className="text-gray-400" />
                )}
              </div>
              <h1 className="text-xl font-bold">{jobTitle}</h1>
              <p className="text-primary font-medium">{companyName}</p>
            </div>
          </div>

          {/* Job Details */}
          <div className="p-4 border-b border-gray-200 space-y-4">
            {job?.role && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Role</span>
                <span className="font-medium">{job.role}</span>
              </div>
            )}
            
            {job?.ctc && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">CTC</span>
                <span className="font-medium">₹{job.ctc?.toLocaleString() || '0'} LPA</span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Location</span>
              <span className="font-medium">
                {job?.locationOptions && job.locationOptions.length > 0
                  ? Array.isArray(job.locationOptions)
                    ? job.locationOptions.join(', ')
                    : job.locationOptions
                  : "Remote"}
              </span>
            </div>
            
            {job?.applicationDeadline && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Apply Before</span>
                <span className="font-medium text-red-600">
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Student Details - Read-only information */}
          <div className="p-4 border-b border-gray-200 space-y-2">
            <h3 className="font-medium text-sm mb-2 text-gray-500">YOUR INFO</h3>
            
            <div className="text-sm flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{auth.user?.fullName}</span>
            </div>
            
            <div className="text-sm flex justify-between">
              <span className="text-gray-500">Roll Number</span>
              <span className="font-medium">
                {studentData.rollNumber || auth.user?.email?.split('_')[0] || 'Not available'}
              </span>
            </div>
            
            <div className="text-sm flex justify-between">
              <span className="text-gray-500">CGPA</span>
              <span className="font-medium">{studentData.cgpa || '8.0'}/10</span>
            </div>
            
            <div className="text-sm flex justify-between">
              <span className="text-gray-500">Branch</span>
              <span className="font-medium">
                {studentData?.Branch?.name || 
                 (studentData?.branchCode === 'CSE' ? 'Computer Science & Engineering' : 
                  studentData?.branchCode === 'ECE' ? 'Electronics & Communication Engineering' : 
                  studentData?.branchCode === 'ME' ? 'Mechanical Engineering' : 
                  studentData?.branchCode || 'Not available')}
              </span>
            </div>
            
            <div className="text-sm flex justify-between">
              <span className="text-gray-500">Graduation</span>
              <span className="font-medium">{studentData.gradYear || '2025'}</span>
            </div>
          </div>
          
          <div className="mt-auto p-4">
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
              <p>These details will be shared with the company when you apply.</p>
            </div>
          </div>
        </div>

        {/* Right Side - Application Form */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="bg-white p-6 flex flex-col h-full">
            {/* Content Header */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h2 className="text-2xl font-semibold">Application Form</h2>
            </div>
            
            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Enhanced Resume Section */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                          <RiFileLine size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
                          <p className="text-sm text-gray-500">Select or upload a resume</p>
                        </div>
                      </div>
                      
                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        className="btn btn-sm btn-outline gap-2"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <div className="loading loading-spinner loading-xs"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <RiUpload2Line />
                            Upload New
                          </>
                        )}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="application/pdf"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {Array.isArray(resumes) && resumes.length > 0 ? (
                      <div className="space-y-4">
                        {/* Log the resume data for debugging */}
                        {console.log('Rendering resumes:', resumes)}
                        
                        {resumes.map(resume => (
                          <div key={resume.id || resume._id} className="flex items-center bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all">
                            <input
                              type="radio"
                              id={`resume-${resume.id || resume._id}`}
                              name="resume"
                              value={resume.id || resume._id}
                              checked={selectedResumeId === (resume.id || resume._id)}
                              onChange={() => setSelectedResumeId(resume.id || resume._id)}
                              className="radio radio-primary mr-3"
                            />
                            <label
                              htmlFor={`resume-${resume.id || resume._id}`}
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                            >
                              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <RiFileLine size={24} />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{resume.name || resume.fileName || 'Resume'}</div>
                                <div className="text-xs text-gray-500">
                                  Last updated: {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'Recently'}
                                </div>
                              </div>
                              
                              {/* View PDF Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePreviewResume(resume);
                                }}
                                className="btn btn-sm btn-ghost text-blue-600"
                              >
                                <RiExternalLinkLine size={18} /> View
                              </button>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-3 bg-amber-50 rounded-full text-amber-600 mb-3">
                          <RiFileLine size={32} />
                        </div>
                        <p className="text-gray-700 mb-3">No resumes found</p>
                        <button
                          type="button"
                          onClick={handleUploadClick}
                          className="btn btn-primary"
                        >
                          <RiUpload2Line /> Upload Resume
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Personal Email */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <RiMailLine size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Contact Email</h3>
                        <p className="text-sm text-gray-500">Email where the recruiter can contact you</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <input
                      type="email"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Enter your personal email"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      This email will be shared with the recruiter for contact purposes
                    </p>
                  </div>
                </div>
                
                {/* Cover Letter */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <RiSendPlaneLine size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Cover Letter</h3>
                        <p className="text-sm text-gray-500">Optional message to the hiring team</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="textarea textarea-bordered w-full h-32"
                      placeholder="Tell the employer why you're interested in this position and what makes you a good fit."
                    />
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="sticky bottom-0 pt-4 bg-white border-t border-gray-100">
                  <button
                    type="submit"
                    className="btn btn-primary w-full gap-2"
                    disabled={!selectedResumeId || !personalEmail || applyMutation.isLoading}
                  >
                    <RiSendPlaneLine />
                    {applyMutation.isLoading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && previewResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{previewResume.name}</h3>
              <div className="flex gap-2">
                <a 
                  href={previewResume.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  <RiFileDownloadLine /> Download
                </a>
                <button 
                  className="btn btn-sm btn-ghost" 
                  onClick={() => setShowPreview(false)}
                >
                  <RiCloseLine /> Close
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 overflow-auto">
              <iframe
                src={previewResume.url}
                className="w-full h-full"
                title="Resume Preview"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default JobApplication;