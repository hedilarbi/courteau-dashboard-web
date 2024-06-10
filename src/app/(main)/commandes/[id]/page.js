import OrderDetails from "@/components/OrderDetails";
import OrderGeneralInfo from "@/components/OrderGeneralInfo";
import { getOrder } from "@/services/OrdersServices";
import React from "react";

const Page = async ({ params }) => {
  const { data } = await getOrder(params.id);

  return (
    <div className="w-full h-full p-4 bg flex flex-col overflow-y-auto text-text-dark-gray">
      <OrderDetails data={data} />
    </div>
  );
};

export default Page;
