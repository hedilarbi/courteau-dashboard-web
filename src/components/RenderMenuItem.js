import React, { useMemo } from "react";

import { FaCircleChevronDown, FaCircleChevronUp } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import Image from "next/image";
import { HiMiniPencil } from "react-icons/hi2";
import { useRouter } from "next/navigation";

const RenderMenuItem = ({
  item,
  index,

  handleShowDeleteWarning,

  handleTri,
  triMode,
}) => {
  const router = useRouter();
  const backgroundColor = useMemo(
    () => (index % 2 ? "bg-transparent" : "bg-[rgba(247,166,0,0.3)]"),
    [index]
  );

  const menuItemName = useMemo(() => item.name, [item]);

  const prices = useMemo(() => item.prices, [item]);

  return useMemo(
    () => (
      <div
        className={`w-full flex flex-row gap-12 items-center justify-between py-2.5 px-2.5 ${backgroundColor}`}
      >
        <div className="w-[120px] h-[100px] relative">
          <Image
            src={item.image}
            alt={menuItemName}
            layout="fill"
            objectFit="cover"
          />
        </div>

        <span className="font-lato-regular text-lg w-1/4">{menuItemName}</span>

        <div className="font-lato-regular text-lg w-[10%] flex flex-col">
          {prices.map((price, i) => (
            <span key={i}>{price.size}</span>
          ))}
        </div>

        <div className="font-lato-regular text-lg flex-1 flex flex-col">
          {prices.map((price, i) => (
            <span key={i}>{price.price.toFixed(2)}$</span>
          ))}
        </div>

        <button
          className="flex justify-center items-center"
          onClick={() => router.push(`/articles/${item._id}`)}
        >
          <HiMiniPencil color="#2AB2DB" size={24} />
        </button>

        <button
          className="flex justify-center items-center"
          onClick={() => handleShowDeleteWarning(item._id)}
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

export default RenderMenuItem;
