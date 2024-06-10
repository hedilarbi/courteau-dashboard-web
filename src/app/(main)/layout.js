import NavBar from "@/components/NavBar";
import React from "react";

const DashboardLayout = ({ children }) => {
  return (
    <main className="flex w-screen h-screen">
      <NavBar />
      <section className="w-full h-full">{children}</section>
    </main>
  );
};

export default DashboardLayout;
