import React from "react";
import { appContext, hideOptions, start, run, pause, showOptions, stop } from "./stores";

interface Props {
  initializer: string;
  stepSignal: number;
  refreshSignal: number;
  reset: () => void;
  interval: number;
  backgroundColor: string;
  aliveColor: string;
  deadColor: string;
  radius: number;
  margin: number;
}

export default function GridComponent(props: Props) {
  const { state: appState, dispatch } = React.useContext(appContext);
  const canvasRef = React.useRef(null);
  const [grid, setGrid] = React.useState<Grid | null>(null);
  const [mouseDownCoords, setMouseDownCoords] = React.useState({ x: 0, y: 0 });
  const style = { backgroundColor: props.backgroundColor };

  const onMouseDown = React.useCallback((event) => {
    setMouseDownCoords({ x: event.clientX, y: event.clientY });
  }, []);

  const onClick = React.useCallback(
    (event) => {
      if (grid) {
        const r = props.radius;
        const { clientX: x, clientY: y } = event;
        const { x: mouseDownX, y: mouseDownY } = mouseDownCoords;
        if (Math.abs(x - mouseDownX) < r && Math.abs(y - mouseDownY) < r) {
          grid.toggleAliveFromXY(x, y);
        }
      }
    },
    [props.radius, mouseDownCoords, grid]
  );

  const onMouseMove = React.useCallback(
    (event) => {
      if (grid && event.buttons === 1) {
        const { clientX: x, clientY: y } = event;
        grid.setAliveFromXY(x, y);
      }
    },
    [grid]
  );

  // Create a new grid on initial render, when the refresh button is
  // clicked, and when the radius, margin, or initializer is changed.
  // This is a layout effect because the grid depends on the size of
  // the canvas.
  React.useLayoutEffect(() => {
    const grid = new Grid();
    grid.setup(canvasRef.current, props.radius, props.margin, props.initializer);
    setGrid(grid);
  }, [props.refreshSignal, props.radius, props.margin, props.initializer]);

  React.useEffect(() => {
    let intervalId;
    if (grid && appState.running) {
      intervalId = setInterval(() => {
        if (!grid.evolve()) {
          clearInterval(intervalId);
          dispatch(stop());
          grid.clear();
          setGrid(new Grid());
        }
      }, props.interval);
    }
    return () => clearInterval(intervalId);
  }, [appState.running, dispatch, props.interval, grid]);

  React.useEffect(() => {
    if (grid && props.stepSignal) {
      grid.evolve();
    }
  }, [props.stepSignal, grid]);

  React.useEffect(() => {
    if (grid) {
      grid.setAliveColor(props.aliveColor);
    }
  }, [props.aliveColor, grid]);

  React.useEffect(() => {
    if (grid) {
      grid.setDeadColor(props.deadColor);
    }
  }, [props.deadColor, grid]);

  const onKeyPress = React.useCallback(
    (event) => {
      if (event.charCode === 32) {
        if (!appState.started) {
          dispatch(start());
        } else if (appState.running) {
          dispatch(pause());
        } else {
          dispatch(run());
        }
        if (appState.showOptions) {
          dispatch(hideOptions());
        } else {
          dispatch(showOptions());
        }
      }
    },
    [appState.started, appState.running, appState.showOptions, dispatch]
  );

  React.useEffect(() => {
    document.addEventListener("keypress", onKeyPress, false);
    return () => {
      document.removeEventListener("keypress", onKeyPress, false);
    };
  }, [onKeyPress]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onKeyUp={onKeyPress}
      className="full-width-and-height"
      style={style}
    />
  );
}

// Grid ---------------------------------------------------------------

const TWO_PI = 2 * Math.PI;

interface Cell {
  x: number;
  y: number;
  alive: boolean;
  changed: boolean;
}

interface Coordinate {
  x: number;
  y: number;
}

class Grid {
  public rows: Cell[][] = [];

  public canvas?: HTMLCanvasElement = undefined;

  public width: number = 0;
  public height: number = 0;

  public radius: number = 0;
  public margin: number = 0;

  public outerRadius: number = 0;
  public outerDiameter: number = 0;

  public numRows: number = 0;
  public numCols: number = 0;

  public innerWidth: number = 0;
  public innerHeight: number = 0;

  public rowGutter: number = 0;
  public colGutter: number = 0;

  public rowOffset: number = 0;
  public colOffset: number = 0;

  public aliveColor: string = "black";
  public deadColor: string = "black";

  setup(canvas, radius, margin, initializer) {
    this.canvas = canvas;
    this.radius = radius;
    this.margin = margin;

    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;

    this.outerRadius = this.radius + this.margin;
    this.outerDiameter = 2 * this.outerRadius;

    this.numRows = Math.floor((this.height - 4 * this.margin) / this.outerDiameter);
    this.numCols = Math.floor((this.width - 4 * this.margin) / this.outerDiameter);

    this.innerWidth = this.numCols * this.outerDiameter;
    this.innerHeight = this.numRows * this.outerDiameter;

    this.rowGutter = Math.floor((this.height - this.innerHeight) / 2);
    this.colGutter = Math.floor((this.width - this.innerWidth) / 2);

    this.rowOffset = this.outerRadius + this.rowGutter;
    this.colOffset = this.outerRadius + this.colGutter;

    if (canvas.width !== this.width) {
      canvas.width = this.width;
    }

    if (canvas.height !== this.height) {
      canvas.height = this.height;
    }

    this.initialize(initializer);
  }

