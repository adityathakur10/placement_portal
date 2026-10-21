import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import BasicDetailsForm from "../job/forms/BasicDetailsForm";
import RequirementsForm from "../job/forms/RequirementsForm";
import EligibilityForm from "../job/forms/EligibilityForm";
import LocationCTCForm from "../job/forms/LocationCTCForm";
import HiringProcessForm from "../job/forms/HiringProcessForm";
import PreviewForm from "../job/forms/PreviewForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "@/utils/axiosConfig";
import { useRecoilState } from "recoil";
import { draftJobsState } from "@/store/atoms/jobFormAtom";
import { RoleTypes } from "@/config/enums";
import { RiInformationLine } from "react-icons/ri";

const INITIAL_DATA = {
  // Basic Info
  companyId: "",
  title: "",
  requirements: "",
  responsibilities: "",
  descriptionText: "",
  descriptionFile: null,
  webLinks: [],
  role: "",
  gradYear: [],

  // Eligibility
  failedSubjects: 0,
  activeBacklogsAcceptable: false,
  applicationDeadline: "",
  bondInYrs: 0,

  // Location & Work
  remoteWork: false,
  locationOptions: [],

  // Compensation
  ctc: 0,
  ctcBreakup: [],

  // Branch Requirements
  branchWiseMinCgpa: {},

  // Hiring Process
  workflowData: [],
};

// Add this helper function before getStepValidation
const calculateTotal = (ctcBreakup) => {
  return (
    ctcBreakup?.reduce(
      (sum, component) => sum + (parseFloat(component.amount) || 0),
      0
    ) || 0
  );
};

// Add step validation helpers
const getStepValidation = (step, formData) => {
  switch (step) {
    case 1:
      return {
        isValid: !!(
          formData.companyId &&
          formData.title?.trim() &&
          formData.role &&
          Object.values(RoleTypes).map(role => role.toLowerCase()).includes(formData.role.toLowerCase()) &&
          formData.gradYear.length > 0
        ),
        requiredFields: [
          "Company",
          "Job Title",
          "Role Type",
          "Graduation Years",
        ],
      };
    case 2:
      return {
        isValid: !!(
          formData.requirements &&
          formData.responsibilities &&
          formData.descriptionText
        ),
        requiredFields: ["Description", "Requirements", "Responsibilities"],
      };
    case 3:
      return {
        isValid: !!(
          Object.keys(formData.branchWiseMinCgpa).length > 0 &&
          formData.applicationDeadline
        ),
        requiredFields: ["Branch CGPA Requirements", "Application Deadline"],
      };
    case 4: // Location & CTC step
      return {
        isValid: !!(
          formData.locationOptions?.length > 0 &&
          formData.ctc > 0 &&
          // Remove ctcBreakup validation since it's optional
          (!formData.ctcBreakup?.length ||
            Math.abs(formData.ctc - calculateTotal(formData.ctcBreakup)) < 0.01)
        ),
        requiredFields: ["Location Options", "CTC"],
      };
    case 5:
      return {
        isValid: !!(formData.workflowData.length > 0),
        requiredFields: ["Hiring Process Rounds"],
      };
    default:
      return { isValid: true, requiredFields: [] };
  }
};

const transformWorkflowData = (workflowData) => {
  console.log("Before transform:", workflowData);
  const transformedData = workflowData.map((process) => {
    let processType = process.type?.toLowerCase() || "";
    
    if (processType === "interview" || processType === "technical" || processType === "hr" || processType === "managerial") {
      processType = "interview"; 
    } else if (processType === "group discussion" || processType === "group_discussion") {
      processType = "group-discussion"; 
    } else if (processType === "coding round" || processType === "coding_round") {
      processType = "coding-round"; 
    } else if (processType === "ppt") {
      processType = "ppt";
    }
    
    // Make sure dates are properly formatted as ISO strings
    const startDate = process.date?.from ? new Date(process.date.from) : new Date();
    const endDate = process.date?.to ? new Date(process.date.to) : new Date();
    
    const baseProcess = {
      id: process.id,
      index: process.index || 0,
      type: processType, 
      title: process.title || "",
      startDateTime: startDate.toISOString(),  
      endDateTime: endDate.toISOString(),      
      venue: process.venue || "offline",
      link: process.venue === "online" ? process.link : null,
    };

    // Add type-specific properties at the top level
    if (processType === "interview") {
      baseProcess.interviewType = process.interviewType || "technical";
    } else if (processType === "group-discussion") {
      baseProcess.topic = process.topic || "";
    }

    return baseProcess;
  });
  console.log("After transform:", transformedData);
  return transformedData;
};

