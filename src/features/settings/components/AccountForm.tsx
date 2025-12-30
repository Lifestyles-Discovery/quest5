import { useState, useEffect } from 'react';
import Input from '@components/form/input/InputField';
import Label from '@components/form/Label';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import { useUpdateAccount } from '@hooks/api/useSettings';
import { useAuth } from '@context/AuthContext';
import type { AccountFormData } from '@app-types/settings.types';

export function AccountForm() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const updateAccount = useUpdateAccount();

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!firstName || !lastName || !email) {
      setError('First name, last name, and email are required');
      return;
    }

    const data: AccountFormData = {
      firstName,
      lastName,
      email,
      ...(password ? { password } : {}),
    };

    updateAccount.mutate(
      { userId: user!.id, data },
      {
        onSuccess: () => {
          setSuccess(true);
          setPassword(''); // Clear password field
        },
        onError: () => {
          setError('Failed to update account');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Account Information
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your name, email, and password
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}
      {success && (
        <Alert
          variant="success"
          title="Success"
          message="Account updated successfully"
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>First Name</Label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={updateAccount.isPending}
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={updateAccount.isPending}
          />
        </div>
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={updateAccount.isPending}
        />
      </div>

      <div>
        <Label>New Password (leave blank to keep current)</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          disabled={updateAccount.isPending}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateAccount.isPending}>
          {updateAccount.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
