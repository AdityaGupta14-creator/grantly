import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog = ({ open, title, description, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <span className="sr-only">This action cannot be undone from the app.</span>
  </Modal>
);
