import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface FactoryinsightQuery extends DataQuery {
  location?: string;
  asset?: string;

  enterprise?: string;
  site?: string;
  area?: string;
  productionLine?: string;
  workCell?: string;
  kpi?: string;
}

export const defaultFactoryinsightQuery: Partial<FactoryinsightQuery> = {
  location: '', // TODO TESTDATA
  asset: '',
    enterprise: '',
    site: '',
    area: '',
    productionLine: '',
    workCell: '',
    kpi: '',
};

/**
 * These are options configured for each DataSource instance
 */
export interface FactoryinsightDataSourceOptions extends DataSourceJsonData {
  baseURL?: string;
  customerID?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface FactoryinsightSecureJsonData {
  apiKey?: string;
}
