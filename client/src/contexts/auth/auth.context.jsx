import * as React from "react";
import axios from "axios";
import { ACTIONS, authReducer } from "./auth.reducer";
import { authService } from "src/services/auth";

export const AuthContext = React.createContext();
export const useAuthContext = () => React.useContext(AuthContext);

const savedUser = JSON.parse(localStorage.getItem("user")) ?? {};
const thereSavedUser = Object.entries(savedUser).length > 0;
const USER_INITIAL_STATE = thereSavedUser
  ? savedUser
  : {
      user: {},
      error: "",
      fetched: false,
    };

export default function AuthContextProvider({ children }) {
  const [state, dispatch] = React.useReducer(authReducer, USER_INITIAL_STATE);
  axios.defaults.headers.common["Authorization"] = state.user.token ?? "";
  const isUserLogged = state.fetched && state.user;

  React.useEffect(
    () => localStorage.setItem("user", JSON.stringify(state)),
    [state]
  );

  async function signup(user) {
    try {
      const response = await authService.signup(user);
      dispatch({
        type: ACTIONS.signup,
        payload: { ...response.user, token: response.token },
      });
      return true;
    } catch (err) {
      let errorMessage =
        "Email already exists. Please choose a different email.";

      if (err.response) {
        const { status, data } = err.response;
        if (status === 409) {
          errorMessage =
            "Email already exists. Please choose a different email.";
        } else if (
          status === 400 &&
          data &&
          data.errors &&
          data.errors.length > 0
        ) {
          errorMessage = data.errors[0].message;
        }
      }

      dispatch({ type: ACTIONS.reportError, payload: errorMessage });

      setTimeout(() => {
        dispatch({ type: ACTIONS.reportError, payload: "" });
      }, 3000); // Dismiss error message after 3 seconds

      return false;
    }
  }

  async function login(user) {
    try {
      const response = await authService.login(user);
      dispatch({
        type: ACTIONS.login,
        payload: { ...response.user, token: response.token },
      });
      return true;
    } catch (err) {
      let errorMessage = "Incorrect email or password.";

      if (err.response && err.response.status === 401) {
        errorMessage = "Incorrect email or password.";
      }

      dispatch({ type: ACTIONS.reportError, payload: errorMessage });

      setTimeout(() => {
        dispatch({ type: ACTIONS.reportError, payload: "" });
      }, 3000); // Dismiss error message after 3 seconds

      console.log(err);
      return false;
    }
  }
  function logout() {
    dispatch({ type: ACTIONS.logout });
  }

  function updateInfo(updatedUser) {
    dispatch({ type: ACTIONS.update, payload: updatedUser });
  }

  const contextValue = {
    user: state.user,
    error: state.error,
    fetched: state.fetched,
    isUserLogged,
    signup,
    login,
    logout,
    updateInfo,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
