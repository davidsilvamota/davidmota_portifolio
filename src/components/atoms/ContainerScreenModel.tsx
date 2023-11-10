import { Flex } from "@chakra-ui/react";
import { colors } from "../theme/Theme";

export default function ContainerScreenModel(props: { children: JSX.Element }) {
  return (
    <>
      <Header />
      <Flex
        minH={"100vh"}
        pt={"4%"}
        pl={8}
        pr={8}
        bgGradient={colors.bgGradient}
      >
        {props.children}
      </Flex>
    </>
  );
}
function Header() {
  return (
    <Flex
      right={0}
      position={"fixed"}
      zIndex={1}
      bg={"trasparent"}
      h={20}
      p={8}
      w={"40%"}
      justifyContent={"end"}
      alignItems={"end"}
    >
      <Flex color={"white"}>Adcionar menu</Flex>
    </Flex>
  );
}
