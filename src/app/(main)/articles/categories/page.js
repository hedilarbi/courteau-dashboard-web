import CategoriesScreen from "@/components/CategoriesScreen";
import NavBackButton from "@/components/NavBackButton";

import { getCategories } from "@/services/MenuItemServices";
import React from "react";

const page = async () => {
  const { data } = await getCategories();

  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <NavBackButton />
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Categories
      </h1>
      <CategoriesScreen data={data} />
    </div>
  );
};

export default page;
