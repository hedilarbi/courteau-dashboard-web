import RewardsScreen from "@/components/RewardsScreen";
import { getRewards } from "@/services/RewardServices";
import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const { data } = await getRewards();

  return (
    <div className="w-full h-full p-4  flex flex-col relative max-h-screen overflow-y-auto">
      <RewardsScreen data={data} />
    </div>
  );
};

export default page;
