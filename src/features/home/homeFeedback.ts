import type { HomeSummary } from "./homeSummary";

export function financialFeedback(summary: HomeSummary) {
  if (summary.committedMinor === 0) {
    return { kind: "unplanned", title: "Empezá por tus próximos pagos",
      description: "Cargá lo que sabés que vas a pagar para ver cuánto tenés realmente disponible." } as const;
  }
  if (summary.availableMinor < 0) {
    return { kind: "shortfall", title: "Hay que mirar un poco más de cerca",
      shortfallMinor: -summary.availableMinor } as const;
  }
  return { kind: "covered", title: "Todo bajo control",
    description: "Tus próximos compromisos están cubiertos." } as const;
}
