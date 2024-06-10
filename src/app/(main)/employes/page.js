import EmplyeesScreen from "@/components/EmplyeesScreen";
import { getStaffMembers } from "@/services/staffServices";

import React from "react";

const page = async () => {
  const { data } = await getStaffMembers();

  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Employes
      </h1>
      <EmplyeesScreen data={data} />
    </div>
  );
};

export default page;
