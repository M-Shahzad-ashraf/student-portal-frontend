import React, { useState, useEffect } from 'react';
import { classesAPI } from '../api/classes';
import Modal from '../components/Common/Modal';  // ✅ Import Modal once
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { CAMPUSES } from '../utils/constants';
import toast from 'react-hot-toast';

const ClassManagement = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState({ boys: [], girls: [], kids: [] });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionData, setSectionData] = useState({ campusId: '', classId: '', section: '' });

  useEffect(() => {
    fetchAllClasses();
  }, []);

  const fetchAllClasses = async () => {
    setLoading(true);
    try {
      const response = await classesAPI.getAll();
      const grouped = response.data || {};

      setClasses({
        boys: Array.isArray(grouped.boys) ? grouped.boys : [],
        girls: Array.isArray(grouped.girls) ? grouped.girls : [],
        kids: Array.isArray(grouped.kids) ? grouped.kids : [],
      });
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast.error('Failed to load classes');
      setClasses({ boys: [], girls: [], kids: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesByCampus = async (campusId) => {
    try {
      const response = await classesAPI.getAll(campusId);
      const campusClasses = Array.isArray(response.data) ? response.data : [];

      setClasses(prev => ({ ...prev, [campusId]: campusClasses }));
    } catch (error) {
      console.error(`Failed to load ${campusId} classes:`, error);
    }
  };

  const handleCreateClass = async (data) => {
    try {
      await classesAPI.create(data);
      toast.success('Class created successfully');
      await fetchClassesByCampus(data.campusId);
      setShowAddModal(false);
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleUpdateClass = async (id, data) => {
    try {
      await classesAPI.update(id, data);
      toast.success('Class updated successfully');
      await fetchAllClasses();
      setShowAddModal(false);
      setEditingClass(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update class');
    }
  };

  const handleDeleteClass = async (campusId, classId, className) => {
    if (!confirm(`Delete class "${className}" permanently?`)) return;
    try {
      await classesAPI.delete(classId);
      toast.success('Class deleted successfully');
      await fetchClassesByCampus(campusId);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleAddSection = async () => {
    if (!sectionData.section.trim()) {
      toast.error('Please enter section name');
      return;
    }
    try {
      await classesAPI.addSection(sectionData.classId, sectionData.section);
      toast.success('Section added successfully');
      setShowSectionModal(false);
      setSectionData({ campusId: '', classId: '', section: '' });
      await fetchAllClasses();
    } catch (error) {
      console.error('Add section error:', error);
      toast.error(error.response?.data?.message || 'Failed to add section');
    }
  };

  const handleRemoveSection = async (campusId, classId, section, className) => {
    if (!confirm(`Remove Section ${section} from ${className}?`)) return;
    try {
      await classesAPI.removeSection(classId, section);
      toast.success('Section removed successfully');
      await fetchClassesByCampus(campusId);
    } catch (error) {
      console.error('Remove section error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove section');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="text-lg md:text-xl font-bold text-gray-900">Manage Classes &amp; Sections</div>
      </div>

      {CAMPUSES.map((campus) => {
        const campusClasses = Array.isArray(classes[campus.id]) ? classes[campus.id] : [];

        return (
          <div key={campus.id} className="mb-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-base font-bold text-gray-800">{campus.icon} {campus.label}</h3>
              <button
                onClick={() => {
                  setSelectedCampus(campus.id);
                  setShowAddModal(true);
                }}
                className="py-1 px-2.5 rounded-lg text-xs font-semibold border border-[#185fa5] bg-white text-[#185fa5] hover:bg-[#e6f1fb] inline-flex items-center gap-1 transition-all cursor-pointer"
              >
                <i className="ti ti-plus"></i> Add Class
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {campusClasses.length === 0 ? (
                <div className="text-[#4a5568] text-sm py-4 col-span-full text-center bg-gray-50 rounded-lg">
                  No classes yet. Click "Add Class" to create one.
                </div>
              ) : (
                campusClasses.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-lg border border-[#c5d8ef] overflow-hidden shadow-sm">
                    <div className="p-3 px-4 flex items-center justify-between border-b border-[#c5d8ef]">
                      <span className="font-bold text-gray-800">{cls.name}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditingClass(cls);
                            setSelectedCampus(campus.id);
                            setShowAddModal(true);
                          }}
                          className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#faeeda] text-[#ba7517] hover:bg-[#f3dfbe] inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <i className="ti ti-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClass(campus.id, cls.id, cls.name)}
                          className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#fcebeb] text-[#a32d2d] hover:bg-red-100 inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="p-3 px-4">
                      <div className="text-[11px] text-[#4a5568] mb-1.5">Sections:</div>
                      <div className="flex flex-wrap gap-1">
                        {cls.sections && cls.sections.length > 0 ? (
                          cls.sections.map((section) => (
                            <span key={section} className="inline-flex items-center gap-1.5 bg-[#f0f5fb] border border-[#c5d8ef] rounded-full py-1 px-3 text-xs font-semibold text-[#185fa5]">
                              {section}
                              <span
                                onClick={() => handleRemoveSection(campus.id, cls.id, section, cls.name)}
                                className="cursor-pointer text-[#a32d2d] hover:text-red-700 font-bold"
                                title="Remove section"
                              >
                                ×
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No sections</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSectionData({ campusId: campus.id, classId: cls.id, section: '' });
                          setShowSectionModal(true);
                        }}
                        className="py-1 px-3 rounded-lg text-xs font-semibold bg-[#f0f5fb] text-[#185fa5] hover:bg-[#e6f1fb] inline-flex items-center justify-center gap-1 transition-all w-full mt-3 cursor-pointer"
                      >
                        <i className="ti ti-plus"></i> Add Section
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* Add/Edit Class Modal - Using imported Modal */}
      <ClassModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingClass(null);
          setSelectedCampus(null);
        }}
        campusId={selectedCampus}
        classData={editingClass}
        onSave={editingClass ? handleUpdateClass : handleCreateClass}
      />

      {/* Add Section Modal - Using imported Modal */}
      <Modal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        title="Add New Section"
      >
        <div className="grid grid-cols-1 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Section Name</label>
            <input
              type="text"
              value={sectionData.section}
              onChange={(e) => setSectionData({ ...sectionData, section: e.target.value.toUpperCase() })}
              placeholder="e.g., D or E"
              className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={() => setShowSectionModal(false)} className="py-2 px-4 rounded-[10px] text-sm font-semibold bg-white text-[#185fa5] border border-[#185fa5]">
            Cancel
          </button>
          <button onClick={handleAddSection} className="py-2 px-4 rounded-[10px] text-sm font-semibold bg-[#185fa5] text-white">
            Add Section
          </button>
        </div>
      </Modal>
    </div>
  );
};

// Class Modal Component - Different name, not "Modal"
const ClassModal = ({ isOpen, onClose, campusId, classData, onSave }) => {
  const isEditing = !!classData;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: classData?.name || '',
    sections: classData?.sections?.join(', ') || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sections) {
      toast.error('Please fill class name and sections');
      return;
    }
    const sections = formData.sections.split(',').map(s => s.trim()).filter(Boolean);
    if (sections.length === 0) {
      toast.error('Please add at least one section');
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        await onSave(classData.id, { name: formData.name, sections });
      } else {
        await onSave({ campusId, name: formData.name, sections });
      }
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Class' : 'Add New Class'}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Class Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Class 6, Nursery, Prep"
              required
              className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Sections (comma-separated) *</label>
            <input
              type="text"
              name="sections"
              value={formData.sections}
              onChange={handleChange}
              placeholder="A, B, C"
              required
              className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm"
            />
            <p className="text-[10px] text-[#4a5568]">Example: A, B, C (will create sections A, B, and C)</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-[10px] text-sm font-semibold bg-white text-[#185fa5] border border-[#185fa5]">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="py-2 px-4 rounded-[10px] text-sm font-semibold bg-[#185fa5] text-white disabled:opacity-50">
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add Class')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassManagement;