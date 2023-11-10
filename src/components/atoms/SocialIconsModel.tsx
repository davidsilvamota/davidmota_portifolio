import { Link, Image } from "@chakra-ui/react";

export function SocialIconsModel(props: {
  icons: { icon: string; linkTo?: string }[];
}) {
  return (
    <>
      {props.icons.map((item) => (
        <Link mb={4} mt={4} href={item.linkTo} isExternal>
          <Image
            boxSize="50px"
            objectFit="cover"
            src={item.icon}
            alt="Dan Abramov"
          />
        </Link>
      ))}
    </>
  );
}
