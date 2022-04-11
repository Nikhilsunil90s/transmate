export const toCamelCase = input => {
  return input.toLowerCase().replace(/-(.)/g, (match, group1) => {
    return group1.toUpperCase();
  });
};
