import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { ThemeProvider } from "styled-components";
import { ThorinGlobalStyles, lightTheme } from "@ensdomains/thorin";
import { WagmiConfig, createClient, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <ThemeProvider theme={lightTheme}>
        <ThorinGlobalStyles />
        <App />
      </ThemeProvider>
    </WagmiConfig>
  </React.StrictMode>
);
