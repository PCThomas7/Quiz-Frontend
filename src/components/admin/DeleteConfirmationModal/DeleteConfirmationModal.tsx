import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode; // Add this prop
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemCount,
  onConfirm,
  onCancel,
  children, // Add children prop
}) => {
  return (
    <>
      {/* Background Content */}
      <div className={`${isOpen ? 'blur-sm' : ''}`}>
        {children}
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0  bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Confirmation</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {itemCount} selected {itemCount === 1 ? 'question' : 'questions'}? 
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};