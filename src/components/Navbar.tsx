"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp, LayoutDashboard, Briefcase, Star,
  LogOut, User, Menu, X,
} from "lucide-react";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio",  icon: Briefcase },
  { href: "/watchlist", label: "Watchlist",  icon: Star },
];

export default function Navbar() {
  const { user, logout }  = useAuth();
  const pathname          = usePathname();
  const router            = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => { setTimeout(() => setMenuOpen(false), 0); }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/dashboard" className={styles.logo}>
            <TrendingUp size={20} color="var(--accent-blue)" />
            <span>TradeSense <strong>Pro</strong></span>
          </Link>

          {/* Desktop nav links */}
          <div className={styles.links}>
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.link} ${pathname.startsWith(href) ? styles.active : ""}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop user section */}
          {user && (
            <div className={styles.user}>
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? "User"}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarFallback}><User size={15} /></div>
              )}
              <span className={styles.userName}>{user.displayName?.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className={`btn btn-ghost btn-sm btn-icon ${styles.logout}`}
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className={`btn btn-ghost btn-icon ${styles.hamburger}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className={styles.drawer}>
          <div className={styles.drawerLinks}>
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.drawerLink} ${pathname.startsWith(href) ? styles.drawerActive : ""}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
          {user && (
            <div className={styles.drawerUser}>
              <span className={styles.drawerEmail}>{user.email}</span>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
