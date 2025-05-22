import GoBackButton from "@/components/GoBackButton";
import UserGeneralInfo from "@/components/UserGeneralInfo";
import UserOrdersList from "@/components/UserOrdersList";

import { getUser } from "@/services/UsersServices";
import React from "react";

const page = async ({ params }) => {
  const { data } = await getUser(params.id);

  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <div className="flex gap-4 items-center">
        <GoBackButton />
        <h2 className="text-2xl font-roboto font-semibold ">
          Informations generale
        </h2>
      </div>
      <UserGeneralInfo data={data} />
      <h2 className="text-2xl font-roboto font-semibold mt-8">Commandes</h2>
      <UserOrdersList orders={data.orders} />
    </div>
  );
};

export default page;
