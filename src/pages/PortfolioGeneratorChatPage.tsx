import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Input,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";
import { FaGithub, FaUser } from "react-icons/fa";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ThemeModeToggle } from "../components/atoms/ThemeModeToggle";
import TextGradientModel from "../components/atoms/TextGradientModel.1";
import { LineGradientModel } from "../components/atoms/LineGradientModel";
import { colors } from "../components/theme/Theme";
import { useAccentGradient } from "../components/theme/AccentGradientContext";
import { usePortfolioGitHubUser } from "../context/PortfolioGitHubUserContext";

const GITHUB_USERS_API = "https://api.github.com/users/" as const;

type ChatRole = "bot" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

function normalizeGithubLogin(raw: string) {
  return raw.trim().replace(/^@+/, "");
}

export default function PortfolioGeneratorChatPage() {
  const navigate = useNavigate();
  const { setPortfolioGitHubLogin } = usePortfolioGitHubUser();
  const { selected } = useAccentGradient();
  const accentGradient = `linear(to-r, ${selected.stops.join(", ")})`;

  const bgGradient = useColorModeValue(colors.bgGradientLight, colors.bgGradient);
  const cardBg = useColorModeValue("white", "gray.900");
  const scrollAreaBg = useColorModeValue("gray.50", "blackAlpha.300");
  const botBg = useColorModeValue("white", "whiteAlpha.80");
  const userBg = useColorModeValue("gray.100", "whiteAlpha.120");
  const textMuted = useColorModeValue("gray.600", "whiteAlpha.800");
  const textMain = useColorModeValue("gray.800", "whiteAlpha.900");
  const footerBarBg = useColorModeValue("white", "whiteAlpha.50");
  const shadowCard = useColorModeValue(
    "0 4px 24px rgba(0,0,0,0.06)",
    "0 4px 32px rgba(0,0,0,0.35)",
  );
  const bubbleBotShadow = useColorModeValue(
    "sm",
    "0 2px 8px rgba(0,0,0,0.25)",
  );
  const hairlineBorder = useColorModeValue("gray.100", "whiteAlpha.100");
  const botBubbleBorder = useColorModeValue("gray.100", "whiteAlpha.100");
  const userBubbleBorder = useColorModeValue("transparent", "whiteAlpha.100");
  const userAvatarBg = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputBgResolved = useColorModeValue("white", "gray.800");

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [step, setStep] = React.useState<"username" | "confirm">("username");
  const [validatedLogin, setValidatedLogin] = React.useState<string | null>(
    null,
  );
  const [validating, setValidating] = React.useState(false);
  const listEndRef = React.useRef<HTMLDivElement>(null);

  const appendMessage = React.useCallback((role: ChatRole, text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, text },
    ]);
  }, []);

  const chatBootstrapped = React.useRef(false);
  React.useEffect(() => {
    if (chatBootstrapped.current) return;
    chatBootstrapped.current = true;
    appendMessage(
      "bot",
      "Olá! Sou o assistente do gerador. Digite abaixo um usuário válido do GitHub (só o login, sem @) para buscarmos nome e foto do perfil.",
    );
  }, [appendMessage]);

  React.useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendUsername = async () => {
    const login = normalizeGithubLogin(input);
    if (!login || validating) return;

    appendMessage("user", login);
    setInput("");
    setValidating(true);

    try {
      const res = await fetch(`${GITHUB_USERS_API}${encodeURIComponent(login)}`);
      if (!res.ok) {
        appendMessage(
          "bot",
          "Não encontrei esse usuário no GitHub. Confira o login e tente novamente.",
        );
        return;
      }
      const body = (await res.json()) as { login?: string };
      const resolved = body.login?.trim() || login;
      setValidatedLogin(resolved);
      setStep("confirm");
      appendMessage(
        "bot",
        `Encontrei o usuário “${resolved}”. Deseja atualizar o portfólio com as informações deste perfil?`,
      );
    } catch {
      appendMessage(
        "bot",
        "Não foi possível validar agora. Verifique sua conexão e tente de novo.",
      );
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmYes = () => {
    if (!validatedLogin) return;
    appendMessage("user", "Sim, quero.");
    setPortfolioGitHubLogin(validatedLogin);
    appendMessage(
      "bot",
      "Perfeito! O portfólio será atualizado com esse usuário. Redirecionando…",
    );
    window.setTimeout(() => navigate("/"), 600);
  };

  const handleConfirmNo = () => {
    appendMessage("user", "Não, obrigado.");
    appendMessage(
      "bot",
      "Tudo bem. Você pode voltar ao início quando quiser ou informar outro usuário.",
    );
    setStep("username");
    setValidatedLogin(null);
  };

  const outlineBtnHover = useColorModeValue(
    { bg: "gray.100" },
    { bg: "whiteAlpha.100" },
  );
  const outlineBtnBorder = useColorModeValue("gray.400", "whiteAlpha.400");
  const outlineBtnColor = useColorModeValue("gray.800", "white");

  return (
    <Flex
      minH="100vh"
      direction="column"
      bgGradient={bgGradient}
      pl={{ base: 4, md: 8 }}
      pr={{ base: 4, md: 8 }}
      pt={{ base: 4, md: 6 }}
      pb={8}
      transition="background 0.25s ease"
    >
      <Flex
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={3}
        mb={4}
        maxW="720px"
        w="100%"
        mx="auto"
      >
        <Link
          as={RouterLink}
          to="/"
          fontSize="sm"
          fontWeight="medium"
          color={textMain}
          _hover={{ opacity: 0.85 }}
        >
          ← Voltar ao portfólio
        </Link>
        <ThemeModeToggle />
      </Flex>

      <Flex
        flex={1}
        align="center"
        justify="center"
        w="100%"
        py={{ base: 4, md: 8 }}
      >
        <Box w="100%" maxW="640px">
          <Flex direction="column" align="center" w="100%">
            <Box textAlign="center" w="100%">
              <TextGradientModel fontSize={{ base: "2xl", md: "3xl" }}>
                Gerador de portfólio
              </TextGradientModel>
            </Box>
            <LineGradientModel type="horizontal" size="160px" />
          </Flex>

          <Text
            color={textMuted}
            fontSize="sm"
            lineHeight="tall"
            mt={4}
            mb={8}
            maxW="560px"
            mx="auto"
            textAlign="center"
          >
            Este fluxo usa dados públicos do GitHub para montar a pré-visualização
            do portfólio. Para o teste funcionar, é necessário um usuário válido e
            existente na plataforma — assim conseguimos carregar foto, nome e
            gráfico de contribuições.
          </Text>

          <Box
            p="1px"
            borderRadius="2xl"
            bgGradient={accentGradient}
            boxShadow={shadowCard}
            maxW="640px"
            mx="auto"
          >
            <Box
              bg={cardBg}
              borderRadius="2xl"
              overflow="hidden"
              display="flex"
              flexDirection="column"
              minH={{ base: "400px", md: "460px" }}
              maxH={{ base: "65vh", md: "520px" }}
            >
              <Flex
                align="center"
                gap={2}
                px={4}
                py={3}
                borderBottomWidth="1px"
                borderColor={hairlineBorder}
              >
                <Flex
                  align="center"
                  justify="center"
                  w={9}
                  h={9}
                  borderRadius="full"
                  bgGradient={accentGradient}
                  color="white"
                  flexShrink={0}
                >
                  <Icon as={FaGithub} boxSize={5} />
                </Flex>
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="semibold" color={textMain}>
                    Assistente do gerador
                  </Text>
                  <Text fontSize="xs" color={textMuted}>
                    Validação via API pública do GitHub
                  </Text>
                </Box>
              </Flex>

              <Flex
                direction="column"
                gap={3}
                flex={1}
                overflowY="auto"
                px={4}
                py={4}
                bg={scrollAreaBg}
                sx={{
                  scrollbarWidth: "thin",
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-thumb": {
                    borderRadius: "full",
                    bg: "whiteAlpha.300",
                  },
                }}
              >
                {messages.map((m) => (
                  <Flex
                    key={m.id}
                    justify={m.role === "user" ? "flex-end" : "flex-start"}
                    align="flex-end"
                    gap={2}
                  >
                    {m.role === "bot" ? (
                      <Flex
                        align="center"
                        justify="center"
                        w={8}
                        h={8}
                        borderRadius="full"
                        flexShrink={0}
                        bgGradient={accentGradient}
                        color="white"
                      >
                        <Icon as={FaGithub} boxSize={4} />
                      </Flex>
                    ) : null}
                    <Box
                      maxW={{ base: "88%", sm: "78%" }}
                      px={4}
                      py={2.5}
                      borderRadius="2xl"
                      borderTopLeftRadius={m.role === "bot" ? "md" : "2xl"}
                      borderTopRightRadius={m.role === "user" ? "md" : "2xl"}
                      bg={m.role === "user" ? userBg : botBg}
                      color={textMain}
                      fontSize="sm"
                      lineHeight="short"
                      boxShadow={m.role === "bot" ? bubbleBotShadow : "none"}
                      borderWidth="1px"
                      borderColor={
                        m.role === "user" ? userBubbleBorder : botBubbleBorder
                      }
                    >
                      {m.text}
                    </Box>
                    {m.role === "user" ? (
                      <Flex
                        align="center"
                        justify="center"
                        w={8}
                        h={8}
                        borderRadius="full"
                        flexShrink={0}
                        bg={userAvatarBg}
                        color={textMain}
                      >
                        <Icon as={FaUser} boxSize={3.5} />
                      </Flex>
                    ) : null}
                  </Flex>
                ))}
                <div ref={listEndRef} />
              </Flex>

              <Box bg={footerBarBg} px={4} py={3}>
                <Divider mb={3} borderColor={hairlineBorder} />
                {step === "confirm" ? (
                  <Flex gap={3} justify="center" flexWrap="wrap">
                    <Box p="1px" borderRadius="md" bgGradient={accentGradient}>
                      <Button
                        size="md"
                        bg={cardBg}
                        color={outlineBtnColor}
                        _hover={{ opacity: 0.92 }}
                        onClick={handleConfirmYes}
                      >
                        Sim, atualizar portfólio
                      </Button>
                    </Box>
                    <Button
                      size="md"
                      variant="outline"
                      borderColor={outlineBtnBorder}
                      color={outlineBtnColor}
                      _hover={outlineBtnHover}
                      onClick={handleConfirmNo}
                    >
                      Não
                    </Button>
                  </Flex>
                ) : (
                  <Flex gap={2} align="stretch">
                    <Input
                      placeholder="usuário do GitHub"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleSendUsername();
                      }}
                      isDisabled={validating}
                      size="md"
                      bg={inputBgResolved}
                      borderRadius="xl"
                      borderColor={inputBorder}
                      _focusVisible={{
                        borderColor: "purple.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)",
                      }}
                    />
                    <Box p="1px" borderRadius="xl" bgGradient={accentGradient} flexShrink={0}>
                      <Button
                        h="100%"
                        minH="40px"
                        px={6}
                        borderRadius="xl"
                        bg={cardBg}
                        color={outlineBtnColor}
                        _hover={{ opacity: 0.92 }}
                        onClick={() => void handleSendUsername()}
                        isLoading={validating}
                        loadingText="…"
                      >
                        Enviar
                      </Button>
                    </Box>
                  </Flex>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
