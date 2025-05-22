"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import logo from "../../public/logo.png";
import NavItemsList from "@/constants/navItemsList";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoLogOut } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { selectStaffData, setStaffData } from "@/redux/slices/StaffSlice";
import NavItemListCashier from "@/constants/navItemsListCashier";
import { getStaffData, logout } from "@/actions";
import Spinner from "./spinner/Spinner";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();

  const router = useRouter();
  const list = NavItemsList();
  const currentPath = pathname.split("/")[1];
  const list2 = NavItemListCashier();

  const logoutStaff = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="w-1/4 bg-[#2E2E2E] h-full  overflow-y-auto flex flex-col">
      <div className="flex justify-center bg-black py-2">
        <Image src={logo} alt="logo" width={150} height={80} />
      </div>

      <ul className="mt-2 space-y-2 flex-1 overflow-y-auto ">
        {list.map((item) => (
          <li key={item.id} className="bg-pr">
            <Link
              href={`${item.path}`}
              className={
                "/" + currentPath === item.path
                  ? "px-4 py-4 flex items-center bg-pr font-roboto font-semibold text-black "
                  : "px-4 py-4  flex items-center hover:bg-pr hover:text-black font-roboto font-semibold bg-[#2E2E2E] text-pr"
              }
            >
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="bg-black py-4 w-full px-4 ">
        <button
          onClick={logoutStaff}
          className="flex  bg-black  border-2 border-pr rounded-md items-center justify-between  px-4 py-2 w-full "
        >
          <span className="font-roboto font-semibold text-lg text-pr">
            Déconnexion
          </span>
          <IoLogOut size={36} color="#F7A600" />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
