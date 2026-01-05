import PageMeta from '@components/common/PageMeta';
import PageBreadcrumb from '@components/common/PageBreadCrumb';
import { Card } from '@components/ui/card';
import { AccountForm } from '../components/AccountForm';
import { PreferencesForm } from '../components/PreferencesForm';
import { BillingSection } from '../components/BillingSection';

export default function SettingsPage() {
  return (
    <>
      <PageMeta
        title="Settings | Quest"
        description="Manage your account settings and preferences"
      />

      <PageBreadcrumb pageTitle="Settings" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account, preferences, and billing
          </p>
        </div>

        {/* Account Section */}
        <Card>
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Account
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your personal information and password
              </p>
            </div>
            <AccountForm />
          </div>
        </Card>

        {/* Preferences Section */}
        <Card>
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Preferences
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Customize your default settings
              </p>
            </div>
            <PreferencesForm />
          </div>
        </Card>

        {/* Billing Section */}
        <Card>
          <div className="p-4 sm:p-6">
            <BillingSection />
          </div>
        </Card>
      </div>
    </>
  );
}
