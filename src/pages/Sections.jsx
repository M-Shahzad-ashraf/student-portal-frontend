import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classesAPI } from '../api/classes';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { CAMPUSES } from '../utils/constants';
import toast from 'react-hot-toast';

const Sections = () => {
  const { campusId, classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [sections, setSections] = useState([]);

  const campus = CAMPUSES.find(c => c.id === campusId);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const response = await classesAPI.getById(classId);
      setClassData(response.data);
      setSections(response.data?.sections || []);
    } catch (error) {
      console.error('Failed to load class data:', error);
      toast.error('Failed to load sections');
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section) => {
    navigate(`/students?campusId=${campusId}&classId=${classId}&section=${section}`);
  };

  if (loading) return <LoadingSpinner />;

  // Section color schemes
  const sectionColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500'
  ];

  return (
    <div>
      {/* Breadcrumb / Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-[#4a5568]">
          <span
            className="cursor-pointer text-[#185fa5] hover:underline"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </span>
          <span>/</span>
          <span
            className="cursor-pointer text-[#185fa5] hover:underline"
            onClick={() => navigate(`/classes/${campusId}`)}
          >
            {campus?.label}
          </span>
          <span>/</span>
          <span className="font-semibold text-gray-800">{classData?.name}</span>
        </div>
      </div>

      {/* Class Header */}
      <div className="bg-gradient-to-r from-[#185fa5] to-[#0c447c] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-amiri">{classData?.name}</h1>
            <p className="text-sm opacity-80 mt-1">{sections.length} Sections</p>
          </div>
          <button
            onClick={() => navigate('/students?add=true')}
            className="bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg text-sm font-semibold transition-all"
          >
            <i className="ti ti-plus"></i> Add Student
          </button>
        </div>
      </div>

      {/* Sections Grid */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Select Section</h2>

      {sections.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#c5d8ef] p-8 text-center text-gray-500">
          No sections found in {classData?.name}. Please add sections first.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sections.map((section, index) => (
            <div
              key={section}
              onClick={() => handleSectionClick(section)}
              className={`${sectionColors[index % sectionColors.length]} rounded-xl p-6 text-white cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl text-center`}
            >
              <div className="text-4xl font-bold mb-2">{section}</div>
              <div className="text-sm opacity-80">Section {section}</div>
              <div className="mt-3 text-xs opacity-60">Click to view students</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sections;