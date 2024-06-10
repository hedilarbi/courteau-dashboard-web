import NavBackButton from "@/components/NavBackButton";
import SizesScreen from "@/components/SizesScreen";
import { getSizes } from "@/services/SizesServices";
import React from "react";

const page = async () => {
  const { data } = await getSizes();

  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <NavBackButton />
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Tailles
      </h1>
      <SizesScreen data={data} />
    </div>
  );
};

export default page;
