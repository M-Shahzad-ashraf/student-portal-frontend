import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../api/settings';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const DEFAULT_SETTINGS = {
  schoolName: 'Muslim Model High School Pattoki',
  schoolAddress: 'Pattoki City, Kasur, Punjab',
  schoolPhone: '049-4412345',
  bankDetails: 'Allied Bank Ltd, Pattoki (Branch Code: 0292) A/C No: 0110-38491029-01',
  defaultFee: 2000,
  lateFee: 200,
  dueDateDay: 10,
};

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [adminCredentials, setAdminCredentials] = useState({
    username: 'admin',
    password: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.getAll();
      const payload = response.data?.data;

      if (payload?.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...payload.settings });
      }
      if (payload?.admin) {
        setAdminCredentials({
          username: payload.admin.username || 'admin',
          password: '',
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value, 10) || 0 : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleAdminChange = (e) => {
    setAdminCredentials({ ...adminCredentials, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const adminPayload = { username: adminCredentials.username };
      if (adminCredentials.password.trim()) {
        adminPayload.password = adminCredentials.password.trim();
      }

      await settingsAPI.update({ settings, admin: adminPayload });
      toast.success('Settings saved successfully');
      setAdminCredentials((prev) => ({ ...prev, password: '' }));
      fetchSettings();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="text-lg md:text-xl font-bold text-gray-900 mb-2">System Settings</div>
      <p className="text-xs text-[#4a5568] mb-4">
        Manage school information, fee defaults, and administrator credentials.
      </p>

      <div className="grid grid-cols-1 gap-5 font-cairo">
        {/* School Information */}
        <div className="bg-white rounded-[10px] border border-[#c5d8ef] p-5 shadow-sm">
          <h3 className="font-bold text-sm md:text-base border-b border-[#c5d8ef] pb-2 mb-4 text-[#185fa5]">
            <i className="ti ti-building"></i> School Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-[#4a5568] uppercase">School Name</label>
              <input
                type="text"
                name="schoolName"
                value={settings.schoolName}
                onChange={handleSettingChange}
                className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff]"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-[#4a5568] uppercase">Address</label>
              <input
                type="text"
                name="schoolAddress"
                value={settings.schoolAddress}
                onChange={handleSettingChange}
                className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4a5568] uppercase">Phone</label>
              <input
                type="text"
                name="schoolPhone"
                value={settings.schoolPhone}
                onChange={handleSettingChange}
                className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff]"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-[#4a5568] uppercase">Bank Details</label>
              <textarea
                name="bankDetails"
                value={settings.bankDetails}
                onChange={handleSettingChange}
                rows={2}
                className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Fee Defaults */}
        <div className="bg-white rounded-[10px] border border-[#c5d8ef] p-5 shadow-sm">
          <h3 className="font-bold text-sm md:text-base border-b border-[#c5d8ef] pb-2 mb-4 text-[#185fa5]">
            <i className="ti ti-cash"></i> Fee Defaults
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4a5568] uppercase">Default Monthly Fee (Rs.)</label>
              <input
                type="number"
                name="defaultFee"
                value={settings.defaultFee}
                onChange={handleSettingChange}
                min="0"
                className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4a5568] uppercase">Late Fee (Rs.)</label>
              <input
                type="number"
                name="lateFee"
                value={settings.lateFee}
                onChange={handleSettingChange}
                min="0"
                className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4a5568] uppercase">Due Date (Day of Month)</label>
              <input
                type="number"
                name="dueDateDay"
                value={settings.dueDateDay}
                onChange={handleSettingChange}
                min="1"
                max="28"
                className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff]"
              />
            </div>
          </div>
        </div>

        {/* Admin Authentication */}
        <div className="bg-white rounded-[10px] border border-[#c5d8ef] p-5 shadow-sm">
          <h3 className="font-bold text-sm md:text-base border-b border-[#c5d8ef] pb-2 mb-4 text-[#a32d2d]">
            <i className="ti ti-lock"></i> Admin Credentials
          </h3>
          <p className="text-xs text-[#4a5568] mb-3">
            Default login: <strong>admin</strong> / <strong>admin123</strong>. Leave password blank to keep current password.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4a5568] uppercase">Admin Username</label>
              <input
                type="text"
                name="username"
                value={adminCredentials.username}
                onChange={handleAdminChange}
                className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4a5568] uppercase">New Password</label>
              <input
                type="password"
                name="password"
                value={adminCredentials.password}
                onChange={handleAdminChange}
                placeholder="Leave blank to keep current"
                className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-[#185fa5] text-white hover:bg-[#378add] py-2.5 px-6 rounded-[10px] text-xs md:text-sm font-bold shadow-sm cursor-pointer disabled:opacity-50"
        >
          <i className="ti ti-check"></i> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
