import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import {
  FactoryinsightDataSourceOptions,
  FactoryinsightQuery,
  defaultFactoryinsightQuery
} from './types';
import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';

export class DataSource extends DataSourceApi<FactoryinsightQuery, FactoryinsightDataSourceOptions> {
  baseUrl: string; // baseUrl is the url to factoryinsight
  apiPath: string;
  customerID: string;

  constructor(instanceSettings: DataSourceInstanceSettings<FactoryinsightDataSourceOptions>) {
    instanceSettings.access = 'proxy'; // always set access to proxy

    super(instanceSettings);

    this.baseUrl = instanceSettings.url!;
    this.customerID = instanceSettings.jsonData.customerID!;
    this.apiPath = `/api/v1/`;
  }

  async query(options: DataQueryRequest<FactoryinsightQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Return a constant for each query.
    const data = options.targets.map(target => {
      const query = defaults(target, defaultFactoryinsightQuery);
      return new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time },
          { name: 'Value', values: [query.location, query.asset], type: FieldType.string },
        ],
      });
    });

    return { data };
  }

  async getLocations(callback: Function) {
    return this.fetchAPIRequest({
      url: this.baseUrl+this.apiPath+this.customerID,
    })
        .then((res: any) => {
          callback(res.data);
        })
        .catch((error: any) => {
          console.error(error);
          throw new Error('Failed to fetch locations');
        });
  }

  async testDatasource() {
    // Implement a health check for your data source.
    let testResult = {
      status: 'success',
      message: 'Data source works.',
      title: 'Success',
    };
      console.log(this.baseUrl)
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
  async fetchAPIRequest(options: BackendSrvRequest): Promise<any> {
    console.log('fetchAPIRequest: ' + JSON.stringify(options));
    return getBackendSrv()
        .fetch({
          url: options.url,
          method: options.method || 'GET'
        })
        .toPromise();
  }
}
