import * as React from "react";
import { githubUsername as defaultGithubUsername } from "../data/siteContent";

type PortfolioGitHubUserContextValue = {
  portfolioGitHubLogin: string;
  setPortfolioGitHubLogin: (login: string) => void;
};

const PortfolioGitHubUserContext =
  React.createContext<PortfolioGitHubUserContextValue | null>(null);

export function PortfolioGitHubUserProvider(props: {
  children: React.ReactNode;
}) {
  const [portfolioGitHubLogin, setPortfolioGitHubLoginState] = React.useState(
    () => defaultGithubUsername.trim(),
  );

  const setPortfolioGitHubLogin = React.useCallback((login: string) => {
    setPortfolioGitHubLoginState(login.trim());
  }, []);

  const value = React.useMemo(
    () => ({ portfolioGitHubLogin, setPortfolioGitHubLogin }),
    [portfolioGitHubLogin, setPortfolioGitHubLogin],
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
