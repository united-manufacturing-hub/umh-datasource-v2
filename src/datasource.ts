import defaults from 'lodash/defaults';

import {
    DataQueryRequest,
    DataQueryResponse,
    DataSourceApi,
    DataSourceInstanceSettings,
    FieldType,
    MutableDataFrame,
} from '@grafana/data';

import {isString, isUndefined} from 'lodash';
import {
    CustomerConfiguration,
    DatabaseStatistics,
    defaultFactoryinsightQuery,
    FactoryinsightDataSourceOptions,
    FactoryinsightQuery, GetValuesQueryReturn
} from './types';
import {BackendSrvRequest, FetchResponse, getBackendSrv} from "@grafana/runtime";
import {Buffer} from "buffer";
import {lastValueFrom} from "rxjs";

export class DataSource extends DataSourceApi<FactoryinsightQuery, FactoryinsightDataSourceOptions> {
    baseUrl: string; // baseUrl is the url to factoryinsight
    apiPath: string;
    enterpriseName: string;
    apiKey: string;

    constructor(instanceSettings: DataSourceInstanceSettings<FactoryinsightDataSourceOptions>) {
        instanceSettings.access = 'proxy'; // always set access to proxy

        super(instanceSettings);

        this.baseUrl =
            instanceSettings.url === undefined
                ? 'http://united-manufacturing-hub-factoryinsight-service/'
                : instanceSettings.url;
        this.enterpriseName =
            instanceSettings.jsonData.customerID === undefined ? 'factoryinsight' : instanceSettings.jsonData.customerID;
        this.apiPath = `/api/v2/`;
        this.apiKey = instanceSettings.jsonData.apiKey === undefined ? '' : instanceSettings.jsonData.apiKey;
    }

    async fetchAPIRequest(options: BackendSrvRequest, enterpriseName: string, apiKey: string): Promise<FetchResponse<unknown>> {
        console.log("fetchAPIRequest");
        if (options.headers === undefined) {
            options.headers = {};
        }
        let b64encodedAuth: string;
        if (Buffer !== undefined) {
            b64encodedAuth = Buffer.from(`${enterpriseName}:${apiKey}`).toString('base64');
        } else if (btoa !== undefined) {
            b64encodedAuth = btoa(`${enterpriseName}:${apiKey}`);
        } else {
            throw new Error('No Buffer or btoa function available');
        }
        options.headers['Authorization'] = `Basic ${b64encodedAuth}`;
        options.headers['Content-Type'] = `application/json`;

        const response = getBackendSrv().fetch({
            url: options.url,
            method: options.method || 'GET',
            headers: options.headers,
        });
        return lastValueFrom(response);
    }

    async query(options: DataQueryRequest<FactoryinsightQuery>): Promise<DataQueryResponse> {
        const {range} = options;
        const from: string = range.from.utc().toISOString();
        const to: string = range.to.utc().toISOString();

        // Return a constant for each query.

        let data = [];

        for (let queryIndex = 0; queryIndex < options.targets.length; queryIndex++) {
            let target = options.targets[queryIndex];
            data.push(await this.GetMappedValues(target, from, to, options, queryIndex));
        }

        console.log('Query (options, data)', options, data);

        return {data};
    }

