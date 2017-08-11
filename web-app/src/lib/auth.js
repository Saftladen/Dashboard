import Cookies from "js-cookie";

const setToken = token => {
  Cookies.set("auth-token", token, {expires: 365 * 10});
};

const getToken = () => {
  return Cookies.get("auth-token");
};

export {setToken, getToken};
