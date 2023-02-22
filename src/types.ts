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
    configurationTimeBucket: '1m',
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
    apiKeyConfigured: boolean;
}

export const defaultOptions: Partial<FactoryinsightDataSourceOptions> = {
    customerID: 'factoryinsight',
    apiKey: '',
    apiKeyConfigured: false,
};

export interface CustomerConfiguration {
    AutomaticallyIdentifyChangeovers: boolean;
    AvailabilityLossStates: number[];
    IgnoreMicrostopUnderThisDurationInSeconds: number;
    LanguageCode: number;
    LowSpeedThresholdInPcsPerHour: number;
    MicrostopDurationInSeconds: number;
    MinimumRunningTimeInSeconds: number;
    PerformanceLossStates: number[];
    ThresholdForNoShiftsConsideredBreakInSeconds: number;
}

export interface DatabaseStatistics {
    DatabaseSizeInBytes: number;
    TableStatistics: { [key: string]: TableStatistic };
}

export interface TableStatistic {
    ApproximateRows: number;
    LastAutoAnalyze: MaybeString;
    LastAutoVacuum: MaybeString;
    LastAnalyze: MaybeString;
    LastVacuum: MaybeString;
    IsHyperTable: boolean;

    NormalStats: NormalTableStats;
    HyperStats: HypertableStats[] | null;
    HyperRetention: HyperTableRetention;
    HyperCompression: HyperTableCompression;
}

export interface HyperTableRetention {
    ScheduleInterval: string;
    Config: string;
}

export interface HyperTableCompression {
    ScheduleInterval: string;
    Config: string;
}


export interface HypertableStats {
    TableBytes: number;
    IndexBytes: number;
    ToastBytes: number;
    TotalBytes: number;
    NodeName: MaybeString;
}

export interface MaybeString {
    String: string;
    Valid: boolean;
}

export interface NormalTableStats {
    PgTableSize: number;
    PgTotalRelationSize: number;
    PgIndexesSize: number;
    PgRelationSizeMain: number;
    PgRelationSizeFsm: number;
    PgRelationSizeVm: number;
    PgRelationSizeInit: number;
}

export interface GetValuesQueryReturn {
    label:  string;
    value:  string;
    tables: ValueSubTree[] | null;
    kpi:    ValueSubTree[] | null;
    tags:   ValueSubTree[] | null;
}

export interface ValueSubTree {
    entries: { [key: string]: ValueSubTree } | null;
    label:   string;
    value:   string;
}
