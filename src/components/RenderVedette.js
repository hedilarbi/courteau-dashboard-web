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
  isLast = false,
}) => {
  const menuItemName = useMemo(() => vedette.menuItem.name, [vedette]);
  const gridTemplate = triMode
    ? "grid-cols-[120px,1.6fr,0.6fr,0.6fr]"
    : "grid-cols-[120px,1.6fr,0.6fr]";

  return useMemo(
    () => (
      <div
        className={`grid ${gridTemplate} items-center px-4 py-3 gap-3 text-sm`}
      >
        <div className="h-20 w-24 relative overflow-hidden rounded-md border border-gray-100">
          <Image
            src={vedette.menuItem.image}
            alt={vedette.menuItem.name}
            fill
            className="object-cover"
          />
        </div>

        <span className="font-semibold text-text-dark-gray truncate">
          {menuItemName}
        </span>

        <div className="flex items-center justify-end">
          <button
            className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
            onClick={() => handleShowDeleteWarning(vedette._id)}
            aria-label="Supprimer la vedette"
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
    [index, triMode, gridTemplate, menuItemName, vedette, handleShowDeleteWarning, handleTri, isLast]
  );
};

export default RenderVedette;
