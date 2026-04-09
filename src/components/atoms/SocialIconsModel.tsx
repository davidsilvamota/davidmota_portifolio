import { Flex, Image, Link, type ResponsiveValue } from "@chakra-ui/react";
import { useAccentGradient } from "../theme/AccentGradientContext";

export type SocialIconItem = {
  icon: string;
  label: string;
  href?: string;
};

export function SocialIconsModel(props: {
  icons: SocialIconItem[];
  direction?: ResponsiveValue<"row" | "column">;
}) {
  const dir = props.direction ?? "column";
  const { textGradient } = useAccentGradient();
  return (
    <Flex
      direction={dir}
      align="center"
      justify="center"
      gap={{ base: 4, xl: 6 }}
    >
      {props.icons.map((item) => {
        const image = (
          <Flex
            p="2px"
            borderRadius="full"
            bgGradient={textGradient}
            transition="transform 0.2s ease"
            _hover={{ transform: "scale(1.03)" }}
          >
            <Flex
              bg="blackAlpha.700"
              borderRadius="full"
              boxSize="50px"
              align="center"
              justify="center"
            >
              <Image
                boxSize="34px"
                objectFit="contain"
                src={item.icon}
                alt={item.label}
              />
            </Flex>
          </Flex>
        );
        return item.href ? (
          <Link key={item.label} href={item.href} isExternal>
            {image}
          </Link>
        ) : (
          <span key={item.label}>{image}</span>
        );
      })}
    </Flex>
  );
}
