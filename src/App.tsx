import * as React from "react";
import { ChakraProvider, Flex, theme } from "@chakra-ui/react";
import ContainerScreenModel from "./components/atoms/ContainerScreenModel";
import TextGradientModel from "./components/atoms/TextGradientModel.1";

export const App = () => (
  <ChakraProvider theme={theme}>
    <ContainerScreenModel>
      <TextGradientModel>David Mota</TextGradientModel>
    </ContainerScreenModel>
  </ChakraProvider>
);