const JobListingForm = ({ initialData, isEditMode = false, jobId = null }) => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      console.log("Using provided initial data:", initialData);
      return initialData;
    } else {
      // Default form data for new job listings
      return INITIAL_DATA;
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [drafts, setDrafts] = useRecoilState(draftJobsState);

  // Add states for step validation
  const [stepValidation, setStepValidation] = useState({
    isValid: false,
    requiredFields: [],
  });

  // Initialize react-hook-form
  const {
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: INITIAL_DATA,
  });

  const steps = [
    {
      id: 1,
      title: "Company & Role",
      description: "Basic job details",
      isComplete: false,
    },
    {
      id: 2,
      title: "Requirements",
      description: "Job requirements and responsibilities",
      isComplete: false,
    },
    {
      id: 3,
      title: "Eligibility",
      description: "CGPA and other criteria",
      isComplete: false,
    },
    {
      id: 4,
      title: "Location & CTC",
      description: "Work location and compensation",
      isComplete: false,
    },
    {
      id: 5,
      title: "Hiring Process",
      description: "Interview rounds and workflow",
      isComplete: false,
    },
    {
      id: 6,
      title: "Preview",
      description: "Review all details",
      isComplete: false,
    },
  ];

  // Restore draft if available
  useEffect(() => {
    const { state } = location;
    if (state?.draft) {
      setFormData(state.draft.formData);
      setCurrentStep(state.draft.currentStep);
      Toast.success("Draft restored");
    }
  }, [location]);

  // Update auto-save functionality
  useEffect(() => {
    const saveFormData = async () => {
      if (!formData.title && !formData.companyId) return;

      setIsSaving(true);
      try {
        const validation = getStepValidation(currentStep, formData);
        const draftId = formData.draftId || `draft_${Date.now()}`;

        const draftData = {
          id: draftId,
          draftId,
          title: formData.title || "Untitled Job",
          formData: {
            ...formData,
            // Store filename separately since File objects can't be serialized
            fileName: formData.descriptionFile ? formData.descriptionFile.name : formData.fileName,
            // Clear the actual file reference before saving to avoid serialization issues
            descriptionFile: null,
          },
          currentStep,
          lastSaved: new Date().toISOString(),
          progress: calculateProgress(formData),
          stepsCompleted: steps.map((step) => ({
            id: step.id,
            isComplete: getStepValidation(step.id, formData).isValid,
          })),
        };

        // Update drafts in Recoil state
        const existingDraftIndex = drafts.findIndex(
          (d) =>
            d.draftId === draftId || d.formData.companyId === formData.companyId
        );

        if (existingDraftIndex !== -1) {
          const updatedDrafts = [...drafts];
          updatedDrafts[existingDraftIndex] = draftData;
          setDrafts(updatedDrafts);
        } else {
          setDrafts((prev) => [...prev, draftData]);
        }

        localStorage.setItem("jobDrafts", JSON.stringify(drafts));
        setStepValidation(validation);
      } catch (error) {
        Toast.error("Failed to save draft");
      } finally {
        setIsSaving(false);
      }
    };

    const timeoutId = setTimeout(saveFormData, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData, currentStep]);

  // Calculate form completion progress
  const calculateProgress = (data) => {
    const requiredFields = [
      "title",
      "companyId",
      "requirements",
      "responsibilities",
      "role",
      "gradYear",
      "locationOptions",
      "ctc",
    ];

    const completedFields = requiredFields.filter((field) => {
      const value = data[field];
      return (
        value &&
        (Array.isArray(value)
          ? value.length > 0
          : typeof value === "string"
          ? value.trim() !== ""
          : true)
      );
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  // Update the createJobMutation
  const createJobMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        const formDataToSend = new FormData();

        // 1. Validate and append file first
        if (formData.descriptionFile instanceof File) {
          // Key change: Make sure we're using the EXACT field name expected by multer
          formDataToSend.append(
            "descriptionFile", // This must match the field name in multer config
            formData.descriptionFile
          );
          
          // Add some logging to verify the file is being included
          console.log("Uploading file:", {
            name: formData.descriptionFile.name,
            size: formData.descriptionFile.size,
            type: formData.descriptionFile.type
          });
        } else {
          // If no file is selected, throw an error - files are required for new job listings
          throw new Error("Description file is required");
        }

        // 2. Transform hiring process data to match backend model
        const workflowData = transformWorkflowData(formData.workflowData);

        // Add this log to debug what's being sent
        console.log("Sending workflow data:", workflowData);

        // Find the correctly cased enum value that matches input
        // IMPORTANT: Move this declaration BEFORE using the variable in logs
        const matchingRole = Object.values(RoleTypes).find(
          enumRole => enumRole.toLowerCase() === formData.role?.toLowerCase()
        );

        // Now we can safely log it since it's already defined
        console.log("Debug - Process Types:", workflowData.map(p => p.type));
        console.log("Debug - Role Value:", matchingRole || formData.role);

        // 3. Prepare job listing data
        const jobListingData = {
          title: formData.title?.trim(),
          companyId: formData.companyId,
          requirements: formData.requirements?.trim(),
          responsibilities: formData.responsibilities?.trim(),
          descriptionText: formData.descriptionText?.trim(),
          webLinks: Array.isArray(formData.webLinks) ? formData.webLinks : [],
          role: matchingRole || formData.role, // Use correctly cased enum value
          gradYear: formData.gradYear,
          failedSubjects: parseInt(formData.failedSubjects) || 0,
          activeBacklogsAcceptable: Boolean(formData.activeBacklogsAcceptable),
          applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
          bondInYrs: parseInt(formData.bondInYrs) || 0,
          remoteWork: Boolean(formData.remoteWork),
          locationOptions: formData.locationOptions,
          ctc: parseFloat(formData.ctc) || 0, // Make sure it's a valid number
          // Format CTC breakup to ensure consistency
          ctcBreakup: formData.ctcBreakup?.map(item => ({
            name: item.name || item.title || "", // Support both formats
            amount: parseFloat(item.amount || item.value || 0)
          })) || [],
          workflowData,
        };

        // 4. Append data in correct order - AFTER appending the file and AFTER cleaning CGPA data
        const cleanedBranchCgpa = {};
        Object.entries(formData.branchWiseMinCgpa).forEach(([branch, cgpa]) => {
          // Only include branches with valid numeric CGPA values
          if (cgpa !== undefined && cgpa !== null && cgpa !== '') {
            cleanedBranchCgpa[branch] = parseFloat(cgpa);
          }
        });

        formDataToSend.append("jobListingData", JSON.stringify(jobListingData));
        formDataToSend.append(
          "branchWiseMinCgpa",
          JSON.stringify(cleanedBranchCgpa) // Use cleaned data
        );
        formDataToSend.append("companyId", formData.companyId);

        // Debug: Log all entries in FormData to verify content
        for (let pair of formDataToSend.entries()) {
          console.log(`FormData entry - ${pair[0]}: ${pair[1] instanceof File ? 
            `File: ${pair[1].name} (${pair[1].size} bytes)` : 
            (typeof pair[1] === 'string' && pair[1].length > 100 ? 
              `${pair[1].substring(0, 100)}...` : pair[1])}`);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_URI}/job-listings/admins/`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        // Enhanced error logging to see the exact server response
        console.error("Job creation error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          reason: error.response?.data?.reason || "Unknown server error",
          stack: error.response?.data?.stack || "No stack trace available",
          formData: {
            ...formData,
            descriptionFile: formData.descriptionFile ? formData.descriptionFile.name : null
          }
        });
        throw error;
      }
    },
  });

  // Add updateJobMutation for edit mode
  const updateJobMutation = useMutation({
    mutationFn: async (updatedData) => {
      try {
        // Handle file upload if it's a new file
        let formDataToSend = {};
        let apiEndpoint = '';
        let requestConfig = {};
        
        // Different handling based on whether the description file has changed
        if (updatedData.descriptionFile instanceof File) {
          // If file changed, use FormData for multipart/form-data
          formDataToSend = new FormData();
          formDataToSend.append("descriptionFile", updatedData.descriptionFile);
          
          // Transform and prepare data similarly to creation
          const workflowData = transformWorkflowData(updatedData.workflowData);
          
          const jobListingData = {
            title: updatedData.title?.trim(),
            companyId: updatedData.companyId,
            requirements: updatedData.requirements?.trim(),
            responsibilities: updatedData.responsibilities?.trim(),
            descriptionText: updatedData.descriptionText?.trim(),
            webLinks: Array.isArray(updatedData.webLinks) ? updatedData.webLinks : [],
            role: updatedData.role,
            gradYear: updatedData.gradYear,
            failedSubjects: parseInt(updatedData.failedSubjects) || 0,
            activeBacklogsAcceptable: Boolean(updatedData.activeBacklogsAcceptable),
            applicationDeadline: new Date(updatedData.applicationDeadline).toISOString(),
            bondInYrs: parseInt(updatedData.bondInYrs) || 0,
            remoteWork: Boolean(updatedData.remoteWork),
            locationOptions: updatedData.locationOptions,
            ctc: parseFloat(updatedData.ctc) || 0,
            ctcBreakup: updatedData.ctcBreakup?.map(item => ({
              name: item.name || item.title || "", // Support both formats
              amount: parseFloat(item.amount || item.value || 0)
            })) || [],
            workflowData,
          };
          
          formDataToSend.append("updatedData", JSON.stringify(jobListingData));
          formDataToSend.append(
            "branchWiseMinCgpa",
            JSON.stringify(updatedData.branchWiseMinCgpa)
          );
          
          apiEndpoint = `${import.meta.env.VITE_URI}/job-listings/admins/${jobId}`;
          requestConfig = {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${auth.token}`,
            },
          };
        } else {
          // If file didn't change, use JSON
          // Transform workflow data
          const workflowData = transformWorkflowData(updatedData.workflowData);
          
          // Prepare data for update
          formDataToSend = {
            updatedData: {
              title: updatedData.title?.trim(),
              companyId: updatedData.companyId,
              requirements: updatedData.requirements?.trim(),
              responsibilities: updatedData.responsibilities?.trim(),
              descriptionText: updatedData.descriptionText?.trim(),
              webLinks: Array.isArray(updatedData.webLinks) ? updatedData.webLinks : [],
              role: updatedData.role,
              gradYear: updatedData.gradYear,
              failedSubjects: parseInt(updatedData.failedSubjects) || 0,
              activeBacklogsAcceptable: Boolean(updatedData.activeBacklogsAcceptable),
              applicationDeadline: new Date(updatedData.applicationDeadline).toISOString(),
              bondInYrs: parseInt(updatedData.bondInYrs) || 0,
              remoteWork: Boolean(updatedData.remoteWork),
              locationOptions: updatedData.locationOptions,
              ctc: parseFloat(updatedData.ctc) || 0,
              ctcBreakup: updatedData.ctcBreakup?.map(item => ({
                name: item.name || item.title || "", // Support both formats
                amount: parseFloat(item.amount || item.value || 0)
              })) || [],
              workflowData,
              branchWiseMinCgpa: updatedData.branchWiseMinCgpa
            }
          };
          
          apiEndpoint = `${import.meta.env.VITE_URI}/job-listings/admins/${jobId}`;
          requestConfig = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          };
        }
        
        // Make the PUT request
        const response = await axios.put(apiEndpoint, formDataToSend, requestConfig);
        return response.data;
      } catch (error) {
        console.error("Job update error:", error);
        throw error;
      }
    },
  });

  // Modify onSubmit to handle both create and update
  const onSubmit = async (data) => {
    try {
      // Check if we have a filename but no file (lost reference)
      if (formData.fileName && !formData.descriptionFile && !isEditMode) {
        Toast.info("Please re-upload your description file before submitting");
        setCurrentStep(2); // Navigate to the requirements step
        return;
      }

      // Validate form data before submitting
      const validation = getStepValidation(currentStep, formData);
      if (!validation.isValid) {
        Toast.error(`Please complete: ${validation.requiredFields.join(", ")}`);
        return;
      }

      console.log(`${isEditMode ? 'Updating' : 'Submitting'} form data:`, formData);
      
      let result;
      if (isEditMode) {
        result = await updateJobMutation.mutateAsync(formData);
        Toast.success("Job listing updated successfully!");
      } else {
        result = await createJobMutation.mutateAsync(formData);
        Toast.success("Job listing created successfully!");
      }
      
      console.log(`${isEditMode ? 'Update' : 'Submission'} successful:`, result);

      // Navigate to listings page
      navigate('/super-admin/job-listings');
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Submission'} error:`, error);
      const errorMessage = error.response?.data?.reason || 
                          error.response?.data?.message || 
                          `Failed to ${isEditMode ? 'update' : 'create'} job listing`;
      Toast.error(errorMessage);
    }
  };

  // Update step click handler
  const handleStepClick = async (e, stepId) => {
    e.preventDefault();

    // Always allow going back
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      return;
    }

    // Check if current step is valid before allowing forward navigation
    const validation = getStepValidation(currentStep, formData);
    if (!validation.isValid) {
      Toast.error(`Please complete: ${validation.requiredFields.join(", ")}`);
      return;
    }

    setCurrentStep(stepId);
  };

  // Update next button handler
  const handleNext = async () => {
    const validation = getStepValidation(currentStep, formData);

    if (!validation.isValid) {
      Toast.error(
        `Please complete required fields: ${validation.requiredFields.join(
          ", "
        )}`
      );
      return;
    }

    if (currentStep === steps.length) {
      handleSubmit(onSubmit)();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-w-full gap-12 max-w-7xl h-[80vh]"
    >
      {/* Vertical Stepper - Left Side */}
      <div className="w-64 flex flex-col bg-white rounded-xl min-w-64">
        {/* Fixed Header */}
        <div className="p-6 border-b border-base-200">
          <button 
            type="button"
            onClick={() => navigate('/super-admin/job-listings')}
            className="bg-dark py-2 w-full text-nowrap rounded-lg text-white"
          >
            Back to Job Listings
          </button>
        </div>

        {/* Scrollable Steps */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-10 py-6">
          <div className="flex flex-col">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "relative flex flex-col pl-8",
                  step.id !== steps.length && "pb-8"
                )}
              >
                {/* Rest of step content remains the same */}
                {step.id !== steps.length && (
                  <div className="absolute left-0 top-4 bottom-0 w-0.5">
                    <div className="absolute inset-0 bg-muted/20" />
                    {currentStep >= step.id && (
                      <div
                        className="border-progress"
                        style={{
                          top: "0",
                          bottom: "0",
                          background:
                            currentStep > step.id
                              ? "linear-gradient(to bottom, #22c55e, #22c55e)"
                              : "linear-gradient(to bottom, #3b82f6, #60a5fa)",
                        }}
                      />
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    "absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    currentStep === step.id &&
                      "border-blue-500 bg-blue-50 text-blue-500",
                    currentStep > step.id &&
                      "border-green-500 bg-green-50 text-green-500",
                    currentStep < step.id &&
                      "border-gray-200 bg-white text-gray-400"
                  )}
                >
                  <div className="relative z-10">
                    {step.isComplete ? "✓" : step.id}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleStepClick(e, step.id)}
                    className={cn(
                      "mb-2 text-left transition-colors relative z-10",
                      currentStep === step.id && "text-blue-500",
                      currentStep > step.id && "text-green-500",
                      currentStep < step.id && "text-muted/50"
                    )}
                  >
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted">{step.description}</p>
                  </button>
                  {step.id < currentStep && (
                    <span className="text-xs text-green-500">
                      Completed{" "}
                      {new Date(
                        drafts.find(
                          (d) => d.formData.draftId === formData.draftId
                        )?.lastSaved
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Fields - Right Side */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col h-full">
          {/* Form title and save indicator */}
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-2xl font-semibold">
              {isEditMode ? 'Edit ' : ''}{steps[currentStep - 1].title}
            </h2>
            {isSaving && (
              <span className="text-sm text-muted flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
                Saving...
              </span>
            )}
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide pr-4">
            <div className="space-y-6">
              {currentStep === 1 && (
                <BasicDetailsForm
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              )}
              {currentStep === 2 && (
                <RequirementsForm
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                >
                  {formData.fileName && !formData.descriptionFile && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                      <div className="flex items-center gap-2">
                        <RiInformationLine className="text-amber-500" size={20} />
                        <p className="text-amber-700">
                          Your previously attached file <strong>"{formData.fileName}"</strong> needs to be re-uploaded before submission.
                        </p>
                      </div>
                    </div>
                  )}
                </RequirementsForm>
              )}
              {currentStep === 3 && (
                <EligibilityForm
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              )}
              {currentStep === 4 && (
                <LocationCTCForm
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              )}
              {currentStep === 5 && (
                <HiringProcessForm
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              )}
              {currentStep === 6 && (
                <PreviewForm
                  formData={formData}
                  onEditSection={(step) => setCurrentStep(step)}
                />
              )}
            </div>
          </div>

          {/* Navigation - Fixed at bottom */}
          <div className="flex justify-between mt-6 pt-6 border-t flex-shrink-0">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 1}
              className="px-4 py-2 border-2 border-dark text-dark hover:bg-dark hover:text-white rounded-lg"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-red/80 text-white rounded-lg hover:bg-red"
            >
              {currentStep === steps.length ? (isEditMode ? "Save Changes" : "Submit") : "Next Step"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default JobListingForm;
