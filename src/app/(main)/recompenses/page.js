import RewardsScreen from "@/components/RewardsScreen";
import { getRewards } from "@/services/RewardServices";
import React from "react";

const page = async () => {
  const { data } = await getRewards();

  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Recompenses
      </h1>
      <RewardsScreen data={data} />
    </div>
  );
};

export default page;
