import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiUserLine, 
  RiMessage2Line, 
  RiEditLine, 
  RiDeleteBin6Line,
  RiMoreLine,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';

const ActionButtons = ({ 
  job, 
  onNavigate, 
  onDelete, 
  onStatusChange 
}) => {
  const { hr, status, assignedAdmin, id } = job;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && 
          buttonRef.current && 
          !dropdownRef.current.contains(event.target) && 
          !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle status change function (calls parent with delay)
  const handleStatusChange = async (newStatus, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Close dropdown first
    setIsDropdownOpen(false);
    
    // Small delay to ensure dropdown closes first
    setTimeout(() => {
      onStatusChange(id, newStatus);
    }, 10);
  };
  
  return (
    <div className="flex justify-between mt-4 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
      {/* HR Contact */}
      <div className="flex items-center gap-2">
        <RiUserLine className="text-primary" />
        <div>
          <div className="text-xs opacity-70">HR Contact</div>
          <Link
            to={`/super-admin/chat/${hr}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            {hr}
            <RiMessage2Line className="text-primary" />
          </Link>
        </div>
      </div>

      {/* Status dropdown with proper positioning */}
      <div className="flex gap-2">
        {/* Edit button */}
        <button
          className="btn btn-sm btn-outline btn-square"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(`/super-admin/job-listings/${id}/edit`);
          }}
          title="Edit Job"
        >
          <RiEditLine size={18} />
        </button>
        
        {/* Delete button - updated to just call onDelete */}
        <button
          className="btn btn-sm btn-outline btn-error btn-square"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(job); // Pass the entire job object so we have access to title/position
          }}
          title="Delete Job"
        >
          <RiDeleteBin6Line size={18} />
        </button>
        
        {/* Status button with improved dropdown */}
        <div className="relative inline-block" style={{ zIndex: 50 }}>
          <button
            ref={buttonRef}
            className={`btn btn-sm gap-2 shadow-md ${
              status === "approved"
                ? "btn-success"
                : status === "changes_requested"
                ? "btn-warning"
                : status === "rejected"
                ? "btn-error"
                : "btn-info"
            }`}
            disabled={!assignedAdmin}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <div className="flex items-center gap-2">
              {status === "pending" && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              <span>
                {status === "pending" 
                  ? "Pending" 
                  : status === "approved" 
                    ? "Approved" 
                    : status === "changes_requested" 
                      ? "Changes Requested" 
                      : "Rejected"
                }
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </button>
          
          {/* Dropdown menu with enhanced positioning */}
          {assignedAdmin && isDropdownOpen && (
            <ul 
              ref={dropdownRef}
              className="absolute right-0 top-full mt-1 shadow-xl bg-white rounded-lg w-56 border border-gray-100 overflow-hidden"
              style={{
                zIndex: 100,
                animation: 'dropdownFadeIn 0.2s ease-out',
                position: 'absolute'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <li className="border-b border-gray-100">
                <button 
                  onClick={(e) => handleStatusChange("changes_requested", e)}
                  disabled={status === "changes_requested"}
                  className="py-3 px-4 w-full text-left hover:bg-amber-50 hover:text-amber-600 disabled:opacity-60 disabled:bg-gray-50 disabled:hover:text-gray-400 transition-colors flex items-center gap-2"
                >
                  <RiMoreLine className="text-amber-500" size={18} />
                  <span>Request Changes</span>
                </button>
              </li>
              <li className="border-b border-gray-100">
                <button 
                  onClick={(e) => handleStatusChange("approved", e)}
                  disabled={status === "approved"}
                  className="py-3 px-4 w-full text-left hover:bg-green-50 hover:text-green-600 disabled:opacity-60 disabled:bg-gray-50 disabled:hover:text-gray-400 transition-colors flex items-center gap-2"
                >
                  <RiCheckLine className="text-green-500" size={18} />
                  <span>Approve Listing</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => handleStatusChange("rejected", e)}
                  disabled={status === "rejected"}
                  className="py-3 px-4 w-full text-left hover:bg-red-50 hover:text-red-600 disabled:opacity-60 disabled:bg-gray-50 disabled:hover:text-gray-400 transition-colors flex items-center gap-2"
                >
                  <RiCloseLine className="text-red-500" size={18} />
                  <span>Reject Listing</span>
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;