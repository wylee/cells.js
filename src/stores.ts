import { createContext, useReducer } from "react";

interface Action {
  type: string;
}

interface AppState {
  started: boolean;
  running: boolean;
  showOptions: boolean;
  fullscreen: boolean;
}

const initialAppState: AppState = {
  started: false,
  running: false,
  showOptions: true,
  fullscreen: false,
};

const appActions = {
  START: "START",
  STOP: "STOP",
  RUN: "RUN",
  PAUSE: "PAUSE",
  SHOW_OPTIONS: "SHOW_OPTIONS",
  HIDE_OPTIONS: "HIDE_OPTIONS",
  ENTER_FULLSCREEN: "ENTER_FULLSCREEN",
  EXIT_FULLSCREEN: "EXIT_FULLSCREEN",
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case appActions.START:
      return {
        ...state,
        started: true,
        running: true,
        showOptions: false,
      };
    case appActions.STOP:
      return {
        ...state,
        started: false,
        running: false,
        showOptions: true,
      };
    case appActions.RUN:
      return { ...state, running: true };
    case appActions.PAUSE:
      return { ...state, running: false };
    case appActions.SHOW_OPTIONS:
      return { ...state, showOptions: true };
    case appActions.HIDE_OPTIONS:
      return { ...state, showOptions: false };
    case appActions.ENTER_FULLSCREEN:
      return { ...state, fullscreen: true };
    case appActions.EXIT_FULLSCREEN:
      return { ...state, fullscreen: false };
    default:
      return state;
  }
};

/* API */

export const appContext = createContext({
  state: initialAppState,
  dispatch: (action: Action): any => {
    throw new Error(
      [
        "Component must be wrapped with",
        '<appContext.Provider value="{{ state, dispatch }}">',
        "first, where `state` and `dispatch` are the result of",
        "calling `useAppReducer`.",
      ].join(" ")
    );
  },
});

export const useAppReducer = (initialState = initialAppState) => {
  return useReducer(appReducer, initialState);
};

export const start = () => {
  return {
    type: appActions.START,
  };
};

export const stop = () => {
  return {
    type: appActions.STOP,
  };
};

export const run = () => {
  return {
    type: appActions.RUN,
  };
};

export const pause = () => {
  return {
    type: appActions.PAUSE,
  };
};

export const showOptions = () => {
  return {
    type: appActions.SHOW_OPTIONS,
  };
};

export const hideOptions = () => {
  return {
    type: appActions.HIDE_OPTIONS,
  };
};

export const setFullscreen = (value) => {
  return {
    type: value ? appActions.ENTER_FULLSCREEN : appActions.EXIT_FULLSCREEN,
  };
};
