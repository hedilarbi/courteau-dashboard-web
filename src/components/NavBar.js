"use client";
import Image from "next/image";
import React from "react";
import logo from "../../public/logo.png";
import NavItemsList from "@/constants/navItemsList";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoLogOut } from "react-icons/io5";

import { logout } from "@/actions";

import { useRouter } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();

  const router = useRouter();
  const list = NavItemsList();
  const currentPath = pathname.split("/")[1];

  const logoutStaff = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="w-1/4 bg-[#0f172a] h-full overflow-y-auto flex flex-col border-r border-white/5 shadow-xl">
      <div className="flex flex-col items-center gap-2 bg-gradient-to-r from-pr to-[#111827] py-4 px-3 shadow">
        <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex items-center gap-3 w-full justify-center">
          <Image src={logo} alt="logo" width={130} height={64} />
        </div>
      </div>

      <ul className="mt-3 flex-1 overflow-y-auto px-3 space-y-1">
        {list.map((item) => {
          const isActive = "/" + currentPath === item.path;
          return (
            <li key={item.id}>
              <Link
                href={`${item.path}`}
                className={`group flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                  isActive
                    ? "bg-pr text-[#0f172a] shadow-md"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                    isActive
                      ? "border-[#0f172a] bg-white/20"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="font-roboto font-semibold text-sm">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-white/50 group-hover:text-white/70">
                    {item.subtitle || ""}
                  </span>
                </div>
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#0f172a]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="bg-[#0b1120] py-4 w-full px-4 border-t border-white/5">
        <button
          onClick={logoutStaff}
          className="flex bg-white/5 border border-white/10 rounded-lg items-center justify-between px-4 py-2 w-full text-white hover:border-pr hover:bg-pr/10 transition"
        >
          <span className="font-roboto font-semibold text-sm">Déconnexion</span>
          <IoLogOut size={22} color="#F7A600" />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
