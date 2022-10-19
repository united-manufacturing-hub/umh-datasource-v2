import defaults from 'lodash/defaults';

import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';

import { defaultFactoryinsightQuery, FactoryinsightDataSourceOptions, FactoryinsightQuery } from './types';
import { BackendSrvRequest, FetchResponse, getBackendSrv } from '@grafana/runtime';
import { getDemoTimeseriesData } from './demoData';
import { lastValueFrom } from 'rxjs';

export class DataSource extends DataSourceApi<FactoryinsightQuery, FactoryinsightDataSourceOptions> {
  baseUrl: string; // baseUrl is the url to factoryinsight
  apiPath: string;
  enterpriseName: string;

  constructor(instanceSettings: DataSourceInstanceSettings<FactoryinsightDataSourceOptions>) {
    instanceSettings.access = 'proxy'; // always set access to proxy

    super(instanceSettings);

    this.baseUrl =
      instanceSettings.url == undefined
        ? 'http://united-manufacturing-hub-factoryinsight-service/'
        : instanceSettings.url;
    this.enterpriseName =
      instanceSettings.jsonData.customerID == undefined ? 'factoryinsight' : instanceSettings.jsonData.customerID;
    this.apiPath = `/api/v2/`;
  }

  async query(options: DataQueryRequest<FactoryinsightQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Return a constant for each query.
    const data = options.targets.map((target) => {
      const query = defaults(target, defaultFactoryinsightQuery);
      return getDemoTimeseriesData(query, from, to);
    });

    return { data };
  }

  async GetResourceTree() {
    return this.fetchAPIRequest({
      url: this.baseUrl + this.apiPath + 'treeStructure',
    })
      .then((res: any) => {
        //console.log(res);
        //console.log('res data: ' + res.data);
        const result = Object.entries(res.data);
        //console.log(result);
        return result;
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch resource tree');
      });
  }

  async GetValuesTree(queryPath: string) {
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
    console.log(this.baseUrl);
    // Implement a health check for your data source.
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
    const response = getBackendSrv().fetch({
      url: options.url,
      method: options.method || 'GET',
    });
    return lastValueFrom(response);
  }
}
