import iconGithub from "../assets/icons/github.png";
import iconWhatsapp from "../assets/icons/whatsapp.png";
import iconLinkedin from "../assets/icons/linkedin.png";

/** Login do GitHub (sem @). Sobrescrito por REACT_APP_GITHUB_USERNAME no .env se definido. */
const githubLogin = "davidsilvamota";

export const githubUsername = 
  process.env.REACT_APP_GITHUB_USERNAME?.trim() || githubLogin;

/** Linha do hero abaixo do nome; pode ser sobrescrita pelo gerador de portfólio. */
export const defaultPortfolioHeroSubtitle =
  "Desenvolvedor front-end · Web design · Foco em UX";

/** Parágrafo longo do hero; pode ser sobrescrito pelo gerador de portfólio. */
export const defaultPortfolioHeroAbout =
  "Mais do que interfaces bonitas, eu construo experiências que funcionam. Sou desenvolvedor front-end com 4 anos de experiência, atuando também com web design para garantir produtos intuitivos, consistentes e bem pensados do início ao fim. Role e veja como eu transformo ideia em produto.";

export const howIWorkItems = [
  "Entendo o problema e referências antes de definir interface ou código.",
  "Cuido de layout, hierarquia visual e consistência — também faço web design.",
  "Implemento com foco em usabilidade, acessibilidade e performance no front-end.",
];

export type ProjectEntry = {
  title: string;
  description: string;
  stack: string[];
  uxNote: string;
  liveUrl?: string;
  repoUrl?: string;
};

/** Troque pelos seus cases reais; links vazios omitem o botão correspondente. */
export const projects: ProjectEntry[] = [
  {
    title: "Case em destaque",
    description:
      "Resuma o contexto, seu papel e o resultado. Um bom case explica o problema e como a interface ajudou a resolvê-lo.",
    stack: ["React", "TypeScript", "Chakra UI"],
    uxNote:
      "Destaque uma decisão de UX ou UI: fluxo simplificado, padrão de componentes, feedback ao usuário, etc.",
    liveUrl: "",
    repoUrl: "",
  },
  {
    title: "Segundo projeto",
    description:
      "Outro exemplo com escopo diferente mostra versatilidade. Pode ser produto interno, site ou app.",
    stack: ["Front-end", "Design system"],
    uxNote:
      "Mencione como você alinhou expectativa visual com necessidades reais de uso.",
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
  { icon: iconLinkedin, label: "LinkedIn", href: "" },
  { icon: iconWhatsapp, label: "WhatsApp", href: "" },
];
