import { Box, Button, Flex, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import * as React from "react";
import { ProfileAvatarModel } from "../atoms/ProfileAvatarModel";
import TextGradientModel from "../atoms/TextGradientModel.1";
import { LineGradientModel } from "../atoms/LineGradientModel";
import { SocialIconsModel } from "../atoms/SocialIconsModel";
import { socialLinks } from "../../data/siteContent";
import { usePortfolioGitHubUser } from "../../context/PortfolioGitHubUserContext";
import { useAccentGradient } from "../theme/AccentGradientContext";

const getFallbackAvatar = (username: string) =>
  username ? `https://github.com/${encodeURIComponent(username)}.png` : "";
const GITHUB_USERS_API = "https://api.github.com/users/" as const;

export default function SectionProfile() {
  const {
    portfolioGitHubLogin,
    portfolioHeroSubtitle,
    portfolioHeroAbout,
    portfolioLinkedIn,
    portfolioWhatsApp,
    portfolioAccentSwatchesHidden,
  } = usePortfolioGitHubUser();
  const username = portfolioGitHubLogin.trim();
  const iconsForSocial = React.useMemo(() => {
    return socialLinks
      .filter((link) => {
        if (link.label === "LinkedIn" && portfolioLinkedIn.kind === "hidden") {
          return false;
        }
        if (link.label === "WhatsApp" && portfolioWhatsApp.kind === "hidden") {
          return false;
        }
        return true;
      })
      .map((link) => {
        if (link.label === "GitHub" && username) {
          return {
            ...link,
            href: `https://github.com/${encodeURIComponent(username)}`,
          };
        }
        if (link.label === "LinkedIn" && portfolioLinkedIn.kind === "url") {
          return { ...link, href: portfolioLinkedIn.href };
        }
        if (link.label === "WhatsApp" && portfolioWhatsApp.kind === "url") {
          return { ...link, href: portfolioWhatsApp.href };
        }
        return link;
      });
  }, [username, portfolioLinkedIn, portfolioWhatsApp]);
  const [avatarSrc, setAvatarSrc] = React.useState(getFallbackAvatar(username));
  const [displayName, setDisplayName] = React.useState("David Mota");
  const { options, selectedId, setSelectedId } = useAccentGradient();
  const bodyTextColor = useColorModeValue("gray.700", "white");
  const swatchSelectedBorder = useColorModeValue("gray.800", "white");
  const swatchBorder = useColorModeValue("gray.400", "whiteAlpha.500");

  React.useEffect(() => {
    const fallbackAvatarSrc = getFallbackAvatar(username);
    const fallbackName = username || "David Mota";
    if (!username) {
      setAvatarSrc(fallbackAvatarSrc);
      setDisplayName("David Mota");
      return;
    }
    const ac = new AbortController();
    fetch(`${GITHUB_USERS_API}${encodeURIComponent(username)}`, {
      signal: ac.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Falha ao carregar avatar do GitHub.");
        const body = (await res.json()) as { avatar_url?: string; name?: string };
        setAvatarSrc(body.avatar_url || fallbackAvatarSrc);
        setDisplayName(body.name?.trim() || fallbackName);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setAvatarSrc(fallbackAvatarSrc);
          setDisplayName(fallbackName);
        }
      });
    return () => ac.abort();
  }, [username]);

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
      <Flex alignItems="center" flexDir="column" gap={4}>
        <ProfileAvatarModel src={avatarSrc} size={300} />
        {!portfolioAccentSwatchesHidden ? (
          <Flex
            w="100%"
            justifyContent="center"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
          >
            {options.map((item) => {
              const gradient = `linear(to-r, ${item.stops.join(", ")})`;
              const isSelected = selectedId === item.id;
              return (
                <Tooltip key={item.id} label={item.name} hasArrow placement="top">
                  <Button
                    onClick={() => setSelectedId(item.id)}
                    aria-label={`Selecionar degrade ${item.name}`}
                    size="xs"
                    minW="16px"
                    w="16px"
                    h="16px"
                    p={0}
                    borderRadius="full"
                    bgGradient={gradient}
                    borderWidth={isSelected ? "2px" : "1px"}
                    borderColor={isSelected ? swatchSelectedBorder : swatchBorder}
                    _hover={{ opacity: 0.9 }}
                  >
                    <Box w="100%" h="100%" />
                  </Button>
                </Tooltip>
              );
            })}
          </Flex>
        ) : null}
      </Flex>
      <Flex
        w={{ base: "100%", xl: "50%" }}
        mr={{ base: 0, xl: 10 }}
        ml={{ base: 0, xl: 10 }}
        flexDir="column"
        textAlign={{ base: "center", xl: "left" }}
      >
        <TextGradientModel fontSize={"7xl"}>{displayName}</TextGradientModel>
        <TextGradientModel fontSize={"20px"} fontWeight={"normal"}>
          {portfolioHeroSubtitle}
        </TextGradientModel>
        <Text mt={3} color={bodyTextColor} whiteSpace="pre-wrap" lineHeight="tall">
          {portfolioHeroAbout}
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
            icons={iconsForSocial}
            direction={{ base: "row", xl: "column" }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
