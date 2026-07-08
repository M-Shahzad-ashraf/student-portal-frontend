import { useState, useEffect } from 'react';
import { studentsAPI } from '../../api/students';
import { classesAPI } from '../../api/classes';
import { CAMPUSES, BLOOD_GROUPS, FEE_MONTHS } from '../../utils/constants';
import { getDefaultFeeStartMonth, resolveStudentFeeStartMonth } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StudentForm = ({ student, defaultCampus, onSuccess, onCancel }) => {
  const isEditing = !!student;
  const [loading, setLoading] = useState(false);
  const [classesList, setClassesList] = useState([]);  // ✅ Renamed to avoid confusion
  const [sections, setSections] = useState([]);
  
  const [formData, setFormData] = useState({
    id: student?.id || '',
    name: student?.name || '',
    fatherName: student?.fatherName || '',
    fatherPhone: student?.fatherPhone || '',
    campusId: student?.campusId || defaultCampus || 'boys',
    classId: student?.classId || '',
    className: student?.className || '',
    section: student?.section || '',
    gender: student?.gender || 'M',
    dob: student?.dob ? student.dob.split('T')[0] : '',
    bloodGroup: student?.bloodGroup || 'A+',
    monthlyFee: student?.monthlyFee || 2000,
    feeStartMonth: student ? resolveStudentFeeStartMonth(student) : getDefaultFeeStartMonth(),
    bForm: student?.bForm || '',
    email: student?.email || '',
    address: student?.address || '',
    notes: student?.notes || ''
  });

  // Load classes when campus changes
  useEffect(() => {
    if (formData.campusId) {
      loadClasses();
    } else {
      setClassesList([]);
    }
  }, [formData.campusId]);

  // Load sections when class changes
  useEffect(() => {
    if (formData.classId) {
      loadSections();
    } else {
      setSections([]);
    }
  }, [formData.classId]);

  const loadClasses = async () => {
    try {
      const response = await classesAPI.getAll(formData.campusId);
      setClassesList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load classes:', error);
      setClassesList([]);
    }
  };

  const loadSections = async () => {
    try {
      const response = await classesAPI.getById(formData.classId);
      setSections(response.data?.sections || []);
    } catch (error) {
      console.error('Failed to load sections:', error);
      setSections([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'campusId') {
      setFormData({
        ...formData,
        campusId: value,
        classId: '',
        className: '',
        section: ''
      });
    } else if (name === 'classId') {
      const selectedClass = classesList.find(c => c.id === value);
      setFormData({
        ...formData,
        classId: value,
        className: selectedClass ? selectedClass.name : '',
        section: ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.fatherName || !formData.classId || !formData.section) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      let response;
      if (isEditing) {
        await studentsAPI.update(student.id, formData);
        toast.success('Student updated successfully');
        // For edit, we can simply refetch to get latest data
        onSuccess();
      } else {
        response = await studentsAPI.create(formData);
        toast.success('Student added successfully');
        // Pass the newly created student back to the parent
        onSuccess(response?.data?.data || response?.data);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || (isEditing ? 'Update failed' : 'Add failed'));
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSections = () => {
    let list = [...sections];
    if (list.length === 0) {
      list = ['A'];
    }
    if (formData.section && !list.includes(formData.section)) {
      list.push(formData.section);
    }
    return list;
  };
  const availableSections = getAvailableSections();

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Student ID {isEditing ? '*' : '(Auto)'}</label>
        <input 
          type="text" 
          name="id" 
          value={formData.id} 
          onChange={handleChange} 
          required={isEditing}
          disabled={isEditing}
          placeholder="Leave blank for auto ID" 
          className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
        />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Full Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Father Name *</label>
        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Father Phone</label>
        <input type="tel" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Campus *</label>
        <select name="campusId" value={formData.campusId} onChange={handleChange} required className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm">
          {CAMPUSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Class *</label>
        <select name="classId" value={formData.classId} onChange={handleChange} required className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm">
          <option value="">Select Class</option>
          {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Section *</label>
        <select name="section" value={formData.section} onChange={handleChange} required className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm">
          <option value="">Select Section</option>
          {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm">
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Date of Birth</label>
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Blood Group</label>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm">
          {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Monthly Fee (Rs)</label>
        <input type="number" name="monthlyFee" value={formData.monthlyFee} onChange={handleChange} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Fee Start Month *</label>
        <select
          name="feeStartMonth"
          value={formData.feeStartMonth}
          onChange={handleChange}
          required
          className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm"
        >
          {FEE_MONTHS.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <p className="text-[10px] text-[#4a5568]">
          Fee will be charged from this month onward. Cannot be before the academic session start (March).
        </p>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">B-Form / CNIC</label>
        <input type="text" name="bForm" value={formData.bForm} onChange={handleChange} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>
      
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Address</label>
        <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm"></textarea>
      </div>
      
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className="text-[10px] font-bold text-[#4a5568] uppercase">Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm"></textarea>
      </div>
      
      <div className="md:col-span-2 flex gap-2 justify-end mt-2">
        <button type="button" onClick={onCancel} className="py-2 px-4 rounded-lg text-sm font-semibold bg-white text-[#185fa5] border border-[#185fa5]">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="py-2 px-4 rounded-lg text-sm font-semibold bg-[#185fa5] text-white disabled:opacity-50">
          {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
