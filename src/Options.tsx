import React from "react";

import Typography from "@material-ui/core/Typography";

// Widgets
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";

// Icons
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import PlayIcon from "@material-ui/icons/PlayCircleFilled";
import RefreshIcon from "@material-ui/icons/Refresh";
import SkipNext from "@material-ui/icons/SkipNext";

import { appContext } from "./stores";

interface Props {
  onStart: () => void;
  onStep: () => void;
  onReset: () => void;
  onFullscreen?: () => void;

  initializer: string;
  setInitializer: (initializer: string) => void;

  speed: number;
  setSpeed: (speed: number) => void;

  interval: number;

  backgroundColor: string;
  setBackgroundColor: (color: string) => void;

  aliveColor: string;
  setAliveColor: (color: string) => void;

  deadColor: string;
  setDeadColor: (color: string) => void;

  radius: number;
  setRadius: (radius: number) => void;

  margin: number;
  setMargin: (margin: number) => void;
}

export default function Options(props: Props) {
  const { state: appState } = React.useContext(appContext);

  const onInitializerChange = (event) => props.setInitializer(event.target.value as string);
  const onSpeedChange = (event, speed) => props.setSpeed(speed as number);
  const onBackgroundColorChange = (event) => props.setBackgroundColor(event.target.value);
  const onAliveColorChange = (event) => props.setAliveColor(event.target.value);
  const onDeadColorChange = (event) => props.setDeadColor(event.target.value);
  const onRadiusChange = (event, radius) => props.setRadius(radius as number);
  const onMarginChange = (event, margin) => props.setMargin(margin as number);

  return (
    <div className="Options">
      <Typography>
        <b>Game of Life</b>
      </Typography>
      <hr />

      {!appState.started ? (
        <div>
          <Typography id="initializer-label">Initializer</Typography>
          <Select
            value={props.initializer}
            labelId="initializer-label"
            onChange={onInitializerChange}
          >
            <MenuItem value="" disabled>
              Select Initializer
            </MenuItem>
            <MenuItem value="blank">Blank</MenuItem>
            <MenuItem value="glider">Glider</MenuItem>
            <MenuItem value="horizontal-line">Horizontal Line</MenuItem>
            <MenuItem value="vertical-line">Vertical Line</MenuItem>
            <MenuItem value="plus">Plus</MenuItem>
            <MenuItem value="random">Random</MenuItem>
          </Select>
        </div>
      ) : null}

      <Typography id="speed-label">
        <b>Speed</b>
      </Typography>
      <Slider value={props.speed} aria-labelledby="speed-label" onChange={onSpeedChange} />
      <Typography>
        {props.speed} ({props.interval}ms steps)
      </Typography>

      <hr />

      <Typography id="radius-label">
        <b>Radius</b>
      </Typography>
      <Slider
        min={1}
        max={10}
        value={props.radius}
        aria-labelledby="radius-label"
        onChange={onRadiusChange}
      />
      <Typography>
        {props.radius} ({props.radius}px)
      </Typography>

      <hr />

      <Typography id="margin-label">
        <b>Margin</b>
      </Typography>
      <Slider
        min={0.5}
        max={10}
        step={0.5}
        value={props.margin}
        aria-labelledby="margin-label"
        onChange={onMarginChange}
      />
      <Typography>
        {props.margin} ({props.margin}px)
      </Typography>

      <hr />

      <Typography id="background-color-label">
        <b>Background Color</b>
      </Typography>
      <TextField
        value={props.backgroundColor}
        aria-labelledby="background-color-label"
        onChange={onBackgroundColorChange}
      />

      <Typography id="alive-color-label">
        <b>Alive Color</b>
      </Typography>
      <TextField
        value={props.aliveColor}
        aria-labelledby="alive-color-label"
        onChange={onAliveColorChange}
      />

      <Typography id="dead-color-label">
        <b>Dead Color</b>
      </Typography>
      <TextField
        value={props.deadColor}
        aria-labelledby="dead-color-label"
        onChange={onDeadColorChange}
      />

      <Grid container justify="space-between" spacing={2}>
        <Grid item>
          <IconButton title="Reload" aria-label="Reload" onClick={props.onReset}>
            <RefreshIcon />
          </IconButton>
        </Grid>

        {appState.started && !appState.running ? (
          <Grid item>
            <IconButton title="Step" aria-label="Step" color="primary" onClick={props.onStep}>
              <SkipNext />
            </IconButton>
          </Grid>
        ) : null}

        {props.onFullscreen ? (
          <Grid item>
            <IconButton
              title={appState.fullscreen ? "Exit full screen" : "Enter full screen"}
              aria-label={appState.fullscreen ? "Exit full screen" : "Enter full screen"}
              onClick={props.onFullscreen}
            >
              {appState.fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Grid>
        ) : null}

        {!appState.started ? (
          <Grid item>
            <IconButton title="Run" aria-label="Run" color="primary" onClick={props.onStart}>
              <PlayIcon />
            </IconButton>
          </Grid>
        ) : null}
      </Grid>
    </div>
  );
}
