/** Typed power-config filter values — null means no filter for that field. */
export interface PowerConfigFilters {
  volts: number | null;
  amps: number | null;
  /** Normalized phase label, e.g. "1", "2", "3", "1+2". */
  phases: string | null;
}

export const EMPTY_POWER_CONFIG_FILTERS: PowerConfigFilters = {
  volts: null,
  amps: null,
  phases: null,
};

/** Parsed electrical configuration from a power-accessory description. */
export interface ProductPowerConfig {
  volts: number[];
  amps: number | null;
  /** Normalized phase label when present. */
  phases: string | null;
}
