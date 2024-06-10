"use client";
import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import SearchBar from "./SearchBar";
import Link from "next/link";

const UsersScreen = ({ data }) => {
  const [users, setUsers] = useState(data);
  const [filter, setFilter] = useState("tout");

  //   useEffect(() => {
  //     if (filter === "tout") {
  //       setusers(data);
  //     } else {
  //       const filteredusers = data.filter((user) => user.status === filter);
  //       setusers(filteredusers);
  //     }
  //   }, [filter, data]);

  return (
    <>
      <div className="mt-4 flex w-full">
        <SearchBar />
      </div>
      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-6">
        {data.length > 0 ? (
          <ul>
            {users.map((user, index) => (
              <li
                key={user._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-70 flex items-center justify-between px-5 py-4"
                    : "bg-white flex items-center justify-between px-5 py-4"
                }
              >
                <p className="text-text-dark-gray font-roboto font-normal w-1/3 truncate">
                  {user.name}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/3">
                  {user.email}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/6">
                  {user.phone_number}
                </p>

                <button className="text-primary-blue">
                  <Link href={`/utilisateurs/${user._id}`}>
                    <FaEye size={28} color="" />
                  </Link>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-col flex justify-center items-center w-full h-full ">
            <h1 className="text-xl font-roboto font-semibold text-text-dark-gray ">
              Aucun utilisateur
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default UsersScreen;
