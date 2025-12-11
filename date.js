// Utils/date.js
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
};

const now = () => {
  return new Date().toISOString();
};

module.exports = { formatDate, now };
