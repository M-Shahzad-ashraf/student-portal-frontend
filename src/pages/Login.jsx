import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // ← Ye sahi hai
import { IoLogIn, IoPersonAdd } from 'react-icons/io5';
import img from '../assets/image.png';

const Login = () => {
  const navigate = useNavigate();
  const { adminLogin, studentLogin, studentSignup } = useAuth();

  const [activeTab, setActiveTab] = useState('admin');
  const [error, setError] = useState('');

  // Admin Login State
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPass, setAdminPass] = useState('admin123');

  // Student Login State
  const [studentId, setStudentId] = useState('');
  const [studentPass, setStudentPass] = useState('');

  // Signup State
  const [signupId, setSignupId] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupPass2, setSignupPass2] = useState('');

  const handleAdminLogin = async () => {
    const result = await adminLogin(adminUser, adminPass);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleStudentLogin = async () => {
    const result = await studentLogin(studentId, studentPass);
    if (result.success) {
      navigate('/portal');
    } else {
      setError(result.error);
    }
  };

  const handleSignup = async () => {
    const result = await studentSignup(signupId, signupName, signupPass, signupPass2);
    if (result.success) {
      navigate('/portal');
    } else {
      setError(result.error);
    }
  };

  const tabs = [
    { id: 'admin', label: 'Admin Login' },
    // { id: 'student', label: 'Student Login' },
    // { id: 'signup', label: 'Student Sign Up' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#042c53] via-[#0c447c] to-[#185fa5] p-4">
      <div className="bg-white rounded-[18px] w-full max-w-[450px] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-[#042c53] to-[#185fa5] text-white pt-8 pb-6 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/15 mx-auto mb-3 flex items-center justify-center text-3xl border-2 border-white/35">
            <img src={img} className="w-full h-full object-contain rounded-full" alt="" />
          </div>
          <h1 className="font-amiri text-xl font-bold">
            Muslim Model High School Pattoki
          </h1>
          <p className="text-xs opacity-75 mt-1">
            Student & Fee Management System
          </p>
        </div>

        <div className="p-6">
          <div className="flex gap-1 bg-[#f0f4f9] rounded-lg p-1 mb-[22px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                }}
                className={`flex-1 py-2 px-1 rounded-md text-xs md:text-sm font-semibold transition-all duration-150 ${activeTab === tab.id
                  ? 'bg-white text-[#185fa5] shadow-sm'
                  : 'hover:text-[#185fa5] text-[#4a5568]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-[#fcebeb] text-[#a32d2d] rounded-lg py-2 px-3.5 text-sm mb-3">
              {error}
            </div>
          )}

          {/* Admin Login Tab */}
          {activeTab === 'admin' && (
            <div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#4a5568] uppercase tracking-wider block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full py-2 px-3.5 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none transition-colors duration-200"
                  placeholder="admin"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#4a5568] uppercase tracking-wider block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  // value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full py-2 px-3.5 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none transition-colors duration-200"
                  placeholder="••••••"
                />
              </div>
              <button
                onClick={handleAdminLogin}
                className="w-full py-3 bg-[#185fa5] text-white rounded-lg font-bold text-sm md:text-base hover:bg-[#378add] transition-colors duration-150 mt-1.5 flex items-center justify-center gap-2"
              >
                <IoLogIn size={18} /> Login as Admin
              </button>
              <hr />
              <a href="https://wa.me/923434013800" >
                <p className="text-center text-xs text-[#0653da] mt-3">
                  Designed and developed by Shahzad Ashraf.


                </p>
              </a>
            </div>
          )}

          {/* Student Login Tab */}
          {activeTab === 'student' && (
            <div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#4a5568] uppercase tracking-wider block mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full py-2 px-3.5 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none transition-colors duration-200"
                  placeholder="e.g. S1001"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#4a5568] uppercase tracking-wider block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={studentPass}
                  onChange={(e) => setStudentPass(e.target.value)}
                  className="w-full py-2 px-3.5 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none transition-colors duration-200"
                  placeholder="Your password"
                />
              </div>
              <button
                onClick={handleStudentLogin}
                className="w-full py-3 bg-[#185fa5] text-white rounded-lg font-bold text-sm md:text-base hover:bg-[#378add] transition-colors duration-150 mt-1.5 flex items-center justify-center gap-2"
              >
                <IoLogIn size={18} /> Login as Student
              </button>
              <div className="text-center text-xs md:text-sm text-[#4a5568] mt-4">
                Don't have an account?
                <span
                  onClick={() => setActiveTab('signup')}
                  className="text-[#185fa5] cursor-pointer font-semibold hover:underline ml-1"
                >
                  Sign Up
                </span>
              </div>
            </div>
          )}

          {/* Signup Tab */}
          {activeTab === 'signup' && (
            <div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#4a5568] uppercase tracking-wider block mb-1">
                  Student ID (from school record)
                </label>
                <input
                  type="text"
                  value={signupId}
                  onChange={(e) => setSignupId(e.target.value)}
                  className="w-full py-2 px-3.5 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none transition-colors duration-200"
                  placeholder="e.g. S1001"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#4a5568] uppercase tracking-wider block mb-1">
                  Your Full Name (must match record)
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full py-2 px-3.5 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none transition-colors duration-200"
                  placeholder="Full name as in school record"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#4a5568] uppercase tracking-wider block mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                  className="w-full py-2 px-3.5 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none transition-colors duration-200"
                  placeholder="Choose a password"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#4a5568] uppercase tracking-wider block mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={signupPass2}
                  onChange={(e) => setSignupPass2(e.target.value)}
                  className="w-full py-2 px-3.5 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none transition-colors duration-200"
                  placeholder="Repeat password"
                />
              </div>
              <button
                onClick={handleSignup}
                className="w-full py-3 bg-[#185fa5] text-white rounded-lg font-bold text-sm md:text-base hover:bg-[#378add] transition-colors duration-150 mt-1.5 flex items-center justify-center gap-2"
              >
                <IoPersonAdd size={18} /> Create Account
              </button>
              <div className="text-center text-xs md:text-sm text-[#4a5568] mt-4">
                Already have an account?
                <span
                  onClick={() => setActiveTab('student')}
                  className="text-[#185fa5] cursor-pointer font-semibold hover:underline ml-1"
                >
                  Login
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;