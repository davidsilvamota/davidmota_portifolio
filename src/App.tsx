import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { appTheme } from "./chakra-theme";
import ContainerScreenModel from "./components/atoms/ContainerScreenModel";
import { HomePageContent } from "./components/HomePageContent";
import { AccentGradientProvider } from "./components/theme/AccentGradientContext";
import { PortfolioGitHubUserProvider } from "./context/PortfolioGitHubUserContext";
import PortfolioGeneratorChatPage from "./pages/PortfolioGeneratorChatPage";

export const App = () => (
  <ChakraProvider theme={appTheme}>
    <BrowserRouter>
      <AccentGradientProvider>
        <PortfolioGitHubUserProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ContainerScreenModel>
                  <HomePageContent />
                </ContainerScreenModel>
              }
            />
            <Route path="/gerador" element={<PortfolioGeneratorChatPage />} />
          </Routes>
        </PortfolioGitHubUserProvider>
      </AccentGradientProvider>
    </BrowserRouter>
  </ChakraProvider>
);
