import { buildOnboardingSnapshot } from "../../lib/services/onboarding";

describe("Block 33 - Improved onboarding (helpers)", () => {
  it("builds the next recommended step from real core progress first", () => {
    const snapshot = buildOnboardingSnapshot({
      source: {
        hasBusinessProfile: true,
        clientsCount: 1,
        servicesCount: 0,
        quotesCount: 0,
        chargesCount: 0,
        templatesCount: 0,
        nfseReady: false,
        nfseRecordsCount: 0,
        dasRecordsCount: 0,
        automationRulesCount: 0,
        automationExecutionsCount: 0,
        currentPlan: "free",
      },
      onboardingState: {
        dismissedAt: null,
        hiddenInDashboard: false,
        skippedStepKeys: [],
        completedAt: null,
      },
    });

    expect(snapshot.progress.completedCount).to.eq(2);
    expect(snapshot.progress.totalSteps).to.eq(5);
    expect(snapshot.nextRecommendedStep?.key).to.eq("first_service_created");
    expect(snapshot.checklist.some((step) => step.key === "nfse_ready_or_used")).to.eq(false);
  });

  it("keeps premium-only steps out of restrictive plans and respects skipped optional steps", () => {
    const snapshot = buildOnboardingSnapshot({
      source: {
        hasBusinessProfile: true,
        clientsCount: 1,
        servicesCount: 1,
        quotesCount: 1,
        chargesCount: 1,
        templatesCount: 0,
        nfseReady: false,
        nfseRecordsCount: 0,
        dasRecordsCount: 0,
        automationRulesCount: 0,
        automationExecutionsCount: 0,
        currentPlan: "free",
      },
      onboardingState: {
        dismissedAt: null,
        hiddenInDashboard: false,
        skippedStepKeys: ["first_template_created"],
        completedAt: null,
      },
    });

    expect(snapshot.checklist.map((step) => step.key)).to.deep.eq([
      "business_profile_completed",
      "first_client_created",
      "first_service_created",
      "first_quote_created",
      "first_charge_created",
    ]);
    expect(snapshot.status).to.eq("completed");
  });

  it("surfaces plan-aware advanced steps once the plan and maturity allow them", () => {
    const snapshot = buildOnboardingSnapshot({
      source: {
        hasBusinessProfile: true,
        clientsCount: 1,
        servicesCount: 1,
        quotesCount: 1,
        chargesCount: 1,
        templatesCount: 1,
        nfseReady: true,
        nfseRecordsCount: 0,
        dasRecordsCount: 0,
        automationRulesCount: 0,
        automationExecutionsCount: 0,
        currentPlan: "plus",
      },
      onboardingState: {
        dismissedAt: null,
        hiddenInDashboard: false,
        skippedStepKeys: [],
        completedAt: null,
      },
    });

    expect(snapshot.checklist.some((step) => step.key === "nfse_ready_or_used")).to.eq(true);
    expect(snapshot.checklist.some((step) => step.key === "das_accessed_or_used")).to.eq(true);
    expect(snapshot.checklist.some((step) => step.key === "automation_used")).to.eq(false);
    expect(snapshot.nextRecommendedStep?.key).to.eq("das_accessed_or_used");
  });
});

export {};
