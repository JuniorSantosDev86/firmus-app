import { createDASRecordIfAbsent, readDASRecords } from "../../lib/storage/das-records";
import {
  createDASRecordForCompetenceMonth,
  listDASCompanionRecords,
  markDASAsPaid,
  recordDASOfficialChannelOpened,
} from "../../lib/services/das/das-companion-service";
import { getTimelineEvents } from "../../lib/storage/timeline-events";

describe("Block 31 - DAS companion and official handoff (helpers)", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.clearFirmusStorage();
  });

  it("derives overdue from competence month without persisting overdue status", () => {
    createDASRecordIfAbsent("2026-03");

    const records = listDASCompanionRecords(new Date("2026-04-22T12:00:00.000Z"));
    expect(records).to.have.length(1);
    expect(records[0].displayStatus).to.eq("overdue");
    expect(records[0].record.status).to.eq("pending");
  });

  it("emits events only on meaningful DAS actions", () => {
    const created = createDASRecordForCompetenceMonth("2026-04");
    expect(created.created).to.eq(true);

    const firstOpen = recordDASOfficialChannelOpened(created.record.id);
    expect(firstOpen.ok).to.eq(true);

    const paid = markDASAsPaid(created.record.id);
    expect(paid.ok).to.eq(true);
    if (!paid.ok) {
      throw new Error("Expected DAS mark-as-paid to succeed.");
    }
    expect(paid.didChange).to.eq(true);
    expect(paid.record.status).to.eq("paid");

    const secondPaid = markDASAsPaid(created.record.id);
    expect(secondPaid.ok).to.eq(true);
    if (!secondPaid.ok) {
      throw new Error("Expected second DAS mark-as-paid call to succeed.");
    }
    expect(secondPaid.didChange).to.eq(false);

    const events = getTimelineEvents();
    const types = events.map((event) => event.type);
    expect(types).to.include("das_record_created");
    expect(types).to.include("das_official_channel_opened");
    expect(types).to.include("das_marked_paid");
    expect(types.filter((type) => type === "das_marked_paid")).to.have.length(1);
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
