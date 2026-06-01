/**
 * Common security header parameters required by MApiKey middleware
 * These headers must be included in every API v1 request
 *
 * Note: apikey is handled by ApiKeyAuth security scheme, so it's not included here
 */
export const securityHeaderParameters = [
  {
    in: "header",
    name: "x-content-type-options",
    required: true,
    schema: {
      type: "string",
      default: "nosniff",
    },
    description: "Prevents MIME type sniffing",
  },
  {
    in: "header",
    name: "x-xss-protection",
    required: true,
    schema: {
      type: "string",
      default: "1; mode=block",
    },
    description: "Enables XSS protection",
  },
  {
    in: "header",
    name: "strict-transport-security",
    required: true,
    schema: {
      type: "string",
      default: "max-age=31536000; includeSubDomains; preload",
    },
    description: "Enforces HTTPS connections",
  },
  {
    in: "header",
    name: "x-frame-options",
    required: true,
    schema: {
      type: "string",
      default: "SAMEORIGIN",
    },
    description: "Prevents clickjacking attacks",
  },
];
