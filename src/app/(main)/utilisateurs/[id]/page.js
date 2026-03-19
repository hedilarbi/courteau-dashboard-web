import GoBackButton from "@/components/GoBackButton";
import UserGeneralInfo from "@/components/UserGeneralInfo";
import UserOrdersList from "@/components/UserOrdersList";
import UserStatsPanel from "@/components/UserStatsPanel";

import { getUser, getUserStats } from "@/services/UsersServices";
import React from "react";

const page = async ({ params }) => {
  const [userResponse, statsResponse] = await Promise.all([
    getUser(params.id),
    getUserStats(params.id),
  ]);

  const data = userResponse?.data || {};
  const stats = statsResponse?.data || null;

  return (
    <div className="w-full h-full p-4  flex flex-col relative max-h-screen overflow-y-auto">
      <div className="flex gap-4 items-center">
        <GoBackButton />
        <h2 className="text-2xl font-roboto font-semibold ">
          Informations generale
        </h2>
      </div>
      <UserGeneralInfo data={data} />
      <UserStatsPanel stats={stats} />
      <h2 className="text-2xl font-roboto font-semibold mt-8">Commandes</h2>
      <UserOrdersList orders={data.orders || []} />
    </div>
  );
};

export default page;
