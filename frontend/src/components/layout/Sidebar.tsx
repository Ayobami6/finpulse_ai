"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, MessageSquare, Settings, AlertTriangle, Users } from "lucide-react";
import clsx from "clsx";
import styles from "./Sidebar.module.css";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Issues", href: "/issues", icon: AlertTriangle },
  { name: "Chats", href: "/chats", icon: MessageSquare },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <LayoutDashboard size={28} className="text-emerald-500" />
        <span>FinPulse AI</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(styles.navLink, {
                [styles.navLinkActive]: isActive,
              })}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
