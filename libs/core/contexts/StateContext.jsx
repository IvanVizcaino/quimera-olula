import PropTypes from "prop-types";
import React, { createContext, useCallback, useReducer } from "react";

export const StateContext = createContext();

const StateProvider = ({ reducer, apiClient, initialState, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const apiMiddleware = next => action => {
    // apiClient(action, apiDispatch)
    return next({
      ...action,
      payload: {
        ...action.payload,
        dispatch: apiDispatch,
      },
    });
  };

  const apiDispatch = useCallback(apiMiddleware(dispatch), []);

  const dispatcher = useCallback(action => {
    const myAction = {
      ...action,
      payload: {
        ...action.payload,
        dispatch: dispatcher,
      },
    };
    dispatch(myAction);
  }, []);

  return <StateContext.Provider value={[state, dispatcher]}>{children}</StateContext.Provider>;
};

StateProvider.propTypes = {
  /** Ctrl */
  reducer: PropTypes.any,
  /** API Ctrl */
  apiClient: PropTypes.any,
  /** Initial State */
  initialState: PropTypes.any,
  /** Children elements to pass through */
  children: PropTypes.any,
};

export { StateProvider };
