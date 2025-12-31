import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/modal';
import Input from '@components/form/input/InputField';
import Label from '@components/form/Label';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import {
  useCreateUser,
  useUpdateUserFromAdmin,
  useUpdateUserRights,
} from '@hooks/api/useAdmin';
import type { AdminUser, CreateUserFormData, UserRightsUpdate } from '@app-types/admin.types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUser; // If provided, we're editing
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAgent, setIsAgent] = useState(false);

  // Rights (only for editing)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSearchFree, setIsSearchFree] = useState(false);

  const createUser = useCreateUser();
  const updateUser = useUpdateUserFromAdmin();
  const updateRights = useUpdateUserRights();

  const isPending =
    createUser.isPending || updateUser.isPending || updateRights.isPending;
  const isEditing = !!user;

  // Populate form when editing
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setIsAgent(user.rights?.search ?? false);
      setIsAdmin(user.rights?.admin ?? false);
      setIsSearchFree(user.rights?.searchFree ?? false);
    } else {
      resetForm();
    }
  }, [user, isOpen]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setIsAgent(false);
    setIsAdmin(false);
    setIsSearchFree(false);
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

    if (!isEditing && password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (isEditing && user) {
      // Update existing user
      try {
        await updateUser.mutateAsync({
          userId: user.id,
          data: { firstName, lastName, email },
        });

        // Update rights
        const rights: UserRightsUpdate = {
          admin: isAdmin,
          search: isAgent, // "search" is the API field for agent capability
          searchFree: isSearchFree,
        };
        await updateRights.mutateAsync({ userId: user.id, rights });

        handleClose();
      } catch {
        setError('Failed to update user');
      }
    } else {
      // Create new user
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
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditing ? 'Edit User' : 'New User'}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEditing
            ? 'Update user details and permissions'
            : 'Create a new employee or agent with a free subscription'}
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
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>

        {!isEditing && (
          <div>
            <Label>Password (min 4 characters)</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>
        )}

        {/* Permissions */}
        <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="font-medium text-gray-800 dark:text-white/90">
            Permissions
          </h4>

          {isEditing && (
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              Admin
            </label>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={isAgent}
              onChange={(e) => setIsAgent(e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            Agent
          </label>

          {isEditing && (
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={isSearchFree}
                onChange={(e) => setIsSearchFree(e.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              Free Search
            </label>
          )}
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
                : 'Create User'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
