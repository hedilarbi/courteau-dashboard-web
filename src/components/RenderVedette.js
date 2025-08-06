import React, { useMemo } from "react";

import { FaCircleChevronDown, FaCircleChevronUp } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import Image from "next/image";

const RenderVedette = ({
  vedette,
  index,

  handleShowDeleteWarning,

  handleTri,
  triMode,
}) => {
  const backgroundColor = useMemo(
    () => (index % 2 ? "bg-transparent" : "bg-[rgba(247,166,0,0.3)]"),
    [index]
  );

  const menuItemName = useMemo(() => vedette.menuItem.name, [vedette]);

  return useMemo(
    () => (
      <div
        className={`w-full flex flex-row gap-12 items-center justify-between py-2.5 px-2.5 ${backgroundColor}`}
      >
        <div className="w-[120px] h-[100px] relative">
          <Image
            src={vedette.menuItem.image}
            alt={vedette.menuItem.name}
            layout="fill"
            objectFit="cover"
          />
        </div>

        <span className="font-lato-regular text-lg w-1/4">{menuItemName}</span>

        <button
          className="flex justify-center items-center"
          onClick={() => handleShowDeleteWarning(vedette._id)}
        >
          <FaTrash color="#F31A1A" size={24} />
        </button>

        {triMode && (
          <div className="flex flex-col justify-between h-[100px]">
            <button
              className="flex justify-center items-center p-1"
              onClick={() => handleTri(index, index - 1)}
            >
              <FaCircleChevronUp />
            </button>
            <button
              className="flex justify-center items-center p-1"
              onClick={() => handleTri(index, index + 1)}
            >
              <FaCircleChevronDown />
            </button>
          </div>
        )}
      </div>
    ),
    [index, triMode]
  );
};

export default RenderVedette;
