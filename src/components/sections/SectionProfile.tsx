import { Flex, Text } from "@chakra-ui/react";
import { ProfileAvatarModel } from "../atoms/ProfileAvatarModel";
import TextGradientModel from "../atoms/TextGradientModel.1";
import { LineGradientModel } from "../atoms/LineGradientModel";
import { SocialIconsModel } from "../atoms/SocialIconsModel";
import { socialLinks } from "../../data/siteContent";

const avatarSrc =
  "https://media-gru1-2.cdn.whatsapp.net/v/t61.24694-24/609426331_1267261424734135_4662029117884972343_n.jpg?ccb=11-4&oh=01_Q5Aa4QEipMLIfTsz6nMJj9bMfIdFcWvrsSN6TpzEExIy3Msw7w&oe=69E3B92E&_nc_sid=5e03e0&_nc_cat=103";

export default function SectionProfile() {
  return (
    <Flex
      as="section"
      id="inicio"
      w="100%"
      maxW="1200px"
      mx="auto"
      alignItems="center"
      justifyContent="space-between"
      flexDir={{ base: "column", xl: "row" }}
      gap={{ base: 10, xl: 6 }}
      py={{ base: 6, md: 8 }}
    >
      <ProfileAvatarModel src={avatarSrc} size={300} />
      <Flex
        w={{ base: "100%", xl: "50%" }}
        mr={{ base: 0, xl: 10 }}
        ml={{ base: 0, xl: 10 }}
        flexDir="column"
        textAlign={{ base: "center", xl: "left" }}
      >
        <TextGradientModel fontSize={"7xl"}>David Mota</TextGradientModel>
        <TextGradientModel fontSize={"20px"} fontWeight={"normal"}>
          Desenvolvedor front-end · Web design · Foco em UX
        </TextGradientModel>
        <Text mt={4} color={"white"}>
          Há cerca de quatro anos construo interfaces no front-end — é o que eu
          mais gosto de fazer. Também atuo com web design, então costumo cuidar
          do desenho da experiência e da implementação: fluxos claros,
          consistência visual e detalhes que fazem a interface fazer sentido
          para quem usa. Se quiser ver como trabalho, role para{" "}
          <Text as="span" fontWeight="semibold">
            Como eu trabalho
          </Text>{" "}
          e{" "}
          <Text as="span" fontWeight="semibold">
            Projetos
          </Text>
          .
        </Text>
      </Flex>
      <Flex
        flexDir="row"
        alignItems="stretch"
        justifyContent="center"
        gap={{ base: 6, xl: 8 }}
        w={{ base: "100%", xl: "auto" }}
      >
        <Flex
          display={{ base: "none", xl: "flex" }}
          alignItems="stretch"
          justifyContent="center"
          flexShrink={0}
          px={1}
        >
          <LineGradientModel type="vertical" size="100%" />
        </Flex>
        <Flex alignItems="center" justifyContent="center">
          <SocialIconsModel
            icons={socialLinks}
            direction={{ base: "row", xl: "column" }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
