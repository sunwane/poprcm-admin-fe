'use client';

import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import FormInput from '@/components/ui/FormInput';
import GradientButton from '@/components/ui/GradientButton';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { changePassword } = useSettings();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer effect
  const handleSendVerificationCode = async () => {
    // Remove this function - no longer needed
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      // Reset form and close modal on success
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onClose();
      
      // Show success message (you might want to add a toast notification here)
      alert('Đổi mật khẩu thành công!');
    } catch (error: any) {
      setError(error.message || 'Đổi mật khẩu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-120 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-blue-600">
            Đổi mật khẩu
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='bg-gray-50 p-6 rounded-xl'>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại
              </label>
              <FormInput
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu hiện tại"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <FormInput
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu mới
              </label>
              <FormInput
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handleInputChange}
                placeholder="Xác nhận mật khẩu mới"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                disabled={loading}
              >
                Hủy
              </button>
            </div>
            <div className="flex-1">
              <GradientButton disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  'Đổi mật khẩu'
                )}
              </GradientButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}