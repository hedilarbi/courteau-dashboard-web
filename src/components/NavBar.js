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
  const dispatch = useDispatch();
  const router = useRouter();
  const list = NavItemsList();
  const currentPath = pathname.split("/")[1];
  const list2 = NavItemListCashier();
  const staff = useSelector(selectStaffData);

  const [isLoading, setIsLoading] = React.useState(true);

  const getData = async () => {
    const data = await getStaffData();

    dispatch(setStaffData(data));
  };

  useEffect(() => {
    if (!staff || Object.keys(staff).length === 0) {
      getData().then(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const logoutStaff = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="w-1/4 bg-black h-full flex flex-col justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-1/4 bg-black h-full py-2 overflow-y-auto flex flex-col">
      <div className="flex justify-center bg-black">
        <Image src={logo} alt="logo" width={150} height={80} />
      </div>
      {staff.role === "admin" ? (
        <ul className="mt-2 space-y-2 flex-1 overflow-y-auto ">
          {list.map((item) => (
            <li key={item.id} className="bg-pr">
              <Link
                href={`${item.path}`}
                className={
                  "/" + currentPath === item.path
                    ? "px-4 py-4 flex items-center bg-pr font-roboto font-semibold text-black "
                    : "px-4 py-4  flex items-center hover:bg-pr hover:text-black font-roboto font-semibold bg-black text-pr"
                }
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-2 space-y-2 overflow-y-auto flex-1 ">
          {list2.map((item) => (
            <li key={item.id} className="bg-pr">
              <Link
                href={`${item.path}`}
                className={
                  "/" + currentPath === item.path
                    ? "px-4 py-4 flex items-center bg-pr font-roboto font-semibold text-black "
                    : "px-4 py-4  flex items-center hover:bg-pr hover:text-black font-roboto font-semibold bg-black text-pr"
                }
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="w-full px-2 mt-4">
        <div className="flex  bg-pr items-center w-full gap-3 px-4 py-2">
          <div className="h-14 w-14 bg-black flex justify-center items-center rounded-md text-pr text-2xl">
            {staff.image ? (
              <Image
                src={staff.image}
                alt="profile"
                width={50}
                height={50}
                className="rounded-full"
              />
            ) : (
              staff.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-left font-roboto flex-1 ">
            <p className="font-bold ">Bienvenu</p>
            <p className="capitalize">{staff.name}</p>
          </div>
          <button onClick={logoutStaff}>
            <IoLogOut size={36} color="black" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
