// Transforme les prix d'un article en options de dropdown de tailles.
export const buildSizesList = (prices) =>
  (prices || [])
    .filter((price) => typeof price?.size === "string" && price.size.length > 0)
    .map((price) => ({ value: price.size, label: price.size }));

// Un même article peut être proposé plusieurs fois en récompense,
// mais jamais deux fois avec la même taille.
// `excludedRewardId` permet de s'exclure soi-même lors d'une modification.
export const isRewardTaken = (rewards, itemId, size, excludedRewardId = null) =>
  (rewards || []).some(
    (reward) =>
      reward?._id !== excludedRewardId &&
      (reward?.item?._id || reward?.item) === itemId &&
      reward?.size === size
  );
