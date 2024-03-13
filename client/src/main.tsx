import React from "react";
import ReactDOM from "react-dom/client";
import keycloakConfig from "./keycloak-config";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

import Keycloak from "keycloak-js";
import { StateProvider } from "./StateProvider";

const keycloak = new Keycloak(keycloakConfig);

keycloak.init({ onLoad: "login-required" }).then((authenticated) => {
  if (authenticated) {
    console.log("User is authenticated");
    const rootElement = document.getElementById("root");
    if (rootElement) {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <StateProvider>
            <App keycloak={keycloak} />
          </StateProvider>
        </React.StrictMode>
      );
    }
  } else {
    console.log("User not authenticated");
    keycloak.login();
  }
});
