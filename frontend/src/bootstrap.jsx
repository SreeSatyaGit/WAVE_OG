import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

function mount(element, { authInfo } = {}) {
  ReactDOM.createRoot(element).render(<App authInfo={authInfo} />);
}

if (import.meta.env.DEV) {
  const devRoot = document.getElementById("root");
  const authInfo = {
    isLoggedIn: true,
    token: "local-dev-token",
    apps: [{ name: "Assay Run Monitor" }],
  };

  if (devRoot) {
    mount(devRoot, { authInfo });
  }
}

export default mount;
