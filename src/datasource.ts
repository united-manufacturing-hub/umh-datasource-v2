import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';

import { isString, isUndefined } from 'lodash';
import { defaultFactoryinsightQuery, FactoryinsightDataSourceOptions, FactoryinsightQuery } from './types';
import { BackendSrvRequest, FetchResponse, getBackendSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';
import { Buffer } from 'buffer';

export class DataSource extends DataSourceApi<FactoryinsightQuery, FactoryinsightDataSourceOptions> {
  baseUrl: string; // baseUrl is the url to factoryinsight
  apiPath: string;
  enterpriseName: string;
  apiKey: string;

  constructor(instanceSettings: DataSourceInstanceSettings<FactoryinsightDataSourceOptions>) {
    console.log('constructor');
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

  async query(options: DataQueryRequest<FactoryinsightQuery>): Promise<DataQueryResponse> {
    console.log('query');
    console.log('options: ', options);
    const { range } = options;
    const from: string = range.from.utc().toISOString();
    const to: string = range.to.utc().toISOString();

    // Return a constant for each query.

    let data = [];

    for (let queryIndex = 0; queryIndex < options.targets.length; queryIndex++) {
      let target = options.targets[queryIndex];
      data.push(await this.GetMappedValues(target, from, to, options, queryIndex));
    }

    return { data };
  }

  private async GetMappedValues(
    target: FactoryinsightQuery,
    from: string,
    to: string,
    options: DataQueryRequest<FactoryinsightQuery>,
    queryIndex: number
  ) {
    console.log('GetMappedValues');
    //const query = defaults(target, defaultFactoryinsightQuery);

    if (target.value === undefined) {
      throw new Error('No value selected');
    }

    const resultArray = await this.getDatapoints(from, to, target.value, options.targets);

    if (resultArray === null) {
      console.log('resultArray is null');
      return { data: [] };
    }

    // Temporary space for the requested data points, data format and requested value
    // Initialising array
    const datapoints = resultArray.datapoints;
    const columnNames = resultArray.columnNames;

    // Return and empty frame if no location, asset or value has been specified
    const frame = new MutableDataFrame({
      refId: target.refId,
      fields: [],
    });

    // Handle empty arrays
    if (isUndefined(datapoints[queryIndex])) {
      return frame;
    }

    // Turn rows into fields if defined by user
    if (target.labelsField !== undefined && target.labelsField !== '') {
      const fieldNameIndex = columnNames[queryIndex].indexOf(target.labelsField);

      if (fieldNameIndex === -1) {
        console.error(`ERROR: Column ${target.labelsField} not found. Using default format.`);
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
        console.log('TODO: Special case for fieldName');
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
    console.log('getDatapoints');
    console.log('path: ', path);
    console.log('from: ', from);
    console.log('to: ', to);

    let url = this.baseUrl + this.apiPath + path;
    url = url + '?from=' + from + '&to=' + to;

    const datapoints: number[][][] = [];
    const columnNames: string[][] = [];

    for (let i = 0; i < queries.length; i += 1) {
      const query = queries[i];
      const urlX = this.ConstructURL(query, url);
      console.log('urlX: ', urlX);

      await this.fetchAPIRequest({
        url: urlX,
      })
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

    return { datapoints: datapoints, columnNames: columnNames };
  }

  private ConstructURL(target: FactoryinsightQuery, url: string) {
    console.log('constructing url from target and url:', target, url);
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
      url2 = url2 + '&timeBucket=1 minute';
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

    console.log('url2: ', url2);
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
    console.log('GetResourceTree');
    return this.fetchAPIRequest({
      url: this.baseUrl + this.apiPath + 'treeStructure',
    })
      .then((res: any) => {
        return Object.entries(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch resource tree');
      });
  }

  async GetValuesTree(queryPath: string) {
    console.log('GetValuesTree');
    return this.fetchAPIRequest({
      url: this.baseUrl + this.apiPath + queryPath + '/getValues',
    })
      .then((res: any) => {
        return Object.entries(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch value tree');
      });
  }

  async testDatasource() {
    console.log('testDatasource');
    console.log(this.baseUrl); // Implement a health check for your data source.
    let testResult = {
      status: 'success',
      message: 'Data source works.',
      title: 'Success',
    };

    await this.fetchAPIRequest({
      url: this.baseUrl, // no API path as health check is on path /
    })
      .then((res: any) => {
        if (res === undefined || res.status !== 200 || res.data !== 'online') {
          console.log(JSON.stringify(res));
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

  /// Replacement for deprecated fetchAPIRequest, using fetch api
  fetchAPIRequest(options: BackendSrvRequest): Promise<FetchResponse<unknown>> {
    console.log('fetchAPIRequest: ' + JSON.stringify(options));
    if (options.headers === undefined) {
      options.headers = {};
    }
    let b64encodedAuth: string;
    if (Buffer !== undefined) {
      b64encodedAuth = Buffer.from(`${this.enterpriseName}:${this.apiKey}`).toString('base64');
    } else if (btoa !== undefined) {
      b64encodedAuth = btoa(`${this.enterpriseName}:${this.apiKey}`);
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
}
