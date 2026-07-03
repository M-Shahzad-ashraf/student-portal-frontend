import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classesAPI } from '../api/classes';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { CAMPUSES } from '../utils/constants';
import toast from 'react-hot-toast';

const Classes = () => {
  const { campusId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const campus = CAMPUSES.find(c => c.id === campusId);

  // Color schemes for different campuses
  const getCardColor = (index) => {
    if (campusId === 'boys') {
      return 'from-[#0c447c] to-[#185fa5]';
    } else if (campusId === 'girls') {
      return 'from-[#72243e] to-[#993556]';
    } else {
      return 'from-[#633806] to-[#854f0b]';
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [campusId]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await classesAPI.getAll(campusId);
      setClasses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast.error('Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classId) => {
    navigate(`/sections/${campusId}/${classId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Campus Header */}
      <div className={`bg-gradient-to-br ${getCardColor(0)} rounded-2xl p-6 mb-6 text-white`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{campus?.icon}</span>
          <div>
            <h1 className="text-2xl font-bold font-amiri">{campus?.label}</h1>
            <p className="text-sm opacity-80 mt-1">{classes.length} Classes</p>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Classes</h2>
        <button
          onClick={() => navigate('/students?add=true')}
          className="bg-[#185fa5] text-white hover:bg-[#378add] py-2 px-4 rounded-[10px] text-sm font-semibold"
        >
          <i className="ti ti-plus"></i> Add Student
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#c5d8ef] p-8 text-center text-gray-500">
          No classes found in {campus?.label}. Please add classes first.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classes.map((cls, index) => (
            <div
              key={cls.id}
              onClick={() => handleClassClick(cls.id)}
              className={`bg-gradient-to-br ${getCardColor(index)} rounded-xl p-5 text-white cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="text-3xl font-bold mb-2">{cls.name}</div>
              <div className="text-sm opacity-80">{cls.sections?.length || 0} Sections</div>
              <div className="mt-3 text-xs opacity-60">
                {cls.sections?.join(', ') || 'No sections'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classes;