import SettingsScreen from "@/components/SettingsScreen";
import { getSettings } from "@/services/SettingsServices";

import React from "react";

const page = async () => {
  const { data } = await getSettings();

  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Parametres
      </h1>
      <SettingsScreen data={data} />
    </div>
  );
};

export default page;
