"use client";

import { XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export default function CancelConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Cancel Your Order?",
  description = "Are you sure you want to cancel this order? This action cannot be undone once accepted.",
  isLoading = false
}: CancelConfirmationModalProps) {
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
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border-2 border-red-500/20">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>

              {/* Text */}
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">
                {title}
              </h3>
              
              <p className="text-neutral-500 font-medium text-sm leading-relaxed mb-10">
                {description}
              </p>

              {/* Actions */}
              <div className="flex flex-col w-full gap-4">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-2xl shadow-red-500/30"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel Order"
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full bg-transparent text-neutral-500 hover:text-white py-4 font-black text-sm uppercase tracking-widest transition-all"
                >
                  Keep Order
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
