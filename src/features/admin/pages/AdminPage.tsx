import PageMeta from '@components/common/PageMeta';
import PageBreadcrumb from '@components/common/PageBreadCrumb';
import { UsersList } from '../components/UsersList';

export default function AdminPage() {
  return (
    <>
      <PageMeta
        title="Super Admin | Quest"
        description="Manage users"
      />

      <PageBreadcrumb pageTitle="Super Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Super Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage users
          </p>
        </div>

        {/* Users List */}
        <UsersList />
      </div>
    </>
  );
}
