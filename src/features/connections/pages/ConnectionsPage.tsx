import { useState } from 'react';
import PageMeta from '@components/common/PageMeta';
import PageBreadcrumb from '@components/common/PageBreadCrumb';
import Button from '@components/ui/button/Button';
import { ConnectionCard } from '../components/ConnectionCard';
import { ConnectionModal } from '../components/ConnectionModal';
import {
  useConnections,
  useToggleConnectionVisibility,
  filterVisibleConnections,
} from '@hooks/api/useConnections';
import { useAuth } from '@context/AuthContext';
import type { Connection, ConnectionType } from '@app-types/connection.types';
import { CONNECTION_TYPES } from '@app-types/connection.types';

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | undefined>();
  const [showHidden, setShowHidden] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ConnectionType | ''>('');

  const { data: connections, isLoading, error } = useConnections(user?.id);
  const toggleVisibility = useToggleConnectionVisibility();

  // Filter connections
  const visibleConnections = showHidden
    ? connections
    : filterVisibleConnections(connections);

  const filteredConnections = typeFilter
    ? visibleConnections?.filter((c) => c.type === typeFilter)
    : visibleConnections;

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingConnection(undefined);
    setIsModalOpen(false);
  };

  const handleToggleVisibility = (connection: Connection) => {
    if (!user) return;
    toggleVisibility.mutate({
      userId: user.id,
      connectionId: connection.id,
      deleted: !connection.deleted,
    });
  };

  return (
    <>
      <PageMeta
        title="Connections | Quest"
        description="Manage your real estate contacts and connections"
      />

      <PageBreadcrumb pageTitle="Connections" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Connections
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filteredConnections?.length ?? 0} contacts
            </p>
          </div>
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
            New Connection
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ConnectionType | '')}
            className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
          >
            <option value="">All Types</option>
            {CONNECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

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

        {/* Connection Modal */}
        <ConnectionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          connection={editingConnection}
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
              Error loading connections. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredConnections?.length === 0 && (
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
              No connections found
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Add your first contact to start building your network.
            </p>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              Add Connection
            </Button>
          </div>
        )}

        {/* Connections Grid */}
        {!isLoading && !error && filteredConnections && filteredConnections.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredConnections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onEdit={handleEdit}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
