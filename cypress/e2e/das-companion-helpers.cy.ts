import { readDASRecords, upsertDASRecord } from "../../lib/das-storage";
import {
  getDASCompanionSnapshot,
  markDASAsGuided,
  markDASAsPaidExternally,
} from "../../lib/services/das/das-companion-service";
import { handoffToDASOfficialChannel } from "../../lib/services/das/das-handoff-service";

describe("Block 31 - DAS companion and official handoff (helpers)", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.clearFirmusStorage();
  });

  it("derives overdue for pending records deterministically", () => {
    upsertDASRecord({
      id: "das-overdue",
      competence: "2026-03",
      dueDate: "2026-04-20T00:00:00.000Z",
      status: "pending",
      amountInCents: 8100,
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T10:00:00.000Z",
    });

    const snapshot = getDASCompanionSnapshot(new Date("2026-04-22T12:00:00.000Z"));

    expect(snapshot.record?.id).to.eq("das-overdue");
    expect(snapshot.isOverdue).to.eq(true);
    expect(snapshot.displayStatus).to.eq("overdue");
    expect(snapshot.displayStatusLabel).to.eq("Pendente em atraso");
  });

  it("registers official handoff and allows explicit external payment confirmation", () => {
    upsertDASRecord({
      id: "das-1",
      competence: "2026-04",
      dueDate: "2026-05-20T00:00:00.000Z",
      status: "pending",
      officialUrl: "https://www.gov.br/receitafederal/pt-br",
      createdAt: "2026-04-22T10:00:00.000Z",
      updatedAt: "2026-04-22T10:00:00.000Z",
    });

    const guided = markDASAsGuided("das-1");
    expect(guided.ok).to.eq(true);
    if (!guided.ok) {
      throw new Error("Expected DAS guidance update to succeed.");
    }

    expect(guided.record.status).to.eq("guided");

    const handoff = handoffToDASOfficialChannel("das-1");
    expect(handoff.ok).to.eq(true);
    if (!handoff.ok) {
      throw new Error("Expected DAS handoff to succeed.");
    }

    expect(handoff.record.status).to.eq("handed_off");
    expect(handoff.destinationUrl).to.eq("https://www.gov.br/receitafederal/pt-br");

    const paid = markDASAsPaidExternally("das-1");
    expect(paid.ok).to.eq(true);
    if (!paid.ok) {
      throw new Error("Expected DAS paid externally update to succeed.");
    }

    expect(paid.record.status).to.eq("paid_externally");

    const persisted = readDASRecords();
    expect(persisted).to.have.length(1);
    expect(persisted[0].status).to.eq("paid_externally");
  });

  it("falls back safely when DAS storage contains invalid data", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("firmus.das-records", "not-json");
    });

    cy.then(() => {
      const records = readDASRecords();
      expect(records).to.deep.eq([]);
    });
  });
});

export {};
