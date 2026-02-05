import RestaurantsScreen from "@/components/RestaurantsScreen";
import RewardsScreen from "@/components/RewardsScreen";
import { getRestaurants } from "@/services/RestaurantServices";

import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const { data } = await getRestaurants();

  return (
    <div className="w-full h-full p-4  flex flex-col relative max-h-screen overflow-y-auto">
      <RestaurantsScreen data={data} />
    </div>
  );
};

export default page;
