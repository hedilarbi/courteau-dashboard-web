import UsersScreen from "@/components/UsersScreen";
import { getUsers } from "@/services/UsersServices";
import React from "react";

const page = async () => {
  const { data } = await getUsers();

  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Utilisateurs
      </h1>
      <UsersScreen data={data} />
    </div>
  );
};

export default page;
