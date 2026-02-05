import CategoriesScreen from "@/components/CategoriesScreen";
import NavBackButton from "@/components/NavBackButton";

import { getCategories } from "@/services/MenuItemServices";
import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const { data } = await getCategories();
  const categoriesCount = Array.isArray(data) ? data.length : 0;

  return (
    <div className="bg-[#f5f7fb] min-h-screen max-h-screen overflow-y-auto font-roboto">
      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pr to-[#111827] text-white shadow-lg">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#ffffff,transparent_45%)]" />
          <div className="flex items-center justify-between gap-3 flex-wrap p-6">
            <div className="flex items-center gap-3 z-30">
              <NavBackButton />

              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                  Catalogue
                </p>
                <h1 className="text-3xl font-semibold">Catégories</h1>
                <p className="text-sm opacity-90 mt-1">
                  Gérez l&apos;image et le nom de vos catégories.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/15 border border-white/20 text-sm px-3 py-1 rounded-full">
                {categoriesCount} catégorie(s)
              </span>
            </div>
          </div>
        </div>

        <CategoriesScreen data={data} />
      </div>
    </div>
  );
};

export default page;
