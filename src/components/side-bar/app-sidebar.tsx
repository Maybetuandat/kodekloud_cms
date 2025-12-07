import * as React from "react";
import {
  HelpCircleIcon,
  Boxes,
  Tags,
  BookOpen,
  FlaskConical,
  User,
  Cpu,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { useAuth } from "@/contexts/auth-context";

export function AppSidebar({
  variant,
  ...props
}: { variant?: string } & React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();

  // Define nav items with role requirements
  const allNavItems = [
    {
      title: t("navigation.subject"),
      url: "/subjects",
      icon: Tags,
      isActive:
        location.pathname === "/" || location.pathname.startsWith("/subjects"),
      requiredRoles: ["ROLE_ADMIN", "ROLE_LECTURER"],
    },
    {
      title: t("navigation.courses"),
      url: "/courses",
      icon: BookOpen,
      isActive: location.pathname.startsWith("/courses"),
      requiredRoles: [], // All authenticated users
    },
    {
      title: t("navigation.labs"),
      url: "/labs",
      icon: FlaskConical,
      isActive: location.pathname.startsWith("/labs"),
      requiredRoles: [], // All authenticated users
    },
    {
      title: t("navigation.users"),
      url: "/users",
      icon: User,
      isActive: location.pathname.startsWith("/users"),
      requiredRoles: ["ROLE_ADMIN"],
    },
    {
      title: t("navigation.instancetypes"),
      url: "/instancetypes",
      icon: Cpu,
      isActive: location.pathname.startsWith("/instancetypes"),
      requiredRoles: ["ROLE_ADMIN"],
    },
  ];

  // Filter nav items based on user roles
  const navMain = allNavItems.filter((item) => {
    if (item.requiredRoles.length === 0) {
      return true; // Show to all authenticated users
    }
    return hasAnyRole(item.requiredRoles);
  });

  const data = {
    navMain: navMain.map(({ requiredRoles, ...item }) => item), // Remove requiredRoles from final output
    navSecondary: [
      {
        title: t("navigation.feedback"),
        url: "#",
        icon: HelpCircleIcon,
      },
    ],
  };

  return (
    <Sidebar
      collapsible="icon"
      variant={variant}
      {...props}
      className="border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Devops Infra"
              className="data-[slot=sidebar-menu-button]:!p-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Link to="/">
                <Boxes className="h-5 w-5 text-sidebar-primary" />
                <span className="text-base font-semibold text-sidebar-foreground">
                  Devops Infra
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
