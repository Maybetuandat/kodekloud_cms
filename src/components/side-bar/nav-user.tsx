import {
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
  Loader2,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeSettingsPanel } from "@/components/theme/theme-settings-panel";

export function NavUser() {
  const { t } = useTranslation("common");
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { user, logout, loading, isAdmin } = useAuth();

  const handleAccountClick = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      toast.success("Đăng xuất thành công", {
        description: "Hẹn gặp lại bạn!",
      });

      logout();

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout anyway
      logout();
      navigate("/login", { replace: true });
    }
  }, [navigate, logout]);

  // Helper functions for user display
  const getInitials = (): string => {
    if (!user) return "U";

    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return "U";
  };

  const getDisplayName = (): string => {
    if (!user) return "User";
    return user.username || user.email || "User";
  };

  const getEmail = (): string => {
    return user?.email || "user@example.com";
  };

  // Show loading skeleton
  if (loading && !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="animate-pulse">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Main render with real user data
  const displayName = getDisplayName();
  const initials = getInitials();
  const email = getEmail();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-blue-600 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full font-medium">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-blue-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleAccountClick}
                className="cursor-pointer"
              >
                <UserCircleIcon className="mr-2 h-4 w-4" />
                {t("sidebar.account")}
              </DropdownMenuItem>

              <ThemeSettingsPanel
                variant="popover"
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {t("sidebar.settings")}
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              {t("sidebar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
