import {BackendSrvRequest, FetchResponse, getBackendSrv} from '@grafana/runtime';
import {lastValueFrom} from 'rxjs';
import {Buffer} from 'buffer';

export class Helper {

    static async fetchAPIRequest(options: BackendSrvRequest, enterpriseName: string, apiKey: string): Promise<FetchResponse<unknown>> {
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

}
