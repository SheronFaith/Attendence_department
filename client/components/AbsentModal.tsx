import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AbsentModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: 'OD' | 'Leave') => void;
  studentName?: string;
}

export function AbsentModal({ open, onClose, onSelect, studentName }: AbsentModalProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && firstButtonRef.current) {
      // Focus the first button when modal opens
      setTimeout(() => firstButtonRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  const handleSelect = (type: 'OD' | 'Leave') => {
    console.log('Modal button clicked:', type);
    onSelect(type);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">Mark as Absent</h2>
        <p className="text-gray-600 mb-4">
          {studentName ? `Mark ${studentName} as:` : 'Select absence type:'}
        </p>

        <div className="flex flex-col gap-3">
          <button
            ref={firstButtonRef}
            onClick={() => handleSelect('OD')}
            className="h-12 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            OD (Official Duty)
          </button>

          <button
            onClick={() => handleSelect('Leave')}
            className="h-12 text-base border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
