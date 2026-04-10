import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Input,
  Link,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
  keyframes,
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

type Step =
  | "username"
  | "confirm_github"
  | "description"
  | "about"
  | "linkedin_yesno"
  | "linkedin_url"
  | "whatsapp_yesno"
  | "whatsapp_phone"
  | "accent_pick"
  | "final_confirm";

const MAX_HERO_ABOUT_LENGTH = 1200;

/** Atraso base antes de cada resposta do assistente (feedback “digitando…”). */
const BOT_REPLY_DELAY_MS = 850;

const OPENING_BOT_MESSAGE =
  "Olá! Sou o assistente do gerador. Digite abaixo um usuário válido do GitHub (só o login, sem @) para buscarmos nome e foto do perfil.";

function botReplyDelayForText(text: string) {
  return Math.min(
    BOT_REPLY_DELAY_MS + Math.min(text.length * 12, 900),
    2400,
  );
}

const waTypingDotKf = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.35;
  }
  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
`;

function normalizeGithubLogin(raw: string) {
  return raw.trim().replace(/^@+/, "");
}

function normalizeLinkedInUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withScheme);
    if (!u.hostname.toLowerCase().includes("linkedin.com")) return null;
    return u.href;
  } catch {
    return null;
  }
}

function buildWhatsAppHref(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  // Formato BR comum no gerador: só DDD + número (10 ou 11 dígitos) → adiciona 55
  if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith("55")) {
    digits = `55${digits}`;
  }
  if (digits.length < 12 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

export default function PortfolioGeneratorChatPage() {
  const navigate = useNavigate();
  const {
    setPortfolioGitHubLogin,
    setPortfolioHeroSubtitle,
    setPortfolioHeroAbout,
    setPortfolioLinkedIn,
    setPortfolioWhatsApp,
    setPortfolioAccentSwatchesHidden,
    setPortfolioGeneratorPreviewOnly,
  } = usePortfolioGitHubUser();
  const { selected, selectedId, options, setSelectedId } = useAccentGradient();
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
  const outlineBtnHover = useColorModeValue(
    { bg: "gray.100" },
    { bg: "whiteAlpha.100" },
  );
  const outlineBtnBorder = useColorModeValue("gray.400", "whiteAlpha.400");
  const outlineBtnColor = useColorModeValue("gray.800", "white");
  const swatchSelectedBorder = useColorModeValue("gray.800", "white");
  const swatchBorder = useColorModeValue("gray.400", "whiteAlpha.500");
  const botAssistantBg = useColorModeValue("gray.600", "gray.500");
  const botAssistantIconColor = useColorModeValue("white", "white");
  const typingBubbleBg = useColorModeValue("white", "whiteAlpha.90");
  const typingDotColor = useColorModeValue("gray.500", "whiteAlpha.600");

  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    {
      id: "opening-welcome",
      role: "bot",
      text: OPENING_BOT_MESSAGE,
    },
  ]);
  const [botTyping, setBotTyping] = React.useState(false);
  const [isApplyingPortfolio, setIsApplyingPortfolio] = React.useState(false);
  const botTimersRef = React.useRef<number[]>([]);

  const clearBotTimers = React.useCallback(() => {
    botTimersRef.current.forEach((id) => window.clearTimeout(id));
    botTimersRef.current = [];
    setBotTyping(false);
  }, []);

  React.useEffect(() => () => clearBotTimers(), [clearBotTimers]);
  const [input, setInput] = React.useState("");
  const [step, setStep] = React.useState<Step>("username");
  const [validatedLogin, setValidatedLogin] = React.useState<string | null>(
    null,
  );
  const [pendingDescription, setPendingDescription] = React.useState<
    string | null
  >(null);
  const [pendingAbout, setPendingAbout] = React.useState<string | null>(null);
  /** false = usuário recusou; string = URL/href; undefined = ainda não definido nesta etapa */
  const [draftLinkedIn, setDraftLinkedIn] = React.useState<
    string | false | undefined
  >(undefined);
  const [draftWhatsApp, setDraftWhatsApp] = React.useState<
    string | false | undefined
  >(undefined);
  const [pendingAccentId, setPendingAccentId] = React.useState<string | null>(
    null,
  );
  const [validating, setValidating] = React.useState(false);
  const listEndRef = React.useRef<HTMLDivElement>(null);
  /** Cor do tema antes do passo de escolha (para reverter se o fluxo for cancelado). */
  const accentIdBeforePickStepRef = React.useRef<string | null>(null);

  const appendMessage = React.useCallback((role: ChatRole, text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, text },
    ]);
  }, []);

  const appendBotMessageDelayed = React.useCallback(
    (text: string, delayMs?: number) => {
      const ms = delayMs ?? botReplyDelayForText(text);
      setBotTyping(true);
      const t = window.setTimeout(() => {
        setBotTyping(false);
        appendMessage("bot", text);
        botTimersRef.current = botTimersRef.current.filter((x) => x !== t);
      }, ms);
      botTimersRef.current.push(t);
    },
    [appendMessage],
  );

  React.useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  const resetFlowFromStart = React.useCallback(() => {
    clearBotTimers();
    const savedAccent = accentIdBeforePickStepRef.current;
    accentIdBeforePickStepRef.current = null;
    if (savedAccent !== null) {
      setSelectedId(savedAccent);
    }
    setStep("username");
    setValidatedLogin(null);
    setPendingDescription(null);
    setPendingAbout(null);
    setDraftLinkedIn(undefined);
    setDraftWhatsApp(undefined);
    setPendingAccentId(null);
    setIsApplyingPortfolio(false);
    setInput("");
    setMessages([
      {
        id: `opening-${Date.now()}`,
        role: "bot",
        text: OPENING_BOT_MESSAGE,
      },
    ]);
  }, [clearBotTimers, setSelectedId]);

  const handleSendUsername = async () => {
    const login = normalizeGithubLogin(input);
    if (!login || validating) return;

    appendMessage("user", login);
    setInput("");
    setValidating(true);

    try {
      const res = await fetch(`${GITHUB_USERS_API}${encodeURIComponent(login)}`);
      if (!res.ok) {
        appendBotMessageDelayed(
          "Não encontrei esse usuário no GitHub. Confira o login e tente novamente.",
        );
        return;
      }
      const body = (await res.json()) as { login?: string };
      const resolved = body.login?.trim() || login;
      setValidatedLogin(resolved);
      setStep("confirm_github");
      appendBotMessageDelayed(
        `Encontrei o usuário “${resolved}”. Deseja utilizar este perfil no portfólio?`,
      );
    } catch {
      appendBotMessageDelayed(
        "Não foi possível validar agora. Verifique sua conexão e tente de novo.",
      );
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmGithubYes = () => {
    appendMessage("user", "Sim, quero usar.");
    setStep("description");
    appendBotMessageDelayed(
      "Ótimo! Escreva uma descrição profissional curta para aparecer logo abaixo do nome no hero (stack, foco ou headline — até 280 caracteres).",
    );
  };

  const handleConfirmGithubNo = () => {
    appendMessage("user", "Não.");
    appendBotMessageDelayed(
      "Sem problema. Informe outro usuário do GitHub quando quiser.",
    );
    setValidatedLogin(null);
    setStep("username");
  };

  const handleSendDescription = () => {
    const text = input.trim();
    if (!text) {
      appendBotMessageDelayed(
        "A descrição não pode ficar vazia. Escreva pelo menos uma frase curta.",
      );
      return;
    }
    if (text.length > 280) {
      appendBotMessageDelayed(
        "Use no máximo 280 caracteres para manter o layout do hero equilibrado.",
      );
      return;
    }
    appendMessage("user", text);
    setInput("");
    setPendingDescription(text);
    setDraftLinkedIn(undefined);
    setDraftWhatsApp(undefined);
    setStep("about");
    appendBotMessageDelayed(
      "Agora escreva um texto para se apresentar: quem você é, sua trajetória, o que mais gosta de fazer e, se quiser, um convite para explorar o restante do portfólio.",
    );
  };

  const handleSendAbout = () => {
    const text = input.trim();
    if (!text) {
      appendBotMessageDelayed(
        "Escreva pelo menos um parágrafo para o visitante te conhecer melhor.",
      );
      return;
    }
    if (text.length > MAX_HERO_ABOUT_LENGTH) {
      appendBotMessageDelayed(
        `Use no máximo ${MAX_HERO_ABOUT_LENGTH} caracteres para o texto caber bem no layout.`,
      );
      return;
    }
    appendMessage("user", text);
    setInput("");
    setPendingAbout(text);
    setStep("linkedin_yesno");
    appendBotMessageDelayed("Deseja incluir o link do seu LinkedIn?");
  };

  const handleLinkedinYes = () => {
    appendMessage("user", "Sim, adicionar LinkedIn.");
    setStep("linkedin_url");
    appendBotMessageDelayed(
      "Envie a URL do seu perfil (ex.: https://www.linkedin.com/in/seu-usuario ou linkedin.com/in/seu-usuario).",
    );
  };

  const handleLinkedinNo = () => {
    appendMessage("user", "Não quero LinkedIn.");
    setDraftLinkedIn(false);
    setStep("whatsapp_yesno");
    appendBotMessageDelayed("Deseja incluir seu WhatsApp para contato?");
  };

  const handleSendLinkedinUrl = () => {
    const href = normalizeLinkedInUrl(input);
    if (!href) {
      appendBotMessageDelayed(
        "URL inválida. Use um link do domínio linkedin.com (perfil público).",
      );
      return;
    }
    appendMessage("user", input.trim());
    setInput("");
    setDraftLinkedIn(href);
    setStep("whatsapp_yesno");
    appendBotMessageDelayed("Deseja incluir seu WhatsApp para contato?");
  };

  const handleWhatsappYes = () => {
    appendMessage("user", "Sim, adicionar WhatsApp.");
    setStep("whatsapp_phone");
    appendBotMessageDelayed(
      "Informe seu WhatsApp com DDD e número, só dígitos, sem espaços ou símbolos. Exemplo: 31 977777777 — digite 31977777777.",
    );
  };

  const handleWhatsappNo = () => {
    appendMessage("user", "Não quero WhatsApp.");
    setDraftWhatsApp(false);
    accentIdBeforePickStepRef.current = selectedId;
    setStep("accent_pick");
    appendBotMessageDelayed(
      "Por último, escolha a cor predominante do portfólio — use uma das opções abaixo.",
    );
  };

  const handleSendWhatsapp = () => {
    const href = buildWhatsAppHref(input);
    if (!href) {
      appendBotMessageDelayed(
        "Número inválido. Use DDD + número só com dígitos, como 31977777777 (10 ou 11 dígitos no total).",
      );
      return;
    }
    appendMessage("user", input.trim());
    setInput("");
    setDraftWhatsApp(href);
    accentIdBeforePickStepRef.current = selectedId;
    setStep("accent_pick");
    appendBotMessageDelayed(
      "Por último, escolha a cor predominante do portfólio — use uma das opções abaixo.",
    );
  };

  const handlePickAccent = (id: string, name: string) => {
    if (botTyping || isApplyingPortfolio) return;
    appendMessage("user", `Cor: ${name}`);
    setPendingAccentId(id);
    setSelectedId(id);
    setStep("final_confirm");
    appendBotMessageDelayed(
      "Deseja aplicar todas as informações ao portfólio agora?",
    );
  };

  const handleFinalYes = () => {
    if (!validatedLogin || !pendingDescription || !pendingAbout) return;
    if (draftLinkedIn === undefined || draftWhatsApp === undefined) return;
    if (!pendingAccentId) return;
    if (botTyping || isApplyingPortfolio) return;

    setIsApplyingPortfolio(true);
    appendMessage("user", "Sim, aplicar tudo.");
    setPortfolioGitHubLogin(validatedLogin);
    setPortfolioHeroSubtitle(pendingDescription);
    setPortfolioHeroAbout(pendingAbout);

    if (draftLinkedIn === false) {
      setPortfolioLinkedIn({ kind: "hidden" });
    } else {
      setPortfolioLinkedIn({ kind: "url", href: draftLinkedIn });
    }

    if (draftWhatsApp === false) {
      setPortfolioWhatsApp({ kind: "hidden" });
    } else {
      setPortfolioWhatsApp({ kind: "url", href: draftWhatsApp });
    }

    setSelectedId(pendingAccentId);
    setPortfolioAccentSwatchesHidden(true);
    setPortfolioGeneratorPreviewOnly(true);
    accentIdBeforePickStepRef.current = null;

    setBotTyping(true);
    const t1 = window.setTimeout(() => {
      setBotTyping(false);
      appendMessage(
        "bot",
        "Só um instante — estou preparando seu portfólio: aplicando perfil do GitHub, textos, links e o tema de cores que você escolheu.",
      );
      setBotTyping(true);
      const t2 = window.setTimeout(() => {
        setBotTyping(false);
        appendMessage(
          "bot",
          "Tudo certo por aqui. Abrindo a página inicial para você ver o resultado.",
        );
        const t3 = window.setTimeout(() => navigate("/"), 1400);
        botTimersRef.current.push(t3);
      }, 1600);
      botTimersRef.current.push(t2);
    }, 950);
    botTimersRef.current.push(t1);
  };

  const handleFinalNo = () => {
    appendMessage("user", "Não, cancelar.");
    setBotTyping(true);
    const cancelMsg =
      "Tudo bem. Você pode recomeçar o fluxo quando quiser.";
    const t1 = window.setTimeout(() => {
      setBotTyping(false);
      appendMessage("bot", cancelMsg);
      const t2 = window.setTimeout(() => {
        resetFlowFromStart();
      }, 450);
      botTimersRef.current.push(t2);
    }, botReplyDelayForText(cancelMsg));
    botTimersRef.current.push(t1);
  };

  const footerLocked = botTyping || isApplyingPortfolio;

  const yesNoFooter = (
    yesLabel: string,
    noLabel: string,
    onYes: () => void,
    onNo: () => void,
  ) => (
    <Flex gap={3} justify="center" flexWrap="wrap">
      <Box p="1px" borderRadius="md" bgGradient={accentGradient}>
        <Button
          size="md"
          bg={cardBg}
          color={outlineBtnColor}
          _hover={{ opacity: 0.92 }}
          onClick={onYes}
          isDisabled={footerLocked}
        >
          {yesLabel}
        </Button>
      </Box>
      <Button
        size="md"
        variant="outline"
        borderColor={outlineBtnBorder}
        color={outlineBtnColor}
        _hover={outlineBtnHover}
        onClick={onNo}
        isDisabled={footerLocked}
      >
        {noLabel}
      </Button>
    </Flex>
  );

  const renderFooter = () => {
    switch (step) {
      case "confirm_github":
        return yesNoFooter(
          "Sim, usar este usuário",
          "Não",
          handleConfirmGithubYes,
          handleConfirmGithubNo,
        );
      case "linkedin_yesno":
        return yesNoFooter(
          "Sim, adicionar LinkedIn",
          "Não",
          handleLinkedinYes,
          handleLinkedinNo,
        );
      case "whatsapp_yesno":
        return yesNoFooter(
          "Sim, adicionar WhatsApp",
          "Não",
          handleWhatsappYes,
          handleWhatsappNo,
        );
      case "accent_pick":
        return (
          <Flex justify="center" align="center" gap={2.5} flexWrap="wrap">
            {options.map((item) => {
              const gradient = `linear(to-r, ${item.stops.join(", ")})`;
              const isSelected = selectedId === item.id;
              return (
                <Tooltip key={item.id} label={item.name} hasArrow placement="top">
                  <Button
                    type="button"
                    onClick={() => handlePickAccent(item.id, item.name)}
                    aria-label={`Cor ${item.name}`}
                    isDisabled={footerLocked}
                    size="sm"
                    minW="28px"
                    w="28px"
                    h="28px"
                    p={0}
                    borderRadius="full"
                    bgGradient={gradient}
                    borderWidth={isSelected ? "2px" : "1px"}
                    borderColor={isSelected ? swatchSelectedBorder : swatchBorder}
                    _hover={{ opacity: 0.9 }}
                  >
                    <Box w="100%" h="100%" />
                  </Button>
                </Tooltip>
              );
            })}
          </Flex>
        );
      case "final_confirm":
        return yesNoFooter(
          "Sim, aplicar ao portfólio",
          "Não",
          handleFinalYes,
          handleFinalNo,
        );
      case "description":
        return (
          <Flex
            gap={2}
            align="flex-end"
            direction={{ base: "column", sm: "row" }}
          >
            <Textarea
              placeholder="Ex.: Desenvolvedor front-end · React · UX"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendDescription();
                }
              }}
              isDisabled={footerLocked}
              rows={3}
              resize="vertical"
              maxLength={280}
              bg={inputBgResolved}
              borderRadius="xl"
              borderColor={inputBorder}
              _focusVisible={{
                borderColor: "purple.400",
                boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)",
              }}
            />
            <Box
              p="1px"
              borderRadius="xl"
              bgGradient={accentGradient}
              flexShrink={0}
              w={{ base: "100%", sm: "auto" }}
            >
              <Button
                w={{ base: "100%", sm: "auto" }}
                minH="40px"
                px={6}
                borderRadius="xl"
                bg={cardBg}
                color={outlineBtnColor}
                _hover={{ opacity: 0.92 }}
                onClick={handleSendDescription}
                isDisabled={footerLocked}
              >
                Enviar
              </Button>
            </Box>
          </Flex>
        );
      case "about":
        return (
          <Flex
            gap={2}
            align="flex-end"
            direction={{ base: "column", sm: "row" }}
          >
            <Textarea
              placeholder="Conte sua história profissional, o que você faz e o que busca…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              isDisabled={footerLocked}
              rows={6}
              resize="vertical"
              maxLength={MAX_HERO_ABOUT_LENGTH}
              bg={inputBgResolved}
              borderRadius="xl"
              borderColor={inputBorder}
              _focusVisible={{
                borderColor: "purple.400",
                boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)",
              }}
            />
            <Box
              p="1px"
              borderRadius="xl"
              bgGradient={accentGradient}
              flexShrink={0}
              w={{ base: "100%", sm: "auto" }}
            >
              <Button
                w={{ base: "100%", sm: "auto" }}
                minH="40px"
                px={6}
                borderRadius="xl"
                bg={cardBg}
                color={outlineBtnColor}
                _hover={{ opacity: 0.92 }}
                onClick={handleSendAbout}
                isDisabled={footerLocked}
              >
                Enviar
              </Button>
            </Box>
          </Flex>
        );
      case "linkedin_url":
        return (
          <Flex gap={2} align="stretch">
            <Input
              placeholder="https://www.linkedin.com/in/…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendLinkedinUrl();
              }}
              isDisabled={footerLocked}
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
                onClick={handleSendLinkedinUrl}
                isDisabled={footerLocked}
              >
                Enviar
              </Button>
            </Box>
          </Flex>
        );
      case "whatsapp_phone":
        return (
          <Flex gap={2} align="stretch">
            <Input
              placeholder="Ex.: 31977777777"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendWhatsapp();
              }}
              isDisabled={footerLocked}
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
                onClick={handleSendWhatsapp}
                isDisabled={footerLocked}
              >
                Enviar
              </Button>
            </Box>
          </Flex>
        );
      case "username":
      default:
        return (
          <Flex gap={2} align="stretch">
            <Input
              placeholder="usuário do GitHub"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSendUsername();
              }}
              isDisabled={validating || footerLocked}
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
                isDisabled={footerLocked}
                isLoading={validating}
                loadingText="…"
              >
                Enviar
              </Button>
            </Box>
          </Flex>
        );
    }
  };

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
                  bg={botAssistantBg}
                  color={botAssistantIconColor}
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
                        bg={botAssistantBg}
                        color={botAssistantIconColor}
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
                      <Text as="span" whiteSpace="pre-wrap" wordBreak="break-word">
                        {m.text}
                      </Text>
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
                {botTyping ? (
                  <Flex justify="flex-start" align="flex-end" gap={2}>
                    <Flex
                      align="center"
                      justify="center"
                      w={8}
                      h={8}
                      borderRadius="full"
                      flexShrink={0}
                      bg={botAssistantBg}
                      color={botAssistantIconColor}
                    >
                      <Icon as={FaGithub} boxSize={4} />
                    </Flex>
                    <Box
                      px={4}
                      py={3}
                      borderRadius="2xl"
                      borderTopLeftRadius="md"
                      bg={typingBubbleBg}
                      borderWidth="1px"
                      borderColor={botBubbleBorder}
                      boxShadow={bubbleBotShadow}
                    >
                      <HStack spacing={1} align="center" justify="center" minW="44px">
                        {[0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg={typingDotColor}
                            animation={`${waTypingDotKf} 1.05s ease-in-out infinite`}
                            style={{ animationDelay: `${i * 0.14}s` }}
                          />
                        ))}
                      </HStack>
                    </Box>
                  </Flex>
                ) : null}
                <div ref={listEndRef} />
              </Flex>

              <Box bg={footerBarBg} px={4} py={3}>
                <Divider mb={3} borderColor={hairlineBorder} />
                {renderFooter()}
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
