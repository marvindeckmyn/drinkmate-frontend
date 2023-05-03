const apiCache = {};

export const setCache = (key, data) => {
  apiCache[key] = data;
};

export const getCache = (key) => {
  return apiCache[key];
};

export const clearCache = () => {
  Object.keys(apiCache).forEach((key) => {
    delete apiCache[key];
  });
};