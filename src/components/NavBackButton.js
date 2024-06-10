"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
const NavBackButton = () => {
  const router = useRouter();
  return (
    <button
      className="flex justify-center items-center w-9 h-9  bg-black text-pr rounded-full mb-4"
      onClick={() => router.back()}
    >
      <FaArrowLeftLong size={20} />
    </button>
  );
};

export default NavBackButton;
