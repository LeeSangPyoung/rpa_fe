import React from 'react'
export default function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xs p-6 text-center">
        <div className="mb-6 text-base text-gray-900">{message}</div>
        <div className="flex justify-center gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium" onClick={onConfirm}>확인</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs font-medium" onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  );
} 