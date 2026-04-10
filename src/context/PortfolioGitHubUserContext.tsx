import * as React from "react";
import {
  defaultPortfolioHeroAbout,
  defaultPortfolioHeroSubtitle,
  githubUsername as defaultGithubUsername,
} from "../data/siteContent";

/** Rede social: herda siteContent, some do portfólio, ou URL fixa (gerador). */
export type PortfolioSocialOverride =
  | { kind: "inherit" }
  | { kind: "hidden" }
  | { kind: "url"; href: string };

type PortfolioGitHubUserContextValue = {
  portfolioGitHubLogin: string;
  setPortfolioGitHubLogin: (login: string) => void;
  portfolioHeroSubtitle: string;
  setPortfolioHeroSubtitle: (subtitle: string) => void;
  portfolioHeroAbout: string;
  setPortfolioHeroAbout: (text: string) => void;
  portfolioLinkedIn: PortfolioSocialOverride;
  setPortfolioLinkedIn: (value: PortfolioSocialOverride) => void;
  portfolioWhatsApp: PortfolioSocialOverride;
  setPortfolioWhatsApp: (value: PortfolioSocialOverride) => void;
  /** Após aplicar o gerador com cor escolhida, esconde os swatches abaixo da foto no perfil. */
  portfolioAccentSwatchesHidden: boolean;
  setPortfolioAccentSwatchesHidden: (hidden: boolean) => void;
};

const PortfolioGitHubUserContext =
  React.createContext<PortfolioGitHubUserContextValue | null>(null);

const defaultSocial: PortfolioSocialOverride = { kind: "inherit" };

export function PortfolioGitHubUserProvider(props: {
  children: React.ReactNode;
}) {
  const [portfolioGitHubLogin, setPortfolioGitHubLoginState] = React.useState(
    () => defaultGithubUsername.trim(),
  );
  const [portfolioHeroSubtitle, setPortfolioHeroSubtitleState] = React.useState(
    () => defaultPortfolioHeroSubtitle,
  );
  const [portfolioHeroAbout, setPortfolioHeroAboutState] = React.useState(
    () => defaultPortfolioHeroAbout,
  );
  const [portfolioLinkedIn, setPortfolioLinkedInState] =
    React.useState<PortfolioSocialOverride>(defaultSocial);
  const [portfolioWhatsApp, setPortfolioWhatsAppState] =
    React.useState<PortfolioSocialOverride>(defaultSocial);
  const [portfolioAccentSwatchesHidden, setPortfolioAccentSwatchesHiddenState] =
    React.useState(false);

  const setPortfolioGitHubLogin = React.useCallback((login: string) => {
    setPortfolioGitHubLoginState(login.trim());
  }, []);

  const setPortfolioHeroSubtitle = React.useCallback((subtitle: string) => {
    const next = subtitle.trim();
    setPortfolioHeroSubtitleState(
      next.length > 0 ? next : defaultPortfolioHeroSubtitle,
    );
  }, []);

  const setPortfolioHeroAbout = React.useCallback((text: string) => {
    const next = text.trim();
    setPortfolioHeroAboutState(
      next.length > 0 ? next : defaultPortfolioHeroAbout,
    );
  }, []);

  const setPortfolioLinkedIn = React.useCallback(
    (value: PortfolioSocialOverride) => {
      setPortfolioLinkedInState(value);
    },
    [],
  );

  const setPortfolioWhatsApp = React.useCallback(
    (value: PortfolioSocialOverride) => {
      setPortfolioWhatsAppState(value);
    },
    [],
  );

  const setPortfolioAccentSwatchesHidden = React.useCallback(
    (hidden: boolean) => {
      setPortfolioAccentSwatchesHiddenState(hidden);
    },
    [],
  );

  const value = React.useMemo(
    () => ({
      portfolioGitHubLogin,
      setPortfolioGitHubLogin,
      portfolioHeroSubtitle,
      setPortfolioHeroSubtitle,
      portfolioHeroAbout,
      setPortfolioHeroAbout,
      portfolioLinkedIn,
      setPortfolioLinkedIn,
      portfolioWhatsApp,
      setPortfolioWhatsApp,
      portfolioAccentSwatchesHidden,
      setPortfolioAccentSwatchesHidden,
    }),
    [
      portfolioGitHubLogin,
      setPortfolioGitHubLogin,
      portfolioHeroSubtitle,
      setPortfolioHeroSubtitle,
      portfolioHeroAbout,
      setPortfolioHeroAbout,
      portfolioLinkedIn,
      setPortfolioLinkedIn,
      portfolioWhatsApp,
      setPortfolioWhatsApp,
      portfolioAccentSwatchesHidden,
      setPortfolioAccentSwatchesHidden,
    ],
  );

  return (
    <PortfolioGitHubUserContext.Provider value={value}>
      {props.children}
    </PortfolioGitHubUserContext.Provider>
  );
}

export function usePortfolioGitHubUser() {
  const ctx = React.useContext(PortfolioGitHubUserContext);
  if (!ctx) {
    throw new Error(
      "usePortfolioGitHubUser must be used within PortfolioGitHubUserProvider",
    );
  }
  return ctx;
}
