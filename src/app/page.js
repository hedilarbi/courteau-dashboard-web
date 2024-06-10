"use client";

import { getToken } from "@/actions";
import { setStaffData, setStaffToken } from "@/redux/slices/StaffSlice";
import { getStaffByToken } from "@/services/staffServices";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import logo from "../../public/logo.png";
import Spinner from "@/components/spinner/Spinner";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const fetchToken = async () => {
    try {
      const { value } = await getToken();
      const token = value;

      if (token) {
        const response = await getStaffByToken(token);

        if (response.status) {
          dispatch(setStaffData(response.data));
          dispatch(setStaffToken(token));
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    } catch (err) {
      router.push("/login");
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return (
    <main className="  max-h-screen h-screen w-screen">
      <div className="flex w-full h-full bg-black justify-center items-center ">
        <div className="flex flex-col items-center space-y-4">
          <Image src={logo} alt="logo" width={250} height={100} />
          <Spinner />
        </div>
      </div>
    </main>
  );
}
