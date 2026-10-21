import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import DatePicker from '@/components/ui/datepicker';
import { RiAddLine, RiCalendarLine, RiGraduationCapLine, RiTimeLine } from 'react-icons/ri';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const BranchCard = ({ branch, isSelected, onToggle, cgpa, onCGPAChange, error }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`relative bg-white rounded-xl border-2 transition-all duration-300 ease-in-out overflow-hidden
      ${isSelected 
        ? 'border-red shadow-[0_0_15px_rgba(239,68,68,0.1)] scale-100' 
        : 'border-gray-100 hover:border-red/30 scale-98 hover:scale-100 hover:shadow-sm'
      }
    `}
  >
    <div className="p-4">
      <label className="flex items-center justify-between cursor-pointer group">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0
            ${isSelected ? 'bg-red scale-100' : 'bg-muted scale-0 group-hover:scale-100'}
          `}/>
          <span className={`font-medium transition-colors ${isSelected ? 'text-red' : 'text-gray-800 group-hover:text-red'}`}>
            {branch.name}
          </span>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-error"
            checked={isSelected}
            onChange={onToggle}
          />
          {isSelected && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-5 -top-1 w-3 h-3 rounded-full"
            />
          )}
        </div>
      </label>
      
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden"
          >
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={cgpa || ''}
                onChange={onCGPAChange}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200
                  ${error 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-red'}
                  pr-10
                `}
                placeholder="Minimum CGPA"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                /10
              </span>
            </div>
            {error && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-xs mt-1 block"
              >
                {error}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

const SectionCard = ({ title, subtitle, children, icon }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red/10 text-red rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const EligibilityForm = ({ formData, setFormData, errors }) => {
  const { auth } = useAuth();
  const [bulkCGPA, setBulkCGPA] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Initialize selectedBranches from formData to maintain persistence
  const [selectedBranches, setSelectedBranches] = useState(() => 
    formData.branchWiseMinCgpa ? Object.keys(formData.branchWiseMinCgpa) : []
  );

  // Keep selectedBranches in sync with formData.branchWiseMinCgpa
  useEffect(() => {
    if (formData.branchWiseMinCgpa) {
      setSelectedBranches(Object.keys(formData.branchWiseMinCgpa));
    }
  }, [formData.branchWiseMinCgpa]);

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_URI}/super-admin/branch`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        return response.data.data;
      } catch (error) {
        Toast.error('Failed to fetch branches');
        return [];
      }
    }
  });

  const handleBranchToggle = (branchCode) => {
    const newSelected = selectedBranches.includes(branchCode)
      ? selectedBranches.filter(code => code !== branchCode)
      : [...selectedBranches, branchCode];
    
    // Update local state
    setSelectedBranches(newSelected);
    
    // Clear CGPA for removed branches
    const newCgpa = { ...formData.branchWiseMinCgpa };
    if (!newSelected.includes(branchCode)) {
      delete newCgpa[branchCode];
    } else if (!newCgpa[branchCode]) {
      // If adding a new branch, set default empty value
      newCgpa[branchCode] = '';
    }
    
    setFormData({
      ...formData,
      branchWiseMinCgpa: newCgpa,
    });
  };

  const handleCgpaChange = (branch, value) => {
    // Validate input
    if (value !== '' && (isNaN(parseFloat(value)) || parseFloat(value) < 0 || parseFloat(value) > 10)) {
      Toast.error("CGPA must be a number between 0 and 10");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      branchWiseMinCgpa: {
        ...prev.branchWiseMinCgpa,
        [branch]: value
      }
    }));
  };

  const handleBulkCGPAUpdate = () => {
    if (bulkCGPA && selectedBranches.length > 0) {
      const newCgpa = { ...formData.branchWiseMinCgpa };
      selectedBranches.forEach(branchCode => {
        newCgpa[branchCode] = parseFloat(bulkCGPA);
      });
      setFormData({
        ...formData,
        branchWiseMinCgpa: newCgpa
      });
      setBulkCGPA('');
      Toast.success(`Applied ${bulkCGPA} CGPA to ${selectedBranches.length} branches`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Academic Criteria */}
      <SectionCard 
        title="Academic Criteria" 
        subtitle="Set eligibility requirements for branches"
        icon={<RiGraduationCapLine size={20} />}
      >
        <div className="space-y-6">
          {/* Bulk CGPA Update */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h4 className="font-medium text-gray-800">Bulk CGPA Update</h4>
                <p className="text-sm text-gray-500">Apply the same CGPA to multiple branches</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="join">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={bulkCGPA}
                    onChange={(e) => setBulkCGPA(e.target.value)}
                    className="join-item input input-sm w-28
                      border-gray-300 focus:border-red hover:border-red/30
                      placeholder:text-gray-400"
                    placeholder="Set CGPA"
                  />
                  <button
                    type="button"
                    onClick={handleBulkCGPAUpdate}
                    disabled={!bulkCGPA || selectedBranches.length === 0}
                    className={`join-item btn btn-sm normal-case
                      ${!bulkCGPA || selectedBranches.length === 0 
                        ? 'btn-disabled' 
                        : 'bg-red hover:bg-red/90 text-white border-red'}
                    `}
                  >
                    <RiAddLine size={18} />
                    Apply to {selectedBranches.length} {selectedBranches.length === 1 ? 'branch' : 'branches'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Count */}
          {branches?.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedBranches.length} of {branches.length} branches selected
              </span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red transition-all duration-300"
                  style={{ width: `${(selectedBranches.length / branches.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Branch Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center gap-2 py-8">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-red animate-spin"/>
                <span className="text-sm text-gray-500">Loading branches...</span>
              </div>
            ) : branches?.length === 0 ? (
              <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <RiGraduationCapLine size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No branches found</p>
              </div>
            ) : (
              branches?.map(branch => (
                <BranchCard
                  key={branch.code}
                  branch={branch}
                  isSelected={selectedBranches.includes(branch.code)}
                  onToggle={() => handleBranchToggle(branch.code)}
                  cgpa={formData.branchWiseMinCgpa[branch.code]}
                  onCGPAChange={(e) => handleCgpaChange(branch.code, e.target.value)}
                  error={errors?.branchWiseMinCgpa?.[branch.code]}
                />
              ))
            )}
          </div>

          {/* Other Academic Requirements */}
          <div className="mt-8 space-y-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-100 hover:shadow-sm transition-all">
              <div className="space-y-1">
                <h4 className="font-medium text-gray-800">Active Backlogs</h4>
                <p className="text-sm text-gray-500">Allow students with active backlogs to apply</p>
              </div>
              <Switch
                checked={formData.activeBacklogsAcceptable}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  activeBacklogsAcceptable: checked
                })}
                className="data-[state=checked]:bg-red"
              />
            </div>

            {/* Failed Subjects Input */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Failed Subjects Allowed*</label>
              <input
                type="number"
                min="0"
                value={formData.failedSubjects}
                onChange={(e) => setFormData({
                  ...formData,
                  failedSubjects: parseInt(e.target.value) || 0
                })}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 ${
                  errors?.failedSubjects ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red'
                }`}
                placeholder="Enter maximum number"
              />
              {errors?.failedSubjects && (
                <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.failedSubjects}</p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Application Details */}
      <SectionCard 
        title="Application Details" 
        subtitle="Set application deadline and bond duration"
        icon={<RiCalendarLine size={20} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Application Deadline */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Application Deadline*</label>
            
            {/* The input that shows the selected date */}
            <div className="relative">
              <input
                type="text"
                readOnly
                value={formData.applicationDeadline ? new Date(formData.applicationDeadline).toLocaleString() : ''}
                onClick={() => setIsCalendarOpen(true)}
                placeholder="Select application deadline"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 ${
                  errors?.applicationDeadline ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red'
                } cursor-pointer pl-10 hover:border-red/50`}
              />
              <RiCalendarLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            {/* Modern DatePicker Modal */}
            {isCalendarOpen && (
              <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-red/90 to-red px-6 py-4 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Select Application Deadline</h3>
                      <button 
                        type="button"
                        onClick={() => setIsCalendarOpen(false)}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Selected Date Display */}
                    <div className="mt-2 text-white/90 flex items-center gap-2">
                      <RiCalendarLine size={18} />
                      <span>
                        {formData.applicationDeadline 
                          ? new Date(formData.applicationDeadline).toLocaleString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) 
                          : 'No date selected'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Calendar Body */}
                  <div className="p-6">
                    <DatePicker
                      selected={formData.applicationDeadline ? new Date(formData.applicationDeadline) : new Date()}
                      onChange={(date) => {
                        setFormData({
                          ...formData,
                          applicationDeadline: date
                        });
                      }}
                      inline
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      calendarClassName="modern-calendar side-by-side-picker"
                      dayClassName={date => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = formData.applicationDeadline && 
                          date.toDateString() === new Date(formData.applicationDeadline).toDateString();
                        
                        if (isSelected) return "bg-red text-white hover:bg-red/90 font-medium";
                        if (isToday) return "bg-red/10 text-red font-medium border border-red";
                        return "hover:bg-red/10 hover:text-red";
                      }}
                      timeClassName={() => "hover:bg-red/10 hover:text-red text-sm"}
                    />
                  </div>
                  
                  {/* Footer with Actions */}
                  <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="px-4 py-2.5 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm transition-all flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Confirm Selection
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
            
            {errors?.applicationDeadline && (
              <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.applicationDeadline}</p>
            )}
          </div>

          {/* Bond Duration */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bond Duration (in years)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.bondInYrs}
                onChange={(e) => setFormData({
                  ...formData,
                  bondInYrs: parseFloat(e.target.value) || 0
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red/20 focus:border-red transition-all duration-200 pl-10"
                placeholder="Enter bond duration"
              />
              <RiTimeLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <p className="mt-2 text-xs text-gray-500">Leave as 0 for no bond requirement</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default EligibilityForm;