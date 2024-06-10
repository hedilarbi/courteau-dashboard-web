const dateToDDMMMYYYY = (date) => {
  const d = new Date(date);
  const formattedDate = d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return formattedDate;
};

module.exports = { dateToDDMMMYYYY };
