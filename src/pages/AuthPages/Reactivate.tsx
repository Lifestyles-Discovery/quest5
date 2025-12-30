import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import ReactivateForm from '../../components/auth/ReactivateForm';

export default function Reactivate() {
  return (
    <>
      <PageMeta
        title="Reactivate Account | Quest"
        description="Reactivate your Quest subscription"
      />
      <AuthLayout>
        <ReactivateForm />
      </AuthLayout>
    </>
  );
}
