import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import TextGradientModel from "../atoms/TextGradientModel.1";
import { LineGradientModel } from "../atoms/LineGradientModel";
import { howIWorkItems } from "../../data/siteContent";

export default function SectionHowIWork() {
  return (
    <Box
      as="section"
      id="como-trabalho"
      w="100%"
      maxW="900px"
      mx="auto"
      py={{ base: 8, md: 12 }}
    >
      <TextGradientModel fontSize={{ base: "2xl", md: "3xl" }}>
        Como eu trabalho
      </TextGradientModel>
      <LineGradientModel type="horizontal" size="120px" />
      <UnorderedList
        mt={6}
        spacing={4}
        color="whiteAlpha.900"
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
