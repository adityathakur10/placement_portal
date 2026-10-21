import React, { useState, useRef, useEffect } from 'react';
import { RiArrowDownSLine, RiTimeLine, RiBriefcaseFill, RiSuitcaseLine, RiCheckLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';

const RoleTypeSelector = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roleTypes = [
    { 
      value: 'FTE', 
      label: 'Full Time', 
      icon: <RiBriefcaseFill className="text-red" />,
      description: 'Permanent position with benefits'
    },
    { 
      value: 'INTERNSHIP', 
      label: 'Internship', 
      icon: <RiTimeLine className="text-green-500" />,
      description: 'Temporary learning opportunity'
    },
    { 
      value: 'INTERNSHIP + FTE', 
      label: 'Internship + FTE', 
      icon: <RiSuitcaseLine className="text-blue-500" />,
      description: 'Convert to full-time after internship period'
    }
  ];

  const selectedRole = roleTypes.find(type => type.value === value) || { label: 'Select Role Type', icon: null };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full flex items-center justify-between bg-white px-4 py-3 rounded-lg border ${
          error ? 'border-red-500' : isOpen ? 'border-red shadow-sm' : 'border-gray-300 hover:border-gray-400'
        } transition-all duration-200`}
      >
        <div className="flex items-center gap-3">
          {selectedRole.icon && (
            <div className="text-xl">
              {selectedRole.icon}
            </div>
          )}
          <span className={`${!value ? 'text-gray-500' : 'font-medium'}`}>{selectedRole.label}</span>
        </div>
        <RiArrowDownSLine 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-red' : 'text-gray-400'}`} 
          size={20} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {roleTypes.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => {
                  onChange(role.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors relative ${
                  value === role.value ? 'bg-red/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${value === role.value ? 'bg-red/10' : 'bg-gray-100'}`}>
                    {role.icon}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {role.label}
                      {value === role.value && (
                        <RiCheckLine className="text-red" size={18} />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleTypeSelector;