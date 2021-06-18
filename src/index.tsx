import React from "react";
import ReactDOM from "react-dom";
import AppWithContext from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <AppWithContext />
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
