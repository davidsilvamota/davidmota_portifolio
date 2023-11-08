import { Flex } from "@chakra-ui/react";
import { colors } from "../theme/Theme";
import { jsx } from "@emotion/react";

export default function ContainerScreenModel(props: { children: JSX.Element }) {
  return (
    <>
      <Flex
        minH={"100vh"}
        width={"100%"}
        bg={"black"}
        justifyContent={"center"}
      >
        <Flex minH={"100vh"} p={8} w={"96%"} bgGradient={colors.bgGradient}>
          {props.children}
        </Flex>
      </Flex>
    </>
  );
}
