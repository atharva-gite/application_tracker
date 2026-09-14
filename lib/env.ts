export function getAppUrl() {
  const explicit = process.env.AUTH_URL?.replace(/\/$/, "");
  if (explicit) {
    return explicit;
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) {
    return `https://${productionHost}`;
  }

  const deploymentHost = process.env.VERCEL_URL;
  if (deploymentHost) {
    return `https://${deploymentHost}`;
  }

  return "http://localhost:3000";
}