    private async GetMappedValues(
        target: FactoryinsightQuery,
        from: string,
        to: string,
        options: DataQueryRequest<FactoryinsightQuery>,
        queryIndex: number
    ) {
        const query = defaults(target, defaultFactoryinsightQuery);

        if (query.value === undefined) {
            throw new Error('No value selected');
        }

        //factoryinsight/testLocation/DefaultArea/DefaultProductionLine/testMachine
        //factoryinsight/testLocation/DefaultArea/DefaultProductionLine/ABC/tags/custom/Pressure

        let fTNX;
        if (query.fullTagName === undefined) {
            fTNX = query.value;
        } else {
            const fTN = query.fullTagName;
            const q = query.value;
            const ftnSplits = fTN.split('/');
            const qSplits = q.split('/');
            fTNX = fTN + '/' + qSplits.slice(ftnSplits.length, qSplits.length).join('/');
        }

        const resultArray = await this.getDatapoints(from, to, fTNX, options.targets);

        // Return and empty frame if no location, asset or value has been specified
        const frame = new MutableDataFrame({
            refId: query.refId,
            fields: [],
        });

        if (resultArray === null) {
            return frame;
        }

        // Temporary space for the requested data points, data format and requested value
        // Initialising array
        const datapoints = resultArray.datapoints;
        const columnNames = resultArray.columnNames;

        // Handle empty arrays
        if (isUndefined(datapoints[queryIndex])) {
            return frame;
        }

        // Turn rows into fields if defined by user
        if (query.labelsField !== undefined && query.labelsField !== '') {
            const fieldNameIndex = columnNames[queryIndex].indexOf(query.labelsField);

            if (fieldNameIndex === -1) {
                console.error(`ERROR: Column ${query.labelsField} not found. Using default format.`);
            } else {
                // These are the new column names
                const newColumnNames = datapoints[queryIndex][fieldNameIndex];
                // Filter out the column names from the table and transpose it for easier assignment
                const newDatapoints = this.transpose(
                    datapoints[queryIndex].filter((element, eIndex) => {
                        return eIndex !== fieldNameIndex;
                    })
                );
                // Create a new field with the corresponding data
                newColumnNames.map((columnName, columnIndex) => {
                    frame.addField({
                        name: columnName.toString(),
                        type: FieldType.number,
                        values: newDatapoints[columnIndex],
                    });
                });

                return frame;
            }
        }

        // If no label column was specified, handle the incoming data with the
        // defined data model structure:
        // { columnNames: string[], datapoints: any[][] }
        columnNames[queryIndex].map((columnName, columnIndex) => {
            // Look for the fixed columns
            if (columnName === 'timestamp') {
                frame.addField({
                    name: columnName,
                    type: FieldType.time,
                    values: datapoints[queryIndex][columnIndex],
                });
            } else if (columnName === 'fieldName') {
                // TODO Special case
                // Edit from 2022: I have no idea what this special case is about
            } else {
                // Check data type
                const sampleValue = datapoints[queryIndex][columnIndex][0];
                frame.addField({
                    name: columnName,
                    type: isString(sampleValue) ? FieldType.string : FieldType.number,
                    values: datapoints[queryIndex][columnIndex],
                });
            }
        });

        return frame;
    }

    async getDatapoints(
        from: string,
        to: string,
        path: string,
        queries: FactoryinsightQuery[]
    ): Promise<{ datapoints: number[][][]; columnNames: string[][] } | null> {
        let url = this.baseUrl + this.apiPath + path;
        url = url + '?from=' + from + '&to=' + to;

        const datapoints: number[][][] = [];
        const columnNames: string[][] = [];

        for (let i = 0; i < queries.length; i += 1) {
            const query = queries[i];
            if (query.hide) {
                continue;
            }
            const urlX = this.ConstructURL(query, url);


            await this.fetchAPIRequest({
                url: urlX,
            }, this.enterpriseName, this.apiKey)
                .then((res: any) => {
                    // Handle empty responses
                    if (res.data.datapoints !== null) {
                        // Push datapoints
                        columnNames.push(res.data.columnNames);
                        datapoints.push(this.transpose(res.data.datapoints));
                    }
                })
                .catch((error: any) => {
                    console.error(error);
                    throw new Error('Failed to fetch datapoints');
                });
        }

        return {datapoints: datapoints, columnNames: columnNames};
    }

    private ConstructURL(target: FactoryinsightQuery, url: string) {
        // force deep copy of string
        let url2 = (' ' + url).slice(1);
        // Include optional parameters
        if (target.configurationIncludeNext !== undefined) {
            url2 = url2 + '&includeNext=' + target.configurationIncludeNext;
        }
        if (target.configurationIncludePrevious !== undefined) {
            url2 = url2 + '&includePrevious=' + target.configurationIncludePrevious;
        }
        if (target.configurationTagGapfilling !== undefined && target.configurationTagGapfilling.length > 0) {
            url2 = url2 + '&gapFilling=' + target.configurationTagGapfilling;
        } else {
            url2 = url2 + '&gapFilling=null';
        }
        if (target.configurationTagAggregates !== undefined && target.configurationTagAggregates.length > 0) {
            // join array to string separated by comma
            url2 = url2 + '&tagAggregates=' + target.configurationTagAggregates.join(',');
        } else {
            url2 = url2 + '&tagAggregates=avg';
        }
        if (target.configurationTimeBucket !== undefined) {
            url2 = url2 + '&timeBucket=' + target.configurationTimeBucket;
        } else {
            url2 = url2 + '&timeBucket=1m';
        }
        if (target.configurationIncludeLastDatapoint !== undefined) {
            url2 = url2 + '&includePrevious=' + target.configurationIncludeLastDatapoint;
        } else {
            url2 = url2 + '&includePrevious=true';
        }
        if (target.configurationIncludeNextDatapoint !== undefined) {
            url2 = url2 + '&includeNext=' + target.configurationIncludeNextDatapoint;
        } else {
            url2 = url2 + '&includeNext=true';
        }
        if (target.configurationIncludeRunningProcesses !== undefined) {
            url2 = url2 + '&includeRunning=' + target.configurationIncludeRunningProcesses;
        } else {
            url2 = url2 + '&includeRunning=true';
        }
        if (target.configurationKeepStates !== undefined) {
            url2 = url2 + '&keepStatesInteger=' + target.configurationKeepStates;
        } else {
            url2 = url2 + '&keepStatesInteger=true';
        }

        return url2;
    }

