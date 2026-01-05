import { useState, useEffect } from 'react';
import Button from '@components/ui/button/Button';
import { UserModal } from './UserModal';
import {
  useAllUsers,
  useUpdateUserFromAdmin,
  useUpdateUserRights,
  useImpersonateUser,
} from '@hooks/api/useAdmin';
import { useEditableField } from '@hooks/useEditableField';
import type { AdminUser, UserRightsUpdate } from '@app-types/admin.types';
import { Skeleton } from '@components/ui/skeleton/Skeleton';

function UsersTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Email
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Admin
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Agent
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Free
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i}>
              <td className="whitespace-nowrap px-4 py-3">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Skeleton className="h-4 w-40" />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-center">
                <Skeleton className="mx-auto h-5 w-5 rounded" />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-center">
                <Skeleton className="mx-auto h-5 w-5 rounded" />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-center">
                <Skeleton className="mx-auto h-5 w-5 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Inline checkbox for permissions with optimistic updates
function PermissionCheckbox({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => Promise<void>;
  disabled?: boolean;
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [optimisticValue, setOptimisticValue] = useState(checked);

  useEffect(() => {
    setOptimisticValue(checked);
  }, [checked]);

  const handleToggle = async () => {
    if (disabled || isToggling) return;

    const newValue = !optimisticValue;
    setOptimisticValue(newValue);
    setIsToggling(true);

    try {
      await onChange(newValue);
    } catch {
      setOptimisticValue(checked); // Rollback on error
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isToggling}
      className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
        optimisticValue
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
      } ${isToggling ? 'opacity-50' : ''} ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      {optimisticValue && (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}

// Inline editable text cell
function InlineEditableCell({
  value,
  onSave,
  className = '',
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
}) {
  const handleSave = async (val: string | number) => {
    await onSave(String(val));
  };

  const {
    isEditing,
    inputValue,
    setInputValue,
    startEditing,
    handleBlur,
    handleKeyDown,
    inputRef,
    justSaved,
    hasError,
  } = useEditableField({ value, onSave: handleSave });

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full min-w-[100px] rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
      />
    );
  }

  return (
    <span
      onClick={startEditing}
      className={`cursor-pointer rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
    >
      {value}
      {justSaved && (
        <svg
          className="ml-1 inline h-3 w-3 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {hasError && (
        <svg
          className="ml-1 inline h-3 w-3 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
    </span>
  );
}

// User row component for desktop
function UserRow({ user }: { user: AdminUser }) {
  const updateUser = useUpdateUserFromAdmin();
  const updateRights = useUpdateUserRights();
  const impersonate = useImpersonateUser();

  const handleImpersonate = async () => {
    try {
      const session = await impersonate.mutateAsync(user.id);

      // Open new tab with impersonation session
      const newTab = window.open('about:blank', '_blank');
      if (newTab) {
        newTab.sessionStorage.setItem('session', JSON.stringify(session));
        newTab.location.href = `${window.location.origin}/deals`;
      } else {
        alert('Please allow popups to impersonate users');
      }
    } catch {
      alert('Failed to impersonate user');
    }
  };

  const handleSaveEmail = async (email: string) => {
    await updateUser.mutateAsync({
      userId: user.id,
      data: { firstName: user.firstName, lastName: user.lastName, email },
    });
  };

  const handleUpdateRights = async (
    field: 'admin' | 'search' | 'searchFree',
    value: boolean
  ) => {
    const rights: UserRightsUpdate = {
      admin: field === 'admin' ? value : user.isAdmin,
      search: field === 'search' ? value : user.isAgent,
      searchFree: field === 'searchFree' ? value : user.isSearchFree,
    };
    await updateRights.mutateAsync({ userId: user.id, rights });
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
      {/* Name - clickable for impersonation */}
      <td className="whitespace-nowrap px-4 py-3">
        <button
          onClick={handleImpersonate}
          disabled={impersonate.isPending}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          title="Click to impersonate"
        >
          {user.firstName} {user.lastName}
        </button>
      </td>

      {/* Email - inline editable */}
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        <InlineEditableCell value={user.email} onSave={handleSaveEmail} />
      </td>

      {/* Admin checkbox */}
      <td className="whitespace-nowrap px-4 py-3 text-center">
        <PermissionCheckbox
          checked={user.isAdmin}
          onChange={(value) => handleUpdateRights('admin', value)}
        />
      </td>

      {/* Agent checkbox */}
      <td className="whitespace-nowrap px-4 py-3 text-center">
        <PermissionCheckbox
          checked={user.isAgent}
          onChange={(value) => handleUpdateRights('search', value)}
        />
      </td>

      {/* Free Search checkbox */}
      <td className="whitespace-nowrap px-4 py-3 text-center">
        <PermissionCheckbox
          checked={user.isSearchFree}
          onChange={(value) => handleUpdateRights('searchFree', value)}
        />
      </td>
    </tr>
  );
}

// Mobile user card
function UserCard({ user }: { user: AdminUser }) {
  const updateUser = useUpdateUserFromAdmin();
  const updateRights = useUpdateUserRights();
  const impersonate = useImpersonateUser();

  const handleImpersonate = async () => {
    try {
      const session = await impersonate.mutateAsync(user.id);
      const newTab = window.open('about:blank', '_blank');
      if (newTab) {
        newTab.sessionStorage.setItem('session', JSON.stringify(session));
        newTab.location.href = `${window.location.origin}/deals`;
      } else {
        alert('Please allow popups to impersonate users');
      }
    } catch {
      alert('Failed to impersonate user');
    }
  };

  const handleSaveEmail = async (email: string) => {
    await updateUser.mutateAsync({
      userId: user.id,
      data: { firstName: user.firstName, lastName: user.lastName, email },
    });
  };

  const handleUpdateRights = async (
    field: 'admin' | 'search' | 'searchFree',
    value: boolean
  ) => {
    const rights: UserRightsUpdate = {
      admin: field === 'admin' ? value : user.isAdmin,
      search: field === 'search' ? value : user.isAgent,
      searchFree: field === 'searchFree' ? value : user.isSearchFree,
    };
    await updateRights.mutateAsync({ userId: user.id, rights });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3">
        <button
          onClick={handleImpersonate}
          disabled={impersonate.isPending}
          className="font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
        >
          {user.firstName} {user.lastName}
        </button>
        <div className="mt-1">
          <InlineEditableCell
            value={user.email}
            onSave={handleSaveEmail}
            className="text-sm text-gray-500 dark:text-gray-400"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <PermissionCheckbox
            checked={user.isAdmin}
            onChange={(value) => handleUpdateRights('admin', value)}
          />
          Admin
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <PermissionCheckbox
            checked={user.isAgent}
            onChange={(value) => handleUpdateRights('search', value)}
          />
          Agent
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <PermissionCheckbox
            checked={user.isSearchFree}
            onChange={(value) => handleUpdateRights('searchFree', value)}
          />
          Free
        </label>
      </div>
    </div>
  );
}

type SortField = 'firstName' | 'lastName' | 'email' | 'isAdmin' | 'isAgent' | 'isSearchFree';
type SortDirection = 'asc' | 'desc';

export function UsersList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { data: users, isLoading, error } = useAllUsers();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort users
  const sortedUsers = users?.slice().sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    // Handle boolean fields (permissions)
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      // true values first when ascending
      const comparison = aVal === bVal ? 0 : aVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    // Handle string fields
    const comparison = String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase());
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => (
    <svg
      className={`ml-1 inline h-4 w-4 ${
        sortField === field ? 'text-brand-500' : 'text-gray-400'
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={
          sortField === field && sortDirection === 'desc'
            ? 'M19 9l-7 7-7-7'
            : 'M5 15l7-7 7 7'
        }
      />
    </svg>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {users?.length ?? 0} users
        </p>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New User
        </Button>
      </div>

      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Loading State */}
      {isLoading && <UsersTableSkeleton />}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error loading users. Please try again.
          </p>
        </div>
      )}

      {/* Users Table - Desktop */}
      {!isLoading && !error && sortedUsers && (
        <div className="hidden overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 md:block">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort('firstName')}
                >
                  Name <SortIcon field="firstName" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort('email')}
                >
                  Email <SortIcon field="email" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort('isAdmin')}
                >
                  Admin <SortIcon field="isAdmin" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort('isAgent')}
                >
                  Agent <SortIcon field="isAgent" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort('isSearchFree')}
                >
                  Free <SortIcon field="isSearchFree" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {sortedUsers.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Cards - Mobile */}
      {!isLoading && !error && sortedUsers && (
        <div className="space-y-3 md:hidden">
          {sortedUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
