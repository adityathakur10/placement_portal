import { useState } from 'react';
import { RiAddLine, RiCloseLine, RiPercentLine, RiPieChartLine } from 'react-icons/ri';
import { Toast } from '@/components/ui/toast';
import { motion, AnimatePresence } from 'framer-motion';

const CTCBreakdownSection = ({ formData, setFormData, errors }) => {
  const [newComponent, setNewComponent] = useState({ name: '', amount: '' });

  const handleAddComponent = () => {
    if (!newComponent.name || !newComponent.amount) {
      Toast.error('Please fill both name and amount');
      return;
    }

    const amount = parseFloat(newComponent.amount);
    if (isNaN(amount)) {
      Toast.error('Please enter a valid amount');
      return;
    }

    setFormData(prev => ({
      ...prev,
      ctcBreakup: [...(prev.ctcBreakup || []), newComponent]
    }));
    setNewComponent({ name: '', amount: '' });
    Toast.success(`Added ${newComponent.name} to CTC breakdown`);
  };

  const calculateTotal = () => {
    return formData.ctcBreakup?.reduce((sum, component) => 
      sum + parseFloat(component.amount || 0), 0
    ) || 0;
  };

  const getPercentage = (value) => {
    const total = calculateTotal();
    if (!total) return 0;
    return (parseFloat(value) / total) * 100;
  };

  const breakdownToTotalRatio = () => {
    if (!formData.ctc || formData.ctc <= 0) return 100;
    const breakdownTotal = calculateTotal();
    return (breakdownTotal / formData.ctc) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800 flex items-center gap-2">
          <RiPieChartLine size={18} className="text-red" />
          CTC Breakdown
        </h4>
        {formData.ctcBreakup?.length > 0 && (
          <span className="text-sm text-gray-500">
            {formData.ctcBreakup.length} {formData.ctcBreakup.length === 1 ? 'component' : 'components'}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Component name (e.g. Base salary)"
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 
                    transition-all duration-200 border-gray-300 focus:border-red"
            value={newComponent.name}
            onChange={(e) => setNewComponent(prev => ({ 
              ...prev, 
              name: e.target.value 
            }))}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComponent()}
          />
        </div>
        <div className="relative w-32 sm:w-40">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">₹</div>
          <input
            type="number"
            placeholder="Amount"
            className="w-full px-4 py-3 pl-8 rounded-lg border focus:ring-2 focus:ring-red/20 
                    transition-all duration-200 border-gray-300 focus:border-red"
            value={newComponent.amount}
            onChange={(e) => setNewComponent(prev => ({ 
              ...prev, 
              amount: e.target.value 
            }))}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComponent()}
          />
        </div>
        <button
          type="button"
          onClick={handleAddComponent}
          className="px-4 py-3 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm 
                  hover:shadow transition-all duration-200"
        >
          <RiAddLine size={20} />
        </button>
      </div>

      {formData.ctc > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Breakdown: ₹{calculateTotal().toLocaleString()}</span>
            <span>Total CTC: ₹{parseFloat(formData.ctc).toLocaleString()}</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(breakdownToTotalRatio(), 100)}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${
                breakdownToTotalRatio() > 100 
                  ? 'bg-amber-500' 
                  : breakdownToTotalRatio() === 100 
                    ? 'bg-green-500' 
                    : 'bg-red'
              }`}
            />
          </div>
          <div className="text-xs text-right">
            <span className={
              breakdownToTotalRatio() > 100 
                ? 'text-amber-600' 
                : breakdownToTotalRatio() === 100 
                  ? 'text-green-600' 
                  : 'text-red'
            }>
              {breakdownToTotalRatio() > 100 
                ? 'Breakdown exceeds CTC'
                : breakdownToTotalRatio() === 100 
                  ? 'Breakdown matches CTC'
                  : `${Math.round(breakdownToTotalRatio())}% of total CTC`
              }
            </span>
          </div>
        </div>
      )}

      {formData.ctcBreakup?.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {formData.ctcBreakup.map((component, index) => (
              <motion.div 
                key={component.name + index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-50 rounded-lg p-3 group hover:bg-white hover:shadow-sm 
                        border border-gray-100 hover:border-red/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{component.name}</span>
                    <span className="text-gray-500">₹{parseFloat(component.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <RiPercentLine size={14} />
                      <span>{Math.round(getPercentage(component.amount))}%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newBreakup = formData.ctcBreakup.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, ctcBreakup: newBreakup }));
                        Toast.info(`Removed ${component.name}`);
                      }}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red hover:bg-red/10 
                              opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <RiCloseLine size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(component.amount)}%` }}
                    className="h-full bg-red/70"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.div 
            className="bg-red/5 rounded-lg p-4 border border-red/20 mt-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total Breakdown</span>
              <span className="font-bold text-red">₹{calculateTotal().toLocaleString()}</span>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-center text-gray-500">
            <RiPieChartLine size={24} className="mx-auto mb-2 text-gray-400" />
            <p>No components added yet</p>
            <p className="text-sm mt-1">Add salary components to create a breakdown</p>
          </div>
        </div>
      )}

      {errors?.ctcBreakup && (
        <p className="text-sm text-red-500 animate-fadeIn mt-2">{errors.ctcBreakup}</p>
      )}
    </div>
  );
};

export default CTCBreakdownSection;