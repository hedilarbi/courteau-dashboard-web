import NotificationScreen from "@/components/NotificationScreen";
import React from "react";

const page = () => {
  return (
    <div className="w-full h-full p-4  flex flex-col relative max-h-screen overflow-y-auto">
      <NotificationScreen />
    </div>
  );
};

export default page;
