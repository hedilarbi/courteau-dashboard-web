import React from "react";
import StatsCard from "./StatsCard";
import { Roles } from "../constants";

const StatsContainer = ({ usersCount, role }) => {
  return (
    <div className="flex gap-5 mt-5">
      {role === Roles.ADMIN && (
        <StatsCard title="Utilisateur" stat={usersCount} icon="user-group" />
      )}
    </div>
  );
};

export default StatsContainer;
