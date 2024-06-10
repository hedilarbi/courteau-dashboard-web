import RestaurantsScreen from "@/components/RestaurantsScreen";
import RewardsScreen from "@/components/RewardsScreen";
import { getRestaurants } from "@/services/RestaurantServices";

import React from "react";

const page = async () => {
  const { data } = await getRestaurants();

  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Restaurants
      </h1>
      <RestaurantsScreen data={data} />
    </div>
  );
};

export default page;
