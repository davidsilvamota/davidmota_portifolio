import { Box, Button, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  SECTION_CONTENT_MAX_W,
  SECTION_CONTENT_PY,
  SECTION_TITLE_LINE_SIZE,
} from "../../constants/sectionLayout";
import TextGradientModel from "../atoms/TextGradientModel.1";
import { LineGradientModel } from "../atoms/LineGradientModel";
import { useAccentGradient } from "../theme/AccentGradientContext";

export default function SectionPortfolioBuilderPitch() {
  const navigate = useNavigate();
  const { selected } = useAccentGradient();
  const accentGradient = `linear(to-r, ${selected.stops.join(", ")})`;
  const cardBg = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
  const buttonText = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Box
      as="section"
      id="diferencial"
      w="100%"
      maxW={SECTION_CONTENT_MAX_W}
      mx="auto"
      py={SECTION_CONTENT_PY}
      scrollMarginTop={{ base: "88px", md: "96px" }}
    >
      <TextGradientModel fontSize={{ base: "2xl", md: "3xl" }}>
        Meu diferencial: UX + IA
      </TextGradientModel>
      <LineGradientModel type="horizontal" size={SECTION_TITLE_LINE_SIZE} />

      <Box mt={6} p="1px" borderRadius="lg" bgGradient={accentGradient}>
        <Box
          bg={cardBg}
          borderRadius="lg"
          p={{ base: 4, md: 6 }}
          backdropFilter="auto"
          backdropBlur="6px"
        >
          <Text color={textColor} lineHeight="tall">
            Olá, muito prazer! Sou David Mota, desenvolvedor front-end com forte foco em experiência
            do usuário e construção de interfaces modernas. Este projeto vai
            além de um portfólio tradicional: ele demonstra minha capacidade de
            transformar ideias em produtos reais, utilizando boas práticas de
            desenvolvimento e recursos de inteligência artificial. Aqui, o uso
            de um agente de IA é parte central da experiência: ele analisa dados
            públicos do GitHub e do LinkedIn para sugerir descrições e
            configurações personalizadas de forma contextual. Hoje, este projeto
            representa a base de um gerador de portfólios — mostrando não apenas
            o que sei fazer, mas como penso e implemento soluções como desenvolvedor.
          </Text>

          <Flex mt={5} justify="center">
            <Box p="1px" borderRadius="md" bgGradient={accentGradient}>
              <Button
                size="md"
                bg={cardBg}
                color={buttonText}
                _hover={{ opacity: 0.92 }}
                onClick={() => navigate("/gerador")}
              >
                Teste agora
              </Button>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
