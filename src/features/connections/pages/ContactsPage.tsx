import { useState, useMemo } from 'react';
import PageMeta from '@components/common/PageMeta';
import PageBreadcrumb from '@components/common/PageBreadCrumb';
import { ConnectionCard } from '../components/ConnectionCard';
import { ConnectionModal } from '../components/ConnectionModal';
import {
  useConnections,
  useToggleConnectionVisibility,
} from '@hooks/api/useConnections';
import { useAuth } from '@context/AuthContext';
import { CONNECTION_TYPES, type Connection } from '@app-types/connection.types';
import Button from '@components/ui/button/Button';
import Input from '@components/form/input/InputField';
import { Skeleton } from '@components/ui/skeleton/Skeleton';

function ConnectionCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showHidden, setShowHidden] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | undefined>();

  // Fetch all connections (including hidden)
  const { data: connections, isLoading, error } = useConnections(user?.id, true);
  const toggleVisibility = useToggleConnectionVisibility();

  // Filter connections based on search, type, and hidden status
  const filteredConnections = useMemo(() => {
    if (!connections) return [];

    return connections.filter((conn) => {
      // Filter by hidden status
      if (!showHidden && conn.deleted) return false;

      // Filter by type
      if (typeFilter !== 'all' && conn.type !== typeFilter) return false;

      // Filter by search term (name, email, phone, type)
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          conn.name.toLowerCase().includes(search) ||
          conn.email.toLowerCase().includes(search) ||
          conn.phone.toLowerCase().includes(search) ||
          conn.type.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [connections, searchTerm, typeFilter, showHidden]);

  const totalContacts = connections?.length ?? 0;
  const visibleContacts = connections?.filter((c) => !c.deleted).length ?? 0;
  const hiddenContacts = totalContacts - visibleContacts;

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    setIsModalOpen(true);
  };

  const handleToggleVisibility = (connection: Connection) => {
    if (!user) return;
    toggleVisibility.mutate({
      userId: user.id,
      connectionId: connection.id,
      deleted: !connection.deleted,
    });
  };

  const handleNewContact = () => {
    setEditingConnection(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConnection(undefined);
  };

  return (
    <>
      <PageMeta
        title="Contacts | Quest"
        description="Manage your real estate contacts"
      />

      <PageBreadcrumb pageTitle="Contacts" />

      <div className="space-y-6">
        {/* Header with New Contact Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Contacts
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {visibleContacts} contact{visibleContacts !== 1 ? 's' : ''}
              {hiddenContacts > 0 && ` (${hiddenContacts} hidden)`}
            </p>
          </div>
          <Button size="sm" onClick={handleNewContact}>
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
            New Contact
          </Button>
        </div>

        {/* Connection Modal */}
        <ConnectionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          connection={editingConnection}
        />

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            >
              <option value="all">All Types</option>
              {CONNECTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Show Hidden Toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              Show hidden
            </label>
          </div>

          {/* Search */}
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ConnectionCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error loading contacts. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredConnections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
              {searchTerm || typeFilter !== 'all'
                ? 'No contacts match your filters'
                : 'No contacts yet'}
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Add your first contact to get started'}
            </p>
            {!searchTerm && typeFilter === 'all' && (
              <Button size="sm" onClick={handleNewContact}>
                Add Contact
              </Button>
            )}
          </div>
        )}

        {/* Contacts Grid */}
        {!isLoading && !error && filteredConnections.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConnections.map((connection) => (
              <div
                key={connection.id}
                className={connection.deleted ? 'opacity-50' : ''}
              >
                <ConnectionCard
                  connection={connection}
                  onEdit={handleEdit}
                  onToggleVisibility={handleToggleVisibility}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
