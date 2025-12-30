import { useState } from 'react';
import PageMeta from '@components/common/PageMeta';
import PageBreadcrumb from '@components/common/PageBreadCrumb';
import { Card } from '@components/ui/card';
import { UsersList } from '../components/UsersList';
import { UsageStats } from '../components/UsageStats';

type AdminTab = 'users' | 'usage';

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  {
    id: 'users',
    label: 'Users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    id: 'usage',
    label: 'Usage Stats',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  return (
    <>
      <PageMeta
        title="Admin | Quest"
        description="Manage users and view usage statistics"
      />

      <PageBreadcrumb pageTitle="Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage users and view usage statistics
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-500'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={tab.icon}
                  />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <Card>
          <div className="p-6">
            {activeTab === 'users' && <UsersList />}
            {activeTab === 'usage' && <UsageStats />}
          </div>
        </Card>
      </div>
    </>
  );
}
