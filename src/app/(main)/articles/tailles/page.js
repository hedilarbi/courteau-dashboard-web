import NavBackButton from "@/components/NavBackButton";
import SizesScreen from "@/components/SizesScreen";
import { getSizes } from "@/services/SizesServices";
import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const { data } = await getSizes();
  const sizesCount = Array.isArray(data) ? data.length : 0;

  return (
    <div className="bg-[#f5f7fb] min-h-screen max-h-screen overflow-y-auto font-roboto">
      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <NavBackButton />

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pr to-[#111827] text-white shadow-lg">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#ffffff,transparent_45%)]" />
          <div className="relative p-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                  Catalogue
                </p>
                <h1 className="text-3xl font-semibold">Tailles</h1>
                <p className="text-sm opacity-90 mt-1">
                  Gérez vos tailles disponibles pour les articles.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/15 border border-white/20 text-sm px-3 py-1 rounded-full">
                  {sizesCount} taille(s)
                </span>
              </div>
            </div>
          </div>
        </div>

        <SizesScreen data={data} />
      </div>
    </div>
  );
};

export default page;
