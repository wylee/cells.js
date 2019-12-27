import React from 'react';

import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import RefreshIcon from '@material-ui/icons/Refresh';

import { appContext } from './stores';

interface Props {
    onStart: () => void;
    onReset: () => void;
    onFullscreen?: () => void;
    initializer: string;
    setInitializer: (initializer: string) => void;
    speed: number;
    setSpeed: (speed: number) => void;
    interval: number;
}

export default function Options(props: Props) {
    const { state: appState } = React.useContext(appContext);

    const onInitializerChange = event => props.setInitializer(event.target.value as string);
    const onSpeedChange = (event, speed) => props.setSpeed(speed as number);

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
                        onChange={onInitializerChange}
                        labelId="initializer-label"
                    >
                        <MenuItem value="" disabled>
                            Select Initializer
                        </MenuItem>
                        <MenuItem value="random">Random</MenuItem>
                        <MenuItem value="glider">Glider</MenuItem>
                    </Select>
                </div>
            ) : null}

            <Typography id="speed-label">Speed</Typography>
            <Slider value={props.speed} onChange={onSpeedChange} aria-labelledby="speed-label" />
            <Typography>
                {props.speed} ({props.interval}ms steps)
            </Typography>

            <Grid container justify="space-between" spacing={2}>
                <Grid item>
                    <IconButton onClick={props.onReset} title="Reload" aria-label="Reload">
                        <RefreshIcon />
                    </IconButton>
                </Grid>

                {props.onFullscreen ? (
                    <Grid item>
                        <IconButton
                            onClick={props.onFullscreen}
                            title={appState.fullscreen ? 'Exit full screen' : 'Enter full screen'}
                            aria-label={
                                appState.fullscreen ? 'Exit full screen' : 'Enter full screen'
                            }
                        >
                            {appState.fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Grid>
                ) : null}

                {!appState.started ? (
                    <Grid item>
                        <IconButton title="Start evolving" onClick={props.onStart} color="primary">
                            <PlayIcon />
                        </IconButton>
                    </Grid>
                ) : null}
            </Grid>
        </div>
    );
}
