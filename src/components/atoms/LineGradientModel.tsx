import { Flex } from "@chakra-ui/react";

type LineGradientModelProps = {
  size: string;
  type: "horizontal" | "vertical";
};
export function LineGradientModel(props: LineGradientModelProps) {
  return (
    <Flex
      flexDir={"row"}
      bgGradient={`linear(to-${
        props.type === "vertical" ? "t" : "r"
      }, #865EEC, #35CFFE,#AA7CAC)`}
      h={props.type == "vertical" ? props.size : 1}
      w={props.type == "horizontal" ? props.size : 1}
    ></Flex>
  );
}
