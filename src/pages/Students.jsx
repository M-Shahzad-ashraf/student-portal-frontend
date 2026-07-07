import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { studentsAPI } from '../api/students';
import SearchBar from '../components/Common/SearchBar';
import Pagination from '../components/Common/Pagination';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import StudentTable from '../components/Students/StudentTable';
import StudentForm from '../components/Students/StudentForm';
import { PAGE_SIZE, CAMPUSES } from '../utils/constants';
import { downloadTemplate } from '../utils/exportUtils';
import toast from 'react-hot-toast';

const Students = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState('all');
  const [total, setTotal] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef(null);

  // Get filters from URL params - support both naming conventions
  const campusFilter = searchParams.get('campusId') || searchParams.get('campus');
  const classFilter = searchParams.get('classId') || searchParams.get('class');
  const sectionFilter = searchParams.get('section');
  const addParam = searchParams.get('add');

  // Get campus label for display
  const selectedCampus = CAMPUSES.find(c => c.id === campusFilter);
  const pageTitle = selectedCampus
    ? `${selectedCampus.label} - ${classFilter ? classFilter : ''} ${sectionFilter ? 'Section ' + sectionFilter : ''} Students`.trim()
    : 'All Students';

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (addParam === 'true') {
      setShowAddModal(true);
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
    fetchStudents();
  }, [search, currentPage, campusFilter, classFilter, sectionFilter]);

  const fetchStudents = async () => {
    setRefreshing(true);
    try {
      const params = {
        search: search || undefined,
        page: currentPage !== 'all' ? currentPage : 1,
        limit: PAGE_SIZE,
        campusId: campusFilter || undefined,
        classId: classFilter || undefined,
        section: sectionFilter || undefined,
      };

      const response = await studentsAPI.getAll(params);
      setStudents(response.data?.data || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load students');
      setStudents([]);
      setTotal(0);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const params = {
        format,
        campus: campusFilter || undefined
      };
      const response = await studentsAPI.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_${campusFilter || 'all'}.${format === 'xlsx' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await studentsAPI.import(file);
      const { success, message, data } = response.data;

      if (success) {
        const created = data?.created || 0;
        const skipped = data?.skipped || 0;
        const errors = data?.errors || [];

        if (created > 0) {
          if (skipped > 0) {
            toast.success(`Imported ${created} students. ${skipped} rows skipped.`);
            console.warn('Import errors:', errors);
          } else {
            toast.success(`Successfully imported ${created} students.`);
          }
          fetchStudents();
        } else {
          toast.error('Import failed: All rows were skipped.');
          if (errors.length > 0) {
            alert(`Import details:\n${errors.slice(0, 20).join('\n')}${errors.length > 20 ? `\n...and ${errors.length - 20} more` : ''}`);
          }
        }
      } else {
        toast.error(message || 'Import failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadTemplate();
      toast.success('Template downloaded');
    } catch (error) {
      console.error('Template download failed:', error);
      toast.error('Template download failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student permanently?')) return;
    try {
      await studentsAPI.delete(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleClearFilter = () => {
    setSearchParams({});
    setSearchInput('');
    setSearch('');
    setCurrentPage('all');
  };

  if (initialLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="text-lg md:text-xl font-bold text-gray-900">
            {pageTitle} ({total})
          </div>
          {campusFilter && (
            <button
              onClick={handleClearFilter}
              className="text-xs text-[#185fa5] hover:underline flex items-center gap-1"
            >
              <i className="ti ti-x"></i> Clear Filter
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#185fa5] text-white hover:bg-[#378add] py-2 px-4 rounded-[10px] text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <i className="ti ti-plus"></i> Add Student
        </button>
      </div>

      {/* Campus Filter Indicator */}
      {campusFilter && selectedCampus && (
        <div className="mb-4 p-3 bg-[#e6f1fb] rounded-lg border border-[#c5d8ef] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedCampus.icon}</span>
            <span className="text-sm font-semibold text-gray-700">
              Showing students from: <span className="text-[#185fa5]">{selectedCampus.label}</span>
            </span>
          </div>
          <button
            onClick={handleClearFilter}
            className="text-xs text-[#185fa5] hover:underline"
          >
            Show All Students
          </button>
        </div>
      )}

      <div className="bg-white rounded-[10px] border border-[#c5d8ef] overflow-hidden shadow-sm">
        <div className="p-3.5 flex items-center gap-3 border-b border-[#c5d8ef] flex-wrap justify-between">
          <div className="flex gap-2 items-center flex-wrap flex-1">
            <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Search by name, ID, roll no..." />
            <span className="text-xs md:text-sm text-[#4a5568]">{students.length} students</span>
          </div>
          <div className="flex gap-1.5 items-center flex-wrap">
            <button onClick={() => handleExport('xlsx')} className="py-1 px-2.5 rounded-lg text-xs font-semibold border border-[#185fa5] bg-white text-[#185fa5] hover:bg-[#e6f1fb] inline-flex items-center gap-1">
              <i className="ti ti-file-spreadsheet"></i> Export Excel
            </button>
            <button onClick={() => handleExport('csv')} className="py-1 px-2.5 rounded-lg text-xs font-semibold border border-[#185fa5] bg-white text-[#185fa5] hover:bg-[#e6f1fb] inline-flex items-center gap-1">
              <i className="ti ti-file-text"></i> Export CSV
            </button>
            <label className="py-1 px-2.5 rounded-lg text-xs font-semibold border border-[#185fa5] bg-white text-[#185fa5] hover:bg-[#e6f1fb] inline-flex items-center gap-1 cursor-pointer">
              <i className="ti ti-file-upload"></i> Import
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleImport}
              />
            </label>
            <button onClick={handleDownloadTemplate} className="py-1 px-2.5 rounded-lg text-xs font-semibold border border-[#185fa5] bg-white text-[#185fa5] hover:bg-[#e6f1fb] inline-flex items-center gap-1">
              <i className="ti ti-download"></i> Template
            </button>
          </div>
        </div>

        <div className="relative">
          {refreshing && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-[#185fa5] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={currentPage} onPageChange={setCurrentPage} />

          <StudentTable
            students={students || []}
            onEdit={(student) => {
              setSelectedStudent(student);
              setShowEditModal(true);
            }}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student">
        <StudentForm
          defaultCampus={campusFilter}
          onSuccess={(newStudent) => {
            setShowAddModal(false);
            if (newStudent) {
              setStudents((prev) => [newStudent, ...prev]);
            } else {
              fetchStudents();
            }
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Student">
        <StudentForm
          student={selectedStudent}
          onSuccess={() => {
            setShowEditModal(false);
            fetchStudents();
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Students;