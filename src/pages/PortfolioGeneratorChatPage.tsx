import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Image,
  Icon,
  Input,
  Link,
  Text,
  Textarea,
  Tooltip,
  keyframes,
  useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";
import { FaGithub, FaUser } from "react-icons/fa";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { LineGradientModel } from "../components/atoms/LineGradientModel";
import TextGradientModel from "../components/atoms/TextGradientModel.1";
import { ThemeModeToggle } from "../components/atoms/ThemeModeToggle";
import { useAccentGradient } from "../components/theme/AccentGradientContext";
import { colors } from "../components/theme/Theme";
import { usePortfolioGitHubUser } from "../context/PortfolioGitHubUserContext";

const GITHUB_USERS_API = "https://api.github.com/users/" as const;
const GITHUB_SEARCH_API = "https://api.github.com/search/users" as const;
const OPENAI_RESPONSES_API = "https://api.openai.com/v1/responses" as const;
const PORTFOLIO_AGENT_URL =
  process.env.REACT_APP_PORTFOLIO_AGENT_URL?.trim() || OPENAI_RESPONSES_API;
const PORTFOLIO_AGENT_MODEL =
  process.env.REACT_APP_PORTFOLIO_AGENT_MODEL?.trim() || "gpt-4o-mini";
const PORTFOLIO_AGENT_API_KEY =
  process.env.REACT_APP_PORTFOLIO_AGENT_API_KEY?.trim() ||
  process.env.REACT_APP_OPENAI_API_KEY?.trim() ||
  "";
const MAX_HERO_ABOUT_LENGTH = 1200;
const BOT_REPLY_DELAY_MS = 850;
const OPENING_BOT_MESSAGE =
  "Oi! Me manda seu usuario do GitHub.";

type ChatRole = "bot" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type Step =
  | "username"
  | "pick_github"
  | "linkedin_url"
  | "whatsapp_phone"
  | "description_review"
  | "about_review"
  | "final_confirm";

type GitHubCandidate = {
  login: string;
  name: string;
  avatarUrl: string;
};

type GitHubUserLite = {
  login?: string;
  name?: string | null;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  blog?: string | null;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at?: string;
};

type GitHubRepoLite = {
  name?: string;
  description?: string | null;
  stargazers_count?: number;
  language?: string | null;
  fork?: boolean;
};

