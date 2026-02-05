"use client";
import React, { useEffect, useState } from "react";
import SpinnerModal from "./modals/SpinnerModal";
import Spinner from "./spinner/Spinner";
import { getItemsNames } from "@/services/MenuItemServices";
import { sendNotifications } from "@/services/RestaurantServices";
import { sendSMS } from "@/services/NotifyServices";
import { FaBell, FaEnvelope, FaMobileAlt } from "react-icons/fa";

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
    <div className="w-full flex relative font-roboto bg-[#f5f7fb] ">
      {isLoading && <SpinnerModal />}
      <div className=" mx-auto  flex flex-col gap-4 w-full">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">Notifications</h1>
              <p className="text-sm opacity-90 mt-1">
                Envoyez des push, SMS ou emails ciblés.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
                {mode === "notification"
                  ? "Push"
                  : mode === "message"
                  ? "SMS"
                  : "Email (à venir)"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "notification", label: "Notification", icon: <FaBell /> },
              { key: "message", label: "SMS", icon: <FaMobileAlt /> },
              { key: "email", label: "Email", icon: <FaEnvelope /> },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition border ${
                  mode === tab.key
                    ? "bg-white text-[#111827] border-white"
                    : "bg-white/10 text-white border-white/25 hover:bg-white/20"
                }`}
                onClick={() => setMode(tab.key)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-default border border-gray-100 p-5 flex flex-col gap-4">
          {mode === "notification" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-text-dark-gray">
                  Envoyer une notification
                </h2>
                <p className="text-sm text-text-light-gray">
                  Choisissez un titre, un contenu et un article (optionnel).
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-light-gray">Titre</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-pr"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de la notification"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-light-gray">Contenu</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-pr min-h-[120px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Message à envoyer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-light-gray">
                  Sélectionner un article
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-pr bg-white"
                  onChange={(e) => setMenuItem(e.target.value)}
                  value={menuItem || ""}
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
                  className="bg-pr text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:brightness-95 transition"
                  onClick={send}
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}

          {mode === "message" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-text-dark-gray">
                  Envoyer des SMS
                </h2>
                <p className="text-sm text-text-light-gray">
                  Rédigez votre SMS (contenu court recommandé).
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-light-gray">Contenu</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-pr min-h-[120px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Message SMS"
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-pr text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:brightness-95 transition"
                  onClick={send}
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}

          {mode === "email" && (
            <div className="space-y-2 text-sm text-text-light-gray">
              <p>Email en cours de développement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationScreen;
