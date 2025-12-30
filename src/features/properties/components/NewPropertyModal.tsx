import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Modal } from '@components/ui/modal';
import Input from '@components/form/input/InputField';
import Label from '@components/form/Label';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import { useCreatePropertyByAddress } from '@hooks/api/useProperties';
import { useCreateEvaluation } from '@hooks/api/useEvaluations';
import { useCreatePropertyFromSearch } from '@hooks/api/useSearch';
import { useMlsMarkets, useStates } from '@hooks/api/useAdmin';
import { useAuth } from '@context/AuthContext';

interface NewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreateMethod = 'address' | 'mls';

export function NewPropertyModal({ isOpen, onClose }: NewPropertyModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [method, setMethod] = useState<CreateMethod>('address');
  const [error, setError] = useState<string | null>(null);

  // Form state for address method
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Form state for MLS method
  const [mlsMarket, setMlsMarket] = useState(user?.preferences?.mlsMarket || '');
  const [mlsNumber, setMlsNumber] = useState('');

  // Queries for dropdowns
  const { data: mlsMarkets } = useMlsMarkets();
  const { data: states } = useStates();

  // Mutations
  const createByAddress = useCreatePropertyByAddress();
  const createEvaluation = useCreateEvaluation();
  const createPropertyFromSearch = useCreatePropertyFromSearch();

  const isPending =
    createByAddress.isPending ||
    createEvaluation.isPending ||
    createPropertyFromSearch.isPending;

  const resetForm = () => {
    setAddress('');
    setCity('');
    setState('');
    setZip('');
    setMlsNumber('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateByAddress = () => {
    setError(null);

    if (!address || !city || !state || !zip) {
      setError('Please fill in all address fields');
      return;
    }

    // Create property, then auto-create evaluation and navigate to it
    createByAddress.mutate(
      { address, city, state, zip },
      {
        onSuccess: (property) => {
          // Auto-create first evaluation
          createEvaluation.mutate(property.id, {
            onSuccess: (evaluation) => {
              handleClose();
              navigate(`/deals/${property.id}/scenario/${evaluation.id}`);
            },
            onError: () => {
              // Property created but evaluation failed - still navigate
              handleClose();
              navigate(`/deals/${property.id}`);
            },
          });
        },
        onError: () => {
          setError(`Could not find property at ${address}, ${city}, ${state} ${zip}`);
        },
      }
    );
  };

  const handleCreateByMls = () => {
    setError(null);

    if (!mlsMarket || !mlsNumber) {
      setError('Please select a market and enter an MLS number');
      return;
    }

    // Use combined endpoint that creates property + evaluation in one call
    createPropertyFromSearch.mutate(
      { mlsMarket, mlsNumber },
      {
        onSuccess: (result) => {
          handleClose();
          navigate(`/deals/${result.propertyId}/scenario/${result.id}`);
        },
        onError: () => {
          setError(`Could not find property with MLS# ${mlsNumber} in ${mlsMarket}`);
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          New Deal
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add a deal by address or MLS number
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error" message={error} />
        </div>
      )}

      {/* Method Toggle */}
      <div className="mb-6 flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => setMethod('address')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            method === 'address'
              ? 'bg-white text-gray-800 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          By Address
        </button>
        <button
          type="button"
          onClick={() => setMethod('mls')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            method === 'mls'
              ? 'bg-white text-gray-800 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          By MLS #
        </button>
      </div>

      {/* Address Form */}
      {method === 'address' && (
        <div className="space-y-4">
          <div>
            <Label>Street Address</Label>
            <Input
              type="text"
              placeholder="123 Main St"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div>
              <Label>State</Label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={isPending}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
              >
                <option value="">Select state</option>
                {states?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input
                type="text"
                placeholder="12345"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateByAddress} disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </div>
      )}

      {/* MLS Form */}
      {method === 'mls' && (
        <div className="space-y-4">
          <div>
            <Label>MLS Market</Label>
            <select
              value={mlsMarket}
              onChange={(e) => setMlsMarket(e.target.value)}
              disabled={isPending}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            >
              <option value="">Select a market</option>
              {mlsMarkets?.map((market) => (
                <option key={market.acronym} value={market.acronym}>
                  {market.acronym} - {market.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>MLS Number</Label>
            <Input
              type="text"
              placeholder="Enter MLS number"
              value={mlsNumber}
              onChange={(e) => setMlsNumber(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateByMls} disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
