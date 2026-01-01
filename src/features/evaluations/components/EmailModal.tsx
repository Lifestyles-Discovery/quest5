import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useEmailEvaluation } from '@/hooks/api/useEvaluations';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Checkbox from '@/components/form/input/Checkbox';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  evaluationId: string;
  propertyAddress?: string;
}

export default function EmailModal({
  isOpen,
  onClose,
  propertyId,
  evaluationId,
  propertyAddress = '',
}: EmailModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(propertyAddress ? `Evaluation: ${propertyAddress}` : 'Property Evaluation');
  const [message, setMessage] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const emailEvaluation = useEmailEvaluation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!to.trim()) {
      setError('Please enter at least one email address.');
      return;
    }

    if (!disclaimerAccepted) {
      setError('Please accept the disclaimer before sending.');
      return;
    }

    emailEvaluation.mutate(
      {
        propertyId,
        evaluationId,
        to: to.trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            handleClose();
          }, 2000);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to send email. Please try again.');
        },
      }
    );
  };

  const handleClose = () => {
    setTo('');
    setSubject(propertyAddress ? `Evaluation: ${propertyAddress}` : 'Property Evaluation');
    setMessage('');
    setDisclaimerAccepted(false);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        Email Evaluation
      </h3>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Send this evaluation to one or more email addresses.
      </p>

      {/* Success Message */}
      {success && (
        <div className="mb-4 rounded-lg bg-success-50 p-4 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-400">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Email sent successfully!
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg bg-error-50 p-4 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* To Field */}
        <div>
          <Label htmlFor="email-to">To</Label>
          <Input
            id="email-to"
            type="text"
            placeholder="email@example.com (separate multiple with commas)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={emailEvaluation.isPending || success}
          />
        </div>

        {/* Subject Field */}
        <div>
          <Label htmlFor="email-subject">Subject</Label>
          <Input
            id="email-subject"
            type="text"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={emailEvaluation.isPending || success}
          />
        </div>

        {/* Message Field */}
        <div>
          <Label htmlFor="email-message">Message (optional)</Label>
          <TextArea
            placeholder="Add a personal message..."
            rows={4}
            value={message}
            onChange={(value) => setMessage(value)}
            disabled={emailEvaluation.isPending || success}
          />
        </div>

        {/* Disclaimer Checkbox */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Checkbox
            id="disclaimer"
            checked={disclaimerAccepted}
            onChange={setDisclaimerAccepted}
            disabled={emailEvaluation.isPending || success}
            label="I understand that by sending this email, I am sharing this evaluation data with the recipient(s)."
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={emailEvaluation.isPending}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!disclaimerAccepted || emailEvaluation.isPending || success}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {emailEvaluation.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
