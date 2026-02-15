"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, MessageSquare, Settings, AlertTriangle, Users, FileText, Menu, X } from "lucide-react";
import clsx from "clsx";
import styles from "./Sidebar.module.css";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Issues", href: "/issues", icon: AlertTriangle },
  { name: "Chats", href: "/chats", icon: MessageSquare },
  { name: "Logs", href: "/logs", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={clsx(styles.sidebar, { [styles.open]: isOpen })}>
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
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
