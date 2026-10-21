import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '@/utils/axiosConfig';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/atoms/authAtom';
import { Toast } from '@/components/ui/toast';
import DashboardLayout from '@/components/layouts/Dashboard';
import JobListingForm from '@/components/forms/JobListingForm'; 

const EditJobListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const [formData, setFormData] = useState(null);
  const [transformError, setTransformError] = useState(null);

  // Enhanced error handling for job data fetching
  const { 
    data: jobData, 
    isLoading, 
    error: queryError 
  } = useQuery({
    queryKey: ['job-listing', id],
    queryFn: async () => {
      try {
        // Add ?t=timestamp to prevent caching
        const timestamp = Date.now();
        const response = await axios.get(`/job-listings/admins/${id}?t=${timestamp}`);
        console.log("Job data fetched for editing:", response.data);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching job listing:', error);
        Toast.error(error.response?.data?.message || 'Failed to load job listing data');
        throw error;
      }
    },
    enabled: !!id && !!auth.token,
    staleTime: 0, // Don't use cached data
    retry: 1,     // Only retry once
  });

  // Transform job data safely when loaded
  useEffect(() => {
    if (jobData) {
      try {
        console.log("Raw job data from backend:", jobData);
        
        // Safely create transformed data with fallbacks
        const transformedData = {
          // Basic Info
          companyId: jobData.companyId || '',
          title: jobData.title || '',
          requirements: jobData.requirements || '',
          responsibilities: jobData.responsibilities || '',
          descriptionText: jobData.descriptionText || '',
          descriptionFile: jobData.descriptionFile || null,
          fileName: jobData.descriptionFile ? jobData.descriptionFile.split('/').pop() : null,
          webLinks: Array.isArray(jobData.webLinks) ? jobData.webLinks : [],
          role: jobData.role || '',
          gradYear: Array.isArray(jobData.gradYear) ? jobData.gradYear : 
                   jobData.gradYear ? [jobData.gradYear] : [],
          
          // Eligibility
          minCGPA: jobData.minCGPA || 0,
          failedSubjects: jobData.failedSubjects || 0,
          activeBacklogsAcceptable: Boolean(jobData.activeBacklogsAcceptable),
          applicationDeadline: jobData.applicationDeadline || new Date().toISOString(),
          bondInYrs: jobData.bondInYrs || 0,
          
          // Location & Compensation
          remoteWork: Boolean(jobData.remoteWork),
          locationOptions: Array.isArray(jobData.locationOptions) ? 
            jobData.locationOptions : 
            (jobData.locationOptions ? [jobData.locationOptions] : []),
          ctc: jobData.ctc || 0,
          ctcBreakup: Array.isArray(jobData.ctcBreakup) ? 
            jobData.ctcBreakup.map(item => ({
              name: item.name || '',
              amount: parseFloat(item.amount) || 0
            })) : [],
          branchWiseMinCgpa: jobData.branchWiseMinCgpa || {},

          // Hiring Process - with safer extraction
          workflowData: (jobData.HiringProcesses || []).map(process => {
            try {
              // Safe process details extraction
              const processDetails = 
                process.Interview || 
                process.GroupDiscussion || 
                process.CodingRound || 
                process.PPT || 
                {};
                
              // Determine process type with better handling
              let type = (process.type || "").toLowerCase();
              if (type.includes("interview")) type = "interview";
              else if (type.includes("discussion")) type = "group-discussion";
              else if (type.includes("coding")) type = "coding-round";
              else if (type.includes("ppt")) type = "ppt";
              else type = "interview"; // Default if unknown
              
              return {
                id: process.id || `temp-${Date.now()}`,
                index: process.index || 0,
                type: type,
                title: process.title || "Hiring Round",
                date: {
                  from: process.startDateTime ? new Date(process.startDateTime) : new Date(),
                  to: process.endDateTime ? new Date(process.endDateTime) : new Date()
                },
                venue: processDetails.venue || "offline",
                link: processDetails.link || '',
                topic: processDetails.topic || '',
                interviewType: processDetails.type || (type === "interview" ? "technical" : ""),
              };
            } catch (processError) {
              console.error("Error transforming process:", process, processError);
              // Return a minimal valid process object if transformation fails
              return {
                id: `error-${Date.now()}`,
                index: 0,
                type: "interview",
                title: "Hiring Round",
                date: { from: new Date(), to: new Date() },
                venue: "offline"
              };
            }
          }) || [],
        };

        console.log("Transformed form data:", transformedData);
        setFormData(transformedData);
        setTransformError(null);
      } catch (err) {
        console.error("Error transforming job data:", err);
        setTransformError(err.message || "Failed to prepare job data for editing");
        Toast.error("Error preparing job data. Please try again.");
      }
    }
  }, [jobData]);

  // Show appropriate loading/error states
  if (queryError || transformError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-[80vh]">
          <div className="mb-4 text-red-500 text-xl">
            {transformError ? "Error preparing job data" : "Failed to load job listing"}
          </div>
          <p className="mb-4 text-gray-500">
            {transformError || queryError?.response?.data?.message || "There was a problem loading this job listing"}
          </p>
          <div className="flex gap-4">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/super-admin/job-listings')}
            >
              Back to Job Listings
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !formData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="loading loading-spinner text-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <JobListingForm 
        initialData={formData} 
        isEditMode={true} 
        jobId={id}
      />
    </DashboardLayout>
  );
};

export default EditJobListing;