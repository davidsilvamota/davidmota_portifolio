import { Avatar, Flex } from "@chakra-ui/react";
import { useAccentGradient } from "../theme/AccentGradientContext";

type ProfileAvatarModelProps = {
  size: number;
  src: string;
};
export function ProfileAvatarModel(props: ProfileAvatarModelProps) {
  const { textGradient } = useAccentGradient();
  return (
    <Flex p={1} borderRadius={"50%"} bgGradient={textGradient}>
      <Flex w={props.size} h={props.size}>
        <Avatar size="full" name="David Mota" src={props.src} />
      </Flex>
    </Flex>
  );
}
