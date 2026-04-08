import * as React from "react";
import { ChakraProvider, Flex, theme } from "@chakra-ui/react";
import ContainerScreenModel from "./components/atoms/ContainerScreenModel";
import SectionProfile from "./components/sections/SectionProfile";
import SectionHowIWork from "./components/sections/SectionHowIWork";
import SectionProjects from "./components/sections/SectionProjects";

export const App = () => (
  <ChakraProvider theme={theme}>
    <ContainerScreenModel>
      <Flex
        justifyContent="flex-start"
        flexDir="column"
        alignItems="center"
        gap={{ base: 4, md: 8 }}
        w="100%"
      >
        <SectionProfile />
        <SectionHowIWork />
        <SectionProjects />
      </Flex>
    </ContainerScreenModel>
  </ChakraProvider>
);
