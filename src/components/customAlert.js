import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const CustomAlert = ({
  message,
  onClose,
  type = 'success',
  position = 'top-right',
  duration = 5000,
  title
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const alertTypes = {
    success: {
      icon: CheckCircle,
      containerClass: 'bg-emerald-50 border-emerald-200',
      iconClass: 'text-emerald-600',
      titleClass: 'text-emerald-800',
      messageClass: 'text-emerald-600',
      progressClass: 'bg-emerald-500'
    },
    error: {
      icon: AlertCircle,
      containerClass: 'bg-red-50 border-red-200',
      iconClass: 'text-red-600',
      titleClass: 'text-red-800',
      messageClass: 'text-red-600',
      progressClass: 'bg-red-500'
    },
    warning: {
      icon: AlertTriangle,
      containerClass: 'bg-amber-50 border-amber-200',
      iconClass: 'text-amber-600',
      titleClass: 'text-amber-800',
      messageClass: 'text-amber-600',
      progressClass: 'bg-amber-500'
    },
    info: {
      icon: Info,
      containerClass: 'bg-blue-50 border-blue-200',
      iconClass: 'text-blue-600',
      titleClass: 'text-blue-800',
      messageClass: 'text-blue-600',
      progressClass: 'bg-blue-500'
    }
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const config = alertTypes[type];
  const IconComponent = config.icon;

  useEffect(() => {
    setIsVisible(true);
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(hideTimer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed ${positions[position]} z-50
        transform transition-all duration-300 ease-out
        ${isLeaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
    >
      <div className={`
        relative overflow-hidden
        min-w-[320px] max-w-md
        p-4 rounded-lg shadow-lg border
        ${config.containerClass}
      `}>
        <div className="flex gap-3">
          <div className={config.iconClass}>
            <IconComponent size={24} />
          </div>
          <div className="flex-1 pt-0.5">
            {title && (
              <h3 className={`font-medium mb-1 ${config.titleClass}`}>
                {title}
              </h3>
            )}
            <p className={`text-sm ${config.messageClass}`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`${config.iconClass} opacity-70 hover:opacity-100 transition-opacity`}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Animated progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
          <div
            className={`h-full ${config.progressClass} transition-all duration-300`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default CustomAlert;