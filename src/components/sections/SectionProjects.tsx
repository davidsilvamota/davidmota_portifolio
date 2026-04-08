import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import TextGradientModel from "../atoms/TextGradientModel.1";
import { LineGradientModel } from "../atoms/LineGradientModel";
import { projects } from "../../data/siteContent";

export default function SectionProjects() {
  return (
    <Box
      as="section"
      id="projetos"
      w="100%"
      maxW="1100px"
      mx="auto"
      py={{ base: 8, md: 12 }}
    >
      <TextGradientModel fontSize={{ base: "2xl", md: "3xl" }}>
        Projetos
      </TextGradientModel>
      <LineGradientModel type="horizontal" size="120px" />
      <Text mt={4} color="whiteAlpha.800" maxW="720px">
        Cada card é um espaço para um case real: contexto, stack e o que você
        decidiu em UX ou UI. Edite os dados em{" "}
        <Text as="span" fontWeight="semibold" color="whiteAlpha.900">
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
            bg="whiteAlpha.50"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            backdropFilter="auto"
            backdropBlur="6px"
          >
            <VStack align="stretch" spacing={4} flex={1}>
              <TextGradientModel fontSize="xl">{project.title}</TextGradientModel>
              <Text color="whiteAlpha.900" fontSize="sm">
                {project.description}
              </Text>
              <Box>
                <Text fontSize="xs" color="whiteAlpha.600" mb={1}>
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
                      bg="whiteAlpha.100"
                      color="whiteAlpha.900"
                    >
                      {tag}
                    </Text>
                  ))}
                </Flex>
              </Box>
              <Box>
                <Text fontSize="xs" color="whiteAlpha.600" mb={1}>
                  UX / UI
                </Text>
                <Text color="whiteAlpha.800" fontSize="sm">
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
                  borderColor="whiteAlpha.400"
                  color="white"
                  _hover={{ bg: "whiteAlpha.100" }}
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
                  color="whiteAlpha.800"
                  _hover={{ bg: "whiteAlpha.100", color: "white" }}
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
