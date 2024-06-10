import React from "react";

import { MdDashboardCustomize } from "react-icons/md";
import { GiNotebook } from "react-icons/gi";
import { MdRestaurantMenu } from "react-icons/md";
import { BiSolidOffer } from "react-icons/bi";
import { IoMdTrophy } from "react-icons/io";
import { IoHome } from "react-icons/io5";

const NavItemListCashier = () => {
  const NAV_ITEMS_LIST = [
    {
      id: 1,
      title: "Dashboard",
      path: `/dashboard`,
      icon: <IoHome size={24} />,
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
  ];
  return NAV_ITEMS_LIST;
};

export default NavItemListCashier;
