import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Mount the App component into <div id="root"> in index.html
createRoot(document.getElementById("root")).render(<App />);
