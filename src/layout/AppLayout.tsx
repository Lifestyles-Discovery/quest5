import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import AppFooter from "../components/common/AppFooter";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="flex-1 p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 w-full">
          <Outlet />
        </div>
        <AppFooter />
      </div>
      {/* Signature watermark */}
      <img
        src="/images/damonjanis_signature.png"
        alt=""
        className="fixed bottom-4 right-8 w-14 md:w-18 lg:w-20 opacity-20 dark:opacity-30 pointer-events-none select-none z-[9999] dark:invert mix-blend-multiply dark:mix-blend-screen"
      />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
