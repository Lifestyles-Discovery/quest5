import { useState } from 'react';
import { Modal } from '@components/ui/modal';
import Button from '@components/ui/button/Button';
import { useConnections, useAddConnectionToProperty } from '@hooks/api/useConnections';
import { useAuth } from '@context/AuthContext';
import { ConnectionModal } from '@/features/connections/components/ConnectionModal';
import type { Connection } from '@app-types/connection.types';

interface ConnectionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  existingConnectionIds: string[];
}

export function ConnectionPickerModal({
  isOpen,
  onClose,
  propertyId,
  existingConnectionIds,
}: ConnectionPickerModalProps) {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allConnections, isLoading } = useConnections(user?.id);
  const addConnection = useAddConnectionToProperty();

  // Filter out already-linked connections and apply search
  const availableConnections = (allConnections || [])
    .filter((c: Connection) => !c.deleted && !existingConnectionIds.includes(c.id))
    .filter(
      (c: Connection) =>
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSelectConnection = (connectionId: string) => {
    addConnection.mutate(
      { propertyId, connectionId },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleConnectionCreated = (connectionId: string) => {
    // Automatically add the new connection to the property
    addConnection.mutate(
      { propertyId, connectionId },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          onClose();
        },
        onError: () => {
          // If adding fails, still close the create modal (connection was created)
          setShowCreateModal(false);
        },
      }
    );
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Add Contact to Deal
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select from your contacts or create a new one
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
          />
        </div>

        {/* Connection List */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading contacts...</div>
          ) : availableConnections.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No matching contacts found'
                : allConnections?.length === existingConnectionIds.length
                  ? 'All your contacts are already linked to this deal'
                  : 'No contacts available. Create one below.'}
            </div>
          ) : (
            <div className="space-y-2">
              {availableConnections.map((connection: Connection) => (
                <button
                  key={connection.id}
                  onClick={() => handleSelectConnection(connection.id)}
                  disabled={addConnection.isPending}
                  className="w-full rounded-lg border border-gray-200 p-3 text-left hover:border-brand-300 hover:bg-brand-50 disabled:opacity-50 dark:border-gray-700 dark:hover:border-brand-600 dark:hover:bg-brand-900/20"
                >
                  <div className="font-medium text-gray-800 dark:text-white">
                    {connection.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {connection.type}
                    {connection.email && ` · ${connection.email}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            + Create New Contact
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Create Connection Modal */}
      <ConnectionModal
        isOpen={showCreateModal}
        onClose={handleCreateModalClose}
        onCreated={handleConnectionCreated}
      />
    </>
  );
}
