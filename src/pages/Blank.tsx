import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Blank() {
  return (
    <div>
      <PageMeta
        title="Dashboard | Quest"
        description="Quest - Real Estate Investment Analysis Platform"
      />
      <PageBreadcrumb pageTitle="Dashboard" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Welcome to Quest 5
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Your real estate investment analysis platform. This dashboard is under construction.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Properties</h4>
              <p className="text-2xl font-bold text-brand-500">--</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Evaluations</h4>
              <p className="text-2xl font-bold text-brand-500">--</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
