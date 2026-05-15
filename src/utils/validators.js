export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isEmpty = (value) => {
  return !value || value.trim() === "";
};