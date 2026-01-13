import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-lg px-8">
              <Link to="/" className="block mb-4 bg-white rounded-lg p-4">
                <img
                  src="/images/logo/quest-logo-small.png"
                  alt="Quest Logo"
                  className="h-12 object-contain"
                />
              </Link>
              <p className="text-center text-gray-400 dark:text-white/60 mb-8">
                The Lifestyles Unlimited Single Family Property Evaluation Tool
              </p>
              <div className="w-full">
                <h2 className="text-xl font-semibold text-white dark:text-white/90 text-center mb-2">
                  New Quest Orientation
                </h2>
                <p className="text-sm text-gray-400 dark:text-white/60 text-center mb-4">
                  There's a new Quest! Watch this video to get familiar and up-to-speed quickly.
                </p>
                <div className="aspect-video overflow-hidden rounded-lg shadow-lg">
                  <iframe
                    src="https://fast.wistia.net/embed/iframe/1ubgx153s0"
                    title="New Quest Orientation"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
