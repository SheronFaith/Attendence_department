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

  console.log('AbsentModal render - open:', open, 'studentName:', studentName);

  useEffect(() => {
    console.log('AbsentModal useEffect - open changed to:', open);
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

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="sm:max-w-md fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
        onKeyDown={handleKeyDown}
        aria-describedby="absent-modal-description"
        onPointerDownOutside={(e) => {
          console.log('Dialog pointer down outside');
        }}
        onEscapeKeyDown={(e) => {
          console.log('Dialog escape key down');
          onClose();
        }}
      >
        <DialogHeader>
          <DialogTitle>Mark as Absent</DialogTitle>
          <DialogDescription id="absent-modal-description">
            {studentName ? `Mark ${studentName} as:` : 'Select absence type:'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button
            ref={firstButtonRef}
            onClick={() => handleSelect('OD')}
            size="lg"
            className="h-12 text-base"
            aria-describedby="od-description"
          >
            OD (Official Duty)
          </Button>
          <span id="od-description" className="sr-only">
            Mark student as on official duty
          </span>
          
          <Button
            onClick={() => handleSelect('Leave')}
            variant="outline"
            size="lg"
            className="h-12 text-base"
            aria-describedby="leave-description"
          >
            Leave
          </Button>
          <span id="leave-description" className="sr-only">
            Mark student as on leave
          </span>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="mt-2"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
