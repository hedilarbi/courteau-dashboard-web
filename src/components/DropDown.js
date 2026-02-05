'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import DropdownListElement from "./DropDownListElement";

const DropDown = ({ value, setter, list, placeholder }) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuPosition, setMenuPosition] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);

  const filteredList = (list || []).filter((item) => {
    const query = searchQuery.toLowerCase();
    const label = (item?.label || "").toLowerCase();
    const val = (item?.value || "").toString().toLowerCase();
    return label.includes(query) || val.includes(query);
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateMenuPosition = useCallback(() => {
    if (!containerRef.current || typeof window === "undefined") return;
    const rect = containerRef.current.getBoundingClientRect();
    setMenuPosition({
      width: rect.width,
      left: rect.left + window.scrollX,
      top: rect.bottom + window.scrollY + 4,
    });
  }, []);

  const toggleDropDown = () => {
    setIsDropDownOpen((prev) => {
      const next = !prev;
      if (!prev) {
        setSearchQuery("");
        updateMenuPosition();
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isDropDownOpen) return;

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isDropDownOpen, updateMenuPosition]);

  return (
    <div className="w-full relative" ref={containerRef}>
      <button
        className="bg-pr  text-black flex w-full justify-between items-center p-2 text-xs font-roboto font-medium rounded-md"
        onClick={toggleDropDown}
      >
        {value ? value.label : placeholder}
        {isDropDownOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isDropDownOpen &&
        isMounted &&
        menuPosition &&
        createPortal(
          <div
            className="fixed bg-white border border-black rounded-md shadow-sm z-40"
            style={{
              width: menuPosition.width || containerRef.current?.offsetWidth,
              left: menuPosition.left,
              top: menuPosition.top,
            }}
          >
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-pr"
                autoFocus
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              <ul>
                {filteredList.length > 0 ? (
                  filteredList.map((item, index) => (
                    <DropdownListElement
                      value={item}
                      setter={setter}
                      setIsDropDownOpen={setIsDropDownOpen}
                      key={index}
                    />
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-text-light-gray">
                    Aucun résultat
                  </li>
                )}
              </ul>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default DropDown;
