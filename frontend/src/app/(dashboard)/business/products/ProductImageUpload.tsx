"use client";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";

interface ImageUploadProps {
  onChange: (imageData: { file: File }[]) => void;
  value: { file: File }[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

const ProductImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  value,
  maxFiles = 10,
  maxFileSize = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isValidating, _setIsValidating] = useState(false);

  // Image validation
  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isValidSize = img.width >= 500 && img.height >= 500;
        const isValidRatio =
          img.width / img.height >= 0.5 && img.width / img.height <= 2;

        if (!isValidSize) {
          toast.error(
            `Image must be at least 500x500 pixels. Current: ${img.width}x${img.height}`
          );
          resolve(false);
          return;
        }

        if (!isValidRatio) {
          toast.error("Image aspect ratio should be between 1:2 and 2:1");
          resolve(false);
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        toast.error("Invalid image file");
        resolve(false);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection and validation only
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length + value.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles: { file: File }[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }

      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(
          `${file.name} is too large. Maximum size is ${maxFileSize}MB`
        );
        continue;
      }

      const isValidImage = await validateImage(file);
      if (isValidImage) {
        validFiles.push({ file });
      }
    }

    if (validFiles.length > 0) {
      onChange([...value, ...validFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const event = {
        target: { files: files },
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="imageFiles"
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
            isValidating
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Validating images...
                </p>
              </>
            ) : (
              <>
                <svg
                  className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, JPEG, WebP (Max {maxFileSize}MB each)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Minimum 500x500px • Max {maxFiles} images
                </p>
              </>
            )}
          </div>
          <input
            id="imageFiles"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isValidating}
          />
        </label>
      </div>

      {value.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected Images ({value.length}/{maxFiles})
            </h4>
            {value.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {value.map((image, index) => (
              <div
                key={`${image.file.name}-${index}`}
                className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="aspect-square">
                  <img
                    src={URL.createObjectURL(image.file)}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Primary
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  title="Remove image"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="truncate" title={image.file.name}>
                    Image {index + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Image Guidelines
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Use high-quality images (minimum 500x500 pixels)</li>
          <li>• First image will be used as the primary product image</li>
          <li>• Supported formats: PNG, JPG, JPEG, WebP</li>
          <li>• Maximum file size: {maxFileSize}MB per image</li>
          <li>• Show your product from multiple angles</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductImageUpload;
