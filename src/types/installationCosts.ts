import type { Region } from '../types';

export interface InstallationCostCountry {
  name: string;
  id: string;
}

export interface InstallationCostPricing {
  countryId: string;
  countryName: string;
  value: string;
}

export interface InstallationCostLineItem {
  id: string;
  partNumber: string | null;
  productElement: string;
  uom: string;
  pricing: Record<string, InstallationCostPricing>;
}

export interface InstallationCostNote {
  title: string;
  text: string;
}

export interface InstallationCostSection {
  id: string;
  title: string;
  billingType?: string | null;
  type: 'custom-parts-labour' | 'accessories';
  fixedColumns: string[];
  countries: InstallationCostCountry[];
  lineItems: InstallationCostLineItem[];
  notes?: InstallationCostNote[];
}

export interface InstallationCostRegion {
  id: Region;
  name: string;
  sections: InstallationCostSection[];
}

export interface InstallationCostsData {
  generatedAt: string;
  source: string;
  regionCount: number;
  lineItemCount: number;
  regions: InstallationCostRegion[];
}
