import React, { useState, useRef, useEffect } from 'react';
import { validateImageFile } from '@/utils/uploadUtils';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (file: File | null, previewUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function AvatarUpload({ 
  currentAvatar, 
  onAvatarChange, 
  size = 'md',
  disabled = false
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || '');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Đồng bộ previewUrl với currentAvatar khi props thay đổi
  useEffect(() => {
    setPreviewUrl(currentAvatar || '');
  }, [currentAvatar]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = (file: File) => {
    setError('');
  
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'File không hợp lệ');
      return;
    }
  
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url); // Cập nhật preview URL local
        onAvatarChange(file, url); // Truyền file và URL preview lên cha
      };
      reader.onerror = () => {
        setError('Không thể đọc file. Vui lòng thử lại.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    setPreviewUrl('');
    setError('');
    onAvatarChange(null, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={`
          ${sizeClasses[size]} 
          relative rounded-full border-2 border-dashed border-gray-300 
          ${isDragging ? 'border-blue-600 bg-blue-50' : 'hover:border-blue-500'} 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          transition-all duration-200 overflow-hidden
          ${previewUrl ? 'border-solid border-gray-200' : ''}
          ${error ? 'border-red-600' : ''}
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="w-full h-full object-cover rounded-full"
            />
            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10"
                title="Xóa ảnh"
              >
                ×
              </button>
            )}
            <div className="absolute inset-0 bg-black opacity-20 hover:opacity-10 transition-all duration-200 flex items-center justify-center rounded-full">
              <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-xs text-center">
              {disabled ? 'Disabled' : size === 'sm' ? 'Upload' : 'Chọn ảnh'}
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {!disabled && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Kéo thả ảnh vào đây hoặc <button type="button" onClick={handleClick} className="text-blue-600 hover:text-blue-800 underline">chọn file</button>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF, WebP tối đa 5MB
          </p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}