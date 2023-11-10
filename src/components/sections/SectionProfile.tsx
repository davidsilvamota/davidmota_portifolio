import { Flex, Text } from "@chakra-ui/react";
import { ProfileAvatarModel } from "../atoms/ProfileAvatarModel";
import TextGradientModel from "../atoms/TextGradientModel.1";
import { LineGradientModel } from "../atoms/LineGradientModel";
import { SocialIconsModel } from "../atoms/SocialIconsModel";
import iconGithub from "../../assets/icons/github.png";
import iconWhatsapp from "../../assets/icons/whatsapp.png";
import iconLinkedin from "../../assets/icons/linkedin.png";

export default function SectionProfile() {
  return (
    <Flex w={"100%"} alignItems={"center"} justifyContent={"space-between"}>
      <ProfileAvatarModel size={300} />
      <Flex w={"50%"} mr={10} ml={10} flexDir={"column"}>
        <TextGradientModel fontSize={"7xl"}>David Mota</TextGradientModel>
        <TextGradientModel fontSize={"20px"} fontWeight={"normal"}>
          Desenvolvedor de Software Front-end Web/Mobile
        </TextGradientModel>
        <Text mt={4} color={"white"}>
          Sou um desenvolvedor front-end apaixonado por criar interfaces
          cativantes, ágeis e intuitivas que cativam os usuários desde o
          primeiro clique. Combinando minha paixão por design com habilidades
          técnicas sólidas, estou comprometido em dar vida a projetos que não
          apenas impressionam, mas também aprimoram a usabilidade. Explore meu
          portfólio e descubra como posso elevar a sua presença online."
        </Text>
      </Flex>
      <LineGradientModel type="vertical" size="60%" />
      <Flex
        w={200}
        justifyContent={"center"}
        alignItems={"center"}
        flexDir={"column"}
      >
        <SocialIconsModel
          icons={[
            { icon: iconGithub },
            { icon: iconLinkedin },
            { icon: iconWhatsapp },
          ]}
        />
      </Flex>
    </Flex>
  );
}
