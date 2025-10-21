// src/constants/category-map.ts
import { Container, Terminal, GitBranch } from "lucide-react";

export const categoryMap = {
  docker: {
    Icon: Container,
    gradient: "from-blue-400 to-blue-600",
    name: "Docker",
  },
  linux: {
    Icon: Terminal,
    gradient: "from-orange-400 to-orange-600",
    name: "Linux",
  },
  git: {
    Icon: GitBranch,
    gradient: "from-red-400 to-red-600",
    name: "Git",
  },
};
