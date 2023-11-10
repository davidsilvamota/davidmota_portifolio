import { Avatar, Flex } from "@chakra-ui/react";
import { colors } from "../theme/Theme";

type ProfileAvatarModelProps = {
  size: number;
};
export function ProfileAvatarModel(props: ProfileAvatarModelProps) {
  return (
    <Flex p={1} borderRadius={"50%"} bgGradient={colors.textGradient}>
      <Flex w={props.size} h={props.size}>
        <Avatar
          size="full"
          name="Segun Adebayo"
          src="https://media-gru2-2.cdn.whatsapp.net/v/t61.24694-24/379700645_1044874870273882_2183815094067427365_n.jpg?ccb=11-4&oh=01_AdRsrFKKf126wI9sTG9FBh2eq3aCiCeeGR-FsPB3DfaEFA&oe=6558DABF&_nc_sid=e6ed6c&_nc_cat=109"
        />
      </Flex>
    </Flex>
  );
}
