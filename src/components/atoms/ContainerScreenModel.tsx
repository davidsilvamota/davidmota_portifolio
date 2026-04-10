import { Flex, Link, useColorModeValue } from "@chakra-ui/react";
import * as React from "react";
import { colors } from "../theme/Theme";
import { ThemeModeToggle } from "./ThemeModeToggle";

const navItems = [
  { href: "#inicio", label: "Início" },
  { href: "#como-trabalho", label: "Como trabalho" },
  { href: "#projetos", label: "Projetos" },
];

export default function ContainerScreenModel(props: {
  children: React.ReactNode;
}) {
  const bgGradient = useColorModeValue(colors.bgGradientLight, colors.bgGradient);

  return (
    <>
      <Header />
      <Flex
        minH={"100vh"}
        pt={{ base: 20, md: "4%" }}
        pl={8}
        pr={8}
        bgGradient={bgGradient}
        flexDir="column"
        alignItems="stretch"
        transition="background 0.25s ease"
      >
        {props.children}
      </Flex>
    </>
  );
}

function Header() {
  const headerBg = useColorModeValue("whiteAlpha.800", "blackAlpha.400");
  const borderColor = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const linkColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const linkHover = useColorModeValue(
    { color: "gray.600", textDecoration: "none", opacity: 0.9 },
    { color: "white", textDecoration: "none", opacity: 0.85 },
  );

  return (
    <Flex
      top={0}
      left={0}
      right={0}
      position="fixed"
      zIndex={1}
      bg={headerBg}
      backdropFilter="blur(10px)"
      borderBottomWidth="1px"
      borderColor={borderColor}
      px={{ base: 4, md: 8 }}
      py={4}
      justifyContent="flex-end"
      alignItems="center"
      flexWrap="wrap"
      gap={{ base: 3, md: 5 }}
    >
      <ThemeModeToggle />
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          color={linkColor}
          fontSize="sm"
          fontWeight="medium"
          _hover={linkHover}
        >
          {item.label}
        </Link>
      ))}
    </Flex>
  );
}
