import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import BlockedAccountForm from '../../components/auth/BlockedAccountForm';

export default function SubscriptionBlocked() {
  return (
    <>
      <PageMeta
        title="Subscription Inactive | Quest"
        description="Your Quest subscription requires attention"
      />
      <AuthLayout>
        <BlockedAccountForm />
      </AuthLayout>
    </>
  );
}
