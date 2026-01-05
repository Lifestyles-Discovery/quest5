import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/modal';
import Input from '@components/form/input/InputField';
import Label from '@components/form/Label';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import {
  useCreateConnection,
  useUpdateConnection,
} from '@hooks/api/useConnections';
import { useAuth } from '@context/AuthContext';
import {
  CONNECTION_TYPES,
  type Connection,
  type ConnectionFormData,
} from '@app-types/connection.types';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection?: Connection; // If provided, we're editing
  onCreated?: (connectionId: string) => void; // Called after new connection is created
}

export function ConnectionModal({
  isOpen,
  onClose,
  connection,
  onCreated,
}: ConnectionModalProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Mutations
  const createConnection = useCreateConnection();
  const updateConnection = useUpdateConnection();

  const isPending = createConnection.isPending || updateConnection.isPending;
  const isEditing = !!connection;

  // Populate form when editing
  useEffect(() => {
    if (connection) {
      setType(connection.type);
      setName(connection.name);
      setEmail(connection.email);
      setPhone(connection.phone);
    } else {
      resetForm();
    }
  }, [connection, isOpen]);

  const resetForm = () => {
    setType('');
    setName('');
    setEmail('');
    setPhone('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    setError(null);

    if (!type || !name) {
      setError('Type and name are required');
      return;
    }

    const data: ConnectionFormData = { type, name, email, phone };

    if (isEditing && connection) {
      updateConnection.mutate(
        {
          userId: user!.id,
          connectionId: connection.id,
          data,
        },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: () => {
            setError('Failed to update connection');
          },
        }
      );
    } else {
      createConnection.mutate(
        {
          userId: user!.id,
          data,
        },
        {
          onSuccess: (connectionId) => {
            onCreated?.(connectionId);
            handleClose();
          },
          onError: () => {
            setError('Failed to create connection');
          },
        }
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditing ? 'Edit Connection' : 'New Connection'}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEditing
            ? 'Update contact information'
            : 'Add a new contact to your connections'}
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error" message={error} />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Type</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
          >
            <option value="">Select type</option>
            {CONNECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Name</Label>
          <Input
            type="text"
            placeholder="Contact name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div>
          <Label>Phone</Label>
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
                ? 'Save Changes'
                : 'Create Connection'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
