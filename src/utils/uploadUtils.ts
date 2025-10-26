export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Chỉ hỗ trợ file ảnh định dạng JPEG, PNG, GIF, WebP'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Kích thước file (${(file.size / 1024 / 1024).toFixed(1)}MB) vượt quá giới hạn 5MB`
    };
  }

  return { isValid: true };
};

export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Cannot get canvas context'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        // Tính toán kích thước mới
        let { width, height } = img;
        
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          } else {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Vẽ ảnh lên canvas với background trắng
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              console.log('Original size:', file.size, 'Compressed size:', compressedFile.size);
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          Math.max(quality, 0.1) // Đảm bảo quality không quá thấp
        );
      } catch (error) {
        reject(new Error('Failed to process image: ' + error));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Tạo object URL thay vì dùng FileReader
    img.src = URL.createObjectURL(file);
  });
};