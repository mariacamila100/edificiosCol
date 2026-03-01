import React from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, mensaje }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 animate-fadeIn">
        
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Confirmar acción
        </h2>

        <p className="text-gray-600 mb-6">
          {mensaje}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
