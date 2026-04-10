import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  SECTION_CONTENT_MAX_W,
  SECTION_CONTENT_PY,
  SECTION_TITLE_LINE_SIZE,
} from "../../constants/sectionLayout";
import TextGradientModel from "../atoms/TextGradientModel.1";
import { LineGradientModel } from "../atoms/LineGradientModel";
import { projects } from "../../data/siteContent";

export default function SectionProjects() {
  const introColor = useColorModeValue("gray.600", "whiteAlpha.800");
  const introStrong = useColorModeValue("gray.800", "whiteAlpha.900");
  const cardBg = useColorModeValue("white", "whiteAlpha.50");
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const titleColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const muted = useColorModeValue("gray.500", "whiteAlpha.600");
  const tagBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const bodyMuted = useColorModeValue("gray.700", "whiteAlpha.800");
  const outlineBorder = useColorModeValue("gray.400", "whiteAlpha.400");
  const outlineColor = useColorModeValue("gray.800", "white");
  const outlineHover = useColorModeValue(
    { bg: "gray.100" },
    { bg: "whiteAlpha.100" },
  );
  const ghostColor = useColorModeValue("gray.700", "whiteAlpha.800");
  const ghostHover = useColorModeValue(
    { bg: "gray.100", color: "gray.900" },
    { bg: "whiteAlpha.100", color: "white" },
  );

  return (
    <Box
      as="section"
      id="projetos"
      w="100%"
      maxW={SECTION_CONTENT_MAX_W}
      mx="auto"
      py={SECTION_CONTENT_PY}
    >
      <TextGradientModel fontSize={{ base: "2xl", md: "3xl" }}>
        Projetos
      </TextGradientModel>
      <LineGradientModel type="horizontal" size={SECTION_TITLE_LINE_SIZE} />
      <Text mt={4} color={introColor} maxW="720px">
        Cada card é um espaço para um case real: contexto, stack e o que você
        decidiu em UX ou UI. Edite os dados em{" "}
        <Text as="span" fontWeight="semibold" color={introStrong}>
          src/data/siteContent.ts
        </Text>
        .
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={10}>
        {projects.map((project) => (
          <Flex
            key={project.title}
            direction="column"
            p={6}
            borderRadius="lg"
            bg={cardBg}
            borderWidth="1px"
            borderColor={cardBorder}
            backdropFilter="auto"
            backdropBlur="6px"
          >
            <VStack align="stretch" spacing={4} flex={1}>
              <TextGradientModel fontSize="xl">{project.title}</TextGradientModel>
              <Text color={titleColor} fontSize="sm">
                {project.description}
              </Text>
              <Box>
                <Text fontSize="xs" color={muted} mb={1}>
                  Stack
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {project.stack.map((tag) => (
                    <Text
                      key={tag}
                      as="span"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                      bg={tagBg}
                      color={titleColor}
                    >
                      {tag}
                    </Text>
                  ))}
                </Flex>
              </Box>
              <Box>
                <Text fontSize="xs" color={muted} mb={1}>
                  UX / UI
                </Text>
                <Text color={bodyMuted} fontSize="sm">
                  {project.uxNote}
                </Text>
              </Box>
            </VStack>
            <Flex gap={3} mt={6} flexWrap="wrap">
              {project.liveUrl ? (
                <Button
                  as="a"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  variant="outline"
                  borderColor={outlineBorder}
                  color={outlineColor}
                  _hover={outlineHover}
                >
                  Ver demo
                </Button>
              ) : null}
              {project.repoUrl ? (
                <Button
                  as="a"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  variant="ghost"
                  color={ghostColor}
                  _hover={ghostHover}
                >
                  Código
                </Button>
              ) : null}
            </Flex>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  );
}
