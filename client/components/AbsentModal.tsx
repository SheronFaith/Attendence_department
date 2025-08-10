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

  const handleSelect = (type: 'OD' | 'Leave') => {
    console.log('AbsentModal handleSelect clicked:', type);
    onSelect(type);
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Mark as Absent</h2>
        <p className="text-gray-600 mb-4">
          {studentName ? `Mark ${studentName} as:` : 'Select absence type:'}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            ref={firstButtonRef}
            onClick={() => handleSelect('OD')}
            size="lg"
            className="h-12 text-base"
          >
            OD (Official Duty)
          </Button>

          <Button
            onClick={() => handleSelect('Leave')}
            variant="outline"
            size="lg"
            className="h-12 text-base"
          >
            Leave
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="mt-2"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
