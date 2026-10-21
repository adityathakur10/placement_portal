import React, { useState } from 'react';
import { RiBuildingLine, RiMoneyDollarCircleLine, RiMapPinLine, RiAddLine, RiCloseLine, RiGlobalLine } from 'react-icons/ri';
import { Switch } from '@/components/ui/switch';
import { Toast } from '@/components/ui/toast';
import { motion, AnimatePresence } from 'framer-motion';
import CTCBreakdownSection from './CTCBreakdownSection';

const SectionCard = ({ title, subtitle, icon, children }) => (
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

const LocationTag = ({ location, onRemove, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full border border-gray-200 
              hover:border-red/30 hover:bg-gray-100 group transition-all"
  >
    <RiMapPinLine className="text-red" size={16} />
    <span className="text-gray-700">{location}</span>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="p-1 rounded-full text-gray-400 hover:text-red hover:bg-red/10 
                opacity-0 group-hover:opacity-100 transition-all"
    >
      <RiCloseLine size={16} />
    </button>
  </motion.div>
);

const LocationCTCForm = ({ formData, setFormData, errors }) => {
  const [newLocation, setNewLocation] = useState('');
  const [newComponent, setNewComponent] = useState({ name: '', amount: '' });

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      setFormData({
        ...formData,
        locationOptions: [...(formData.locationOptions || []), newLocation.trim()]
      });
      setNewLocation('');
      Toast.success(`Added location: ${newLocation.trim()}`);
    } else {
      Toast.error('Please enter a location');
    }
  };

  const handleRemoveLocation = (index) => {
    const removed = formData.locationOptions[index];
    setFormData({
      ...formData,
      locationOptions: formData.locationOptions.filter((_, i) => i !== index)
    });
    Toast.info(`Removed location: ${removed}`);
  };

  const handleAddCtcComponent = () => {
    if (!newComponent.name || !newComponent.amount) {
      Toast.error('Please fill both component name and amount');
      return;
    }

    const amount = parseFloat(newComponent.amount);
    if (isNaN(amount) || amount <= 0) {
      Toast.error('Please enter a valid amount');
      return;
    }

    setFormData({
      ...formData,
      ctcBreakup: [...(formData.ctcBreakup || []), newComponent]
    });
    setNewComponent({ name: '', amount: '' });
    Toast.success(`Added ${newComponent.name} to CTC breakdown`);
  };

  const handleRemoveCtcComponent = (index) => {
    const removed = formData.ctcBreakup[index].name;
    setFormData({
      ...formData,
      ctcBreakup: formData.ctcBreakup.filter((_, i) => i !== index)
    });
    Toast.info(`Removed ${removed} from CTC breakdown`);
  };

  return (
    <div className="space-y-8">
      {/* Work Location */}
      <SectionCard 
        title="Work Location" 
        subtitle="Add locations where employees can work"
        icon={<RiBuildingLine size={20} />}
      >
        <div className="space-y-5">
          {/* Remote Work Toggle */}
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-full">
                <RiGlobalLine size={20} />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Remote Work</h4>
                <p className="text-sm text-gray-500">Allow employees to work remotely</p>
              </div>
            </div>
            
            <Switch
              checked={formData.remoteWork}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                remoteWork: checked
              })}
              className="data-[state=checked]:bg-red"
            />
          </div>

          {/* Location Input */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <RiMapPinLine size={18} />
                </div>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border focus:ring-2 focus:ring-red/20 
                          transition-all duration-200 border-gray-300 focus:border-red"
                  placeholder="Enter location (e.g., Bangalore, Mumbai)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                />
              </div>
              <button
                type="button"
                onClick={handleAddLocation}
                className="px-4 py-3 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm 
                        hover:shadow transition-all duration-200 flex items-center gap-2"
              >
                <RiAddLine size={18} />
                <span>Add</span>
              </button>
            </div>

            {/* Location Tags */}
            {formData.locationOptions?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-3">
                <AnimatePresence>
                  {formData.locationOptions.map((location, index) => (
                    <LocationTag 
                      key={location + index}
                      location={location}
                      index={index}
                      onRemove={handleRemoveLocation}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center text-gray-500">
                  <RiMapPinLine size={24} className="mx-auto mb-2 text-gray-400" />
                  <p>No locations added yet</p>
                  <p className="text-sm mt-1">Add locations where employees will work</p>
                </div>
              </div>
            )}
            
            {errors?.locationOptions && (
              <p className="text-sm text-red-500 animate-fadeIn mt-2">{errors.locationOptions}</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Compensation */}
      <SectionCard 
        title="Compensation Details" 
        subtitle="Set CTC and compensation breakup"
        icon={<RiMoneyDollarCircleLine size={20} />}
      >
        <div className="space-y-6">
          {/* Total CTC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Total CTC (per annum)*</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">₹</div>
              <input
                type="number"
                value={formData.ctc || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  ctc: parseFloat(e.target.value) || 0
                })}
                className={`w-full px-4 py-3 pl-8 rounded-lg border focus:ring-2 focus:ring-red/20 
                        transition-all duration-200 ${
                  errors?.ctc ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red'
                }`}
                placeholder="Enter total CTC"
              />
            </div>
            {errors?.ctc && (
              <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.ctc}</p>
            )}
          </div>

          {/* CTC Breakdown */}
          <div className="pt-4 border-t border-gray-100">
            <CTCBreakdownSection 
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default LocationCTCForm;