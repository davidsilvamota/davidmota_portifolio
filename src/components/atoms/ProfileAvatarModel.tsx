import { Avatar, Flex } from "@chakra-ui/react";
import { useAccentGradient } from "../theme/AccentGradientContext";

type ProfileAvatarModelProps = {
  size: number;
  src: string;
  /** Disparado quando a imagem termina de carregar ou falha (evita loading infinito). */
  onAvatarImageSettled?: () => void;
};
export function ProfileAvatarModel(props: ProfileAvatarModelProps) {
  const { textGradient } = useAccentGradient();
  return (
    <Flex p={1} borderRadius={"50%"} bgGradient={textGradient}>
      <Flex w={props.size} h={props.size}>
        <Avatar
          size="full"
          backgroundColor={"#000"}
          name="David Mota"
          src={props.src || undefined}
          key={props.src || "no-src"}
          onLoad={props.onAvatarImageSettled}
          onError={props.onAvatarImageSettled}
        />
      </Flex>
    </Flex>
  );
}
