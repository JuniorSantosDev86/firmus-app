import type { OutboundDraft } from "../../lib/domain/outbound";
import {
  buildChargeReminderDraftInput,
  buildOutboundDraft,
  buildQuoteShareDraftInput,
} from "../../lib/services/outbound/outbound-draft-builder";
import { dispatchOutbound } from "../../lib/services/outbound/outbound-dispatcher";
import { resolveOutboundChannelWithFallback } from "../../lib/services/outbound/outbound-fallback";
import { normalizeOutboundPhone } from "../../lib/services/outbound/outbound-target-resolver";
import { buildMailtoLink } from "../../lib/services/outbound/adapters/email-mailto-adapter";
import { buildWhatsAppLink } from "../../lib/services/outbound/adapters/whatsapp-link-adapter";

describe("Block 28 - Outbound abstraction (unit helpers)", () => {
  it("normalizes phone and fallback rules deterministically", () => {
    expect(normalizeOutboundPhone("(11) 98888-7777")).to.eq("5511988887777");
    expect(normalizeOutboundPhone("123")).to.eq(undefined);

    const missingPhone = resolveOutboundChannelWithFallback({
      requestedChannel: "whatsapp",
      recipient: {},
      isChannelSupported: () => true,
    });
    expect(missingPhone).to.deep.eq({
      channel: "copy",
      fallbackReason: "missing_phone",
    });

    const missingEmail = resolveOutboundChannelWithFallback({
      requestedChannel: "email",
      recipient: {},
      isChannelSupported: () => true,
    });
    expect(missingEmail).to.deep.eq({
      channel: "copy",
      fallbackReason: "missing_email",
    });
  });

  it("builds outbound URLs for whatsapp and email", () => {
    const draft: OutboundDraft = buildOutboundDraft({
      kind: "generic",
      channel: "copy",
      recipient: {
        phone: "5511999999999",
        email: "contato@firmus.local",
      },
      subject: "Assunto teste",
      body: "Mensagem teste",
      ctaUrl: "https://firmus.local/cta",
    });

    const whatsappUrl = buildWhatsAppLink({
      ...draft,
      channel: "whatsapp",
    });
    expect(whatsappUrl).to.include("https://wa.me/5511999999999");
    expect(decodeURIComponent(whatsappUrl)).to.include("Mensagem teste");
    expect(decodeURIComponent(whatsappUrl)).to.include("https://firmus.local/cta");

    const mailtoUrl = buildMailtoLink({
      ...draft,
      channel: "email",
    });
    const parsedMailto = new URL(mailtoUrl);
    expect(parsedMailto.protocol).to.eq("mailto:");
    expect(parsedMailto.pathname).to.eq("contato@firmus.local");
    expect(parsedMailto.searchParams.get("subject")).to.eq("Assunto teste");
    expect(parsedMailto.searchParams.get("body")).to.include("Mensagem teste");
  });

  it("dispatches with deterministic fallback to copy and blocks empty body", () => {
    const clipboardWrite = Cypress.sinon.stub().resolves();
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: clipboardWrite,
      },
    });

    cy.then(async () => {
      const fallbackResult = await dispatchOutbound({
        requestedChannel: "whatsapp",
        draftInput: buildQuoteShareDraftInput(
          {
            quoteId: "quote-1",
            clientName: "Ana",
            totalInCents: 10000,
            publicUrl: "https://firmus.local/public/quotes/quote-1",
            recipient: {
              name: "Ana",
            },
          },
          "whatsapp"
        ),
      });

      expect(fallbackResult.status).to.eq("dispatched");
      expect(fallbackResult.channel).to.eq("copy");
      expect(fallbackResult.reason).to.eq("fallback_used:missing_phone");

      const blockedResult = await dispatchOutbound({
        requestedChannel: "email",
        draftInput: {
          kind: "generic",
          recipient: {
            email: "ana@cliente.local",
          },
          body: "   ",
        },
      });

      expect(blockedResult.status).to.eq("blocked");
      expect(blockedResult.reason).to.eq("empty_body");
    });
  });
});

describe("Block 28 - Outbound abstraction (visible flows)", () => {
  beforeEach(() => {
    cy.loginFirmus();
  });

  it("uses outbound action in quotes and charges with feedback and fallback", () => {
    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/clients");
    cy.get("#name").type("Cliente Outbound");
    cy.get("#email").type("cliente@firmus.local");
    cy.contains("button", "Criar cliente").click();

    cy.visit("/quotes");
    cy.window().then((win) => {
      const clipboardWrite = cy.stub().resolves();
      Object.defineProperty(win.navigator, "clipboard", {
        configurable: true,
        value: { writeText: clipboardWrite },
      });
      cy.stub(win, "open").as("quoteWindowOpen");
    });

    cy.get("#clientId").select("Cliente Outbound");
    cy.contains("label", "Descrição").parent().find("input").clear().type("Pacote inicial");
    cy.contains("button", "Criar orçamento").click();

    cy.get('[data-testid^="quote-item-"]').first().within(() => {
      cy.get('[data-testid^="quote-outbound-channel-"]').select("WhatsApp");
      cy.get('[data-testid^="quote-outbound-send-"]').click();
      cy.get('[data-testid^="quote-outbound-feedback-"]').should("contain.text", "Mensagem copiada");
    });

    cy.get("@quoteWindowOpen").should("not.have.been.called");

    cy.visit("/charges");
    cy.window().then((win) => {
      cy.stub(win, "open").as("chargeWindowOpen");
    });

    cy.get("#clientId").select("Cliente Outbound");
    cy.get("#amount").clear().type("220.00");
    cy.get("#dueDate").clear().type("2026-04-30");
    cy.contains("button", "Criar cobrança").click();

    cy.get('[data-testid^="charge-item-"]').first().within(() => {
      cy.get('[data-testid^="charge-outbound-channel-"]').select("Email");
      cy.get('[data-testid^="charge-outbound-send-"]').click();
      cy.get('[data-testid^="charge-outbound-feedback-"]').should("contain.text", "Canal aberto");
    });

    cy.get("@chargeWindowOpen").should("have.been.calledOnce");
    cy.get("@chargeWindowOpen")
      .its("firstCall.args.0")
      .should("match", /^mailto:cliente@firmus\.local\?/);
  });

  it("supports charge reminder draft builder for charge context", () => {
    const draftInput = buildChargeReminderDraftInput(
      {
        chargeId: "charge-1",
        clientName: "Cliente Exemplo",
        amountInCents: 35000,
        dueDate: "2026-04-30",
        recipient: {
          phone: "(11) 97777-1111",
        },
      },
      "whatsapp"
    );

    expect(draftInput.kind).to.eq("charge_reminder");
    expect(draftInput.metadata).to.deep.eq({
      chargeId: "charge-1",
    });
    expect(draftInput.body).to.include("2026-04-30");
  });
});

export {};
