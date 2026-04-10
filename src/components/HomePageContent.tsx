import { Flex } from "@chakra-ui/react";
import * as React from "react";
import SectionProfile from "./sections/SectionProfile";
import SectionGitHubContributions from "./sections/SectionGitHubContributions";
import SectionPortfolioBuilderPitch from "./sections/SectionPortfolioBuilderPitch";
import SectionHowIWork from "./sections/SectionHowIWork";
import SectionProjects from "./sections/SectionProjects";

export function HomePageContent() {
  return (
    <Flex
      justifyContent="flex-start"
      flexDir="column"
      alignItems="center"
      gap={{ base: 4, md: 8 }}
      w="100%"
    >
      <SectionProfile />
      <SectionGitHubContributions />
      <SectionPortfolioBuilderPitch />
      <SectionHowIWork />
      <SectionProjects />
    </Flex>
  );
}
