import { extendTheme, theme as baseTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  ...baseTheme.config,
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const appTheme = extendTheme({ config });
