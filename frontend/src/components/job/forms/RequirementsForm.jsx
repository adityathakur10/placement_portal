import React, { useState } from 'react';
import { RiAddLine, RiCloseLine, RiDragMove2Fill, RiLinkM, RiFileTextLine, RiInformationLine } from 'react-icons/ri';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import RichTextEditor from '@/components/ui/RichTextEditor';
import FileUploadSection from './FileUploadSection';
import { Toast } from '@/components/ui/toast';
import { motion, AnimatePresence } from 'framer-motion';

const SortableItem = ({ id, content, onRemove, isRequirement = true }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex items-center gap-3 p-4 rounded-lg group border ${
        isDragging 
          ? 'border-red border-dashed bg-red/5 shadow-lg' 
          : 'border-gray-100 bg-white hover:border-red/30 hover:shadow-md'
      } transition-all duration-200`}
    >
      <button 
        type="button" 
        className={`p-2 ${isDragging ? 'text-red' : 'text-gray-400'} 
          hover:text-red cursor-grab active:cursor-grabbing 
          rounded-full hover:bg-red/5 transition-colors`}
        {...attributes} 
        {...listeners}
      >
        <RiDragMove2Fill size={20} />
      </button>
      <span className={`flex-1 ${isDragging ? 'text-red font-medium' : 'text-gray-700'}`}>
        {content}
      </span>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="p-2 text-gray-400 hover:text-red rounded-full 
          hover:bg-red/5 opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <RiCloseLine size={18} />
      </button>
    </motion.div>
  );
};

const SectionCard = ({ title, required, children, icon }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red/10 text-red rounded-lg">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {required && (
          <span className="text-sm text-red bg-red/5 px-2 py-1 rounded">Required</span>
        )}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const RequirementsForm = ({ formData, setFormData, errors }) => {
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

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

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      const requirements = formData.requirements 
        ? String(formData.requirements).split('\n').filter(Boolean)
        : [];
      setFormData({
        ...formData,
        requirements: [...requirements, newRequirement.trim()].join('\n')
      });
      setNewRequirement('');
    }
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      const responsibilities = formData.responsibilities 
        ? String(formData.responsibilities).split('\n').filter(Boolean)
        : [];
      setFormData({
        ...formData,
        responsibilities: [...responsibilities, newResponsibility.trim()].join('\n')
      });
      setNewResponsibility('');
    }
  };

  const handleRemoveRequirement = (id) => {
    const requirements = formData.requirements.split('\n').filter(Boolean);
    const updatedRequirements = requirements.filter(req => req !== id);
    setFormData({
      ...formData,
      requirements: updatedRequirements.join('\n')
    });
  };

  const handleRemoveResponsibility = (id) => {
    const responsibilities = formData.responsibilities.split('\n').filter(Boolean);
    const updatedResponsibilities = responsibilities.filter(resp => resp !== id);
    setFormData({
      ...formData,
      responsibilities: updatedResponsibilities.join('\n')
    });
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    // Determine which section (requirements or responsibilities) is being dragged
    if (formData.requirements?.split('\n').filter(Boolean).includes(active.id)) {
      setActiveSection('requirements');
    } else {
      setActiveSection('responsibilities');
    }
  };

  const handleDragEndRequirements = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const requirements = formData.requirements.split('\n').filter(Boolean);
      const oldIndex = requirements.findIndex(req => req === active.id);
      const newIndex = requirements.findIndex(req => req === over.id);
      
      const newRequirements = arrayMove(requirements, oldIndex, newIndex);
      setFormData({
        ...formData,
        requirements: newRequirements.join('\n')
      });
    }
  };

  const handleDragEndResponsibilities = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const responsibilities = formData.responsibilities.split('\n').filter(Boolean);
      const oldIndex = responsibilities.findIndex(resp => resp === active.id);
      const newIndex = responsibilities.findIndex(resp => resp === over.id);
      
      const newResponsibilities = arrayMove(responsibilities, oldIndex, newIndex);
      setFormData({
        ...formData,
        responsibilities: newResponsibilities.join('\n')
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      setActiveSection(null);
      return;
    }
    
    if (activeSection === 'requirements') {
      handleDragEndRequirements(event);
    } else {
      handleDragEndResponsibilities(event);
    }
    
    setActiveId(null);
    setActiveSection(null);
  };

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <SectionCard 
        title="Job Description File" 
        required={true}
        icon={<RiFileTextLine size={20} />}
      >
        <FileUploadSection 
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />
      </SectionCard>

      {/* Web Links Section */}
      <SectionCard 
        title="Web Links" 
        required={false}
        icon={<RiLinkM size={20} />}
      >
        <div className="space-y-5">
          {/* Added Links */}
          {formData.webLinks?.length > 0 && (
            <div className="space-y-3">
              {formData.webLinks.map((link, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg group hover:shadow-sm hover:bg-white transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-red/10 rounded-full flex items-center justify-center text-red">
                        <RiLinkM size={20} />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{link.title || 'Untitled Link'}</span>
                        <a 
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red hover:underline text-sm block"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newLinks = formData.webLinks.filter((_, i) => i !== index);
                      setFormData({ ...formData, webLinks: newLinks });
                    }}
                    className="p-2 text-gray-400 hover:text-red rounded-full hover:bg-red/5 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <RiCloseLine size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Company Website"
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red"
                value={newLink?.title || ''}
                onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red"
                  value={newLink?.url || ''}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && newLink?.url && handleAddLink()}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newLink?.url) return;
                    // URL validation
                    try {
                      new URL(newLink.url);
                      setFormData(prev => ({
                        ...prev,
                        webLinks: [...(prev.webLinks || []), newLink]
                      }));
                      setNewLink({ title: '', url: '' });
                    } catch {
                      Toast.error('Please enter a valid URL');
                    }
                  }}
                  className="px-4 py-3 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm hover:shadow transition-all duration-200"
                >
                  <RiAddLine size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Job Description */}
      <SectionCard 
        title="Job Description" 
        required={true}
        icon={<RiInformationLine size={20} />}
      >
        <RichTextEditor
          content={formData.descriptionText}
          onChange={(content) => setFormData({ ...formData, descriptionText: content })}
          error={errors?.descriptionText}
          maxLength={5000}
        />
        {errors?.descriptionText && (
          <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.descriptionText}</p>
        )}
      </SectionCard>

      {/* Requirements Section */}
      <SectionCard 
        title="Requirements" 
        required={true}
        icon={<RiAddLine size={20} />}
      >
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={formData.requirements?.split('\n').filter(Boolean) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 min-h-[100px]">
                <AnimatePresence>
                  {formData.requirements?.split('\n').filter(Boolean).length > 0 ? (
                    formData.requirements?.split('\n').filter(Boolean).map((req) => (
                      <SortableItem
                        key={req}
                        id={req}
                        content={req}
                        onRemove={handleRemoveRequirement}
                        isRequirement={true}
                      />
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg"
                    >
                      <p className="text-gray-500 mb-2">No requirements added yet</p>
                      <p className="text-sm text-gray-400">Drag items to reorder after adding</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SortableContext>
            
            {/* Drag overlay for better visual feedback */}
            <DragOverlay>
              {activeId && activeSection === 'requirements' && (
                <div className="p-4 bg-white border-2 border-red shadow-lg rounded-lg">
                  <div className="flex items-center gap-3">
                    <RiDragMove2Fill size={20} className="text-red" />
                    <span className="font-medium text-red">{activeId}</span>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          <div className="flex gap-3">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Add a requirement (e.g. 3+ years experience with React)"
              className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red"
              onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
            />
            <button
              type="button"
              onClick={handleAddRequirement}
              className="px-4 py-3 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm hover:shadow transition-all duration-200"
            >
              <RiAddLine size={20} />
            </button>
          </div>
          {errors?.requirements && (
            <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.requirements}</p>
          )}
        </div>
      </SectionCard>

      {/* Responsibilities Section */}
      <SectionCard 
        title="Responsibilities" 
        required={true}
        icon={<RiAddLine size={20} />}
      >
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={formData.responsibilities?.split('\n').filter(Boolean) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 min-h-[100px]">
                <AnimatePresence>
                  {formData.responsibilities?.split('\n').filter(Boolean).length > 0 ? (
                    formData.responsibilities?.split('\n').filter(Boolean).map((resp) => (
                      <SortableItem
                        key={resp}
                        id={resp}
                        content={resp}
                        onRemove={handleRemoveResponsibility}
                        isRequirement={false}
                      />
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg"
                    >
                      <p className="text-gray-500 mb-2">No responsibilities added yet</p>
                      <p className="text-sm text-gray-400">Drag items to reorder after adding</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SortableContext>
            
            {/* Drag overlay for better visual feedback */}
            <DragOverlay>
              {activeId && activeSection === 'responsibilities' && (
                <div className="p-4 bg-white border-2 border-red shadow-lg rounded-lg">
                  <div className="flex items-center gap-3">
                    <RiDragMove2Fill size={20} className="text-red" />
                    <span className="font-medium text-red">{activeId}</span>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          <div className="flex gap-3">
            <input
              type="text"
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              placeholder="Add a responsibility (e.g. Lead the development of new features)"
              className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red/20 transition-all duration-200 border-gray-300 focus:border-red"
              onKeyPress={(e) => e.key === 'Enter' && handleAddResponsibility()}
            />
            <button
              type="button"
              onClick={handleAddResponsibility}
              className="px-4 py-3 bg-red text-white rounded-lg hover:bg-red/90 shadow-sm hover:shadow transition-all duration-200"
            >
              <RiAddLine size={20} />
            </button>
          </div>
          {errors?.responsibilities && (
            <p className="mt-2 text-sm text-red-500 animate-fadeIn">{errors.responsibilities}</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default RequirementsForm;