import NavBackButton from "@/components/NavBackButton";
import ToppingCategoriesScreen from "@/components/ToppingCategoriesScreen";
import { getToppingsCategories } from "@/services/ToppingsServices";
import React from "react";

const page = async () => {
  const { data } = await getToppingsCategories();
  return (
    <div>
      <div className="w-full h-screen p-4  flex flex-col relative">
        <div>
          <NavBackButton />
        </div>
        <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
          Categories
        </h1>
        <ToppingCategoriesScreen data={data} />
      </div>
    </div>
  );
};

export default page;
