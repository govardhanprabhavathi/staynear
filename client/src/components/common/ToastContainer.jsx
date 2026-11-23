import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-mutedSage shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-softRed shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-mutedGold shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-mutedSage shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto bg-nearBlack text-pureWhite p-4 rounded-xl shadow-elevated border border-white/10 flex items-start gap-3"
          >
            {getIcon(toast.type)}
            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/50 hover:text-white transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
