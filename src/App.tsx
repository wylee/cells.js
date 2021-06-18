import React from "react";

import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

import {
  appContext,
  useAppReducer,
  start,
  stop,
  run,
  pause,
  showOptions,
  hideOptions,
  setFullscreen,
} from "./stores";
import { enterFullscreen, exitFullscreen } from "./util";
import Grid from "./Grid";
import Options from "./Options";

const MIN_INTERVAL = 50;
const MAX_INTERVAL = 1000;
const STEP_SIZE = (MAX_INTERVAL - MIN_INTERVAL) / 100;
const INITIAL_INTERVAL = 150;
const INITIAL_SPEED = 93;
const INITIAL_BACKGROUND_COLOR = "#282828";
const INITIAL_ALIVE_COLOR = "#e00000";
const INITIAL_DEAD_COLOR = "#000000";
const INITIAL_RADIUS = 4;
const INITIAL_MARGIN = 1;

// SPEED_MAP[speed from 0 to 100] => interval for speed
const SPEED_MAP: number[] = Array.from({ length: 101 }, (_, i) => {
  return MAX_INTERVAL - Math.round(STEP_SIZE * i);
});

export default function AppWithContext() {
  const [state, dispatch] = useAppReducer();
  const contextValue = { state, dispatch };
  return (
    <appContext.Provider value={contextValue}>
      <App {...contextValue} />
    </appContext.Provider>
  );
}

function App({ state, dispatch }) {
  const [stepSignal, setStepSignal] = React.useState(0);
  const [refreshSignal, setRefreshSignal] = React.useState(0);
  const [initializer, setInitializer] = React.useState("random");
  const [speed, setSpeed] = React.useState(INITIAL_SPEED);
  const [interval, setInterval] = React.useState(INITIAL_INTERVAL);
  const [backgroundColor, setBackgroundColor] = React.useState(INITIAL_BACKGROUND_COLOR);
  const [aliveColor, setAliveColor] = React.useState(INITIAL_ALIVE_COLOR);
  const [deadColor, setDeadColor] = React.useState(INITIAL_DEAD_COLOR);
  const [radius, setRadius] = React.useState(INITIAL_RADIUS);
  const [margin, setMargin] = React.useState(INITIAL_MARGIN);

  const setSpeedAndInterval = (speed) => {
    const interval = SPEED_MAP[speed];
    setSpeed(speed);
    setInterval(interval);
  };

  const onStart = () => {
    dispatch(start());
  };

  const onStep = () => {
    setStepSignal(Math.random());
  };

  const onToggleOptions = () => {
    if (state.showOptions) {
      // About to hide options. Ensure running.
      dispatch(run());
      dispatch(hideOptions());
    } else {
      dispatch(pause());
      dispatch(showOptions());
    }
  };

  const onReset = () => {
    dispatch(stop());
    setSpeedAndInterval(INITIAL_SPEED);
    setRefreshSignal(Math.random());
  };

  const onToggleFullscreen = async () => {
    // This will trigger the fullscreenchange listener, which will
    // update the store's fullscreen state.
    if (state.fullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  };

  React.useEffect(() => {
    const fullscreenListener = () => dispatch(setFullscreen(!!document.fullscreenElement));
    const resizeListener = () => onReset();
    document.addEventListener("fullscreenchange", fullscreenListener, false);
    window.addEventListener("resize", resizeListener, false);
    return () => {
      document.removeEventListener("fullscreenchange", fullscreenListener, false);
      window.removeEventListener("resize", resizeListener, false);
    };
  });

  return (
    <div className="full-width-and-height">
      <Grid
        initializer={initializer}
        stepSignal={stepSignal}
        refreshSignal={refreshSignal}
        reset={onReset}
        interval={interval}
        backgroundColor={backgroundColor}
        aliveColor={aliveColor}
        deadColor={deadColor}
        radius={radius}
        margin={margin}
      />

      {state.showOptions ? (
        <Options
          onStart={onStart}
          onStep={onStep}
          onReset={onReset}
          onFullscreen={onToggleFullscreen}
          initializer={initializer}
          setInitializer={setInitializer}
          speed={speed}
          setSpeed={setSpeedAndInterval}
          interval={interval}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          aliveColor={aliveColor}
          setAliveColor={setAliveColor}
          deadColor={deadColor}
          setDeadColor={setDeadColor}
          radius={radius}
          setRadius={setRadius}
          margin={margin}
          setMargin={setMargin}
        />
      ) : null}

      {state.started && !state.fullscreen ? (
        <IconButton
          id="toggle-options-button"
          onClick={onToggleOptions}
          size="small"
          aria-label="Show options"
        >
          {state.showOptions ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      ) : null}
    </div>
  );
}
