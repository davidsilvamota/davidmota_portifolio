import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";
import {
  ActivityCalendar,
  type Activity,
  type ThemeInput,
} from "react-activity-calendar";
import "../../githubActivityTooltips.css";
import { githubUsername } from "../../data/siteContent";

const CONTRIBUTIONS_API =
  "https://github-contributions-api.jogruber.de/v4/" as const;

const contributionTheme = {
  light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  dark: ["#2d333b", "#0e4429", "#006d32", "#26a641", "#39d353"],
} satisfies ThemeInput;

type ApiOk = {
  total: Record<string, number>;
  contributions: Activity[];
};

type ApiErr = {
  error: string;
};

function isApiErr(body: unknown): body is ApiErr {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as ApiErr).error === "string"
  );
}

export default function SectionGitHubContributions() {
  const { colorMode } = useColorMode();
  const calendarScheme = colorMode === "dark" ? "dark" : "light";
  const cardBg = useColorModeValue("white", "whiteAlpha.50");
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const textPrimary = useColorModeValue("gray.800", "whiteAlpha.900");
  const textSecondary = useColorModeValue("gray.600", "whiteAlpha.800");
  const menuBtnBorder = useColorModeValue("gray.400", "whiteAlpha.400");
  const menuBtnColor = useColorModeValue("gray.800", "white");
  const menuBtnHover = useColorModeValue(
    { bg: "gray.100" },
    { bg: "whiteAlpha.100" },
  );
  const menuListBg = useColorModeValue("white", "gray.800");
  const menuListBorder = useColorModeValue("gray.200", "whiteAlpha.300");
  const menuItemSelected = useColorModeValue("gray.100", "whiteAlpha.200");
  const menuItemHover = useColorModeValue("gray.100", "whiteAlpha.200");
  const emptyHintBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const emptyHintBorder = useColorModeValue("gray.200", "whiteAlpha.300");

  const username = githubUsername.trim();
  const [allData, setAllData] = React.useState<Activity[] | null>(null);
  const [availableYears, setAvailableYears] = React.useState<number[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(2022);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const data = React.useMemo(() => {
    if (!allData || !selectedYear) return [];
    const yearPrefix = `${selectedYear}-`;
    return allData.filter((d) => d.date.startsWith(yearPrefix));
  }, [allData, selectedYear]);

  const total = React.useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data],
  );

  const hasData = data.length > 0;

  React.useEffect(() => {
    if (!username) {
      setAllData(null);
      setAvailableYears([]);
      setSelectedYear(null);
      return;
    }

    const ac = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`${CONTRIBUTIONS_API}${encodeURIComponent(username)}?y=all`, {
      signal: ac.signal,
    })
      .then(async (res) => {
        const body: unknown = await res.json();
        if (!res.ok) {
          const msg = isApiErr(body) ? body.error : res.statusText;
          throw new Error(msg || "Falha ao carregar contribuições.");
        }
        if (isApiErr(body)) {
          throw new Error(body.error);
        }
        const list = (body as ApiOk).contributions;
        if (!Array.isArray(list)) {
          throw new Error("Resposta inválida da API.");
        }
        const yearList = Object.keys((body as ApiOk).total || {})
          .map((year) => Number(year))
          .filter((year) => Number.isInteger(year))
          .sort((a, b) => b - a);

        setAllData(list);
        setAvailableYears(yearList);
        setSelectedYear((current) => {
          if (current && yearList.includes(current)) return current;
          return yearList[0] ?? null;
        });
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Erro desconhecido.");
        setAllData(null);
        setAvailableYears([]);
        setSelectedYear(null);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [username]);

  if (!username) {
    return (
      <Box
        as="section"
        id="contribuicoes"
        w="100%"
        maxW="980px"
        mx="auto"
        py={{ base: 4, md: 6 }}
      >
        <Box
          bg={emptyHintBg}
          borderWidth="1px"
          borderColor={emptyHintBorder}
          borderRadius="md"
          p={6}
        >
          <Text color={textPrimary} fontSize="sm">
            Para exibir o gráfico de contribuições do GitHub, defina{" "}
            <Text as="span" fontWeight="semibold">
              githubUsername
            </Text>{" "}
            em{" "}
            <Text as="span" fontWeight="semibold">
              src/data/siteContent.ts
            </Text>
            .
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      as="section"
      id="contribuicoes"
      w="100%"
      maxW="980px"
      mx="auto"
      py={{ base: 4, md: 6 }}
    >
      <Box
        bg={cardBg}
        color={textPrimary}
        borderWidth="1px"
        borderColor={cardBorder}
        borderRadius="md"
        p={{ base: 3, md: 4 }}
        backdropFilter="auto"
        backdropBlur="6px"
      >
        <Flex
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          gap={3}
          flexDir={{ base: "column", sm: "row" }}
          mb={4}
        >
          <Text fontSize="md" fontWeight="semibold" color={textPrimary}>
            {loading
              ? "Carregando contribuições…"
              : error
                ? "Não foi possível carregar"
                : selectedYear
                  ? `${total.toLocaleString("pt-BR")} contribuições em ${selectedYear}`
                  : "Sem ano disponível"}
          </Text>
          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              size="sm"
              variant="outline"
              borderColor={menuBtnBorder}
              color={menuBtnColor}
              _hover={menuBtnHover}
              fontWeight="normal"
              rightIcon={<span aria-hidden>▾</span>}
            >
              Ano: {selectedYear ?? "--"}
            </MenuButton>
            <MenuList
              fontSize="sm"
              bg={menuListBg}
              borderColor={menuListBorder}
              color={textPrimary}
            >
              {availableYears.map((year) => (
                <MenuItem
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  bg={selectedYear === year ? menuItemSelected : "transparent"}
                  _hover={{ bg: menuItemHover }}
                >
                  {year}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>

        {error ? (
          <Text color="red.600" fontSize="sm">
            {error}
          </Text>
        ) : (
          <Box overflowX="auto" pb={1}>
            {loading && !hasData ? (
              <Flex minH="140px" align="center" justify="center" py={8}>
                <Spinner color="green.500" />
              </Flex>
            ) : !hasData ? (
              <Text color={textSecondary} fontSize="sm">
                Sem dados de contribuições para exibir no período.
              </Text>
            ) : (
              <ActivityCalendar
                data={data!}
                loading={loading}
                theme={contributionTheme}
                colorScheme={calendarScheme}
                blockSize={12}
                blockMargin={3}
                blockRadius={2}
                fontSize={12}
                maxLevel={4}
                weekStart={0}
                showWeekdayLabels={["mon", "wed", "fri"]}
                showTotalCount={false}
                labels={{
                  months: [
                    "jan",
                    "fev",
                    "mar",
                    "abr",
                    "mai",
                    "jun",
                    "jul",
                    "ago",
                    "set",
                    "out",
                    "nov",
                    "dez",
                  ],
                  legend: { less: "Menos", more: "Mais" },
                }}
              />
            )}
          </Box>
        )}

      </Box>
    </Box>
  );
}
