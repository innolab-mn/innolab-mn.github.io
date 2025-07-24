export const formatPrice = (price: Number) => {
  // Convert to string and add apostrophe every three digits from the end
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
};