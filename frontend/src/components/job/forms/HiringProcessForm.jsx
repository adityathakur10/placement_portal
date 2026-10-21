import React, { useState } from 'react';
import { RiAddLine, RiCloseLine, RiDragMove2Fill, RiCalendarLine, RiLinksLine, RiTimeLine, RiMapPinLine } from 'react-icons/ri';
import DatePicker from '@/components/ui/datepicker';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Toast } from '@/components/ui/toast';
import { motion, AnimatePresence } from 'framer-motion';

const PROCESS_TYPES = {
  GROUP_DISCUSSION: 'group-discussion',
  CODING_ROUND: 'coding-round',
  INTERVIEW: 'interview',
  PPT: 'ppt'
};

const VENUE_TYPES = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

const INTERVIEW_TYPES = {
  TECHNICAL: 'technical',
  HR: 'hr',
  MANAGERIAL: 'managerial'
};

// Mapping for icon display
const PROCESS_ICONS = {
  'group-discussion': <RiDragMove2Fill />,
  'coding-round': <RiLinksLine />,
  'interview': <RiTimeLine />,
  'ppt': <RiCalendarLine />
};

const ProcessCard = ({ process, onDelete, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: process.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  // Get display date in nice format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl border-2 ${
        isDragging 
          ? 'border-red border-dashed bg-red/5 shadow-lg' 
          : 'border-gray-100 hover:border-red/30 shadow-sm hover:shadow-md'
      } transition-all duration-200`}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            className={`p-2.5 ${isDragging ? 'text-red' : 'text-gray-400'} 
              hover:text-red cursor-grab active:cursor-grabbing 
              rounded-full hover:bg-red/5 transition-colors`}
            {...attributes} 
            {...listeners}
          >
            <RiDragMove2Fill size={20} />
          </button>
          
          <div className="flex-1">
            <h3 className={`font-medium text-lg ${isDragging ? 'text-red' : 'text-gray-800'}`}>
              {process.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-gray-500">
              <RiCalendarLine size={16} />
              <p className="text-sm">
                {formatDate(process.startDateTime)} - {formatDate(process.endDateTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(process)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(process.id)}
              className="p-2 text-gray-400 hover:text-red hover:bg-red/10 rounded-full transition-all"
            >
              <RiCloseLine size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pl-12">
          <span className="px-2.5 py-1 bg-red/10 text-red text-xs rounded-full font-medium">
            {process.type.replace('-', ' ').toUpperCase()}
          </span>
          
          {process.venue && (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium flex items-center gap-1">
              <RiMapPinLine size={14} />
              {process.venue}
            </span>
          )}
          
          {process.interviewType && (
            <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs rounded-full font-medium">
              {process.interviewType}
            </span>
          )}
          
          {process.topic && (
            <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">
              {process.topic}
            </span>
          )}
          
          {process.link && (
            <a 
              href={process.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs rounded-full font-medium flex items-center gap-1 hover:bg-amber-100 transition-colors"
            >
              <RiLinksLine size={14} />
              Meeting Link
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
    <div className="px-6 py-4 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// New DateTimePickerModal component for enhanced date picking
const DateTimePickerModal = ({ isOpen, onClose, selected, onChange, title }) => {
  if (!isOpen) return null;
  
  return (
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
            <h3 className="text-lg font-semibold">{title}</h3>
            <button 
              type="button"
              onClick={onClose}
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
              {selected 
                ? new Date(selected).toLocaleString(undefined, {
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
            selected={selected}
            onChange={onChange}
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
              const isSelected = selected && 
                date.toDateString() === new Date(selected).toDateString();
              
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
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
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
  );
};

const HiringProcessForm = ({ formData, setFormData, errors }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [newProcess, setNewProcess] = useState({
    id: '',
    type: PROCESS_TYPES.INTERVIEW,
    title: '',
    venue: VENUE_TYPES.ONLINE,
    interviewType: INTERVIEW_TYPES.TECHNICAL,
    date: {
      from: new Date(),
      to: new Date(Date.now() + 2 * 60 * 60 * 1000), // Set end time 2 hours after start time
    },
    link: '',
    topic: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance before activation
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddProcess = () => {
    // Validate required fields
    if (!newProcess.title || !newProcess.type || !newProcess.venue) {
      Toast.error('Please fill all required fields');
      return;
    }

    // Validate dates - ensure end is after start
    const startTime = new Date(newProcess.date.from).getTime();
    const endTime = new Date(newProcess.date.to).getTime();
    
    if (endTime <= startTime) {
      Toast.error('End time must be after start time');
      return;
    }
    
    // Create process data with flat structure to match backend
    const processData = {
      id: editingProcess ? editingProcess.id : Date.now().toString(),
      index: editingProcess ? editingProcess.index : formData.workflowData.length,
      type: newProcess.type.toLowerCase(),
      title: newProcess.title,
      startDateTime: newProcess.date.from,
      endDateTime: newProcess.date.to,
      // Also store in format the updateHiringWorkflow function expects
      date: {
        from: newProcess.date.from,
        to: newProcess.date.to
      },
      venue: newProcess.venue,
      link: newProcess.venue === VENUE_TYPES.ONLINE ? newProcess.link : null,
      // Type-specific fields
      interviewType: newProcess.type === PROCESS_TYPES.INTERVIEW ? newProcess.interviewType : undefined,
      topic: newProcess.type === PROCESS_TYPES.GROUP_DISCUSSION ? newProcess.topic : undefined
    };

    if (editingProcess) {
      setFormData({
        ...formData,
        workflowData: formData.workflowData
          .map(p => p.id === editingProcess.id ? processData : p)
          .map((p, idx) => ({ ...p, index: idx }))
      });
      Toast.success('Round updated successfully');
    } else {
      setFormData({
        ...formData,
        workflowData: [
          ...formData.workflowData,
          processData
        ]
      });
      Toast.success('Round added successfully');
    }

    // Reset form
    setNewProcess({
      id: '',
      type: PROCESS_TYPES.INTERVIEW,
      title: '',
      venue: VENUE_TYPES.ONLINE,
      interviewType: INTERVIEW_TYPES.TECHNICAL,
      date: {
        from: new Date(),
        to: new Date(Date.now() + 2 * 60 * 60 * 1000), // Set end time 2 hours after start time
      },
      link: '',
      topic: ''
    });
    setShowAddForm(false);
    setEditingProcess(null);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || active.id === over.id) return;
    
    setFormData(formData => {
      const oldIndex = formData.workflowData.findIndex(p => p.id === active.id);
      const newIndex = formData.workflowData.findIndex(p => p.id === over.id);
      
      const newWorkflowData = arrayMove(formData.workflowData, oldIndex, newIndex)
        .map((p, idx) => ({ ...p, index: idx }));
      
      return {
        ...formData,
        workflowData: newWorkflowData
      };
    });
  };

  return (
    <div className="space-y-8">
      <SectionCard 
        title="Hiring Process" 
        subtitle="Define the steps in your recruitment workflow"
      >
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {formData.workflowData.length > 0 ? (
                <span>
                  {formData.workflowData.length} round{formData.workflowData.length !== 1 ? 's' : ''} configured
                </span>
              ) : (
                <span>No rounds added yet</span>
              )}
            </div>
            
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
              >
                <RiAddLine size={18} />
                <span>Add Round</span>
              </button>
            )}
          </div>

          {/* Process List */}
          <div className="relative">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={formData.workflowData.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 min-h-[100px]">
                  <AnimatePresence>
                    {formData.workflowData.length > 0 ? (
                      formData.workflowData.map((process) => (
                        <ProcessCard
                          key={process.id}
                          process={process}
                          onDelete={(id) => {
                            setFormData({
                              ...formData,
                              workflowData: formData.workflowData.filter(p => p.id !== id)
                            });
                            Toast.info('Round removed');
                          }}
                          onEdit={(process) => {
                            setNewProcess({
                              id: process.id,
                              type: process.type,
                              title: process.title,
                              venue: process.venue,
                              interviewType: process.interviewType,
                              date: {
                                from: new Date(process.startDateTime),
                                to: new Date(process.endDateTime)
                              },
                              link: process.link,
                              topic: process.topic
                            });
                            setEditingProcess(process);
                            setShowAddForm(true);
                          }}
                        />
                      ))
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg"
                      >
                        <div className="p-3 bg-red/10 text-red rounded-full mb-3">
                          <RiCalendarLine size={24} />
                        </div>
                        <p className="text-gray-700 font-medium">No hiring process rounds added yet</p>
                        <p className="text-sm text-gray-500 mt-1">Add rounds to create your hiring workflow</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              
                {/* Drag Overlay */}
                <DragOverlay>
                  {activeId && (
                    <div className="bg-white p-3 border-2 border-red shadow-lg rounded-lg opacity-90">
                      <div className="flex items-center gap-2">
                        <RiDragMove2Fill className="text-red" size={20} />
                        <span className="font-medium text-red">
                          {formData.workflowData.find(p => p.id === activeId)?.title}
                        </span>
                      </div>
                    </div>
                  )}
                </DragOverlay>
              </SortableContext>
            </DndContext>
          </div>

          {/* Add/Edit Form - Enhanced with better visuals */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl overflow-hidden shadow-lg border-2 border-red/10"
              >
                <div className="bg-gradient-to-r from-red/90 to-red px-6 py-4 text-white">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">
                      {editingProcess ? 'Edit Interview Round' : 'Add New Interview Round'}
                    </h4>
                    <button 
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingProcess(null);
                      }}
                      className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <RiCloseLine size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Round Type*</label>
                      <div className="relative">
                        <select
                          value={newProcess.type}
                          onChange={(e) => setNewProcess({
                            ...newProcess,
                            type: e.target.value
                          })}
                          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red appearance-none"
                        >
                          {Object.entries(PROCESS_TYPES).map(([key, value]) => (
                            <option key={value} value={value}>
                              {key.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Round Title*</label>
                      <input
                        type="text"
                        value={newProcess.title}
                        onChange={(e) => setNewProcess({
                          ...newProcess,
                          title: e.target.value
                        })}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red"
                        placeholder="e.g., Technical Interview Round 1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date & Time*</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={newProcess.date.from ? new Date(newProcess.date.from).toLocaleString() : ''}
                          onClick={() => setShowStartDatePicker(true)}
                          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 
                                    border-gray-300 focus:border-red cursor-pointer pl-10 hover:border-red/50"
                          placeholder="Select start date and time"
                        />
                        <RiCalendarLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                      
                      <DateTimePickerModal
                        isOpen={showStartDatePicker}
                        onClose={() => setShowStartDatePicker(false)}
                        selected={newProcess.date.from}
                        onChange={(date) => {
                          setNewProcess({
                            ...newProcess,
                            date: { ...newProcess.date, from: date }
                          });
                          setShowStartDatePicker(false);
                        }}
                        title="Select Start Date & Time"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date & Time*</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={newProcess.date.to ? new Date(newProcess.date.to).toLocaleString() : ''}
                          onClick={() => setShowEndDatePicker(true)}
                          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 
                                    border-gray-300 focus:border-red cursor-pointer pl-10 hover:border-red/50"
                          placeholder="Select end date and time"
                        />
                        <RiCalendarLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                      
                      <DateTimePickerModal
                        isOpen={showEndDatePicker}
                        onClose={() => setShowEndDatePicker(false)}
                        selected={newProcess.date.to}
                        onChange={(date) => {
                          setNewProcess({
                            ...newProcess,
                            date: { ...newProcess.date, to: date }
                          });
                          setShowEndDatePicker(false);
                        }}
                        title="Select End Date & Time"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue*</label>
                      <div className="relative">
                        <select
                          value={newProcess.venue}
                          onChange={(e) => setNewProcess({
                            ...newProcess,
                            venue: e.target.value
                          })}
                          className="w-full px-4 py-3 pl-10 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red appearance-none"
                        >
                          {Object.entries(VENUE_TYPES).map(([key, value]) => (
                            <option key={value} value={value}>
                              {key}
                            </option>
                          ))}
                        </select>
                        <RiMapPinLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {newProcess.venue === VENUE_TYPES.ONLINE && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Link</label>
                        <div className="relative">
                          <input
                            type="url"
                            value={newProcess.link}
                            onChange={(e) => setNewProcess({
                              ...newProcess,
                              link: e.target.value
                            })}
                            className="w-full px-4 py-3 pl-10 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red"
                            placeholder="https://meet.google.com/..."
                          />
                          <RiLinksLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    )}

                    {newProcess.type === PROCESS_TYPES.INTERVIEW && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Type*</label>
                        <div className="relative">
                          <select
                            value={newProcess.interviewType}
                            onChange={(e) => setNewProcess({
                              ...newProcess,
                              interviewType: e.target.value
                            })}
                            className="w-full px-4 py-3 pl-10 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red appearance-none"
                          >
                            {Object.entries(INTERVIEW_TYPES).map(([key, value]) => (
                              <option key={value} value={value}>
                                {key}
                              </option>
                            ))}
                          </select>
                          <RiTimeLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {newProcess.type === PROCESS_TYPES.GROUP_DISCUSSION && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                        <input
                          type="text"
                          value={newProcess.topic}
                          onChange={(e) => setNewProcess({
                            ...newProcess,
                            topic: e.target.value
                          })}
                          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red"
                          placeholder="Discussion topic..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingProcess(null);
                      }}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddProcess}
                      className="px-6 py-2.5 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm transition-all duration-200 flex items-center gap-2"
                    >
                      {editingProcess ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Update Round
                        </>
                      ) : (
                        <>
                          <RiAddLine size={20} />
                          Add Round
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {errors?.workflowData && (
            <div className="text-red-500 text-sm mt-2 animate-fadeIn">
              {errors.workflowData}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default HiringProcessForm;