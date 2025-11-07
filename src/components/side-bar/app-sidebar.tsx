import * as React from "react";
import {
  HelpCircleIcon,
  Boxes,
  Home,
  Tags,
  BookOpen,
  FlaskConical,
  User,
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

export function AppSidebar({
  variant,
  ...props
}: { variant?: string } & React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { t } = useTranslation();

  const data = {
    navMain: [
      {
        title: t("navigation.subject"),
        url: "/subjects",
        icon: Tags,
        isActive:
          location.pathname == "/" || location.pathname.startsWith("/subjects"),
      },
      {
        title: t("navigation.courses"),
        url: "/courses",
        icon: BookOpen,
        isActive: location.pathname.startsWith("/courses"),
      },
      {
        title: t("navigation.labs"),
        url: "/labs",
        icon: FlaskConical,
        isActive: location.pathname.startsWith("/labs"),
      },
      {
        title: t("navigation.users"),
        url: "/users",
        icon: User,
        isActive: location.pathname.startsWith("/users"),
      },
    ],
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
