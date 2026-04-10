import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";
import { SECTION_CONTENT_MAX_W } from "../constants/sectionLayout";
import { usePortfolioGitHubUser } from "../context/PortfolioGitHubUserContext";
import {
  accentGradientOptions,
  useAccentGradient,
} from "./theme/AccentGradientContext";
import SectionProfile from "./sections/SectionProfile";
import SectionGitHubContributions from "./sections/SectionGitHubContributions";
import SectionPortfolioBuilderPitch from "./sections/SectionPortfolioBuilderPitch";
import SectionHowIWork from "./sections/SectionHowIWork";
import SectionProjects from "./sections/SectionProjects";

export function HomePageContent() {
  const {
    portfolioGeneratorPreviewOnly,
    resetPortfolioToSiteDefaults,
  } = usePortfolioGitHubUser();
  const { selected, setSelectedId } = useAccentGradient();
  const accentGradient = `linear(to-r, ${selected.stops.join(", ")})`;
  const bannerBg = useColorModeValue("white", "gray.900");
  const bannerBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const bannerText = useColorModeValue("gray.700", "whiteAlpha.900");
  const btnColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const exitPreview = React.useCallback(() => {
    resetPortfolioToSiteDefaults();
    setSelectedId(accentGradientOptions[0].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetPortfolioToSiteDefaults, setSelectedId]);

  return (
    <Flex
      justifyContent="flex-start"
      flexDir="column"
      alignItems="center"
      gap={{ base: 4, md: 8 }}
      w="100%"
    >
      {portfolioGeneratorPreviewOnly ? (
        <Box w="100%" maxW={SECTION_CONTENT_MAX_W} mx="auto">
          <Flex
            align="center"
            justify="space-between"
            flexWrap="wrap"
            gap={3}
            py={3}
            px={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={bannerBorder}
            bg={bannerBg}
            backdropFilter="auto"
            backdropBlur="6px"
          >
            <Text fontSize="sm" color={bannerText} flex="1" minW={{ base: "100%", md: "200px" }}>
              Isto é só uma demonstração do gerador: você vê o hero e o calendário de
              contribuições como no teste. Para continuar vendo meu portfólio completo
              (diferencial, como trabalho, projetos e conteúdo original),{" "}
              <Text as="span" fontWeight="semibold">
                clique no botão
              </Text>
              .
            </Text>
            <Box p="1px" borderRadius="md" bgGradient={accentGradient} flexShrink={0}>
              <Button
                size="sm"
                bg={bannerBg}
                color={btnColor}
                _hover={{ opacity: 0.92 }}
                onClick={exitPreview}
                aria-label="Clique aqui para ver o portfólio completo e restaurar o conteúdo original"
              >
                Clique aqui — portfólio completo
              </Button>
            </Box>
          </Flex>
        </Box>
      ) : null}
      <SectionProfile />
      <SectionGitHubContributions />
      {!portfolioGeneratorPreviewOnly ? (
        <>
          <SectionPortfolioBuilderPitch />
          <SectionHowIWork />
          <SectionProjects />
        </>
      ) : null}
    </Flex>
  );
}
