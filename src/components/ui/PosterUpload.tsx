import React, { useState, useRef, useEffect } from 'react';

interface PosterUploadProps {
  currentPoster?: string;
  onPosterChange: (file: File | null, previewUrl: string) => void;
  disabled?: boolean;
}

export default function PosterUpload({ 
  currentPoster = '', 
  onPosterChange, 
  disabled = false 
}: PosterUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentPoster);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview URL when currentPoster changes
  useEffect(() => {
    setPreviewUrl(currentPoster);
  }, [currentPoster]);

  const handleFileSelect = (file: File) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File không được vượt quá 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
        onPosterChange(file, url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    onPosterChange(null, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageError = () => {
    // If current poster fails to load, show upload area
    if (previewUrl === currentPoster) {
      setPreviewUrl('');
    }
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative aspect-3/2 border-2 border-dashed rounded-xl cursor-pointer transition-all 
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${previewUrl ? 'border-solid border-gray-200' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {previewUrl ? (
          <div className="w-full h-full relative">
            <img
              src={previewUrl}
              alt="Poster preview"
              className="w-full h-full object-cover rounded-xl"
              onError={handleImageError}
            />

            {/* Upload hint - Always on top */}
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-10 opacity-0 hover:opacity-50 rounded-xl transition-opacity">
                <div className="text-white text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Click để thay đổi</p>
                </div>
              </div>
            )}

            {/* Remove Button - Always on top */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg z-20 opacity-100"
                title="Xóa ảnh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium mb-2">
              {isDragging ? 'Thả ảnh poster vào đây' : 'Tải lên ảnh poster'}
            </p>
            <p className="text-xs text-gray-400">
              Kéo thả hoặc click để chọn ảnh
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, JPEG (tối đa 5MB)
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Tỷ lệ khuyến nghị: 3:2 (ví dụ: 600x400px)
            </p>
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-xl flex items-center justify-center z-30">
            <p className="text-blue-600 font-medium">Thả ảnh poster vào đây</p>
          </div>
        )}
      </div>
    </div>
  );
}