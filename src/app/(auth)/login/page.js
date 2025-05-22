"use client";

import { create } from "@/actions";
import ErrorMessageModal from "@/components/modals/ErrorMessageModal";
import Spinner from "@/components/spinner/Spinner";
import { setStaffData, setStaffToken } from "@/redux/slices/StaffSlice";
import { loginStaff } from "@/services/staffServices";
import { useRouter } from "next/navigation";

import React, { useState } from "react";
import { useDispatch } from "react-redux";

const Page = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const login = async () => {
    setError("");
    if (!username || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    try {
      setIsLoading(true);
      const response = await loginStaff(username, password, "");
      if (response.status) {
        const { name, role, image, _id, restaurant } = response.data.staff;
        dispatch(setStaffData({ name, role, image, id: _id, restaurant }));
        dispatch(setStaffToken(response.data.token));

        await create(response.data);

        router.push("/dashboard");
      } else {
        setError(response.message);
      }
    } catch (e) {
      console.error(e);
      setError("Erreur de connexion");
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen bg-pr relative flex flex-col items-center justify-center">
      {isLoading && (
        <div className="absolute z-20 top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-30">
          <Spinner />
        </div>
      )}
      {error.length > 0 && <ErrorMessageModal error={error} />}
      <div className="w-full h-1/2 bg-black absolute top-0 left-0" />
      <div className="bg-[#EBEBEB] z-10 py-6 px-12 rounded-md font-roboto flex flex-col">
        <h1 className=" font-bold text-xl border-2 ">
          Se connecter avec nom d&apos;utilisateur
        </h1>
        <div className="mt-6 border-2 ">
          <input
            type="text"
            className="rounded-md  py-1 px-2 w-full"
            placeholder="Nom d'utilisateur"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>
        <div className="mt-4">
          <input
            type="password"
            className="rounded-md py-1 px-2 w-full"
            placeholder="Mot de passe"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <button
          className="mt-6 bg-pr px-8 py-1 rounded-md self-center font-semibold border-2"
          onClick={login}
        >
          Se connecter
        </button>
      </div>
    </main>
  );
};

export default Page;
