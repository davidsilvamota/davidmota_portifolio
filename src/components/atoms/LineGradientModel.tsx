import { Flex } from "@chakra-ui/react";
import { useAccentGradient } from "../theme/AccentGradientContext";

type LineGradientModelProps = {
  size: string;
  type: "horizontal" | "vertical";
};
export function LineGradientModel(props: LineGradientModelProps) {
  const { selected } = useAccentGradient();
  return (
    <Flex
      flexDir={"row"}
      bgGradient={`linear(to-${
        props.type === "vertical" ? "t" : "r"
      }, ${selected.stops.join(", ")})`}
      h={props.type === "vertical" ? props.size : 1}
      w={props.type === "horizontal" ? props.size : 1}
    ></Flex>
  );
}