    transpose = (a: number[][]): number[][] | any[] => {
        // Calculate the width and height of the Array
        const w = a.length || 0;
        const h = a[0] instanceof Array ? a[0].length : 0;

        // In case it is a zero matrix, no transpose routine needed.
        if (h === 0 || w === 0) {
            return [];
        }

        let t: number[][];
        t = [];
        t.length = 0;

        // Loop through every item in the outer array (height)
        for (let i = 0; i < h; i++) {
            // Insert a new row (array)
            t.push([]);

            // Loop through every item per item in outer array (width)
            for (let j = 0; j < w; j++) {
                // Save transposed data.
                t[i][j] = a[j][i];
            }
        }

        return t;
    };

    async GetResourceTree() {
        return this.fetchAPIRequest({
            url: this.baseUrl + this.apiPath + 'treeStructure',
        }, this.enterpriseName, this.apiKey)
            .then((res: any) => {
                return Object.entries(res.data);
            })
            .catch((error: any) => {
                console.error(error);
                throw new Error('Failed to fetch resource tree');
            });
    }

    async GetValuesTree(queryPath: string) : Promise<GetValuesQueryReturn> {
        return this.fetchAPIRequest({
            url: this.baseUrl + this.apiPath + queryPath + '/getValues',
        }, this.enterpriseName, this.apiKey)
            .then((res: any) => {
                let gv: GetValuesQueryReturn = JSON.parse(res.data);
                return gv;
            })
            .catch((error: any) => {
                console.error(error);
                throw new Error('Failed to fetch value tree');
            });
    }

    async testDatasource() {
        let testResult = {
            status: 'success',
            message: 'Data source works.',
            title: 'Success',
        };


        await this.fetchAPIRequest({
            url: this.baseUrl, // no API path as health check is on path /
        }, this.enterpriseName, this.apiKey)
            .then((res: any) => {
                if (res === undefined || res.status !== 200 || res.data !== 'online') {
                    testResult.status = 'error';
                    testResult.message = `Wrong response from server: ${res}`;
                    testResult.title = `Data source connection error`;
                }
            })
            .catch((error: any) => {
                testResult.status = 'error';
                testResult.message = `Caught error in datasource test: ${JSON.stringify(error)}`;
                testResult.title = `Data source exception`;
            });
        return testResult;
    }


    async getCustomerConfiguration(): Promise<CustomerConfiguration | void> {
        const urlX = this.baseUrl + this.apiPath + this.enterpriseName + '/configuration';
        return await this.fetchAPIRequest({
            url: urlX,
        }, this.enterpriseName, this.apiKey).then((res: any) => {
            // res is json, convert to CustomConfiguration

            console.log("[c] res.data", res.data);
            let cC: CustomerConfiguration = res.data;
            return cC;
        }).catch((error: any) => {
            console.error(error);
            throw new Error('Failed to fetch customer configuration');
        });
    }

    async getDatabaseStatistics(): Promise<DatabaseStatistics | void> {
        const urlX = this.baseUrl + this.apiPath + this.enterpriseName + '/database-stats';
        return await this.fetchAPIRequest({
            url: urlX,
        }, this.enterpriseName, this.apiKey).then((res: any) => {
            // res is json, convert to CustomConfiguration

            console.log("[db] res.data", res.data);
            let cC: DatabaseStatistics = res.data;
            return cC;
        }).catch((error: any) => {
            console.error(error);
            throw new Error('Failed to fetch customer configuration');
        });
    }
}
