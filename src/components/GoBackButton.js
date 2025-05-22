"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

const GoBackButton = () => {
  const router = useRouter();
  return (
    <button
      className="bg-pr text-black  p-2 font-roboto font-semibold rounded-full"
      onClick={() => router.back()}
    >
      <FaArrowLeftLong />
    </button>
  );
};

export default GoBackButton;
