import {
  Home,
  Cable,
  Zap,
  Gauge,
  Cpu,
  Box,
  Sun,
  Building2,
  Flame,
  FileText,
  Bot,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Cable, label: "Cable Size", path: "/cable-size" },
  { icon: Zap, label: "Voltage Drop", path: "/voltage-drop" },
  { icon: Gauge, label: "Load Calculator", path: "/load" },
  { icon: Cpu, label: "Motor Current", path: "/motor-current" },
  { icon: Box, label: "Transformer", path: "/transformer" },
  { icon: Sun, label: "Solar", path: "/solar" },
  { icon: Building2, label: "Civil", path: "/civil" },
  { icon: Flame, label: "Fire Fighting", path: "/fire" },
  { icon: FileText, label: "PDF Tools", path: "/pdf-tools" },
  { icon: Bot, label: "AI Engineer", path: "/ai" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r bg-white dark:bg-gray-900">
      <div className="p-5">
        <h2 className="text-xl font-bold">EngineerHub</h2>
      </div>

      <nav className="px-3 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 dark:hover:bg-gray-800"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}