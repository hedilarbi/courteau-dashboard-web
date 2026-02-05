import EmplyeesScreen from "@/components/EmplyeesScreen";
import { getStaffMembers } from "@/services/staffServices";

import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const { data } = await getStaffMembers();

  return (
    <div className="w-full h-full p-4 max-h-screen overflow-y-auto flex flex-col relative">
      <EmplyeesScreen data={data} />
    </div>
  );
};

export default page;
