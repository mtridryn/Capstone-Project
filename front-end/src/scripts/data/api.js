import CONFIG from "../config.js";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  LOGOUT: `${CONFIG.BASE_URL}/logout`,
  PREDICT: `${CONFIG.BASE_URL}/predict`,
  PRODUCTS: `${CONFIG.BASE_URL}/products`,
  HISTORY: `${CONFIG.BASE_URL}/history`,
};

export async function getData(endpoint) {
  const fetchResponse = await fetch(endpoint);
  return await fetchResponse.json();
}

export { ENDPOINTS };
