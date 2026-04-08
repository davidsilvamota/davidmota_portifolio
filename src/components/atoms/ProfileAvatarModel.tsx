import { Avatar, Flex } from "@chakra-ui/react";
import { colors } from "../theme/Theme";

type ProfileAvatarModelProps = {
  size: number;
  src: string;
};
export function ProfileAvatarModel(props: ProfileAvatarModelProps) {
  return (
    <Flex p={1} borderRadius={"50%"} bgGradient={colors.textGradient}>
      <Flex w={props.size} h={props.size}>
        <Avatar size="full" name="David Mota" src={props.src} />
      </Flex>
    </Flex>
  );
}
