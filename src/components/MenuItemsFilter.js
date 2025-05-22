import React from "react";

const MenuItemsFilter = ({
  categories,
  menuItemFilter,
  setMenuItemFilter,
  menuItemsList,
  setMenuItems,
}) => {
  const handleMenuItemFiltering = (categoryName) => {
    if (categoryName !== "Toutes les catégories") {
      let list = null;

      list = menuItemsList.filter(
        (item) => item.category.name === categoryName
      );

      setMenuItems(list);
      setMenuItemFilter(categoryName);
    } else {
      setMenuItems(menuItemsList);
      setMenuItemFilter(categoryName);
    }
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
