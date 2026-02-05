import NavBackButton from "@/components/NavBackButton";
import ToppingCategoriesScreen from "@/components/ToppingCategoriesScreen";
import { getToppingsCategories } from "@/services/ToppingsServices";
import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const { data } = await getToppingsCategories();
  const categoriesCount = Array.isArray(data) ? data.length : 0;
  return (
    <div className="bg-[#f5f7fb] min-h-screen max-h-screen overflow-y-auto font-roboto">
      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pr to-[#111827] text-white shadow-lg">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#ffffff,transparent_45%)]" />
          <div className="relative p-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <NavBackButton />
                <div>
                  <h1 className="text-3xl font-semibold">
                    Catégories de personnalisations
                  </h1>
                  <p className="text-sm opacity-90 mt-1">
                    Structurez vos options par famille.
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
        </div>

        <ToppingCategoriesScreen data={data} />
      </div>
    </div>
  );
};

export default page;
