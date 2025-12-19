import {
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
  Loader2,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
import { UserInfo } from "@/types/user";
import { getUserFromToken, isTokenExpired } from "@/utils/jwt";

const getUserInfoFromToken = (): UserInfo | null => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      return null;
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem("authToken");
      return null;
    }

    const userData = getUserFromToken(token);

    if (!userData) {
      return null;
    }

    return {
      id: userData.id.toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      fullName: `${userData.firstName} ${userData.lastName}`.trim(),
      isPremium: userData.roles?.includes("PREMIUM") || false,
    };
  } catch (error) {
    console.error("Error getting user info from token:", error);
    return null;
  }
};

export function NavUser() {
  const { t } = useTranslation("common");
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = () => {
      try {
        const userData = getUserInfoFromToken();

        if (mounted) {
          setUserInfo(userData);

          if (!userData) {
            navigate("/login", { replace: true });
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        if (mounted) {
          navigate("/login", { replace: true });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleAccountClick = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      localStorage.removeItem("authToken");

      await new Promise((resolve) => setTimeout(resolve, 500));

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);

      localStorage.removeItem("authToken");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const getInitials = (user: UserInfo | null): string => {
    if (!user) return "U";

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.fullName[0].toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (user: UserInfo | null): string => {
    if (!user) return "User";
    return (
      user.fullName ||
      `${user.firstName} ${user.lastName}`.trim() ||
      user.username ||
      "User"
    );
  };

  const getEmail = (user: UserInfo | null): string => {
    return user?.email || "user@example.com";
  };

  const displayName = getDisplayName(userInfo);
  const initials = getInitials(userInfo);
  const email = getEmail(userInfo);
  const isPremium = userInfo?.isPremium || false;

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
            <Loader2 className="ml-auto size-4 animate-spin" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

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
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
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
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick}>
                <UserCircleIcon />
                {t("sidebar.account")}
              </DropdownMenuItem>
              {isPremium && (
                <DropdownMenuItem>
                  <span className="text-yellow-600 font-medium">
                    ✨ {t("sidebar.premiumAccount")}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <ThemeSettingsPanel
              variant="dialog"
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Settings />
                  {t("sidebar.settings")}
                </DropdownMenuItem>
              }
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              {t("sidebar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
