import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface GetSitesQuery extends DataQuery {
  enterprise?: string;
}

export interface GetAreasQuery extends DataQuery {
  enterprise?: string;
  site?: string;
}

export interface GetProductionLinesQuery extends DataQuery {
  enterprise?: string;
  site?: string;
  area?: string;
}

export interface GetWorkCellsQuery extends DataQuery {
  enterprise?: string;
  site?: string;
  area?: string;
  productionLine?: string;
}

export interface FactoryinsightQuery extends DataQuery {
  enterpriseName: { label: string; index: number };
  siteName?: { label: string; index: number };
  areaName?: { label: string; index: number };
  productionLineName?: { label: string; index: number };
  workCellName?: { label: string; index: number };
  dataFormat?: { label: string; index: number };

  tagGroup?: { label: string; index: number };
  tag?: { label: string; index: number };

  kpiMethod?: { label: string; index: number };

  tableType?: { label: string; index: number };

  value?: { label: string; index: number };
  fullTagName?: string;

  labelsField?: string;
  parameterString?: string;
  uriPathExtension?: string;

  configurationTagGapfilling?: string;
  configurationTagAggregates: string[];
  configurationTimeBucket?: string;
}

export const defaultFactoryinsightQuery: Partial<FactoryinsightQuery> = {
  enterpriseName: { label: '', index: 0 },
  siteName: { label: '', index: 0 },
  areaName: { label: '', index: 0 },
  productionLineName: { label: '', index: 0 },
  workCellName: { label: '', index: 0 },
  dataFormat: { label: '', index: 0 },

  tagGroup: { label: '', index: 0 },
  tag: { label: '', index: 0 },

  kpiMethod: { label: '', index: 0 },

  tableType: { label: '', index: 0 },

  value: { label: '', index: 0 },
  fullTagName: '',

  labelsField: '',
  parameterString: '',
  uriPathExtension: '',

  configurationTagGapfilling: '',
  configurationTagAggregates: [],
  configurationTimeBucket: 'auto',
};

/**
 * These are options configured for each DataSource instance
 */
export interface FactoryinsightDataSourceOptions extends DataSourceJsonData {
  baseURL?: string;
  customerId?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface FactoryinsightSecureJsonData {
  apiKey?: string;
}
