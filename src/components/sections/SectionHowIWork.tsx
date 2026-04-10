import { Box, ListItem, UnorderedList, useColorModeValue } from "@chakra-ui/react";
import {
  SECTION_CONTENT_MAX_W,
  SECTION_CONTENT_PY,
  SECTION_TITLE_LINE_SIZE,
} from "../../constants/sectionLayout";
import TextGradientModel from "../atoms/TextGradientModel.1";
import { LineGradientModel } from "../atoms/LineGradientModel";
import { howIWorkItems } from "../../data/siteContent";

export default function SectionHowIWork() {
  const listColor = useColorModeValue("gray.700", "whiteAlpha.900");

  return (
    <Box
      as="section"
      id="como-trabalho"
      w="100%"
      maxW={SECTION_CONTENT_MAX_W}
      mx="auto"
      py={SECTION_CONTENT_PY}
    >
      <TextGradientModel fontSize={{ base: "2xl", md: "3xl" }}>
        Como eu trabalho
      </TextGradientModel>
      <LineGradientModel type="horizontal" size={SECTION_TITLE_LINE_SIZE} />
      <UnorderedList
        mt={6}
        spacing={4}
        color={listColor}
        pl={4}
        styleType="disc"
      >
        {howIWorkItems.map((item) => (
          <ListItem key={item}>{item}</ListItem>
        ))}
      </UnorderedList>
    </Box>
  );
}
