import {
  Box,
  Button,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
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

const gitHubTheme = {
  light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
} satisfies ThemeInput;

type ApiOk = {
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
  const username = githubUsername.trim();
  const [data, setData] = React.useState<Activity[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const hasData = Boolean(data && data.length > 0);

  React.useEffect(() => {
    if (!username) {
      setData(null);
      setTotal(0);
      return;
    }

    const ac = new AbortController();
    setLoading(true);
    setError(null);

    fetch(
      `${CONTRIBUTIONS_API}${encodeURIComponent(username)}?y=last`,
      { signal: ac.signal },
    )
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
        setData(list);
        setTotal(list.reduce((sum, d) => sum + d.count, 0));
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Erro desconhecido.");
        setData(null);
        setTotal(0);
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
          bg="whiteAlpha.100"
          borderWidth="1px"
          borderColor="whiteAlpha.300"
          borderRadius="md"
          p={6}
        >
          <Text color="whiteAlpha.900" fontSize="sm">
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
        bg="white"
        color="gray.800"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="md"
        p={{ base: 3, md: 4 }}
        boxShadow="sm"
      >
        <Flex
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          gap={3}
          flexDir={{ base: "column", sm: "row" }}
          mb={4}
        >
          <Text fontSize="md" fontWeight="semibold" color="gray.700">
            {loading
              ? "Carregando contribuições…"
              : error
                ? "Não foi possível carregar"
                : `${total.toLocaleString("pt-BR")} contribuições no último ano`}
          </Text>
          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              fontWeight="normal"
              rightIcon={<span aria-hidden>▾</span>}
            >
              Configurações de contribuição
            </MenuButton>
            <MenuList fontSize="sm">
              <MenuItem
                as="a"
                href={`https://github.com/${encodeURIComponent(username)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver perfil no GitHub
              </MenuItem>
              <MenuItem
                as="a"
                href="https://docs.github.com/account-and-profile/how-github-counts-your-contributions"
                target="_blank"
                rel="noopener noreferrer"
              >
                Como o GitHub conta contribuições
              </MenuItem>
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
              <Text color="gray.600" fontSize="sm">
                Sem dados de contribuições para exibir no período.
              </Text>
            ) : (
              <ActivityCalendar
                data={data!}
                loading={loading}
                theme={gitHubTheme}
                colorScheme="light"
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

        <Flex
          mt={4}
          pt={3}
          borderTopWidth="1px"
          borderColor="gray.100"
          align="center"
          justify="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Link
            href="https://docs.github.com/account-and-profile/how-github-counts-your-contributions"
            isExternal
            fontSize="xs"
            color="gray.500"
            _hover={{ color: "gray.700" }}
          >
            Saiba como as contribuições são contadas
          </Link>
        </Flex>
      </Box>
    </Box>
  );
}
