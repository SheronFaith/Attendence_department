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
    console.log('AbsentModal rendered - open:', open, 'studentName:', studentName, 'onSelect type:', typeof onSelect);
    if (open && firstButtonRef.current) {
      // Focus the first button when modal opens
      setTimeout(() => firstButtonRef.current?.focus(), 100);
    }
  }, [open, studentName, onSelect]);

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
    try {
      onSelect(type);
      onClose();
    } catch (error) {
      console.error('Error in handleSelect:', error);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('OD button clicked');
              handleSelect('OD');
            }}
            className="h-12 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            OD (Official Duty)
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Leave button clicked');
              handleSelect('Leave');
            }}
            className="h-12 text-base border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
