"use client";
import { getStaffData } from "@/actions";
import NavBar from "@/components/NavBar";
import Spinner from "@/components/spinner/Spinner";
import { selectStaffData, setStaffData } from "@/redux/slices/StaffSlice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const DashboardLayout = ({ children }) => {
  const staff = useSelector(selectStaffData);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(true);

  const getData = async () => {
    const data = await getStaffData();

    dispatch(setStaffData(data));
  };

  useEffect(() => {
    if (!staff || Object.keys(staff).length === 0) {
      getData().then(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <main className="flex w-screen h-screen">
      <NavBar />
      <section className="w-full h-full bg-slate-50">{children}</section>
    </main>
  );
};

export default DashboardLayout;
