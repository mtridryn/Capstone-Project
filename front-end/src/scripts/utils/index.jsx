// CSS imports
import "../../styles/styles.css";

import { createRoot } from "react-dom/client";
import App from "../pages/app.jsx";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  const root = createRoot(container);
  root.render(<App />);
});
