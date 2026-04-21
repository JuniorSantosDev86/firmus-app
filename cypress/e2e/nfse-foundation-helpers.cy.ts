import { readNFSeRecords } from "../../lib/nfse-storage";
import { prepareNFSeDraftFromCharge } from "../../lib/services/nfse/nfse-draft-builder";
import {
  NFSE_READINESS_FIELD_LABELS,
  evaluateBusinessProfileNFSeReadiness,
} from "../../lib/services/nfse/nfse-readiness";
import { validateNFSeDraftContext } from "../../lib/services/nfse/nfse-validation";

describe("Block 29 - NFSe foundation (helpers)", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.clearFirmusStorage();
  });

  it("evaluates readiness deterministically with missing fields and warnings", () => {
    const readiness = evaluateBusinessProfileNFSeReadiness({
      id: "default",
      businessName: "Firmus Studio",
      professionalName: "Ana",
      shortDescription: null,
      city: "São Paulo",
      whatsapp: null,
      logoUrl: null,
      cnpj: "12.345.678/0001",
      municipalRegistration: null,
      serviceCity: null,
      taxRegime: null,
      createdAt: "2026-04-20T10:00:00.000Z",
      updatedAt: "2026-04-20T10:00:00.000Z",
    });

    expect(readiness.isReady).to.eq(false);
    expect(readiness.missingFields).to.deep.eq([
      "municipal_registration",
      "service_city",
      "tax_regime",
    ]);
    expect(NFSE_READINESS_FIELD_LABELS[readiness.missingFields[0]]).to.eq(
      "Inscrição municipal"
    );
    expect(readiness.warnings[0]).to.include("14 dígitos");
  });

  it("creates and persists nfse draft snapshots from paid charge context", () => {
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
            id: "charge-1",
            clientId: "client-1",
            quoteId: "quote-1",
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
          quotes: [
            {
              id: "quote-1",
              clientId: "client-1",
              status: "approved",
              approvedAt: "2026-04-20T10:00:00.000Z",
              issueDate: "2026-04-20",
              validUntil: "2026-04-25",
              itemIds: ["item-1"],
              subtotalInCents: 25000,
              discountInCents: 0,
              totalInCents: 25000,
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ],
          items: [
            {
              id: "item-1",
              quoteId: "quote-1",
              serviceId: null,
              description: "Consultoria mensal",
              quantity: 1,
              unitPriceInCents: 25000,
              lineTotalInCents: 25000,
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ],
        })
      );
    });

    cy.then(() => {
      const result = prepareNFSeDraftFromCharge("charge-1");
      expect(result.ok).to.eq(true);

      if (!result.ok) {
        throw new Error("Expected NFSe draft creation to succeed.");
      }

      expect(result.record.issueStatus).to.eq("ready");
      expect(result.record.amountInCents).to.eq(25000);
      expect(result.record.serviceSnapshot.description).to.include("Consultoria mensal");
      expect(result.record.clientSnapshot.name).to.eq("Cliente Fiscal");
      expect(result.record.businessSnapshot.cnpj).to.eq("12.345.678/0001-90");
      expect(result.record.competenceDate).to.eq("2026-04-25T00:00:00.000Z");

      const persisted = readNFSeRecords();
      expect(persisted).to.have.length(1);
      expect(persisted[0].chargeId).to.eq("charge-1");
    });
  });

  it("blocks draft creation when charge is not paid", () => {
    const validation = validateNFSeDraftContext({
      charge: {
        id: "charge-2",
        clientId: "client-1",
        status: "pending",
        amountInCents: 10000,
        dueDate: "2026-04-25T00:00:00.000Z",
        createdAt: "2026-04-20T10:00:00.000Z",
        updatedAt: "2026-04-20T10:00:00.000Z",
      },
      client: {
        id: "client-1",
        name: "Cliente",
        whatsapp: null,
        email: null,
        city: null,
        notes: null,
        createdAt: "2026-04-20T10:00:00.000Z",
        updatedAt: "2026-04-20T10:00:00.000Z",
      },
      businessProfile: {
        id: "default",
        businessName: "Firmus",
        professionalName: "Ana",
        shortDescription: null,
        city: "São Paulo",
        whatsapp: null,
        logoUrl: null,
        cnpj: null,
        municipalRegistration: null,
        serviceCity: null,
        taxRegime: null,
        createdAt: "2026-04-20T10:00:00.000Z",
        updatedAt: "2026-04-20T10:00:00.000Z",
      },
    });

    expect(validation.ok).to.eq(false);
    expect(validation.errors).to.include("charge_must_be_paid");
  });
});

export {};
