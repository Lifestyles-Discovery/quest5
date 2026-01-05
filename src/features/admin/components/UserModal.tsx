import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/modal';
import Input from '@components/form/input/InputField';
import Label from '@components/form/Label';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import Checkbox from '@components/form/input/Checkbox';
import { useCreateUser } from '@hooks/api/useAdmin';
import type { CreateUserFormData } from '@app-types/admin.types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserModal({ isOpen, onClose }: UserModalProps) {
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAgent, setIsAgent] = useState(false);

  const createUser = useCreateUser();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setIsAgent(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!firstName || !lastName || !email) {
      setError('First name, last name, and email are required');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    const data: CreateUserFormData = {
      firstName,
      lastName,
      email,
      password,
      isAgent,
    };

    createUser.mutate(data, {
      onSuccess: () => handleClose(),
      onError: () => setError('Failed to create user'),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          New User
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new employee or agent with a free subscription
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error" message={error} />
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>First Name</Label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={createUser.isPending}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={createUser.isPending}
            />
          </div>
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={createUser.isPending}
          />
        </div>

        <div>
          <Label>Password (min 4 characters)</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={createUser.isPending}
          />
        </div>

        <Checkbox
          label="Agent"
          checked={isAgent}
          onChange={setIsAgent}
          disabled={createUser.isPending}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={createUser.isPending}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={createUser.isPending}>
            {createUser.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
