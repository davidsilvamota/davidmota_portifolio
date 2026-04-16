import {
  Flex,
  Image,
  Link,
  useColorModeValue,
  type ResponsiveValue,
} from "@chakra-ui/react";
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
  const iconInnerBg = useColorModeValue("white", "blackAlpha.700");
  return (
    <Flex
      direction={dir}
      align="center"
      justify="center"
      gap={{ base: 2, sm: 2.5, md: 3, xl: 4 }}
    >
      {props.icons.map((item) => {
        const image = (
          <Flex
            p="1.5px"
            borderRadius="full"
            bgGradient={textGradient}
            transition="transform 0.2s ease"
            _hover={{ transform: "scale(1.03)" }}
          >
            <Flex
              bg={iconInnerBg}
              borderRadius="full"
              boxSize={{ base: "34px", sm: "38px", md: "42px", xl: "46px" }}
              align="center"
              justify="center"
            >
              <Image
                boxSize={{ base: "22px", sm: "24px", md: "26px", xl: "28px" }}
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
