"use client";

import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  RotateCcw, 
  X, 
  Loader2 
} from 'lucide-react';

export type ConfirmationType = 'delete' | 'warning' | 'undo' | 'info';

export interface ConfirmationModalProps {
  isOpen: boolean;
  type?: ConfirmationType;
  title: string;
  message: string;
  itemDetails?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  type = 'warning',
  title,
  message,
  itemDetails,
  confirmText = 'אישור',
  cancelText = 'ביטול',
  isSubmitting = false,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  const isDanger = type === 'delete';
  const isUndo = type === 'undo';

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden m-auto text-slate-800 transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          isDanger 
            ? 'bg-red-50/80 border-red-100 text-red-900' 
            : isUndo
            ? 'bg-amber-50/80 border-amber-100 text-amber-900'
            : 'bg-blue-50/80 border-blue-100 text-blue-900'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              isDanger 
                ? 'bg-red-100 border-red-200 text-red-700' 
                : isUndo
                ? 'bg-amber-100 border-amber-200 text-amber-700'
                : 'bg-blue-100 border-blue-200 text-blue-700'
            }`}>
              {isDanger ? (
                <Trash2 className="w-5 h-5" />
              ) : isUndo ? (
                <RotateCcw className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 truncate">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-40"
            aria-label="סגור חלון"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 text-xs text-slate-600 overflow-y-auto max-h-[70vh]">
          <p className="text-slate-800 font-medium text-sm leading-relaxed whitespace-pre-line break-words">
            {message}
          </p>

          {itemDetails && (
            <div className={`p-3 rounded-xl border text-xs break-words leading-relaxed ${
              isDanger
                ? 'bg-red-50/50 border-red-100 text-red-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              {typeof itemDetails === 'string' ? (
                <p>{itemDetails}</p>
              ) : (
                itemDetails
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                : isUndo
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                : 'bg-blue-900 hover:bg-blue-950 text-white shadow-xs'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>מבצע...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
