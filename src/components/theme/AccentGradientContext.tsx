import * as React from "react";

export type AccentGradientOption = {
  id: string;
  name: string;
  stops: [string, string, string];
};

export const accentGradientOptions: AccentGradientOption[] = [
  { id: "default", name: "Roxo Azul", stops: ["#865EEC", "#35CFFE", "#AA7CAC"] },
  { id: "sunset", name: "Sunset", stops: ["#FF7E5F", "#FEB47B", "#FFD194"] },
  { id: "mint", name: "Mint", stops: ["#00C9A7", "#00E4D0", "#7FFFD4"] },
  { id: "ocean", name: "Ocean", stops: ["#1A2980", "#26D0CE", "#7FDBFF"] },
  { id: "fire", name: "Fire", stops: ["#F83600", "#F9D423", "#FFD36E"] },
  { id: "violet", name: "Violet", stops: ["#6A11CB", "#8E2DE2", "#C084FC"] },
];

type AccentGradientContextValue = {
  selectedId: string;
  setSelectedId: (id: string) => void;
  selected: AccentGradientOption;
  textGradient: string;
  options: AccentGradientOption[];
};

const defaultSelected = accentGradientOptions[0];

const AccentGradientContext = React.createContext<AccentGradientContextValue>({
  selectedId: defaultSelected.id,
  setSelectedId: () => {},
  selected: defaultSelected,
  textGradient: `linear(to-r, ${defaultSelected.stops.join(", ")})`,
  options: accentGradientOptions,
});

export function AccentGradientProvider(props: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = React.useState(defaultSelected.id);
  const selected =
    accentGradientOptions.find((item) => item.id === selectedId) ?? defaultSelected;
  const textGradient = `linear(to-r, ${selected.stops.join(", ")})`;

  return (
    <AccentGradientContext.Provider
      value={{
        selectedId,
        setSelectedId,
        selected,
        textGradient,
        options: accentGradientOptions,
      }}
    >
      {props.children}
    </AccentGradientContext.Provider>
  );
}

export function useAccentGradient() {
  return React.useContext(AccentGradientContext);
}
