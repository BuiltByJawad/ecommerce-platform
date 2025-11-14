'use client';
import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 transition-opacity duration-150 ease-in-out'
      onClick={onClose} // Allow closing by clicking backdrop
    >
      <div
        className='bg-white rounded-lg shadow-xl p-5 sm:p-6 w-full max-w-md transform transition-all duration-150 ease-in-out'
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside modal content
      >
        <div className='flex items-start'>
          <div className='flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
            <FiAlertTriangle className='h-6 w-6 text-red-600' aria-hidden='true' />
          </div>
          <div className='ml-3 mt-0 text-left'>
            <h3 className='text-lg leading-6 font-semibold text-gray-900' id='modal-title'>
              {title}
            </h3>
            <div className='mt-2'>
              {typeof message === 'string' ? (
                <p className='text-sm text-gray-600'>{message}</p>
              ) : (
                message
              )}
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='ml-auto -mt-1 -mr-1 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors'
          >
            <FiX className='h-5 w-5' />
          </button>
        </div>
        <div className='mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='w-full justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 sm:w-auto transition-colors'
          >
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className='w-full justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 sm:w-auto transition-colors'
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmationModal;
