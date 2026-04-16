import iconGithub from "../assets/icons/github.png";
import iconWhatsapp from "../assets/icons/whatsapp.png";
import iconLinkedin from "../assets/icons/linkedin.png";

const assetBase = `${(process.env.PUBLIC_URL || "").replace(/\/$/, "")}`;

/** Login do GitHub (sem @). Sobrescrito por REACT_APP_GITHUB_USERNAME no .env se definido. */
const githubLogin = "davidsilvamota";

export const githubUsername = 
  process.env.REACT_APP_GITHUB_USERNAME?.trim() || githubLogin;

/** Linha do hero abaixo do nome; pode ser sobrescrita pelo gerador de portfólio. */
export const defaultPortfolioHeroSubtitle =
  "Desenvolvedor Front-end (React, Next.js e React Native) | UX, performance e entrega com IA";

/** Parágrafo longo do hero; pode ser sobrescrito pelo gerador de portfólio. */
export const defaultPortfolioHeroAbout =
  "Sou desenvolvedor front-end com 4 anos de experiência criando produtos digitais com foco em usabilidade, performance e resultado de negócio. Trabalho com React, Next.js e React Native, conectando design e código para entregar interfaces claras, acessíveis e escaláveis. Também uso IA no fluxo de desenvolvimento para acelerar prototipação, refinamento e implementação com qualidade.";

export const howIWorkItems = [
  "Começo entendendo contexto, objetivo da feature e perfil do usuário final.",
  "Transformo requisito em interface simples de usar, com hierarquia visual e consistência.",
  "Implemento com foco em acessibilidade, performance e manutenção do código.",
  "Uso IA para acelerar entregas, validando tecnicamente cada solução antes de publicar.",
];

export type ProjectEntry = {
  title: string;
  description: string;
  stack: string[];
  uxNote: string;
  liveUrl?: string;
  repoUrl?: string;
  /** Link direto para a loja (ex.: Google Play). */
  playStoreUrl?: string;
  isFeatured?: boolean;
  screenshots?: string[];
};

/** Troque pelos seus cases reais; links vazios omitem o botão correspondente. */
export const projects: ProjectEntry[] = [
  {
    title: "PingPlay | React Native",
    description:
      "PingPlay é um app híbrido para exibir recursos de acessibilidade audiovisual (audiodescrição, legendas descritivas, Libras e mais) em cinema e em outros contextos. Fui responsável pelo design no Figma e pela implementação do front-end em React Native; o app está publicado na Google Play e na App Store.",
    stack: ["React Native", "Figma", "UX/UI", "Acessibilidade"],
    uxNote:
      "Estruturei fluxos claros para download e reprodução de recursos, telas de catálogo e detalhes do título, e integração com a identidade visual do produto. Priorizei usabilidade para públicos com necessidades diversas e consistência entre iOS e Android.",
    liveUrl: "https://pingplay.com.br/",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.etc.pingplay&pli=1",
    repoUrl: "",
    isFeatured: true,
    screenshots: [
      `${assetBase}/pingplay/screen-1.png`,
      `${assetBase}/pingplay/screen-2.png`,
      `${assetBase}/pingplay/screen-3.png`,
    ],
  },
  {
    title: "Belo Minas | Next.js",
    description:
      "Participei do desenvolvimento de uma plataforma de agendamento de tours exclusivos pelos Estados Unidos, com fluxo de reserva simples e foco em conversão.",
    stack: ["Next.js", "React", "TypeScript", "i18n"],
    uxNote:
      "Criei interfaces para agendamento eficiente e implementei calculadora de transfer para simular custos no próprio site, trazendo mais transparência para o usuário. Também adicionei suporte em Português, Inglês e Espanhol.",
    liveUrl: "",
    repoUrl: "",
  },
  {
    title: "AutoPapo | React.js",
    description:
      "Atuei na construção de uma experiência de busca de veículos mais eficiente, com filtros avançados e organização de resultados para facilitar decisão de compra.",
    stack: ["React.js", "JavaScript", "CSS", "UX/UI"],
    uxNote:
      "Desenvolvi filtros por nota, custo-benefício, marca, modelo, condição, ano, preço, opcionais e combustível, além de ordenação por ano, preço e avaliação. O resultado foi uma navegação mais intuitiva e objetiva.",
    liveUrl: "",
    repoUrl: "",
  },
  {
    title: "FinancialControl | React Native",
    description:
      "Desenvolvi um aplicativo para controle de finanças pessoais, permitindo registrar serviços, entradas e gastos de forma prática no dia a dia.",
    stack: ["React Native", "React Navigation", "React Native Paper"],
    uxNote:
      "Implementei visualização de ganhos por período (diário, semanal e mensal) a partir de data selecionada, ajudando o usuário a acompanhar evolução financeira com clareza.",
    liveUrl: "",
    repoUrl: "",
  },
];

export type SocialLink = {
  icon: string;
  label: string;
  href?: string;
};

/** Preencha com seus perfis; sem href o ícone aparece sem link. */
export const socialLinks: SocialLink[] = [
  { icon: iconGithub, label: "GitHub", href: "" },
  {
    icon: iconLinkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/david-mota-79b01a215/",
  },
  {
    icon: iconWhatsapp,
    label: "WhatsApp",
    href: "https://wa.me/5531971360313",
  },
];