  initialize(initializer) {
    const centerRow = Math.floor(this.numRows / 2);
    const centerCol = Math.floor(this.numCols / 2);

    let initializerMethod;

    const initBlank = (r: number, c: number): boolean => {
      return false;
    };

    const initRandom = (r: number, c: number): boolean => {
      const rand = Math.random();
      return rand > 0.9;
    };

    const initGlider = (r: number, c: number): boolean => {
      return (
        (r === 2 && c === 3) ||
        (r === 3 && c === 4) ||
        (r === 4 && (c === 2 || c === 3 || c === 4))
      );
    };

    const initHorizontalLine = (r: number, c: number): boolean => {
      return r === centerRow;
    };

    const initVerticalLine = (r: number, c: number): boolean => {
      return c === centerCol;
    };

    const initPlus = (r: number, c: number): boolean => {
      return r === centerRow || c === centerCol;
    };

    this.clear();

    switch (initializer) {
      case "blank":
        initializerMethod = initBlank;
        break;
      case "glider":
        initializerMethod = initGlider;
        break;
      case "horizontal-line":
        initializerMethod = initHorizontalLine;
        break;
      case "vertical-line":
        initializerMethod = initVerticalLine;
        break;
      case "plus":
        initializerMethod = initPlus;
        break;
      case "random":
      default:
        initializerMethod = initRandom;
    }

    for (let r = 0; r < this.numRows; ++r) {
      const row: Cell[] = [];
      const y = this.rowOffset + r * this.outerDiameter;
      for (let c = 0; c < this.numCols; ++c) {
        const x = this.colOffset + c * this.outerDiameter;
        row.push({ x, y, alive: initializerMethod(r, c), changed: true });
      }
      this.rows.push(row);
    }

    this.draw(true);
  }

  clear() {
    const canvas = this.canvas;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  setAliveColor(color) {
    this.aliveColor = color;
    this.draw(true);
  }

  setDeadColor(color) {
    this.deadColor = color;
    this.draw(true);
  }

  toggleAlive(row: number, col: number) {
    const cell = this.rows[row][col];
    cell.alive = !cell.alive;
    this.draw(true, row, col, row, col);
  }

  /**
   * Give page X and Y from a click event, find the corresponding cell
   * and toggle its dead/alive status.
   *
   * @param x
   * @param y
   */
  toggleAliveFromXY(x: number, y: number) {
    x -= this.colGutter;
    y -= this.rowGutter;
    const row = Math.floor(y / this.outerDiameter);
    const col = Math.floor(x / this.outerDiameter);
    this.toggleAlive(row, col);
  }

  setAlive(row: number, col: number) {
    const cell = this.rows[row][col];
    cell.alive = true;
    this.draw(true, row, col, row, col);
  }

  setAliveFromXY(x: number, y: number) {
    x -= this.colGutter;
    y -= this.rowGutter;
    const row = Math.floor(y / this.outerDiameter);
    const col = Math.floor(x / this.outerDiameter);
    this.setAlive(row, col);
  }

  draw(force = false, startRow = 0, startCol = 0, endRow = 0, endCol = 0) {
    const context = this.canvas?.getContext("2d");

    if (!context) {
      return;
    }

    const rows = this.rows;
    const radius = this.radius;
    const diameter = 2 * radius;
    const amongTheLiving: Coordinate[] = [];
    const dead: Coordinate[] = [];

    endRow = endRow || rows.length - 1;
    endCol = endCol || rows[0].length - 1;

    for (let i = startRow; i <= endRow; ++i) {
      const row = rows[i];
      for (let j = startCol; j <= endCol; ++j) {
        const cell = row[j];
        if (force || cell.changed) {
          const { x, y, alive } = cell;
          alive ? amongTheLiving.push({ x, y }) : dead.push({ x, y });
          context.clearRect(x - radius, y - radius, diameter, diameter);
        }
      }
    }

    context.fillStyle = this.aliveColor;
    for (const { x, y } of amongTheLiving) {
      context.beginPath();
      context.arc(x, y, radius, 0, TWO_PI);
      context.fill();
    }

    context.fillStyle = this.deadColor;
    for (const { x, y } of dead) {
      context.beginPath();
      context.arc(x, y, radius, 0, TWO_PI);
      context.fill();
    }
  }

  evolve() {
    const rows = this.rows;
    const numRows = rows.length;
    const numCols = rows[0].length;
    const getNeighborhood = this.getNeighborhood.bind(this);
    let numAlive = 0;

    for (let r = 0; r < numRows; ++r) {
      const row = rows[r];
      for (let c = 0; c < numCols; ++c) {
        const cell = row[c];
        const neighborhood = getNeighborhood(r, c);
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
      const row = rows[i];
      for (let j = 0; j < numCols; ++j) {
        const cell = row[j];
        if (cell.changed) {
          cell.alive = !cell.alive;
          if (cell.alive) {
            numAlive += 1;
          }
        }
      }
    }

    this.draw();
    return numAlive;
  }

  getNeighborhood(row: number, col: number): Cell[] {
    const rows = this.rows;
    const numRows = rows.length;
    const numCols = rows[0].length;
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
      [nextRow, nextCol],
    ];
    return coordinates.map(([r, c]) => rows[r][c]);
  }
}
