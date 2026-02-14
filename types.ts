
export enum FactoryType {
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large'
}

export enum AnodeMaterial {
  GRAPHITE = 'Graphite',
  SILICON = 'Silicon'
}

export enum CathodeMaterial {
  LFP = 'LFP (Lithium Iron Phosphate)',
  NMC = 'NMC (Nickel Manganese Cobalt)'
}

export enum SeparatorType {
  POLYETHYLENE = 'Polyethylene',
  POLYPROPYLENE = 'Polypropylene'
}

export enum CasingMaterial {
  STEEL = 'Steel',
  ALUMINIUM = 'Aluminium'
}

export interface MaterialAvailability {
  Anode: boolean;
  Cathode: boolean;
  Electrolyte: boolean;
  Separator: boolean;
  'Current Collector': boolean;
  Casing: boolean;
}

export interface DashboardState {
  factoryType: FactoryType;
  dailyUnits: number;
  automationLevel: number; // 0 to 100
  anodeMaterial: AnodeMaterial;
  cathodeMaterial: CathodeMaterial;
  separatorType: SeparatorType;
  casingMaterial: CasingMaterial;
  currentProcessTemp: number;
  operatingTemp: number;
  materialAvailability: MaterialAvailability;
}
