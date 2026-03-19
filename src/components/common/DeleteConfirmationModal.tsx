"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  isLoading = false
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>

              {/* Text */}
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                {title}
              </h3>
              
              <div className="mb-8">
                <p className="text-neutral-400 font-medium text-sm leading-relaxed">
                  {description}
                </p>
                {itemName && (
                  <p className="mt-2 text-white font-black text-base italic underline decoration-red-500/50 underline-offset-4">
                    "{itemName}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-xl shadow-red-500/20 focus:ring-2 focus:ring-red-500/50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Permanently"
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full bg-neutral-800 hover:bg-neutral-750 disabled:opacity-50 text-neutral-400 hover:text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] border border-neutral-700/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
