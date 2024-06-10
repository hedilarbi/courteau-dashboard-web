"use client";
import MenuItemsScreen from "@/components/MenuItemsScreen";
import Spinner from "@/components/spinner/Spinner";
import { selectStaffData } from "@/redux/slices/StaffSlice";
import { getCategories, getMenuItems } from "@/services/MenuItemServices";
import { getRestaurantItems } from "@/services/RestaurantServices";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Page = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { restaurant, role } = useSelector(selectStaffData);

  const fetchData = async () => {
    try {
      if (role === "admin") {
        const [categoriesResponse, menuItemResponse] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);

        if (categoriesResponse.status && menuItemResponse.status) {
          setCategories(categoriesResponse.data);
          setData(menuItemResponse.data);
        } else {
          setError(response.message);
        }
      } else {
        const [categoriesResponse, menuItemResponse] = await Promise.all([
          getCategories(),
          getRestaurantItems(restaurant),
        ]);

        if (categoriesResponse.status && menuItemResponse.status) {
          setCategories(categoriesResponse.data);
          setData(menuItemResponse.data.menu_items);
        } else {
          setError(response.message);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Articles
      </h1>
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <MenuItemsScreen
          data={data}
          role={role}
          restaurant={restaurant}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Page;
