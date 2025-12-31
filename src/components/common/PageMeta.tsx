import { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  // Use useEffect for reliable title updates during client-side navigation
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <Helmet>
      <meta name="description" content={description} />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
