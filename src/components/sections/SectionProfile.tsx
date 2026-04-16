import {
  Box,
  Button,
  Flex,
  Spinner,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
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
  const [fetchingGithubProfile, setFetchingGithubProfile] = React.useState(
    () => username.length > 0,
  );
  const [avatarImageReady, setAvatarImageReady] = React.useState(
    () => username.length === 0,
  );
  const { options, selectedId, setSelectedId } = useAccentGradient();
  const bodyTextColor = useColorModeValue("gray.700", "white");
  const swatchSelectedBorder = useColorModeValue("gray.800", "white");
  const swatchBorder = useColorModeValue("gray.400", "whiteAlpha.500");

  React.useEffect(() => {
    const fallbackAvatarSrc = getFallbackAvatar(username);
    const fallbackName = username || "David Mota";
    if (!username) {
      setFetchingGithubProfile(false);
      setAvatarImageReady(true);
      setAvatarSrc(fallbackAvatarSrc);
      setDisplayName("David Mota");
      return;
    }
    setFetchingGithubProfile(true);
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
      })
      .finally(() => {
        if (!ac.signal.aborted) {
          setFetchingGithubProfile(false);
        }
      });
    return () => ac.abort();
  }, [username]);

  React.useEffect(() => {
    if (!username) {
      setAvatarImageReady(true);
      return;
    }
    setAvatarImageReady(false);
  }, [avatarSrc, username]);

  const showAvatarLoading =
    username.length > 0 && (fetchingGithubProfile || !avatarImageReady);

  const avatarPx =
    useBreakpointValue({
      base: 120,
      sm: 132,
      md: 152,
      lg: 176,
      xl: 196,
      "2xl": 216,
    }) ?? 128;

  const spinnerSize = useBreakpointValue<"sm" | "md" | "lg" | "xl">({
    base: "sm",
    sm: "md",
    md: "md",
    lg: "lg",
    xl: "xl",
  }) ?? "sm";

  return (
    <Flex
      as="section"
      id="inicio"
      w="100%"
      maxW={{ base: "100%", xl: "1100px" }}
      mx="auto"
      alignItems={{ base: "stretch", xl: "center" }}
      justifyContent="space-between"
      flexDir={{ base: "column", xl: "row" }}
      gap={{ base: 4, sm: 5, xl: 6 }}
      py={{ base: 3, sm: 4, md: 5 }}
    >
      <Flex alignItems="center" flexDir="column" gap={{ base: 2, md: 3 }} flexShrink={0}>
        <Box position="relative" display="inline-flex" borderRadius="full">
          <ProfileAvatarModel
            src={avatarSrc}
            size={avatarPx}
            onAvatarImageSettled={() => setAvatarImageReady(true)}
          />
          {showAvatarLoading ? (
            <Flex
              position="absolute"
              inset={0}
              align="center"
              justify="center"
              borderRadius="full"
              bg="blackAlpha.600"
            >
              <Spinner
                color="white"
                thickness="3px"
                speed="0.8s"
                emptyColor="whiteAlpha.400"
                size={spinnerSize}
              />
            </Flex>
          ) : null}
        </Box>
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
        w={{ base: "100%", xl: "auto" }}
        minW={0}
        flex={{ base: "none", xl: "1" }}
        mr={{ base: 0, xl: 6 }}
        ml={{ base: 0, xl: 6 }}
        flexDir="column"
        textAlign={{ base: "center", xl: "left" }}
      >
        <TextGradientModel
          fontSize={{
            base: "xl",
            sm: "2xl",
            md: "3xl",
            lg: "4xl",
            xl: "4xl",
            "2xl": "5xl",
          }}
          fontWeight="bold"
        >
          {displayName}
        </TextGradientModel>
        <TextGradientModel
          fontSize={{ base: "xs", sm: "sm", md: "md" }}
          fontWeight="normal"
        >
          {portfolioHeroSubtitle}
        </TextGradientModel>
        <Text
          mt={{ base: 2, md: 3 }}
          fontSize={{ base: "sm", md: "md" }}
          lineHeight={{ base: "short", md: "tall" }}
          color={bodyTextColor}
          whiteSpace="pre-wrap"
          maxW={{ base: "100%", xl: "52rem" }}
        >
          {portfolioHeroAbout}
        </Text>
      </Flex>
      <Flex
        flexDir="row"
        alignItems="center"
        justifyContent="center"
        gap={{ base: 4, xl: 8 }}
        w={{ base: "100%", xl: "auto" }}
        flexShrink={0}
        pt={{ base: 0, xl: 0 }}
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
