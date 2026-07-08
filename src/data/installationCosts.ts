import installationCostsData from './installation-costs.json';
import type { InstallationCostsData } from '../types/installationCosts';

export const installationCosts = installationCostsData as InstallationCostsData;

export function getInstallationLineItemCount(): number {
  return installationCosts.lineItemCount;
}
