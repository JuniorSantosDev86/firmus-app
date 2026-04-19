import { parseTextInputIntent } from "../../lib/services/text-input-parser";

describe("Block 27 - Improved Text Parsing (unit parser)", () => {
  beforeEach(() => {
    cy.clock(Date.UTC(2026, 3, 19, 12, 0, 0), ["Date"]);
  });

  it("normalizes PT-BR text and detects quote intent with key fields", () => {
    const parsed = parseTextInputIntent(
      "  CRIAR ORÇAMENTO para João, referente a revisão elétrica de R$ 1.250,90 para 25/04/2026  "
    );

    expect(parsed.intentType).to.eq("create_quote");
    expect(parsed.extractedFields.clientNameCandidate).to.eq("João");
    expect(parsed.extractedFields.amountInCents).to.eq(125090);
    expect(parsed.extractedFields.titleCandidate).to.eq("revisão elétrica");
    expect(parsed.extractedFields.dueDate).to.eq("2026-04-25");
    expect(parsed.missingFields).to.deep.eq([]);
    expect(parsed.confidence).to.eq("high");
  });

  it("detects charge intent and parses relative date in days", () => {
    const parsed = parseTextInputIntent(
      "Criar cobrança para Ana de 500 reais com vencimento em 3 dias"
    );

    expect(parsed.intentType).to.eq("create_charge");
    expect(parsed.extractedFields.amountInCents).to.eq(50000);
    expect(parsed.extractedFields.dueDate).to.eq("2026-04-22");
    expect(parsed.extractedFields.clientNameCandidate).to.eq("Ana");
    expect(parsed.missingFields).to.deep.eq([]);
  });

  it("detects reminder intent and parses 'depois de amanhã' deterministically", () => {
    const parsed = parseTextInputIntent("Lembrete de follow-up com Bruno depois de amanhã");

    expect(parsed.intentType).to.eq("create_reminder");
    expect(parsed.extractedFields.clientNameCandidate).to.eq("Bruno");
    expect(parsed.extractedFields.dueDate).to.eq("2026-04-21");
    expect(parsed.missingFields).to.deep.eq([]);
    expect(parsed.confidence).to.not.eq("low");
  });

  it("returns unknown intent with explicit ambiguity warning", () => {
    const parsed = parseTextInputIntent(
      "Criar cobrança e lembrete para Ana com vencimento amanhã"
    );

    expect(parsed.intentType).to.eq("unknown");
    expect(parsed.confidence).to.eq("low");
    expect(parsed.warnings.some((warning) => warning.includes("ambígua"))).to.eq(true);
  });

  it("surfaces explicit missing fields for incomplete charge", () => {
    const parsed = parseTextInputIntent("Criar cobrança para Carlos");

    expect(parsed.intentType).to.eq("create_charge");
    expect(parsed.missingFields).to.include("valor");
    expect(parsed.missingFields).to.include("vencimento");
    expect(parsed.warnings.some((warning) => warning.includes("Campos pendentes"))).to.eq(true);
  });

  it("keeps amount undefined when number likely represents date-only context", () => {
    const parsed = parseTextInputIntent("Lembrete com Bruno dia 25");

    expect(parsed.extractedFields.amountInCents).to.eq(undefined);
    expect(parsed.extractedFields.dueDate).to.eq("2026-04-25");
  });

  it("parses month-name dates in PT-BR", () => {
    const parsed = parseTextInputIntent("Criar cobrança para Ana de R$ 300 com vencimento 5 de maio");

    expect(parsed.intentType).to.eq("create_charge");
    expect(parsed.extractedFields.dueDate).to.eq("2026-05-05");
  });

  it("flags multiple detected values to enforce manual review", () => {
    const parsed = parseTextInputIntent("Criar cobrança para Ana de R$ 100 ou R$ 120 amanhã");

    expect(parsed.intentType).to.eq("create_charge");
    expect(parsed.warnings.some((warning) => warning.includes("Mais de um valor"))).to.eq(true);
  });

  it("handles very short text safely", () => {
    const parsed = parseTextInputIntent("oi");

    expect(parsed.intentType).to.eq("unknown");
    expect(parsed.missingFields).to.deep.eq(["instrução"]);
    expect(parsed.warnings[0]).to.include("instrução mais completa");
  });
});

export {};
