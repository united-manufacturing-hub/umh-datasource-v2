import defaults from 'lodash/defaults';

import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';

import { FactoryinsightDataSourceOptions, FactoryinsightQuery, defaultFactoryinsightQuery } from './types';
import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';
import { getDemoTimeseriesData } from './demoData';
import { FunctionalVector } from '@grafana/data/vector/FunctionalVector';

export class DataSource extends DataSourceApi<FactoryinsightQuery, FactoryinsightDataSourceOptions> {
  baseUrl: string; // baseUrl is the url to factoryinsight
  apiPath: string;
  enterpriseName: string;

  constructor(instanceSettings: DataSourceInstanceSettings<FactoryinsightDataSourceOptions>) {
    instanceSettings.access = 'proxy'; // always set access to proxy

    super(instanceSettings);

    this.baseUrl = instanceSettings.jsonData.baseURL!;
    this.enterpriseName = instanceSettings.jsonData.customerId!;
    this.apiPath = `/api/v2/`;
    console.log(this.enterpriseName);
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

  async GetSites(callback: Function) {
    return this.fetchAPIRequest({
      url: this.baseUrl + this.apiPath + this.enterpriseName,
    })
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch sites');
      });
  }

  async GetAreas(site: string, callback: Function) {
    if (site === '' || site === undefined) {
      return [];
    }
    return this.fetchAPIRequest({
      url: this.baseUrl + this.apiPath + this.enterpriseName + `/${site}`,
    })
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch areas');
      });
  }

  async GetProductionLines(site: string, area: string, callback: Function) {
    if (site === undefined || site === '') {
      return [];
    }
    if (area === undefined || area === '') {
      return [];
    }
    return this.fetchAPIRequest({
      url: this.baseUrl + this.apiPath + this.enterpriseName + `/${site}` + `/${area}`,
    })
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch production lines');
      });
  }

  async GetWorkCells(site: string, area: string, productionLine: string, callback: Function) {
    if (site === undefined || site === '') {
      return [];
    }
    if (area === undefined || area === '') {
      return [];
    }
    if (productionLine === undefined || productionLine === '') {
      return [];
    }
    return this.fetchAPIRequest({
      url: this.baseUrl + this.apiPath + this.enterpriseName + `/${site}` + `/${area}` + `/${productionLine}`,
    })
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch work cells');
      });
  }

  async GetDataFormats(site: string, area: string, productionLine: string, workCell: string, callback: Function) {
    if (site === undefined || site === '') {
      return [];
    }
    if (area === undefined || area === '') {
      return [];
    }
    if (productionLine === undefined || productionLine === '') {
      return [];
    }
    if (workCell === undefined || workCell === '') {
      return [];
    }
    return this.fetchAPIRequest({
      url:
        this.baseUrl +
        this.apiPath +
        this.enterpriseName +
        `/${site}` +
        `/${area}` +
        `/${productionLine}` +
        `/${workCell}`,
    })
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch data formats');
      });
  }

  async GetTagGroups(site: string, area: string, productionLine: string, workCell: string, callback: Function) {
    if (site === undefined || site === '') {
      return [];
    }
    if (area === undefined || area === '') {
      return [];
    }
    if (productionLine === undefined || productionLine === '') {
      return [];
    }
    if (workCell === undefined || workCell === '') {
      return [];
    }
    return this.fetchAPIRequest({
      url:
        this.baseUrl +
        this.apiPath +
        this.enterpriseName +
        `/${site}` +
        `/${area}` +
        `/${productionLine}` +
        `/${workCell}` +
        'tags',
    })
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch tag groups');
      });
  }

  async GetTags(
    site: string,
    area: string,
    productionLine: string,
    workCell: string,
    tagGroup: string,
    callback: Function
  ) {
    if (site === undefined || site === '') {
      return [];
    }
    if (area === undefined || area === '') {
      return [];
    }
    if (productionLine === undefined || productionLine === '') {
      return [];
    }
    if (workCell === undefined || workCell === '') {
      return [];
    }
    if (tagGroup === undefined || tagGroup === '') {
      return [];
    }
    return this.fetchAPIRequest({
      url:
        this.baseUrl +
        this.apiPath +
        this.enterpriseName +
        `/${site}` +
        `/${area}` +
        `/${productionLine}` +
        `/${workCell}` +
        'tags' +
        `/${tagGroup}`,
    })
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch tags');
      });
  }

  async GetKpiMethods(site: string, area: string, productionLine: string, workCell: string, callback: Function) {
    if (site === undefined || site === '') {
      return [];
    }
    if (area === undefined || area === '') {
      return [];
    }
    if (productionLine === undefined || productionLine === '') {
      return [];
    }
    if (workCell === undefined || workCell === '') {
      return [];
    }
    return this.fetchAPIRequest({
      url:
        this.baseUrl +
        this.apiPath +
        this.enterpriseName +
        `/${site}` +
        `/${area}` +
        `/${productionLine}` +
        `/${workCell}` +
        'kpis',
    })
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch kpi methods');
      });
  }

  async GetTableTypes(site: string, area: string, productionLine: string, workCell: string, callback: Function) {
    if (site === undefined || site === '') {
      return [];
    }
    if (area === undefined || area === '') {
      return [];
    }
    if (productionLine === undefined || productionLine === '') {
      return [];
    }
    if (workCell === undefined || workCell === '') {
      return [];
    }
    return this.fetchAPIRequest({
      url:
        this.baseUrl +
        this.apiPath +
        this.enterpriseName +
        `/${site}` +
        `/${area}` +
        `/${productionLine}` +
        `/${workCell}` +
        'tables',
    })
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error('Failed to fetch table types');
      });
  }

  async testDatasource() {
    // Implement a health check for your data source.
    let testResult = {
      status: 'success',
      message: 'Data source works.',
      title: 'Success',
    };
    console.log(this.baseUrl);
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
        method: options.method || 'GET',
      })
      .toPromise();
  }
}
