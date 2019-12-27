import React from 'react';
import { appContext } from './stores';

interface Cell {
    x: number;
    y: number;
    alive: boolean;
    changed: boolean;
}

type Grid = Cell[][];

interface Coordinate {
    x: number;
    y: number;
}

interface Props {
    initializer: string;
    interval: number;
    backgroundColor: string;
    radius: number;
    margin: number;
    onClick: (event) => void;
    refreshSignal: number;
}

const TWO_PI = 2 * Math.PI;

export default function GridComponent(props: Props) {
    const { state: appState } = React.useContext(appContext);

    const [grid, setGrid] = React.useState<Grid>([[]]);
    const canvasRef = React.useRef(null);
    const style = {
        backgroundColor: props.backgroundColor,
        cursor: appState.started ? 'pointer' : 'default'
    };

    React.useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const newGrid = create(canvas, props.radius, props.margin, props.initializer);
        clear(canvas);
        draw(newGrid, canvas, props.radius);
        setGrid(newGrid);
    }, [props.initializer, props.refreshSignal, props.radius, props.margin]);

    React.useLayoutEffect(() => {
        let intervalId;
        if (appState.running) {
            const canvas = canvasRef.current;
            intervalId = setInterval(() => {
                evolve(grid);
                draw(grid, canvas, props.radius);
            }, props.interval);
        }
        return () => clearInterval(intervalId);
    }, [appState.running, props.interval, props.radius, grid]);

    return (
        <canvas
            ref={canvasRef}
            onClick={props.onClick}
            className="full-width-and-height"
            style={style}
        />
    );
}

function create(canvas, radius, margin, initializer) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const outerRadius = radius + margin;
    const outerDiameter = 2 * outerRadius;

    const numRows = Math.floor((height - 4 * margin) / outerDiameter);
    const numCols = Math.floor((width - 4 * margin) / outerDiameter);

    const innerWidth = numCols * outerDiameter;
    const innerHeight = numRows * outerDiameter;

    const rowGutter = Math.floor((height - innerHeight) / 2);
    const colGutter = Math.floor((width - innerWidth) / 2);

    const rowOffset = outerRadius + rowGutter;
    const colOffset = outerRadius + colGutter;

    const grid: Grid = [];

    let initializerMethod;
    switch (initializer) {
        case 'glider':
            initializerMethod = initGlider;
            break;
        case 'random':
        default:
            initializerMethod = initRandom;
    }

    if (canvas.width !== width) {
        canvas.width = width;
    }

    if (canvas.height !== height) {
        canvas.height = height;
    }

    for (let r = 0; r < numRows; ++r) {
        const row: Cell[] = [];
        const y = rowOffset + r * outerDiameter;
        for (let c = 0; c < numCols; ++c) {
            const x = colOffset + c * outerDiameter;
            row.push({ x, y, alive: initializerMethod(r, c), changed: true });
        }
        grid.push(row);
    }

    return grid;
}

function initRandom(r: number, c: number): boolean {
    const rand = Math.random();
    return rand > 0.9;
}

function initGlider(r: number, c: number): boolean {
    return (
        (r === 2 && c === 3) || (r === 3 && c === 4) || (r === 4 && (c === 2 || c === 3 || c === 4))
    );
}

function clear(canvas) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function evolve(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;

    for (let r = 0; r < numRows; ++r) {
        const row = grid[r];
        for (let c = 0; c < numCols; ++c) {
            const cell = row[c];
            const neighborhood = getNeighborhood(grid, r, c);
            const numAlive = neighborhood.reduce((result, cell) => {
                return result + (cell.alive ? 1 : 0);
            }, 0);
            switch (numAlive) {
                case 3:
                    // Stay alive or rise from the dead
                    cell.changed = cell.alive ? false : true;
                    break;
                case 4:
                    // Stay alive or dead
                    cell.changed = false;
                    break;
                default:
                    // Die or stay dead
                    cell.changed = cell.alive ? true : false;
            }
        }
    }

    for (let i = 0; i < numRows; ++i) {
        const row = grid[i];
        for (let j = 0; j < numCols; ++j) {
            const cell = row[j];
            if (cell.changed) {
                cell.alive = !cell.alive;
            }
        }
    }
}

function getNeighborhood(grid: Grid, row: number, col: number): Cell[] {
    const numRows = grid.length;
    const numCols = grid[0].length;
    const rowLimit = numRows - 1;
    const colLimit = numCols - 1;
    const prevRow = row === 0 ? rowLimit : row - 1;
    const nextRow = row === rowLimit ? 0 : row + 1;
    const prevCol = col === 0 ? colLimit : col - 1;
    const nextCol = col === colLimit ? 0 : col + 1;
    const coordinates = [
        [prevRow, prevCol],
        [prevRow, col],
        [prevRow, nextCol],
        [row, prevCol],
        [row, col],
        [row, nextCol],
        [nextRow, prevCol],
        [nextRow, col],
        [nextRow, nextCol]
    ];
    return coordinates.map(([r, c]) => grid[r][c]);
}

function draw(grid, canvas, radius) {
    const context = canvas.getContext('2d');
    const numRows = grid.length;
    const numCols = grid[0].length;
    const diameter = 2 * radius;
    const amongTheLiving: Coordinate[] = [];
    const dead: Coordinate[] = [];

    for (let i = 0; i < numRows; ++i) {
        const row = grid[i];
        for (let j = 0; j < numCols; ++j) {
            const cell = row[j];
            if (cell.changed) {
                const { x, y, alive } = cell;
                alive ? amongTheLiving.push({ x, y }) : dead.push({ x, y });
                context.clearRect(x - radius, y - radius, diameter, diameter);
            }
        }
    }

    context.fillStyle = 'red';
    for (const { x, y } of amongTheLiving) {
        context.beginPath();
        context.arc(x, y, radius, 0, TWO_PI);
        context.fill();
    }

    context.fillStyle = 'black';
    for (const { x, y } of dead) {
        context.beginPath();
        context.arc(x, y, radius, 0, TWO_PI);
        context.fill();
    }
}
