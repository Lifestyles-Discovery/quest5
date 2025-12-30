import { useState } from 'react';
import Button from '@components/ui/button/Button';
import { UserModal } from './UserModal';
import { useAllUsers } from '@hooks/api/useAdmin';
import type { AdminUser } from '@app-types/admin.types';

type SortField = 'firstName' | 'lastName' | 'email';
type SortDirection = 'asc' | 'desc';

export function UsersList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>();
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { data: users, isLoading, error } = useAllUsers();

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingUser(undefined);
    setIsModalOpen(false);
  };

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
    const aVal = a[sortField].toLowerCase();
    const bVal = b[sortField].toLowerCase();
    const comparison = aVal.localeCompare(bVal);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => (
    <svg
      className={`ml-1 inline h-4 w-4 ${sortField === field ? 'text-brand-500' : 'text-gray-400'}`}
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

      <UserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        user={editingUser}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error loading users. Please try again.
          </p>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !error && sortedUsers && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort('firstName')}
                >
                  First Name <SortIcon field="firstName" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort('lastName')}
                >
                  Last Name <SortIcon field="lastName" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  onClick={() => handleSort('email')}
                >
                  Email <SortIcon field="email" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Admin
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Agent
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Free Search
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                    {user.firstName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                    {user.lastName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {user.rights?.admin && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {user.rights?.search && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {user.rights?.searchFree && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
