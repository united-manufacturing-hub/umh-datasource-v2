import {DataQuery, DataSourceJsonData} from '@grafana/data';

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
    enterpriseName: string;
    siteName?: string;
    areaName?: string;
    productionLineName?: string;
    workCellName?: string;
    dataFormat?: string;

    tagGroup?: string;
    tag?: string;

    kpiMethod?: string;

    tableType?: string;

    value?: string;
    fullTagName?: string;

    labelsField?: string;
    parameterString?: string;
    uriPathExtension?: string;

    configurationTagGapfilling?: string;
    configurationTagAggregates: string[];
    configurationTimeBucket?: string;
    configurationIncludePrevious?: string;
    configurationIncludeNext?: string;
    configurationIncludeLastDatapoint?: boolean;
    configurationIncludeNextDatapoint?: boolean;
    configurationIncludeRunningProcesses?: boolean;
    configurationKeepStates?: boolean;
}

export const defaultFactoryinsightQuery: Partial<FactoryinsightQuery> = {
    enterpriseName: 'factoryinsight',
    siteName: '',
    areaName: '',
    productionLineName: '',
    workCellName: '',
    dataFormat: '',

    tagGroup: '',
    tag: '',

    kpiMethod: '',

    tableType: '',

    value: '',
    fullTagName: '',

    labelsField: '',
    parameterString: '',
    uriPathExtension: '',

    configurationTagGapfilling: '',
    configurationTagAggregates: [],
    configurationTimeBucket: '1 hour',
    configurationIncludeLastDatapoint: true,
    configurationIncludeNextDatapoint: true,
    configurationIncludeRunningProcesses: true,
    configurationKeepStates: true,
};

/**
 * These are options configured for each DataSource instance
 */
export interface FactoryinsightDataSourceOptions extends DataSourceJsonData {
    baseURL: string;
    customerID: string;
    apiKey: string;
    apiKeyConfigured: boolean,
}


export const defaultOptions: Partial<FactoryinsightDataSourceOptions> = {
    customerID: 'factoryinsight',
    apiKey: '',
    apiKeyConfigured: false,
};
