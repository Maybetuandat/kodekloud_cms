import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { AppSidebar } from "@/components/side-bar/app-sidebar";
import { SiteHeader } from "@/components/side-bar/site-header";

// Component con để điều khiển sidebar
function SidebarController({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { setOpen, setOpenMobile } = useSidebar();
  const userInteracted = useRef(false);
  const lastRoute = useRef(location.pathname);

  // Reset user interaction flag when route changes
  useEffect(() => {
    if (lastRoute.current !== location.pathname) {
      userInteracted.current = false;
      lastRoute.current = location.pathname;
    }
  }, [location.pathname]);

  // Auto control sidebar only if user hasn't manually interacted
  useEffect(() => {
    // Không tự động điều khiển nếu user đã tương tác thủ công
    if (userInteracted.current) return;

    const isEditorRoute =
      location.pathname.includes("/question-detail/") ||
      location.pathname.includes("/contest-joined/");

    if (isEditorRoute) {
      // Thu sidebar vào khi vào editor
      setOpen(false);
      setOpenMobile(false);
    } else {
      // Mở sidebar khi ra khỏi editor
      setOpen(true);
    }
  }, [location.pathname, setOpen, setOpenMobile]);

  // Detect when user manually toggles sidebar
  useEffect(() => {
    const handleSidebarToggle = () => {
      userInteracted.current = true;
    };

    // Listen for sidebar trigger clicks
    const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]');
    if (sidebarTrigger) {
      sidebarTrigger.addEventListener("click", handleSidebarToggle);
      return () => {
        sidebarTrigger.removeEventListener("click", handleSidebarToggle);
      };
    }
  }, []);

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-hidden">{children}</main>
      </SidebarInset>
    </>
  );
}

export function MainLayout() {
  return (
    <SidebarProvider>
      <SidebarController>
        <Outlet />
      </SidebarController>
    </SidebarProvider>
  );
}
