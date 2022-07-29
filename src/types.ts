import {DataQuery, DataSourceJsonData} from '@grafana/data';

export interface FactoryinsightQuery extends DataQuery {
    // to be removed
    location?: string;
    asset?: string;

    // new ones
    enterprise?: string;
    site?: string;
    area?: string;
    productionLine?: string;
    workCell?: string;
    value?: string;
    fullTagName?: string;

    configurationTagGapfilling?: string;
    configurationTagAggregates: string[];
    configurationTimeBucket?: string;
}

export const defaultFactoryinsightQuery: Partial<FactoryinsightQuery> = {
    // to be removed
    location: '', // TODO TESTDATA
    asset: '',

    enterprise: '',
    site: '',
    area: '',
    productionLine: '',
    workCell: '',
    value: '',
    fullTagName: '',

    configurationTagGapfilling : '',
    configurationTagAggregates : [],
    configurationTimeBucket : '',
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
