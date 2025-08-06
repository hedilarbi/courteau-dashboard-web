import React from "react";

import { FaUser, FaUsersCog } from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";
import { GiNotebook } from "react-icons/gi";
import { MdRestaurantMenu } from "react-icons/md";
import { BiSolidOffer } from "react-icons/bi";
import { IoMdTrophy } from "react-icons/io";
import { IoSettings, IoHome, IoTicketSharp } from "react-icons/io5";
import { HiBuildingStorefront } from "react-icons/hi2";
import { AiFillNotification } from "react-icons/ai";
import { FaStar } from "react-icons/fa6";

const NavItemsList = () => {
  const NAV_ITEMS_LIST = [
    {
      id: 1,
      title: "Dashboard",
      path: `/dashboard`,
      icon: <IoHome size={24} />,
    },
    {
      id: 2,
      title: "Utilisateurs",
      path: `/utilisateurs`,
      icon: <FaUser size={24} />,
    },
    {
      id: 3,
      title: "Commandes",
      path: `/commandes`,
      icon: <GiNotebook size={24} />,
    },
    {
      id: 4,
      title: "Articles",
      path: `/articles`,
      icon: <MdRestaurantMenu size={24} />,
    },
    {
      id: 5,
      title: "Personnalisations",
      path: `/personnalisations`,
      icon: <MdDashboardCustomize size={24} />,
    },
    {
      id: 6,
      title: "Offres",
      path: `/offres`,
      icon: <BiSolidOffer size={24} />,
    },
    {
      id: 7,
      title: "Recompenses",
      path: `/recompenses`,
      icon: <IoMdTrophy size={24} />,
    },
    {
      id: 20,
      title: "Vedettes",
      path: `/vedettes`,
      icon: <FaStar size={24} />,
    },
    {
      id: 15,
      title: "Codes Promotions",
      path: `/codes-promotions`,
      icon: <IoTicketSharp size={24} />,
    },
    {
      id: 11,
      title: "Notifications",
      path: `/notifications`,
      icon: <AiFillNotification size={24} />,
    },
    {
      id: 8,
      title: "Employés",
      path: `/employes`,
      icon: <FaUsersCog size={24} />,
    },
    {
      id: 9,
      title: "Restaurants",
      path: `/restaurants`,
      icon: <HiBuildingStorefront size={24} />,
    },
    {
      id: 10,
      title: "Paramètres",
      path: `/parametres`,
      icon: <IoSettings size={24} />,
    },
  ];
  return NAV_ITEMS_LIST;
};

export default NavItemsList;
