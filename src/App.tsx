import * as React from "react";
import { ChakraProvider, Flex, theme } from "@chakra-ui/react";
import ContainerScreenModel from "./components/atoms/ContainerScreenModel";

export const App = () => (
  <ChakraProvider theme={theme}>
    <ContainerScreenModel>
      <>kkkkk</>
    </ContainerScreenModel>
  </ChakraProvider>
);
