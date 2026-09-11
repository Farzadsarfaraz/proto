export type PortalRole = "customer" | "influencer" | "intern";

export const PORTAL_HOME: Record<PortalRole, string> = {
  customer: "/customer",
  influencer: "/influencer",
  intern: "/intern",
};
