/**
 * Centralized Branding Configuration
 * Single source of truth for all branding across the application
 */

export const BRAND = {
  name: "planvIx",
  tagline: "AI Content Strategy OS",
  description: "Premium AI-Powered Content Strategy Platform",
  url: "https://planvIx.com",

  // Social sharing
  shareText: (strategyCount) =>
    `Check out this AI-generated content strategy from ${BRAND.name}! 🚀\n\nGenerated ${strategyCount || 30} days of content in 30 seconds.`,

  // Email subjects
  emailSubject: `AI Content Strategy from ${BRAND.name}`,
  // Meta
  meta: {
    title: "planvIx - AI Content Strategy OS",
    description:
      "5 Elite AI Agents | ROI Predictions | SEO Keywords | Production SaaS",
  },
};

export default BRAND;
