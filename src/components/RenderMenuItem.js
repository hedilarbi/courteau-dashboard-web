import React, { useMemo } from "react";

import { FaCircleChevronDown, FaCircleChevronUp } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import Image from "next/image";
import { HiMiniPencil } from "react-icons/hi2";
import { useRouter } from "next/navigation";

const RenderMenuItem = ({
  item,
  index,
  isLast = false,
  handleShowDeleteWarning,
  handleTri,
  triMode,
}) => {
  const router = useRouter();

  const menuItemName = useMemo(() => item.name, [item]);
  const prices = useMemo(() => item.prices, [item]);
  const gridTemplate = triMode
    ? "grid-cols-[120px,1.4fr,1fr,1fr,0.8fr,0.6fr]"
    : "grid-cols-[120px,1.4fr,1fr,1fr,0.8fr]";

  return useMemo(
    () => (
      <div
        className={`grid ${gridTemplate} items-center px-4 py-3 gap-3 text-sm`}
      >
        <div className="h-20 w-24 relative overflow-hidden rounded-md border border-gray-100">
          <Image
            src={item.image}
            alt={menuItemName}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-semibold text-text-dark-gray truncate">
            {menuItemName}
          </span>
          <span className="text-xs text-text-light-gray truncate">
            {item.category?.name || "Sans catégorie"}
          </span>
        </div>

        <div className="text-sm text-text-dark-gray">
          {prices.map((price, i) => (
            <span key={i} className="block">
              {price.size}
            </span>
          ))}
        </div>

        <div className="text-sm font-semibold text-text-dark-gray">
          {prices.map((price, i) => (
            <span key={i} className="block">
              {price.price.toFixed(2)} $
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition"
            onClick={() => router.push(`/articles/${item._id}`)}
            aria-label="Voir l'article"
          >
            <HiMiniPencil size={18} />
          </button>
          <button
            className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
            onClick={() => handleShowDeleteWarning(item._id)}
            aria-label="Supprimer l'article"
          >
            <FaTrash size={16} />
          </button>
        </div>

        {triMode && (
          <div className="flex items-center justify-end gap-2">
            <button
              className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => handleTri(index, index - 1)}
              disabled={index === 0}
              aria-label="Monter"
            >
              <FaCircleChevronUp />
            </button>
            <button
              className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => handleTri(index, index + 1)}
              disabled={isLast}
              aria-label="Descendre"
            >
              <FaCircleChevronDown />
            </button>
          </div>
        )}
      </div>
    ),
    [
      index,
      triMode,
      gridTemplate,
      menuItemName,
      prices,
      item,
      handleShowDeleteWarning,
      router,
      handleTri,
      isLast,
    ]
  );
};

export default RenderMenuItem;
