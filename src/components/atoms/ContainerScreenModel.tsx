import { Flex, Link } from "@chakra-ui/react";
import * as React from "react";
import { colors } from "../theme/Theme";

const navItems = [
  { href: "#inicio", label: "Início" },
  { href: "#como-trabalho", label: "Como trabalho" },
  { href: "#projetos", label: "Projetos" },
];

export default function ContainerScreenModel(props: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Flex
        minH={"100vh"}
        pt={{ base: 20, md: "4%" }}
        pl={8}
        pr={8}
        bgGradient={colors.bgGradient}
        flexDir="column"
        alignItems="stretch"
      >
        {props.children}
      </Flex>
    </>
  );
}

function Header() {
  return (
    <Flex
      top={0}
      left={0}
      right={0}
      position="fixed"
      zIndex={1}
      bg="blackAlpha.400"
      backdropFilter="blur(8px)"
      px={{ base: 4, md: 8 }}
      py={4}
      justifyContent="flex-end"
      alignItems="center"
      flexWrap="wrap"
      gap={4}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          color="whiteAlpha.900"
          fontSize="sm"
          fontWeight="medium"
          _hover={{ color: "white", textDecoration: "none", opacity: 0.85 }}
        >
          {item.label}
        </Link>
      ))}
    </Flex>
  );
}
