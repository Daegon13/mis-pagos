import type { HomeSummary } from "./homeSummary";

export function financialFeedback(summary: HomeSummary) {
  if (summary.attentionCount > 0) {
    const count = summary.attentionCount;
    return { kind: "overdue", title: "Tenés movimientos por revisar",
      description: `Hay ${count} ${count === 1 ? "movimiento vencido" : "movimientos vencidos"}. Revisalos para poner tus cuentas al día.`
        + (summary.overdueExpenseCount > 0 ? " Los gastos vencidos ya están contemplados en tu disponible real." : "") } as const;
  }
  if (summary.committedMinor === 0) {
    return { kind: "unplanned", title: "Empezá por tus próximos pagos",
      description: "Cargá lo que sabés que vas a pagar para ver cuánto tenés realmente disponible." } as const;
  }
  if (summary.availableMinor < 0) {
    return { kind: "shortfall", title: "Tu saldo actual no cubre todos tus compromisos",
      shortfallMinor: -summary.availableMinor } as const;
  }
  return { kind: "covered", title: "Todo bajo control",
    description: "Tus próximos compromisos están cubiertos." } as const;
}
