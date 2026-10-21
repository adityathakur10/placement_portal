import React, { useState } from 'react';
import { RiEditLine, RiFileDownloadLine, RiMapPinLine, RiBriefcaseLine, RiCalendarLine, 
  RiTimeLine, RiMoneyDollarCircleLine, RiGraduationCapLine, RiCheckLine, RiLinksLine } from 'react-icons/ri';
import DOMPurify from 'dompurify';
import { Toast } from '@/components/ui/toast';
import { exportToPDF } from '@/utils/pdfExport';
import { motion } from 'framer-motion';

const PreviewSection = ({ title, children, onEdit, step, icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
  >
    <div className="border-b border-gray-100">
      <div className="px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red/10 text-red rounded-lg">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <button
          onClick={() => onEdit(step)}
          className="px-4 py-2 flex items-center gap-2 rounded-lg text-red hover:bg-red/5 transition-all duration-200 font-medium"
        >
          <RiEditLine size={18} />
          Edit
        </button>
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

const PreviewForm = ({ formData, onEditSection }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportToPDF(formData);
    } catch (error) {
      console.error('Export failed:', error);
      Toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 -mx-6 px-6 py-5 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{formData.title || 'Job Listing Preview'}</h2>
            <p className="text-sm text-gray-500 mt-1">Review all information before submitting</p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm transition-all duration-200"
          >
            <RiFileDownloadLine size={20} />
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto space-y-8 py-8">
          {/* Basic Info */}
          <PreviewSection title="Basic Information" onEdit={onEditSection} step={1} icon={<RiBriefcaseLine size={20} />}>
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Badge variant="primary" icon={<RiBriefcaseLine size={16} />}>
                  {formData.role}
                </Badge>
                <Badge variant="info" icon={<RiGraduationCapLine size={16} />}>
                  Batch {formData.gradYear?.join(', ')}
                </Badge>
              </div>
            </div>
          </PreviewSection>

          {/* Description */}
          <PreviewSection title="Job Description" onEdit={onEditSection} step={2} icon={<RiFileDownloadLine size={20} />}>
            <div className="space-y-8">
              <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                <div dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(formData.descriptionText || '') 
                }} />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <PreviewCard title="Requirements">
                  <ul className="space-y-3">
                    {formData.requirements?.split('\n').filter(Boolean).map((req, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="h-6 w-6 rounded-full bg-red/10 text-red flex items-center justify-center flex-shrink-0">
                          <RiCheckLine size={16} />
                        </span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </PreviewCard>

                <PreviewCard title="Responsibilities">
                  <ul className="space-y-3">
                    {formData.responsibilities?.split('\n').filter(Boolean).map((resp, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="h-6 w-6 rounded-full bg-red/10 text-red flex items-center justify-center flex-shrink-0">
                          <RiCheckLine size={16} />
                        </span>
                        <span className="text-gray-700">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </PreviewCard>
              </div>
            </div>
          </PreviewSection>

          {/* Eligibility */}
          <PreviewSection title="Eligibility Criteria" onEdit={onEditSection} step={3} icon={<RiGraduationCapLine size={20} />}>
            <div className="space-y-6">
              <PreviewCard title="Branch-wise CGPA Requirements">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(formData.branchWiseMinCgpa).map(([branch, cgpa]) => (
                    <div key={branch} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-gray-700">{branch}</span>
                      <Badge variant="primary">{cgpa} CGPA</Badge>
                    </div>
                  ))}
                </div>
              </PreviewCard>
              
              <div className="flex flex-wrap gap-3">
                <Badge 
                  variant={formData.activeBacklogsAcceptable ? "warning" : "success"}
                  icon={formData.activeBacklogsAcceptable ? null : <RiCheckLine size={16} />}
                >
                  {formData.activeBacklogsAcceptable ? 'Active Backlogs Allowed' : 'No Active Backlogs'}
                </Badge>
                <Badge variant="info">
                  Max Failed Subjects: {formData.failedSubjects}
                </Badge>
                {formData.bondInYrs > 0 && (
                  <Badge variant="warning" icon={<RiTimeLine size={16} />}>
                    {formData.bondInYrs} Year Bond
                  </Badge>
                )}
              </div>

              <PreviewCard>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red/10 text-red rounded-lg">
                    <RiCalendarLine size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Application Deadline</h4>
                    <p className="text-gray-600">
                      {new Date(formData.applicationDeadline).toLocaleString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </PreviewCard>
            </div>
          </PreviewSection>

          {/* Location & CTC */}
          <PreviewSection title="Location & Compensation" onEdit={onEditSection} step={4} icon={<RiMoneyDollarCircleLine size={20} />}>
            <div className="space-y-6">
              <PreviewCard>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red/10 text-red rounded-lg">
                    <RiMapPinLine size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700">Locations</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.locationOptions?.map((location, index) => (
                        <Badge key={index} icon={<RiMapPinLine size={14} />}>
                          {location}
                        </Badge>
                      ))}
                      {formData.remoteWork && (
                        <Badge variant="success" icon={<RiCheckLine size={14} />}>
                          Remote Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </PreviewCard>

              <PreviewCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-red/10 text-red rounded-lg">
                    <RiMoneyDollarCircleLine size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Compensation</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{formData.ctc?.toLocaleString()} <span className="text-sm font-normal text-gray-500">per annum</span></p>
                  </div>
                </div>
                
                {formData.ctcBreakup?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">CTC Breakdown</h5>
                    <div className="space-y-2">
                      {formData.ctcBreakup.map((component, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                          <span className="text-gray-700">{component.name}</span>
                          <span className="font-medium text-gray-900">₹{component.amount?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </PreviewCard>
            </div>
          </PreviewSection>

          {/* Hiring Process */}
          <PreviewSection title="Hiring Process" onEdit={onEditSection} step={5} icon={<RiTimeLine size={20} />}>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 z-0"></div>
              
              <div className="space-y-6 relative z-10">
                {formData.workflowData?.map((process, index) => (
                  <div key={process.id} className="flex gap-4">
                    {/* Timeline point */}
                    <div className="h-12 w-12 rounded-full bg-red/10 text-red flex items-center justify-center flex-shrink-0 border-4 border-white">
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <h4 className="font-medium text-lg text-gray-900">{process.title}</h4>
                        <Badge 
                          variant={
                            process.type === 'interview' ? 'primary' : 
                            process.type === 'coding-round' ? 'info' :
                            process.type === 'group-discussion' ? 'warning' : 'default'
                          }
                        >
                          {process.type.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <RiCalendarLine className="text-red" size={16} />
                          <div className="text-sm">
                            <div>{new Date(process.startDateTime).toLocaleDateString()}</div>
                            <div className="text-gray-500">
                              {new Date(process.startDateTime).toLocaleTimeString()} - {new Date(process.endDateTime).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700">
                          <RiMapPinLine className="text-red" size={16} />
                          <span className="capitalize">{process.venue}</span>
                        </div>
                      </div>
                      
                      {/* Additional details */}
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {process.interviewType && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Interview Type:</span> {process.interviewType}
                          </div>
                        )}
                        {process.topic && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Topic:</span> {process.topic}
                          </div>
                        )}
                        {process.link && (
                          <div className="col-span-full flex items-center gap-2 text-sm">
                            <RiLinksLine className="text-red" size={16} />
                            <a 
                              href={process.link} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Meeting Link
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PreviewSection>
        </div>
      </div>
    </div>
  );
};

export default PreviewForm;