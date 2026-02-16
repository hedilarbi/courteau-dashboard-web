'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import DropdownListElement from "./DropDownListElement";

const VIEWPORT_PADDING = 8;
const MENU_GAP = 4;
const SEARCH_SECTION_HEIGHT = 56;
const MIN_LIST_HEIGHT = 96;
const DEFAULT_LIST_MAX_HEIGHT = 160;

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
    const availableBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const availableAbove = rect.top - VIEWPORT_PADDING;

    const shouldOpenUp =
      availableBelow < SEARCH_SECTION_HEIGHT + MIN_LIST_HEIGHT &&
      availableAbove > availableBelow;

    const availableSpace = shouldOpenUp ? availableAbove : availableBelow;
    const listMaxHeight = Math.max(
      MIN_LIST_HEIGHT,
      Math.min(DEFAULT_LIST_MAX_HEIGHT, availableSpace - SEARCH_SECTION_HEIGHT),
    );
    const menuHeight = SEARCH_SECTION_HEIGHT + listMaxHeight;

    const unclampedTop = shouldOpenUp
      ? rect.top - menuHeight - MENU_GAP
      : rect.bottom + MENU_GAP;

    const top = Math.max(
      VIEWPORT_PADDING,
      Math.min(unclampedTop, window.innerHeight - menuHeight - VIEWPORT_PADDING),
    );

    const left = Math.max(
      VIEWPORT_PADDING,
      Math.min(rect.left, window.innerWidth - rect.width - VIEWPORT_PADDING),
    );

    setMenuPosition({
      width: rect.width,
      left,
      top,
      listMaxHeight,
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
            <div
              className="overflow-y-auto"
              style={{ maxHeight: menuPosition.listMaxHeight }}
            >
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
