import React from 'react';
import { RiCloseLine, RiBuildingLine, RiMapPinLine, RiCalendarLine, RiMoneyDollarCircleLine, RiUserLine } from 'react-icons/ri';

const JobDetailsModal = ({ job, onClose }) => {
  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Job Details</h2>
          <button className="p-2 hover:bg-gray-100 rounded-full" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Company and job header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-16 h-16 bg-white flex items-center justify-center rounded-lg border">
              <img 
                src={job.logo || '/company-logos/default.png'} 
                alt={typeof job.company === 'object' ? job.company.name : job.company}
                className="rounded-lg w-full h-full object-contain p-1"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/company-logos/default.png";
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{job.position}</h1>
              <div className="text-xl text-primary font-medium">
                {typeof job.company === 'object' ? job.company.name : job.company}
              </div>
              <div className="flex items-center text-sm text-muted mt-1">
                Posted: {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Job info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoItem icon={<RiMapPinLine />} label="Location" value={job.location} />
            <InfoItem icon={<RiMoneyDollarCircleLine />} label="Salary" value={job.salary} />
            <InfoItem icon={<RiCalendarLine />} label="Batch" value="2026 Batch" />
            <InfoItem 
              icon={<RiUserLine />} 
              label="Assigned Admin" 
              value={job.assignedAdmin || "None"} 
              highlight={!job.assignedAdmin}
            />
          </div>

          {/* Status */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <div className={`inline-block px-4 py-2 rounded-full font-medium ${
              job.status === "approved" ? "bg-green-100 text-green-800" :
              job.status === "changes_requested" ? "bg-yellow-100 text-yellow-800" : 
              job.status === "rejected" ? "bg-red-100 text-red-800" :
              "bg-blue-100 text-blue-800"
            }`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('_', ' ')}
            </div>
          </div>

          {/* HR Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Company Representative</h3>
            <div className="flex items-center gap-2 p-4 bg-background rounded-lg">
              <RiUserLine size={20} className="text-primary" />
              <div>
                <div className="text-sm text-muted">Email</div>
                <a 
                  href={`mailto:${job.hr}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {job.hr}
                </a>
              </div>
            </div>
          </div>

          {/* Additional information can be added here */}
          {job.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <div className="bg-background p-4 rounded-lg">
                <p>{job.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="border-t p-6 flex justify-end gap-3">
          <button 
            className="btn btn-ghost"
            onClick={onClose}
          >
            Close
          </button>
          {!job.assignedAdmin && (
            <button 
              className="btn bg-red text-white hover:bg-red/90"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                setShowAssignModal(true);
              }}
            >
              Assign Admin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for info items
const InfoItem = ({ icon, label, value, highlight = false }) => (
  <div className="flex items-center gap-3">
    <div className={`p-3 rounded-full ${highlight ? 'bg-red/10 text-red' : 'bg-primary/10 text-primary'}`}>
      {icon}
    </div>
    <div>
      <div className="text-sm text-muted">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  </div>
);

export default JobDetailsModal;