type PortfolioAgentSuggestion = {
  subtitle: string;
  about: string;
  accentId: string;
};

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
  if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith("55")) {
    digits = `55${digits}`;
  }
  if (digits.length < 12 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

function botReplyDelayForText(text: string) {
  return Math.min(BOT_REPLY_DELAY_MS + Math.min(text.length * 12, 900), 2400);
}

function extractLinkedInHandle(linkedinUrl: string): string {
  try {
    const u = new URL(linkedinUrl);
    return u.pathname.replace(/^\/+|\/+$/g, "") || linkedinUrl;
  } catch {
    return linkedinUrl;
  }
}

function normalizeFreeText(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseYesNoIntent(raw: string): "yes" | "no" | null {
  const normalized = normalizeFreeText(raw);
  if (!normalized) return null;
  const yesTokens = ["sim", "s", "yes", "y", "quero", "adicionar", "ok", "claro"];
  const noTokens = ["nao", "n", "no", "pular", "sem", "dispensar", "skip"];
  // Prioriza negativa para frases como "nao quero adicionar".
  if (noTokens.some((token) => normalized === token || normalized.includes(`${token} `))) {
    return "no";
  }
  if (yesTokens.some((token) => normalized === token || normalized.includes(`${token} `))) {
    return "yes";
  }
  return null;
}

function extractLinkedInFromText(raw: string): string | null {
  const urlMatch = raw.match(
    /((https?:\/\/)?(www\.)?linkedin\.com\/[^\s"'<>)\]]+)/i,
  );
  if (!urlMatch?.[1]) return null;
  return normalizeLinkedInUrl(urlMatch[1]);
}

function extractWhatsAppHrefFromText(raw: string): string | null {
  const chunks = raw.match(/(\+?\d[\d\s\-()]{8,}\d)/g) || [];
  for (const chunk of chunks) {
    const href = buildWhatsAppHref(chunk);
    if (href) return href;
  }
  return null;
}

function hasContinueIntent(raw: string) {
  const normalized = normalizeFreeText(raw);
  if (!normalized) return false;
  return (
    normalized.includes("gostei") ||
    normalized.includes("ficou bom") ||
    normalized.includes("ta bom") ||
    normalized.includes("tá bom") ||
    normalized.includes("aprovado") ||
    normalized.includes("continuar") ||
    normalized.includes("seguir") ||
    normalized.includes("pode seguir") ||
    normalized.includes("ok") ||
    normalized.includes("fechou") ||
    normalized.includes("gerar") ||
    normalized.includes("pronto") ||
    normalized.includes("finalizar")
  );
}

function safeParseSuggestion(raw: string): PortfolioAgentSuggestion | null {
  const parseJson = (content: string) => {
    const obj = JSON.parse(content) as Partial<PortfolioAgentSuggestion>;
    if (!obj.subtitle || !obj.about || !obj.accentId) return null;
    return {
      subtitle: obj.subtitle.trim(),
      about: obj.about.trim(),
      accentId: obj.accentId.trim(),
    };
  };
  try {
    return parseJson(raw);
  } catch {
    const jsonBlock = raw.match(/\{[\s\S]*\}/);
    if (!jsonBlock) return null;
    try {
      return parseJson(jsonBlock[0]);
    } catch {
      return null;
    }
  }
}

function extractAiText(payload: unknown): string {
  const typed = payload as
    | {
        output_text?: string;
        output?: Array<{ content?: Array<{ text?: string }> }>;
        choices?: Array<{ message?: { content?: string } }>;
      }
    | undefined;
  if (!typed) return "";
  if (typed.output_text?.trim()) return typed.output_text.trim();
  const firstChoice = typed.choices?.[0]?.message?.content?.trim();
  if (firstChoice) return firstChoice;
  return (typed.output || [])
    .flatMap((block) => block.content || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();
}

/** Separa a fala natural do JSON final que o modelo deve enviar após ---PORTFOLIO_JSON--- */
function parseRefinementAssistantReply(raw: string): {
  chat: string;
  suggestion: PortfolioAgentSuggestion | null;
} {
  const trimmed = raw.trim();
  const marker = "---PORTFOLIO_JSON---";
  const idx = trimmed.lastIndexOf(marker);
  if (idx !== -1) {
    const chat = trimmed.slice(0, idx).trim();
    const jsonSlice = trimmed.slice(idx + marker.length).trim();
    return {
      chat: chat || "Pronto, ajustei o texto.",
      suggestion: safeParseSuggestion(jsonSlice),
    };
  }
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    const suggestion = safeParseSuggestion(inner);
    const chat = trimmed.replace(fenceMatch[0], "").trim();
    return {
      chat: chat || "Pronto, ajustei o texto.",
      suggestion,
    };
  }
  const onlyJson = safeParseSuggestion(trimmed);
  if (onlyJson) {
    return { chat: "Atualizei conforme combinamos.", suggestion: onlyJson };
  }
  return { chat: trimmed, suggestion: null };
}

async function requestPortfolioAgentRaw(
  prompt: string,
): Promise<
  | { ok: true; text: string }
  | { ok: false; reason: "no_key" | "http"; status?: number; detail: string }
> {
  if (!PORTFOLIO_AGENT_API_KEY) {
    return { ok: false, reason: "no_key", detail: "" };
  }
  const isChatCompletionsApi = PORTFOLIO_AGENT_URL.includes("/chat/completions");
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PORTFOLIO_AGENT_API_KEY}`,
    };
    if (PORTFOLIO_AGENT_URL.includes("openrouter.ai")) {
      headers["HTTP-Referer"] =
        typeof window !== "undefined" ? window.location.origin : "";
      headers["X-Title"] = "Portfolio Generator";
    }
    const aiRes = await fetch(PORTFOLIO_AGENT_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(
        isChatCompletionsApi
          ? {
              model: PORTFOLIO_AGENT_MODEL,
              messages: [{ role: "user", content: prompt }],
            }
          : {
              model: PORTFOLIO_AGENT_MODEL,
              input: prompt,
            },
      ),
    });
    if (!aiRes.ok) {
      const detail = await aiRes.text();
      return { ok: false, reason: "http", status: aiRes.status, detail };
    }
    const aiBody = await aiRes.json();
    const text = extractAiText(aiBody);
    return { ok: true, text };
  } catch (e) {
    return {
      ok: false,
      reason: "http",
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function requestPortfolioAgentMessages(
  apiMessages: Array<{ role: string; content: string }>,
): Promise<
  | { ok: true; text: string }
  | { ok: false; reason: "no_key" | "http"; status?: number; detail: string }
> {
  if (!PORTFOLIO_AGENT_API_KEY) {
    return { ok: false, reason: "no_key", detail: "" };
  }
  const isChatCompletionsApi = PORTFOLIO_AGENT_URL.includes("/chat/completions");
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PORTFOLIO_AGENT_API_KEY}`,
    };
    if (PORTFOLIO_AGENT_URL.includes("openrouter.ai")) {
      headers["HTTP-Referer"] =
        typeof window !== "undefined" ? window.location.origin : "";
      headers["X-Title"] = "Portfolio Generator";
    }
    const body = isChatCompletionsApi
      ? { model: PORTFOLIO_AGENT_MODEL, messages: apiMessages }
      : {
          model: PORTFOLIO_AGENT_MODEL,
          input: apiMessages
            .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
            .join("\n\n---\n\n"),
        };
    const aiRes = await fetch(PORTFOLIO_AGENT_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!aiRes.ok) {
      const detail = await aiRes.text();
      return { ok: false, reason: "http", status: aiRes.status, detail };
    }
    const aiBody = await aiRes.json();
    const text = extractAiText(aiBody);
    return { ok: true, text };
  } catch (e) {
    return {
      ok: false,
      reason: "http",
      detail: e instanceof Error ? e.message : String(e),
    };
  }
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
  const bubbleBotShadow = useColorModeValue("sm", "0 2px 8px rgba(0,0,0,0.25)");
  const hairlineBorder = useColorModeValue("gray.100", "whiteAlpha.100");
  const botBubbleBorder = useColorModeValue("gray.100", "whiteAlpha.100");
  const userBubbleBorder = useColorModeValue("transparent", "whiteAlpha.100");
  const userAvatarBg = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputBgResolved = useColorModeValue("white", "gray.800");
  const outlineBtnColor = useColorModeValue("gray.800", "white");
  const swatchSelectedBorder = useColorModeValue("gray.800", "white");
  const swatchBorder = useColorModeValue("gray.400", "whiteAlpha.500");
  const botAssistantBg = useColorModeValue("gray.600", "gray.500");
  const botAssistantIconColor = useColorModeValue("white", "white");
  const typingBubbleBg = useColorModeValue("white", "whiteAlpha.90");
  const typingDotColor = useColorModeValue("gray.500", "whiteAlpha.600");

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: "opening-welcome", role: "bot", text: OPENING_BOT_MESSAGE },
  ]);
  const [botTyping, setBotTyping] = React.useState(false);
  const [isApplyingPortfolio, setIsApplyingPortfolio] = React.useState(false);
  const [isGeneratingWithAgent, setIsGeneratingWithAgent] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [step, setStep] = React.useState<Step>("username");
  const [validatedLogin, setValidatedLogin] = React.useState<string | null>(null);
  const [githubCandidates, setGithubCandidates] = React.useState<GitHubCandidate[]>([]);
  const [pendingDescription, setPendingDescription] = React.useState<string | null>(
    null,
  );
  const [pendingAbout, setPendingAbout] = React.useState<string | null>(null);
  const [draftLinkedIn, setDraftLinkedIn] = React.useState<
    string | false | undefined
  >(undefined);
  const [draftWhatsApp, setDraftWhatsApp] = React.useState<
    string | false | undefined
  >(undefined);
  const [pendingAccentId, setPendingAccentId] = React.useState<string | null>(null);
  /** Histórico da conversa com a IA (só user/assistant) nas etapas de revisão. */
  const [refinementThread, setRefinementThread] = React.useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [validating, setValidating] = React.useState(false);
  const listEndRef = React.useRef<HTMLDivElement>(null);
  const botTimersRef = React.useRef<number[]>([]);
  const accentIdBeforePickStepRef = React.useRef<string | null>(null);

  const appendMessage = React.useCallback((role: ChatRole, text: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text }]);
  }, []);

  const clearBotTimers = React.useCallback(() => {
    botTimersRef.current.forEach((id) => window.clearTimeout(id));
    botTimersRef.current = [];
    setBotTyping(false);
  }, []);

  const appendBotMessageDelayed = React.useCallback(
    (text: string, delayMs?: number) => {
      const ms = delayMs ?? botReplyDelayForText(text);
      setBotTyping(true);
      const timer = window.setTimeout(() => {
        setBotTyping(false);
        appendMessage("bot", text);
        botTimersRef.current = botTimersRef.current.filter((x) => x !== timer);
      }, ms);
      botTimersRef.current.push(timer);
    },
    [appendMessage],
  );

  React.useEffect(() => () => clearBotTimers(), [clearBotTimers]);

  React.useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  const resetFlowFromStart = React.useCallback(() => {
    clearBotTimers();
    const prevAccent = accentIdBeforePickStepRef.current;
    accentIdBeforePickStepRef.current = null;
    if (prevAccent) setSelectedId(prevAccent);
    setStep("username");
    setValidatedLogin(null);
    setGithubCandidates([]);
    setPendingDescription(null);
    setPendingAbout(null);
    setDraftLinkedIn(undefined);
    setDraftWhatsApp(undefined);
    setPendingAccentId(null);
    setRefinementThread([]);
    setIsApplyingPortfolio(false);
    setIsGeneratingWithAgent(false);
    setInput("");
    setMessages([{ id: `opening-${Date.now()}`, role: "bot", text: OPENING_BOT_MESSAGE }]);
  }, [clearBotTimers, setSelectedId]);

  const generateWithRealAgent = React.useCallback(
    async (params: { linkedin: string | false; whatsapp: string | false }) => {
      if (!validatedLogin) {
        appendMessage(
          "bot",
          "Algo deu errado: nao ha usuario do GitHub selecionado. Volte e escolha um perfil.",
        );
        return;
      }
      if (!accentIdBeforePickStepRef.current) {
        accentIdBeforePickStepRef.current = selectedId;
      }
      setIsGeneratingWithAgent(true);
      setBotTyping(true);

      try {
        const [ghUserRes, ghReposRes] = await Promise.all([
          fetch(`${GITHUB_USERS_API}${encodeURIComponent(validatedLogin)}`),
          fetch(
            `${GITHUB_USERS_API}${encodeURIComponent(validatedLogin)}/repos?sort=updated&per_page=12`,
          ),
        ]);

        if (!ghUserRes.ok) {
          appendMessage(
            "bot",
            "Nao consegui ler os dados publicos do GitHub agora. Tente novamente em instantes.",
          );
          setStep("username");
          return;
        }

        const ghUser = (await ghUserRes.json()) as GitHubUserLite;
        const ghRepos = ghReposRes.ok
          ? ((await ghReposRes.json()) as GitHubRepoLite[])
          : [];
        const topRepos = ghRepos
          .filter((repo) => !repo.fork)
          .slice(0, 6)
          .map((repo) => ({
            name: repo.name || "",
            description: repo.description || "",
            language: repo.language || "",
            stars: repo.stargazers_count || 0,
          }));

        let linkedInText = "";
        if (params.linkedin && typeof params.linkedin === "string") {
          try {
            const target = params.linkedin.replace(/^https?:\/\//i, "");
            const linkedInRes = await fetch(`https://r.jina.ai/http://${target}`);
            if (linkedInRes.ok) {
              linkedInText = (await linkedInRes.text()).slice(0, 2000);
            }
          } catch {
            linkedInText = "";
          }
        }

        let suggestion: PortfolioAgentSuggestion | null = null;
        const prompt = [
          "Voce e um agente de IA que personaliza portfolios em portugues do Brasil.",
          "Retorne somente JSON valido, sem markdown, com o formato:",
          '{ "subtitle": "...", "about": "...", "accentId": "..." }',
          "Regras:",
          "- subtitle com no maximo 160 caracteres.",
          "- about com 1-2 paragrafos e no maximo 600 caracteres.",
          `- accentId deve ser um destes: ${options.map((o) => o.id).join(", ")}.`,
          "",
          "Contexto GitHub:",
          JSON.stringify(
            {
              login: ghUser.login || validatedLogin,
              name: ghUser.name || "",
              bio: ghUser.bio || "",
              company: ghUser.company || "",
              location: ghUser.location || "",
              blog: ghUser.blog || "",
              publicRepos: ghUser.public_repos || 0,
              followers: ghUser.followers || 0,
              following: ghUser.following || 0,
              createdAt: ghUser.created_at || "",
              topRepos,
            },
            null,
            2,
          ),
          "",
          params.linkedin && typeof params.linkedin === "string"
            ? `LinkedIn informado: ${params.linkedin} (handle: ${extractLinkedInHandle(params.linkedin)}).`
            : "LinkedIn nao informado.",
          linkedInText
            ? `Trecho publico coletado do LinkedIn:\n${linkedInText}`
            : "Nao foi possivel coletar texto publico do LinkedIn.",
          params.whatsapp ? "WhatsApp sera exibido." : "WhatsApp nao sera exibido.",
          "Gere a melhor descricao inicial e o texto de apresentacao para este perfil.",
        ].join("\n");

        const aiResult = await requestPortfolioAgentRaw(prompt);
        if (aiResult.ok) {
          suggestion = aiResult.text ? safeParseSuggestion(aiResult.text) : null;
        } else if (aiResult.reason === "no_key") {
          appendMessage(
            "bot",
            "Agente real desativado: configure REACT_APP_PORTFOLIO_AGENT_API_KEY no .env.",
          );
        } else {
          appendMessage(
            "bot",
            `Nao consegui usar o agente real agora (status ${aiResult.status ?? "?"}). Verifique modelo/URL no .env. Exemplo: ${aiResult.detail.slice(0, 180)}`,
          );
        }

        if (!suggestion) {
          const fallbackName = ghUser.name?.trim() || ghUser.login || validatedLogin;
          suggestion = {
            subtitle:
              ghUser.bio?.trim().slice(0, 160) ||
              `${fallbackName} - Desenvolvedor(a) com projetos ativos no GitHub.`,
            about: `Sou ${fallbackName} e transformo ideias em produtos digitais com foco em qualidade tecnica e evolucao continua. Este portfolio apresenta meus projetos e a forma como trabalho para gerar impacto real.`,
            accentId: options[0]?.id || selectedId,
          };
        }

        const nextSubtitle = suggestion.subtitle.slice(0, 280).trim();
        const nextAbout = suggestion.about.slice(0, MAX_HERO_ABOUT_LENGTH).trim();
        const nextAccentId =
          options.find((opt) => opt.id === suggestion?.accentId)?.id || options[0]?.id;

        setPendingDescription(nextSubtitle);
        setPendingAbout(nextAbout);
        if (nextAccentId) {
          setPendingAccentId(nextAccentId);
          setSelectedId(nextAccentId);
        }
        setRefinementThread([]);
        setInput("");
        setStep("description_review");
        appendMessage(
          "bot",
          `Descricao sugerida:\n"${nextSubtitle}"\n\nSe quiser ajustar, me diga como. Se estiver bom, pode responder "gostei".`,
        );
      } catch {
        appendMessage("bot", "Falhei ao gerar com IA agora. Tente novamente em instantes.");
      } finally {
        setBotTyping(false);
        setIsGeneratingWithAgent(false);
      }
    },
    [appendMessage, options, selectedId, setSelectedId, validatedLogin],
  );

  const sendRefinementChatMessage = React.useCallback(
    async (phase: "description" | "about") => {
      const text = input.trim();
      if (!text) {
        appendBotMessageDelayed(
          "Pode me mandar sua mensagem.",
        );
        return;
      }
      if (!pendingDescription || !pendingAbout || !pendingAccentId) return;
      if (botTyping || isGeneratingWithAgent || isApplyingPortfolio) return;

      const accentId =
        options.find((o) => o.id === pendingAccentId)?.id ||
        pendingAccentId ||
        options[0]?.id ||
        "";

      appendMessage("user", text);
      setInput("");
      setIsGeneratingWithAgent(true);
      setBotTyping(true);

      const systemContent = [
        "Voce e um assistente de IA amigavel, em portugues do Brasil, em um chat dentro de um gerador de portfolio.",
        phase === "description"
          ? "Momento do fluxo: o usuario esta refinando APENAS a descricao curta (subtitle) sob o nome. O texto longo (about) nao deve mudar."
          : "Momento do fluxo: o usuario esta refinando APENAS o texto de apresentacao (about). A descricao curta (subtitle) nao deve mudar.",
        "",
        "Valores atuais (sincronize o JSON com eles quando nao for editar o campo):",
        `subtitle: ${JSON.stringify(pendingDescription)}`,
        `about: ${JSON.stringify(pendingAbout)}`,
        `accentId: ${JSON.stringify(accentId)}`,
        "",
        "Como responder:",
        "- Converse de forma natural (1 a 4 frases). Pode perguntar, sugerir ou confirmar.",
        "- Se aplicar alteracao no texto em foco, mencione o que mudou.",
        "- Sempre que atualizar subtitle ou about, termine com uma linha contendo exatamente: ---PORTFOLIO_JSON---",
        "- Na linha seguinte, um unico objeto JSON valido: {\"subtitle\":\"...\",\"about\":\"...\",\"accentId\":\"...\"}.",
        phase === "description"
          ? '- No JSON, copie "about" literalmente do valor atual acima se nao for altera-lo.'
          : '- No JSON, copie "subtitle" literalmente do valor atual acima se nao for altera-lo.',
        '- Use o mesmo accentId salvo, salvo pedido explicito de mudar cor.',
      ].join("\n");

      const apiMessages: Array<{ role: string; content: string }> = [
        { role: "system", content: systemContent },
        ...refinementThread.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text },
      ];

      try {
        const aiResult = await requestPortfolioAgentMessages(apiMessages);
        if (!aiResult.ok) {
          if (aiResult.reason === "no_key") {
            appendMessage(
              "bot",
              "Agente desativado: configure REACT_APP_PORTFOLIO_AGENT_API_KEY no .env.",
            );
          } else {
            appendMessage(
              "bot",
              `Nao consegui responder agora (${aiResult.status ?? "?"}). ${aiResult.detail.slice(0, 140)}`,
            );
          }
          setRefinementThread((prev) => [...prev, { role: "user", content: text }]);
          return;
        }

        const { chat, suggestion } = parseRefinementAssistantReply(aiResult.text || "");
        appendMessage("bot", chat);
        setRefinementThread((prev) => [
          ...prev,
          { role: "user", content: text },
          { role: "assistant", content: chat },
        ]);

        if (suggestion) {
          if (phase === "description") {
            setPendingDescription(suggestion.subtitle.slice(0, 280).trim());
          } else {
            setPendingAbout(suggestion.about.slice(0, MAX_HERO_ABOUT_LENGTH).trim());
          }
        }
      } catch {
        appendMessage("bot", "Falha na conversa com a IA. Tente de novo em instantes.");
        setRefinementThread((prev) => [...prev, { role: "user", content: text }]);
      } finally {
        setBotTyping(false);
        setIsGeneratingWithAgent(false);
      }
    },
    [
      appendBotMessageDelayed,
      appendMessage,
      botTyping,
      input,
      isApplyingPortfolio,
      isGeneratingWithAgent,
      options,
      pendingAbout,
      pendingAccentId,
      pendingDescription,
      refinementThread,
    ],
  );

  const handleSendUsername = React.useCallback(async () => {
    const login = normalizeGithubLogin(input);
    if (!login || validating) return;

    appendMessage("user", login);
    setInput("");
    setValidating(true);

    try {
      const searchRes = await fetch(
        `${GITHUB_SEARCH_API}?q=${encodeURIComponent(login)}+in:login&type=Users&per_page=3`,
      );
      if (!searchRes.ok) {
        appendBotMessageDelayed(
          "Nao consegui buscar usuarios agora. Tente novamente em instantes.",
        );
        return;
      }

      const searchBody = (await searchRes.json()) as {
        items?: Array<{ login?: string; avatar_url?: string }>;
      };
      const items = (searchBody.items || []).slice(0, 3);
      if (items.length === 0) {
        appendBotMessageDelayed(
          "Nao encontrei usuarios parecidos no GitHub. Tente outro termo.",
        );
        return;
      }

      const detailedCandidates = await Promise.all(
        items.map(async (item) => {
          const candidateLogin = item.login?.trim();
          if (!candidateLogin) return null;
          try {
            const detailRes = await fetch(
              `${GITHUB_USERS_API}${encodeURIComponent(candidateLogin)}`,
            );
            if (!detailRes.ok) {
              return {
                login: candidateLogin,
                name: candidateLogin,
                avatarUrl: item.avatar_url || "",
              };
            }
            const detail = (await detailRes.json()) as {
              login?: string;
              name?: string | null;
              avatar_url?: string;
            };
            const resolvedLogin = detail.login?.trim() || candidateLogin;
            return {
              login: resolvedLogin,
              name: detail.name?.trim() || resolvedLogin,
              avatarUrl: detail.avatar_url || item.avatar_url || "",
            };
          } catch {
            return {
              login: candidateLogin,
              name: candidateLogin,
              avatarUrl: item.avatar_url || "",
            };
          }
        }),
      );

      const candidates = detailedCandidates.filter(
        (item): item is GitHubCandidate => Boolean(item),
      );
      if (candidates.length === 0) {
        appendBotMessageDelayed(
          "Nao consegui montar a lista de perfis agora. Tente novamente.",
        );
        return;
      }

      setGithubCandidates(candidates);
      setStep("pick_github");
      const candidateListText = candidates
        .map((candidate, idx) => `${idx + 1}) ${candidate.name} (@${candidate.login})`)
        .join("\n");
      appendBotMessageDelayed(
        `Encontrei estes perfis no GitHub:\n${candidateListText}`,
      );
    } catch {
      appendBotMessageDelayed(
        "Nao foi possivel consultar o GitHub agora. Verifique sua conexao e tente novamente.",
      );
    } finally {
      setValidating(false);
    }
  }, [appendBotMessageDelayed, appendMessage, input, validating]);

  const handlePickAccent = React.useCallback((id: string) => {
    if (botTyping || isApplyingPortfolio || isGeneratingWithAgent) return;
    setPendingAccentId(id);
    setSelectedId(id);
  }, [botTyping, isApplyingPortfolio, isGeneratingWithAgent, setSelectedId]);

  const handleDescriptionLiked = React.useCallback((userText?: string) => {
    appendMessage("user", userText?.trim() || "Gostei da descricao.");
    setRefinementThread([]);
    setInput("");
    setStep("about_review");
    appendBotMessageDelayed(
      `Texto de apresentacao atual:\n${pendingAbout || ""}\n\nSe quiser ajustar, me diga como. Se estiver bom, pode responder "gostei" que eu sigo.`,
    );
  }, [appendBotMessageDelayed, appendMessage, pendingAbout]);

  const handleAboutLiked = React.useCallback((userText?: string) => {
    appendMessage("user", userText?.trim() || "Gostei do texto de apresentacao.");
    setRefinementThread([]);
    setInput("");
    setStep("final_confirm");
    appendBotMessageDelayed("Perfeito. Escolha uma cor e aplique quando quiser.");
  }, [appendBotMessageDelayed, appendMessage]);

  const handleFinalYes = React.useCallback((appendUserMessage = true) => {
    if (!validatedLogin || !pendingDescription || !pendingAbout || !pendingAccentId) return;
    if (draftLinkedIn === undefined || draftWhatsApp === undefined) return;
    if (botTyping || isApplyingPortfolio || isGeneratingWithAgent) return;

    setIsApplyingPortfolio(true);
    if (appendUserMessage) {
      appendMessage("user", "Sim, aplicar tudo.");
    }
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
        "Estou aplicando o perfil, os textos gerados e a configuracao escolhida.",
      );
      setBotTyping(true);
      const t2 = window.setTimeout(() => {
        setBotTyping(false);
        appendMessage("bot", "Tudo pronto. Abrindo o portfolio.");
        const t3 = window.setTimeout(() => navigate("/"), 1200);
        botTimersRef.current.push(t3);
      }, 1500);
      botTimersRef.current.push(t2);
    }, 900);
    botTimersRef.current.push(t1);
  }, [
    appendMessage,
    botTyping,
    draftLinkedIn,
    draftWhatsApp,
    isApplyingPortfolio,
    isGeneratingWithAgent,
    navigate,
    pendingAccentId,
    pendingAbout,
    pendingDescription,
    setPortfolioAccentSwatchesHidden,
    setPortfolioGeneratorPreviewOnly,
    setPortfolioGitHubLogin,
    setPortfolioHeroAbout,
    setPortfolioHeroSubtitle,
    setPortfolioLinkedIn,
    setPortfolioWhatsApp,
    setSelectedId,
    validatedLogin,
  ]);

  const handleFinalNo = React.useCallback((appendUserMessage = true) => {
    if (appendUserMessage) {
      appendMessage("user", "Nao, cancelar.");
    }
    setBotTyping(true);
    const cancelMsg = "Tudo bem. Voce pode recomeçar o fluxo quando quiser.";
    const t1 = window.setTimeout(() => {
      setBotTyping(false);
      appendMessage("bot", cancelMsg);
      const t2 = window.setTimeout(() => resetFlowFromStart(), 450);
      botTimersRef.current.push(t2);
    }, botReplyDelayForText(cancelMsg));
    botTimersRef.current.push(t1);
  }, [appendMessage, resetFlowFromStart]);

  const footerLocked = botTyping || isApplyingPortfolio || isGeneratingWithAgent;
  const parseGithubCandidateFromText = React.useCallback(
    (raw: string): GitHubCandidate | "another" | null => {
      const value = raw.trim();
      if (!value) return null;
      const normalized = normalizeFreeText(value);
      if (normalized.includes("outro") || normalized.includes("outra")) {
        return "another";
      }
      const numeric = Number(value);
      if (Number.isInteger(numeric) && numeric >= 1 && numeric <= githubCandidates.length) {
        return githubCandidates[numeric - 1] || null;
      }
      const normalizedLogin = normalizeGithubLogin(value).toLowerCase();
      if (!normalizedLogin) return null;
      return (
        githubCandidates.find((candidate) => candidate.login.toLowerCase() === normalizedLogin) ||
        null
      );
    },
    [githubCandidates],
  );

  const tryPickAccentFromMessage = React.useCallback(
    (raw: string) => {
      const normalized = normalizeFreeText(raw);
      if (!normalized.startsWith("cor ")) return false;
      const colorHint = normalized.replace(/^cor\s+/, "").trim();
      if (!colorHint) return false;
      const pickById = options.find((item) => normalizeFreeText(item.id) === colorHint);
      const pickByName = options.find((item) => normalizeFreeText(item.name) === colorHint);
      const picked = pickById || pickByName;
      if (!picked) return false;
      handlePickAccent(picked.id);
      appendBotMessageDelayed(`Perfeito. Cor alterada para "${picked.name}".`);
      return true;
    },
    [appendBotMessageDelayed, handlePickAccent, options],
  );

  const handleStructuredChatSend = React.useCallback(
    async () => {
      const text = input.trim();
      if (!text || footerLocked) return;

      if (step === "description_review") {
        if (hasContinueIntent(text)) {
          setInput("");
          handleDescriptionLiked(text);
          return;
        }
        void sendRefinementChatMessage("description");
        return;
      }
      if (step === "about_review") {
        if (hasContinueIntent(text)) {
          setInput("");
          handleAboutLiked(text);
          return;
        }
        void sendRefinementChatMessage("about");
        return;
      }

      if (step === "username") {
        void handleSendUsername();
        return;
      }

      appendMessage("user", text);
      setInput("");

      if (step === "pick_github") {
        const parsed = parseGithubCandidateFromText(text);
        if (parsed === "another") {
          setGithubCandidates([]);
          setValidatedLogin(null);
          setStep("username");
          appendBotMessageDelayed("Certo, me manda outro usuario.");
          return;
        }
        if (parsed) {
          setValidatedLogin(parsed.login);
          setGithubCandidates([]);
          setStep("linkedin_url");
          appendBotMessageDelayed(
            `Perfeito, vou usar @${parsed.login}. Agora me manda seu LinkedIn.`,
          );
          return;
        }
        appendBotMessageDelayed(
          "Nao entendi qual perfil voce escolheu.",
        );
        return;
      }

      if (step === "linkedin_url") {
        if (parseYesNoIntent(text) === "no" || normalizeFreeText(text).includes("pular")) {
          setDraftLinkedIn(false);
          setStep("whatsapp_phone");
          appendBotMessageDelayed("Sem problema. Agora me manda seu WhatsApp.");
          return;
        }
        const href = normalizeLinkedInUrl(text) || extractLinkedInFromText(text);
        if (!href) {
          appendBotMessageDelayed(
            "Nao consegui ler seu LinkedIn. Pode enviar no formato: https://www.linkedin.com/in/seu-usuario",
          );
          return;
        }
        setDraftLinkedIn(href);
        setStep("whatsapp_phone");
        appendBotMessageDelayed(
          'LinkedIn salvo. Agora me manda seu WhatsApp. Se nao quiser adicionar, pode responder "nao".',
        );
        return;
      }

      if (step === "whatsapp_phone") {
        if (parseYesNoIntent(text) === "no" || normalizeFreeText(text).includes("pular")) {
          setDraftWhatsApp(false);
          void generateWithRealAgent({
            linkedin: draftLinkedIn === undefined ? false : draftLinkedIn,
            whatsapp: false,
          });
          return;
        }
        const href = buildWhatsAppHref(text) || extractWhatsAppHrefFromText(text);
        if (!href) {
          appendBotMessageDelayed(
            "Nao consegui ler seu WhatsApp. Pode enviar com DDD, por exemplo: 31977777777",
          );
          return;
        }
        setDraftWhatsApp(href);
        void generateWithRealAgent({
          linkedin: draftLinkedIn === undefined ? false : draftLinkedIn,
          whatsapp: href,
        });
        return;
      }

      if (step === "final_confirm") {
        if (tryPickAccentFromMessage(text)) return;
        const decision = parseYesNoIntent(text);
        const normalized = normalizeFreeText(text);
        if (decision === "yes" || normalized.includes("aplicar")) {
          handleFinalYes(false);
          return;
        }
        if (decision === "no" || normalized.includes("cancelar")) {
          handleFinalNo(false);
          return;
        }
        appendBotMessageDelayed(
          "Me diga se quer aplicar ou cancelar.",
        );
      }
    },
    [
      appendBotMessageDelayed,
      appendMessage,
      draftLinkedIn,
      footerLocked,
      generateWithRealAgent,
      handleFinalNo,
      handleFinalYes,
      handleAboutLiked,
      handleDescriptionLiked,
      handleSendUsername,
      input,
      parseGithubCandidateFromText,
      sendRefinementChatMessage,
      step,
      tryPickAccentFromMessage,
    ],
  );

  const footerPlaceholder = React.useMemo(() => {
    switch (step) {
      case "pick_github":
        return "Mensagem";
      case "linkedin_url":
        return "Mensagem";
      case "whatsapp_phone":
        return "Mensagem";
      case "description_review":
        return "Mensagem";
      case "about_review":
        return "Mensagem";
      case "final_confirm":
        return "Mensagem";
      case "username":
      default:
        return "Mensagem";
    }
  }, [step]);

  const renderFooter = () => {
    switch (step) {
      case "pick_github":
        return (
          <Flex direction="column" gap={3}>
            <Flex gap={3} justify="center" flexWrap="wrap">
              {githubCandidates.map((candidate) => (
                <Button
                  key={candidate.login}
                  variant="outline"
                  borderColor={inputBorder}
                  color={outlineBtnColor}
                  _hover={{ opacity: 0.92 }}
                  onClick={() => {
                    appendMessage("user", `Escolho ${candidate.login}`);
                    setValidatedLogin(candidate.login);
                    setGithubCandidates([]);
                    setStep("linkedin_url");
                    appendBotMessageDelayed(
                      `Perfeito, vou usar @${candidate.login}. Agora me manda seu LinkedIn.`,
                    );
                  }}
                  isDisabled={footerLocked}
                  h="auto"
                  py={2}
                  px={3}
                >
                  <Flex align="center" gap={2}>
                    <Image
                      src={candidate.avatarUrl}
                      alt={`Avatar ${candidate.login}`}
                      boxSize="28px"
                      borderRadius="full"
                      fallbackSrc="https://github.githubassets.com/favicons/favicon.png"
                    />
                    <Flex direction="column" align="flex-start" lineHeight="short">
                      <Text fontSize="xs" opacity={0.8}>
                        @{candidate.login}
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {candidate.name}
                      </Text>
                    </Flex>
                  </Flex>
                </Button>
              ))}
            </Flex>
            <Flex justify="center">
              <Button
                variant="outline"
                borderColor={inputBorder}
                color={outlineBtnColor}
                _hover={{ opacity: 0.92 }}
                onClick={() => {
                  appendMessage("user", "Quero digitar outro usuario.");
                  setGithubCandidates([]);
                  setValidatedLogin(null);
                  setStep("username");
                  appendBotMessageDelayed("Certo, me manda outro usuario.");
                }}
                isDisabled={footerLocked}
              >
                Digitar outro usuario
              </Button>
            </Flex>
          </Flex>
        );
      case "linkedin_url":
      case "whatsapp_phone":
        return (
          <Flex gap={2} align="stretch">
            <Input
              placeholder={footerPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleStructuredChatSend();
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
                onClick={() => void handleStructuredChatSend()}
                isDisabled={footerLocked}
              >
                Enviar
              </Button>
            </Box>
          </Flex>
        );
      case "description_review":
        return (
          <Flex direction="column" gap={3}>
            <Flex gap={2} align="flex-end" direction={{ base: "column", sm: "row" }}>
              <Textarea
                placeholder="Mensagem"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleStructuredChatSend();
                  }
                }}
                isDisabled={footerLocked}
                rows={3}
                minH="72px"
                resize="vertical"
                bg={inputBgResolved}
                borderRadius="xl"
                borderColor={inputBorder}
                _focusVisible={{
                  borderColor: "purple.400",
                  boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)",
                }}
              />
              <Box p="1px" borderRadius="xl" bgGradient={accentGradient} flexShrink={0} w={{ base: "100%", sm: "auto" }}>
                <Button
                  w={{ base: "100%", sm: "auto" }}
                  minH="40px"
                  px={6}
                  borderRadius="xl"
                  bg={cardBg}
                  color={outlineBtnColor}
                  _hover={{ opacity: 0.92 }}
                  onClick={() => void handleStructuredChatSend()}
                  isDisabled={footerLocked}
                >
                  Enviar
                </Button>
              </Box>
            </Flex>
          </Flex>
        );
      case "about_review":
        return (
          <Flex direction="column" gap={3}>
            <Flex gap={2} align="flex-end" direction={{ base: "column", sm: "row" }}>
              <Textarea
                placeholder="Mensagem"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleStructuredChatSend();
                  }
                }}
                isDisabled={footerLocked}
                rows={4}
                minH="88px"
                resize="vertical"
                bg={inputBgResolved}
                borderRadius="xl"
                borderColor={inputBorder}
                _focusVisible={{
                  borderColor: "purple.400",
                  boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)",
                }}
              />
              <Box p="1px" borderRadius="xl" bgGradient={accentGradient} flexShrink={0} w={{ base: "100%", sm: "auto" }}>
                <Button
                  w={{ base: "100%", sm: "auto" }}
                  minH="40px"
                  px={6}
                  borderRadius="xl"
                  bg={cardBg}
                  color={outlineBtnColor}
                  _hover={{ opacity: 0.92 }}
                  onClick={() => void handleStructuredChatSend()}
                  isDisabled={footerLocked}
                >
                  Enviar
                </Button>
              </Box>
            </Flex>
          </Flex>
        );
      case "final_confirm":
        return (
          <Flex direction="column" gap={3}>
            <Flex justify="center" align="center" gap={2.5} flexWrap="wrap">
              {options.map((item) => {
                const gradient = `linear(to-r, ${item.stops.join(", ")})`;
                const isSelected = selectedId === item.id;
                return (
                  <Tooltip key={item.id} label={item.name} hasArrow placement="top">
                    <Button
                      type="button"
                      onClick={() => handlePickAccent(item.id)}
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
            <Flex gap={3} justify="center" flexWrap="wrap">
              <Text fontSize="xs" color={textMuted} textAlign="center">
                Escolha uma cor acima ou digite no chat: "cor nome-da-cor". Depois diga
                "aplicar" ou "cancelar".
              </Text>
            </Flex>
            <Flex gap={3} justify="center" flexWrap="wrap">
              <Box p="1px" borderRadius="md" bgGradient={accentGradient}>
                <Button
                  size="md"
                  bg={cardBg}
                  color={outlineBtnColor}
                  _hover={{ opacity: 0.92 }}
                  onClick={() => handleFinalYes()}
                  isDisabled={footerLocked}
                >
                  Aplicar ajustes
                </Button>
              </Box>
              <Button
                size="md"
                variant="outline"
                borderColor={inputBorder}
                color={outlineBtnColor}
                _hover={{ opacity: 0.92 }}
                onClick={() => handleFinalNo()}
                isDisabled={footerLocked}
              >
                Cancelar
              </Button>
            </Flex>
            <Flex gap={2} align="stretch">
              <Input
                placeholder={footerPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleStructuredChatSend();
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
                  onClick={() => void handleStructuredChatSend()}
                  isDisabled={footerLocked}
                >
                  Enviar
                </Button>
              </Box>
            </Flex>
          </Flex>
        );
      case "username":
      default:
        return (
          <Flex gap={2} align="stretch">
            <Input
              placeholder={footerPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleStructuredChatSend();
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
                onClick={() => void handleStructuredChatSend()}
                isDisabled={footerLocked}
                isLoading={validating}
                loadingText="..."
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
          ← Voltar ao portfolio
        </Link>
        <ThemeModeToggle />
      </Flex>

      <Flex flex={1} align="center" justify="center" w="100%" py={{ base: 4, md: 8 }}>
        <Box w="100%" maxW="640px">
          <Flex direction="column" align="center" w="100%">
            <Box textAlign="center" w="100%">
              <TextGradientModel fontSize={{ base: "2xl", md: "3xl" }}>
                Gerador de portfolio
              </TextGradientModel>
            </Box>
            <LineGradientModel type="horizontal" size="160px" />
          </Flex>

          <Box mt={4} mb={8} />

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
                    Agente do gerador
                  </Text>
                  <Text fontSize="xs" color={textMuted}>
                    Online
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
