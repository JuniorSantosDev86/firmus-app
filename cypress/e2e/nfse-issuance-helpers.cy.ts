import { readNFSeRecords } from "../../lib/nfse-storage";
import { issueNFSeRecord } from "../../lib/services/nfse/nfse-issuance-service";
import { prepareNFSeDraftFromCharge } from "../../lib/services/nfse/nfse-draft-builder";
import {
  clearMockNFSeIssuanceMode,
  setMockNFSeIssuanceMode,
} from "../../lib/services/nfse/providers/mock-nfse-provider";

describe("Block 30 - NFSe issuance integration (helpers)", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.clearFirmusStorage();
    clearMockNFSeIssuanceMode();
  });

  function seedBaseData(chargeId: string) {
    cy.window().then((win) => {
      win.localStorage.setItem(
        "firmus.business-profile",
        JSON.stringify({
          id: "default",
          businessName: "Firmus Studio",
          professionalName: "Ana",
          shortDescription: null,
          city: "São Paulo",
          whatsapp: null,
          logoUrl: null,
          cnpj: "12.345.678/0001-90",
          municipalRegistration: "IM-001",
          serviceCity: "São Paulo",
          taxRegime: "mei",
          createdAt: "2026-04-20T10:00:00.000Z",
          updatedAt: "2026-04-20T10:00:00.000Z",
        })
      );
      win.localStorage.setItem(
        "firmus.clients",
        JSON.stringify([
          {
            id: "client-1",
            name: "Cliente Fiscal",
            whatsapp: null,
            email: "cliente@firmus.local",
            city: "Campinas",
            notes: null,
            createdAt: "2026-04-20T10:00:00.000Z",
            updatedAt: "2026-04-20T10:00:00.000Z",
          },
        ])
      );
      win.localStorage.setItem(
        "firmus.charges",
        JSON.stringify([
          {
            id: chargeId,
            clientId: "client-1",
            quoteId: null,
            amountInCents: 25000,
            dueDate: "2026-04-25T00:00:00.000Z",
            status: "paid",
            createdAt: "2026-04-20T10:00:00.000Z",
            updatedAt: "2026-04-20T10:00:00.000Z",
          },
        ])
      );
      win.localStorage.setItem(
        "firmus.quotes",
        JSON.stringify({
          quotes: [],
          items: [],
        })
      );
    });
  }

  it("issues nfse successfully and persists operational fields", () => {
    seedBaseData("charge-success");

    cy.then(async () => {
      const draft = prepareNFSeDraftFromCharge("charge-success");
      expect(draft.ok).to.eq(true);

      if (!draft.ok) {
        throw new Error("Expected NFSe draft to be ready for issuance.");
      }

      setMockNFSeIssuanceMode("success");
      const result = await issueNFSeRecord(draft.record.id);

      expect(result.ok).to.eq(true);
      if (!result.ok) {
        throw new Error("Expected issuance to succeed.");
      }

      expect(result.record.issueStatus).to.eq("issued");
      expect(result.record.documentNumber).to.match(/^NF-\d{6}$/);
      expect(result.record.providerReference).to.match(/^PROTO-\d{6}$/);
      expect(result.record.lastError).to.eq(undefined);
      expect(result.record.issuedAt).to.be.a("string");

      const persisted = readNFSeRecords();
      expect(persisted[0].issueStatus).to.eq("issued");
      expect(persisted[0].issuedAt).to.be.a("string");
      expect(persisted[0].lastError).to.eq(undefined);
    });
  });

  it("persists issue_failed state and readable error on provider failure", () => {
    seedBaseData("charge-failure");

    cy.then(async () => {
      const draft = prepareNFSeDraftFromCharge("charge-failure");
      expect(draft.ok).to.eq(true);

      if (!draft.ok) {
        throw new Error("Expected NFSe draft to be ready for issuance.");
      }

      setMockNFSeIssuanceMode("failure");
      const result = await issueNFSeRecord(draft.record.id);

      expect(result.ok).to.eq(true);
      if (!result.ok) {
        throw new Error("Expected issuance attempt to finalize with failed state.");
      }

      expect(result.record.issueStatus).to.eq("failed");
      expect(result.record.lastError).to.include("Não foi possível emitir a NFSe");
      expect(result.record.documentNumber).to.eq(undefined);
      expect(result.record.issuedAt).to.eq(undefined);

      const persisted = readNFSeRecords();
      expect(persisted[0].issueStatus).to.eq("failed");
      expect(persisted[0].lastError).to.include("Não foi possível emitir a NFSe");
    });
  });
});

export {};

