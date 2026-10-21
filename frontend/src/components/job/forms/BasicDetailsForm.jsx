import React from 'react';
import CompanySelector from '@/components/ui/CompanySelector';
import RoleTypeSelector from '@/components/ui/RoleTypeSelector';
import { RiBriefcaseLine, RiBuilding4Line, RiCalendarLine } from 'react-icons/ri';

const BasicDetailsForm = ({ formData, setFormData, errors }) => {
  const currentYear = new Date().getFullYear();
  const gradYears = Array.from({ length: 4 }, (_, i) => currentYear + i);

  return (
    <div className="space-y-8">
      {/* Company Information */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red/10 text-red rounded-lg">
              <RiBuilding4Line size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
              <p className="text-sm text-gray-500">Select the company for this job listing</p>
            </div>
          </div>
        </div>
        
        {/* Company Selector - Inside card but with higher z-index */}
        <div className="px-6 py-5 relative z-30">
          <CompanySelector
            value={formData.companyId}
            onChange={(company) => setFormData({ ...formData, companyId: company.id })}
            error={errors?.companyId}
          />
          {errors?.companyId && (
            <p className="mt-2 text-sm text-red-500 animate-fadeIn">Please select a company</p>
          )}
        </div>
      </div>

      {/* Position Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red/10 text-red rounded-lg">
              <RiBriefcaseLine size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Position Details</h3>
              <p className="text-sm text-gray-500">Specify job title and role type</p>
            </div>
          </div>
        </div>
        
        {/* Position details content - Inside card with proper spacing */}
        <div className="px-6 py-5 space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title*</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 ${
                errors?.title ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red'
              }`}
              placeholder="e.g. Software Engineer"
            />
            {errors?.title && (
              <p className="mt-2 text-sm text-red-500 animate-fadeIn">Please enter a job title</p>
            )}
          </div>

          {/* Role Type - Higher z-index to appear above other elements */}
          <div className="relative z-20">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Type*</label>
            <RoleTypeSelector
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
              error={errors?.role}
            />
            {errors?.role && (
              <p className="mt-2 text-sm text-red-500 animate-fadeIn">Please select a role type</p>
            )}
          </div>
        </div>
      </div>

      {/* Graduation Years */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red/10 text-red rounded-lg">
              <RiCalendarLine size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Eligibility</h3>
              <p className="text-sm text-gray-500">Select graduation years for applicants</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
            {gradYears.map(year => (
              <button
                key={year}
                type="button"
                onClick={() => {
                  const newYears = formData.gradYear.includes(year)
                    ? formData.gradYear.filter(y => y !== year)
                    : [...formData.gradYear, year];
                  setFormData({ ...formData, gradYear: newYears });
                }}
                className={`relative overflow-hidden group py-3 px-2 rounded-lg border-2 transition-all duration-300 ${
                  formData.gradYear.includes(year)
                    ? 'bg-red border-red text-white shadow-md scale-105'
                    : 'border-gray-200 text-gray-700 hover:border-red/30'
                }`}
              >
                <span className="font-medium text-lg">{year}</span>
                
                {/* Background animation on hover */}
                <span className={`absolute inset-0 transition-all duration-500 ease-out scale-x-0 group-hover:scale-x-100 origin-left ${
                  formData.gradYear.includes(year) ? 'bg-red/20' : 'bg-red/5'
                }`}></span>
                
                {/* Selected indicator */}
                {formData.gradYear.includes(year) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white animate-pulse"></span>
                )}
              </button>
            ))}
          </div>
          {errors?.gradYear && (
            <p className="mt-2 text-sm text-red-500 animate-fadeIn">Please select at least one graduation year</p>
          )}
          {formData.gradYear.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Selected: <span className="font-medium">{formData.gradYear.join(', ')}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicDetailsForm;