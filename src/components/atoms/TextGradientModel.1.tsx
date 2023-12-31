import { ResponsiveValue, Text } from "@chakra-ui/react";
import { colors } from "../theme/Theme";
type TextGradientModelProps = {
  children: string;
  fontWeight?:
    | ResponsiveValue<
        | number
        | (string & {})
        | "medium"
        | "bold"
        | "black"
        | "extrabold"
        | "hairline"
        | "thin"
        | "light"
        | "normal"
        | "semibold"
      >
    | undefined;
  fontSize?:
    | ResponsiveValue<
        | number
        | (string & {})
        | "medium"
        | "bold"
        | "black"
        | "extrabold"
        | "hairline"
        | "thin"
        | "light"
        | "normal"
        | "semibold"
      >
    | undefined
    | ResponsiveValue<
        | number
        | "small"
        | (string & {})
        | "-moz-initial"
        | "inherit"
        | "initial"
        | "revert"
        | "revert-layer"
        | "unset"
        | "sm"
        | "md"
        | "lg"
        | "xl"
        | "2xl"
        | "6xl"
        | "large"
        | "medium"
        | "9xl"
      >
    | undefined;
};
export default function TextGradientModel(props: TextGradientModelProps) {
  return (
    <Text
      bgGradient={colors.textGradient}
      bgClip="text"
      fontSize={props.fontSize}
      fontWeight={props.fontWeight || "semibold"}
    >
      {props.children}
    </Text>
  );
}
