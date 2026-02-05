import NavBackButton from "@/components/NavBackButton";
import SizesGroupsScreen from "@/components/SizesGroupsScreen";

import { getSizesGroups } from "@/services/sizesGroupeServices";

import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const { data } = await getSizesGroups();
  const groupsCount = Array.isArray(data) ? data.length : 0;

  return (
    <div className="bg-[#f5f7fb] min-h-screen max-h-screen overflow-y-auto font-roboto">
      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pr to-[#111827] text-white shadow-lg">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#ffffff,transparent_45%)]" />
          <div className="flex items-center justify-between gap-3 flex-wrap p-6">
            <div className="flex items-center gap-3 z-30">
              <NavBackButton />

              <div>
                <h1 className="text-3xl font-semibold">Groupes de tailles</h1>
                <p className="text-sm opacity-90 mt-1">
                  Associez vos tailles et créez des groupes cohérents.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/15 border border-white/20 text-sm px-3 py-1 rounded-full">
                {groupsCount} groupe(s)
              </span>
            </div>
          </div>
        </div>

        <SizesGroupsScreen data={data} />
      </div>
    </div>
  );
};

export default page;
