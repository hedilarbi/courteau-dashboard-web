import React from "react";

const MenuItemsFilter = ({
  categories,
  menuItemFilter,
  onMenuItemFilterChange,
}) => {
  const handleMenuItemFiltering = (categoryName) => {
    onMenuItemFilterChange(categoryName);
  };

  return (
    <select
      className=" py-2 px-3 border border-black bg-transparent text-black font-lato-regular text-lg"
      value={menuItemFilter}
      onChange={(e) => handleMenuItemFiltering(e.target.value)}
    >
      <option value="Toutes les catégories">Toutes les catégories</option>
      {categories.map((item) => (
        <option key={item._id} value={item.name}>
          {item.name}
        </option>
      ))}
    </select>
  );
};

export default MenuItemsFilter;
