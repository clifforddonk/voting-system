"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  {
    section: "MAIN MENU",
    links: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        label: "Elections",
        href: "/admin/dashboard/elections",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        label: "Voters",
        href: "/admin/dashboard/voters",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5.356-3.712M9 20H4v-2a4 4 0 015.356-3.712M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0zm-18 0a3 3 0 116 0 3 3 0 01-6 0z" />
          </svg>
        ),
      },
      // {
      //   label: "Candidates",
      //   href: "/admin/dashboard/candidates",
      //   icon: (
      //     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A8.966 8.966 0 0112 15a8.966 8.966 0 016.879 2.804M12 12a4 4 0 100-8 4 4 0 000 8z" />
      //     </svg>
      //   ),
      // },
      {
        label: "Results",
        href: "/admin/dashboard/results",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ],
  },
  // {
  //   section: "SYSTEM",
  //   links: [
  //     {
  //       label: "Settings",
  //       href: "/admin/dashboard/settings",
  //       icon: (
  //         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  //         </svg>
  //       ),
  //     },
  //   ],
  // },
];

// Hamburger icon
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

function SidebarContent({
  pathname,
  onNavClick,
}: {
  pathname: string;
  onNavClick?: () => void;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full py-6 px-3">
      {navItems.map((group) => (
        <div key={group.section} className="mb-6">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase px-3 mb-2">
            {group.section}
          </p>
          <nav className="flex flex-col gap-0.5">
            {group.links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavClick}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: active ? "#EEF0FE" : "transparent",
                    color: active ? "#4A5BE0" : "#6b7280",
                    borderLeft: active ? "3px solid #4A5BE0" : "3px solid transparent",
                  }}
                >
                  <span style={{ color: active ? "#4A5BE0" : "#9ca3af" }}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      <div className="mt-auto px-3">
      

        <div style={{ padding: "16px", borderTop: "0.5px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session?.user?.email}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              width: "100%", padding: "8px", borderRadius: "8px",
              border: "0.5px solid #e2e8f0", background: "#f8fafc",
              color: "#64748b", fontSize: "12px", cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      

      
    </div>

      
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top accent bar */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, #5B6BF8, #4A5BE0, #3A4BC8)" }} />

      {/* Top nav bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100 bg-white z-30 relative">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <HamburgerIcon open={mobileOpen} />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#5B6BF8" }} />
              <span className="font-semibold text-sm" style={{ color: "#4A5BE0" }}>QuickVote</span>
            <span className="text-gray-300 text-sm mx-1">/</span>
            <span className="text-sm text-gray-400 font-medium">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden sm:block text-sm text-gray-500">
            {session?.user?.email ?? "admin@school.edu"}
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #5B6BF8, #3A4BC8)" }}
          >
            {initials}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Mobile overlay ── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Mobile drawer ── */}
        <aside
          className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-xl z-30 transform transition-transform duration-250 ease-in-out md:hidden"
          style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
        >
          {/* Drawer header */}
          <div style={{ height: "3px", background: "linear-gradient(90deg, #5B6BF8, #4A5BE0, #3A4BC8)" }} />
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: "#5B6BF8" }} />
              <span className="font-semibold text-sm" style={{ color: "#4A5BE0" }}>QuickVote</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarContent pathname={pathname} onNavClick={() => setMobileOpen(false)} />
        </aside>

        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:flex w-56 shrink-0 border-r border-gray-100 bg-white flex-col">
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}