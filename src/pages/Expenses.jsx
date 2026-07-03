import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../api/expenses';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { formatCurrency, getLocalDateString } from '../utils/helpers';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);  // ✅ Initialize as empty array
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expensesAPI.getAll();
      // ✅ Safely set expenses array
      setExpenses(response.data?.expenses || []);
      setTotalExpenses(response.data?.total || 0);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      toast.error('Failed to load expenses');
      setExpenses([]);  // ✅ Set empty array on error
      setTotalExpenses(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await expensesAPI.delete(id);
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  // ✅ Safe check for expenses length
  const expensesCount = Array.isArray(expenses) ? expenses.length : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Operational Expenditure Ledger</h2>
          <p className="text-xs text-[#4a5568] mt-0.5">Manage school outlays, utility receipts, and staff payrolls.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#185fa5] text-white hover:bg-[#378add] py-2 px-4 rounded-[10px] text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <i className="ti ti-plus"></i> Add Expenditure
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg border border-[#c5d8ef] p-5 mb-5 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Operational Debits</span>
          <div className="text-2xl md:text-3xl font-extrabold text-red-600">{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="flex gap-3 text-xs text-[#4a5568]">
          <span className="bg-[#f0f5fb] border border-[#c5d8ef] rounded-full px-3 py-1.5 font-semibold">
            Categories: Salaries, Utilities, Rent, Stationery, Misc
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-[10px] border border-[#c5d8ef] overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-xs md:text-sm min-w-[600px]">
            <thead className="bg-[#f0f5fb] text-[#4a5568] text-[11px] font-bold uppercase tracking-wider text-left border-b border-[#c5d8ef]">
              <tr>
                <th className="py-3 px-3.5">Reference ID</th>
                <th className="py-3 px-3.5">Posting Date</th>
                <th className="py-3 px-3.5">Voucher Category</th>
                <th className="py-3 px-3.5">Debit Explanation</th>
                <th className="py-3 px-3.5 text-right">Debit Outflow (Rs)</th>
                <th className="py-3 px-3.5 text-center">Control</th>
              </tr>
            </thead>
            <tbody>
              {expensesCount === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-400">Zero debit ledger accounts registered.</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-[#f8fbff]">
                    <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle font-mono font-bold text-gray-700">{expense.id}</td>
                    <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">{expense.date}</td>
                    <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">
                      <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-red-200">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle font-medium text-gray-800">{expense.description}</td>
                    <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle text-right font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                    <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle text-center">
                      <button
                        onClick={() => {
                          setEditingExpense(expense);
                          setShowAddModal(true);
                        }}
                        className="p-1 text-[#ba7517] hover:text-[#854f0b] hover:bg-yellow-50 rounded mr-1"
                        title="Edit"
                      >
                        <i className="ti ti-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      <ExpenseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingExpense(null);
        }}
        expense={editingExpense}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingExpense(null);
          fetchExpenses();
        }}
      />
    </div>
  );
};

// Expense Modal Component
const ExpenseModal = ({ isOpen, onClose, expense, onSuccess }) => {
  const isEditing = !!expense;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: expense?.date || getLocalDateString(),
    category: expense?.category || 'Salaries',
    amount: expense?.amount || '',
    description: expense?.description || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0 || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        await expensesAPI.update(expense.id, formData);
        toast.success('Expense updated successfully');
      } else {
        await expensesAPI.create(formData);
        toast.success('Expense added successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(isEditing ? 'Update failed' : 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Expenditure' : 'Log Debit Account Outflow'}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Debit Posting Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Voucher Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none w-full"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Net Outflow Amount (Rs) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="e.g., 5000"
              className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Reference ID</label>
            <input
              type="text"
              value={expense?.id || `EXP${Math.floor(100 + Math.random() * 899)}`}
              disabled
              className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-gray-100 outline-none w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Voucher / Debit Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Brief posting narration..."
              className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] focus:bg-white outline-none w-full"
            ></textarea>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-[10px] text-sm font-semibold bg-white text-[#185fa5] border border-[#185fa5] hover:bg-[#e6f1fb]">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="py-2 px-4 rounded-[10px] text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
            {loading ? 'Processing...' : (isEditing ? 'Update Expenditure' : 'Post Expenditure')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Expenses;