import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | Quest"
        description="Create your Quest account to start evaluating investment properties"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
