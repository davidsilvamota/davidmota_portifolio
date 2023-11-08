import { Flex } from "@chakra-ui/react";

export default function ContainerScreenModel({ children }: any) {
  return (
    <>
      <Flex
        minH={"100vh"}
        width={"100%"}
        bg={"black"}
        justifyContent={"center"}
      >
        <Flex
          minH={"100vh"}
          p={8}
          w={"96%"}
          bgGradient="linear(to-r, #0D0D0D,#262626, #0D0D0D)"
        >
          {children}
        </Flex>
      </Flex>
    </>
  );
}
