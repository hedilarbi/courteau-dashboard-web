import MenuItemsDetails from "@/components/MenuItemsDetails";
import NavBackButton from "@/components/NavBackButton";

import { getMenuItem } from "@/services/MenuItemServices";
import React from "react";

const page = async ({ params }) => {
  const { data } = await getMenuItem(params.id);
  return (
    <div className="w-full h-full p-4 bg flex flex-col overflow-y-auto text-text-dark-gray">
      <NavBackButton />
      <MenuItemsDetails data={data} />
    </div>
  );
};

export default page;
