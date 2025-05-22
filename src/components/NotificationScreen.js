"use client";
import React, { useEffect, useState } from "react";
import SpinnerModal from "./modals/SpinnerModal";
import Spinner from "./spinner/Spinner";
import { getItemsNames } from "@/services/MenuItemServices";
import { sendNotifications } from "@/services/RestaurantServices";
import { sendSMS } from "@/services/NotifyServices";

const NotificationScreen = () => {
  const [mode, setMode] = useState("notification");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [isDataLoading, setDataLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [menuItem, setMenuItem] = useState(null);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const response = await getItemsNames();
      if (response.status) {
        let list = [{ value: "", label: "Aucun" }];
        response.data.map((item) => {
          list.push({ value: item._id, label: item.name });
        });
        console.log(list);
        setMenuItems(list);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setDataLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const send = async () => {
    setIsLoading(true);
    try {
      let response;
      if (mode === "notification") {
        response = await sendNotifications(title, content, menuItem);
      } else if (mode === "message") {
        response = await sendSMS(content);
      }
      // else if (mode === "email") {
      //   response = await sendEmails(title, content);
      // }

      if (response.status) {
        setTitle("");
        setContent("");
        setMenuItem(null);
        setIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setIsLoading(false);
        setShowFailModel(true);
      }
    } catch (error) {
      setIsLoading(false);
      setShowFailModel(true);
      console.log(error);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);
  useEffect(() => {
    if (showFailModel) {
      const timer = setTimeout(() => {
        setShowFailModel(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModel]);

  if (isDataLoading) {
    return (
      <div className="w-full flex justify-center items-center  h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full flex  h-screen  relative">
      {isLoading && <SpinnerModal />}
      <div className="flex w-full gap-6  font-roboto mt-4">
        <div className=" w-1/3 flex flex-col  h-full space-y-4">
          <button
            className={
              mode === "notification"
                ? "bg-pr border-2 border-pr rounded-md flex justify-center py-4 font-roboto font-semibold text-lg w-full"
                : "bg-transparent border-2 border-pr rounded-md flex justify-center py-4 font-roboto font-semibold text-lg w-full"
            }
            onClick={() => setMode("notification")}
          >
            Notification
          </button>
          <button
            className={
              mode === "message"
                ? "bg-pr border-2 border-pr rounded-md flex justify-center py-4  font-roboto font-semibold text-lg  w-full"
                : "bg-transparent border-2 border-pr rounded-md flex justify-center py-4  font-roboto font-semibold text-lg w-full"
            }
            onClick={() => setMode("message")}
          >
            Message
          </button>
          <button
            className={
              mode === "email"
                ? "bg-pr border-2 border-pr rounded-md flex justify-center py-4  font-roboto font-semibold text-lg w-full"
                : "bg-transparent border-2 border-pr rounded-md flex justify-center py-4  font-roboto font-semibold text-lg w-full"
            }
            onClick={() => setMode("email")}
          >
            Email
          </button>
        </div>
        <div className="flex-1 h-full border-2 border-pr rounded-md p-4 font-roboto ">
          {mode === "notification" && (
            <div className="h-full w-full">
              <h1 className="text-2xl font-roboto font-semibold">
                Envoyer des notifications
              </h1>
              <div className="space-y-2">
                <label htmlFor="" className="font-roboto">
                  Titre
                </label>
                <input
                  type="text"
                  className="w-full border border-black p-3 rounded-md"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2 mt-4 ">
                <label htmlFor="">Contenu</label>
                <textarea
                  className="w-full border border-black rounded-md p-3"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="space-y-2 mt-4 ">
                <label htmlFor="">Sélectionner un article</label>
                <select
                  className="w-full border border-black rounded-md p-3"
                  onChange={(e) => setMenuItem(e.target.value)}
                >
                  {menuItems.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-pr text-black px-4 py-2 rounded-md mt-4"
                  onClick={send}
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}
          {mode === "message" && (
            <div className="h-full w-full">
              <h1 className="text-2xl font-roboto font-semibold">
                Envoyer des SMSs
              </h1>

              <div className="space-y-2 mt-4 ">
                <label htmlFor="">Contenu</label>
                <textarea
                  className="w-full border border-black rounded-md p-3"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-pr text-black px-4 py-2 rounded-md mt-4"
                  onClick={send}
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}
          {mode === "email" && (
            <div className="h-full w-full">
              <p>En cours de developement </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationScreen;
