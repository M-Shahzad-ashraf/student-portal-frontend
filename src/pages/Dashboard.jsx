import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../api/dashboard';
import StatsCards from '../components/Dashboard/StatsCards';
import CampusCard from '../components/Dashboard/CampusCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { CAMPUSES } from '../utils/constants';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [campusStats, setCampusStats] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await dashboardAPI.getStats();
      setStats(statsRes.data);
      setCampusStats(statsRes.data.campusStats || {});
    } catch (error) {
      console.error('Dashboard API Error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCampusClick = (campusId) => {
    // ✅ Navigate to Classes page, not Students page directly
    navigate(`/classes/${campusId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <StatsCards stats={stats} />

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="text-lg md:text-xl font-bold text-gray-900">Select Campus</div>
        <button
          onClick={() => navigate('/students?add=true')}
          className="bg-[#185fa5] text-white hover:bg-[#378add] py-2 px-4 rounded-[10px] text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <i className="ti ti-plus"></i> Add Student
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
        {CAMPUSES.map((campus) => (
          <CampusCard
            key={campus.id}
            campus={campus}
            stats={campusStats[campus.id]}
            onClick={() => handleCampusClick(campus.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;