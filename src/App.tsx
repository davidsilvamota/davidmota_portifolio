import * as React from "react";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import { appTheme } from "./chakra-theme";
import ContainerScreenModel from "./components/atoms/ContainerScreenModel";
import SectionProfile from "./components/sections/SectionProfile";
import SectionGitHubContributions from "./components/sections/SectionGitHubContributions";
import SectionHowIWork from "./components/sections/SectionHowIWork";
import SectionProjects from "./components/sections/SectionProjects";
import { AccentGradientProvider } from "./components/theme/AccentGradientContext";

export const App = () => (
  <ChakraProvider theme={appTheme}>
    <AccentGradientProvider>
      <ContainerScreenModel>
        <Flex
          justifyContent="flex-start"
          flexDir="column"
          alignItems="center"
          gap={{ base: 4, md: 8 }}
          w="100%"
        >
          <SectionProfile />
          <SectionGitHubContributions />
          <SectionHowIWork />
          <SectionProjects />
        </Flex>
      </ContainerScreenModel>
    </AccentGradientProvider>
  </ChakraProvider>
);
