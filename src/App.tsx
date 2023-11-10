import * as React from "react";
import { ChakraProvider, Flex, theme, Text } from "@chakra-ui/react";
import ContainerScreenModel from "./components/atoms/ContainerScreenModel";

import SectionProfile from "./components/sections/SectionProfile";

export const App = () => (
  <ChakraProvider theme={theme}>
    <ContainerScreenModel>
      <Flex justifyContent={"center"} flexDir={"column"}>
        <SectionProfile />
      </Flex>
    </ContainerScreenModel>
  </ChakraProvider>
);
