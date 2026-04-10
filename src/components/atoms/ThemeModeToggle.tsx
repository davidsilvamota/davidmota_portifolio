import { HStack, Icon, Switch, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";

export function ThemeModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const iconMuted = useColorModeValue("gray.500", "whiteAlpha.500");
  const iconActive = useColorModeValue("gray.800", "white");

  return (
    <HStack
      as="label"
      htmlFor="theme-mode-toggle"
      spacing={2}
      cursor="pointer"
      userSelect="none"
    >
      <Icon as={FaSun} boxSize={4} color={isDark ? iconMuted : iconActive} aria-hidden />
      <Switch
        id="theme-mode-toggle"
        isChecked={isDark}
        onChange={toggleColorMode}
        colorScheme="purple"
        size="md"
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      />
      <Icon as={FaMoon} boxSize={4} color={isDark ? iconActive : iconMuted} aria-hidden />
    </HStack>
  );
}
