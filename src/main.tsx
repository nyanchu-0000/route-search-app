import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// React 18以降は import React from 'react' がなくても動きます
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
