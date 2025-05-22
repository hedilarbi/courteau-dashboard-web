import NotificationScreen from "@/components/NotificationScreen";
import React from "react";

const page = () => {
  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Notifications
      </h1>
      <NotificationScreen />
    </div>
  );
};

export default page;
