import { Flex, Image, Link, type ResponsiveValue } from "@chakra-ui/react";

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
  return (
    <Flex
      direction={dir}
      align="center"
      justify="center"
      gap={{ base: 4, xl: 6 }}
    >
      {props.icons.map((item) => {
        const image = (
          <Image
            boxSize="50px"
            objectFit="cover"
            src={item.icon}
            alt={item.label}
          />
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
