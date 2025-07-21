import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import InstructorEvaluationForm from './InstructorEvaluationForm';

interface InstructorEvaluationDialogProps {
  instructorId: number;
  assignmentId: number;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  evaluationType?: 'participant' | 'supervisor' | 'self';
  trigger?: React.ReactNode;
  onEvaluationComplete?: () => void;
}

export default function InstructorEvaluationDialog({
  instructorId,
  assignmentId,
  buttonLabel = 'Evaluar instructor',
  buttonVariant = 'default',
  evaluationType = 'supervisor',
  trigger,
  onEvaluationComplete
}: InstructorEvaluationDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onEvaluationComplete) {
      onEvaluationComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant={buttonVariant}>
            <Star className="mr-2 h-4 w-4" />
            {buttonLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" aria-describedby="evaluation-dialog-description">
        <DialogHeader>
          <DialogTitle>Evaluación de Instructor</DialogTitle>
          <DialogDescription id="evaluation-dialog-description">
            Complete todos los criterios para evaluar el desempeño del instructor.
          </DialogDescription>
        </DialogHeader>
        <InstructorEvaluationForm
          instructorId={instructorId}
          assignmentId={assignmentId}
          evaluationType={evaluationType}
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}