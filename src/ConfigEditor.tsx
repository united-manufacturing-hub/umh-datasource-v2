// @ts-strict
import React, {ChangeEvent, PureComponent} from 'react';
import {LegacyForms} from '@grafana/ui';
import {DataSourcePluginOptionsEditorProps} from '@grafana/data';
import {FactoryinsightDataSourceOptions} from './types';

const {SecretFormField, FormField} = LegacyForms;

interface Props
    extends DataSourcePluginOptionsEditorProps<FactoryinsightDataSourceOptions> {
}

interface State {
    configurationAPIKey: string;
}

const finishedAPIKeyRegex = new RegExp("^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$");

export class ConfigEditor extends PureComponent<Props, State> {

    onBaseURLChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {onOptionsChange, options} = this.props;
        const jsonData = {
            ...options.jsonData,
            url: event.target.value,
            baseURL: event.target.value,
        };
        options.url = event.target.value;
        onOptionsChange({...options, jsonData});
    };

    onEnterpriseNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {onOptionsChange, options} = this.props;
        const jsonData = {
            ...options.jsonData,
            customerID: event.target.value,
        };
        onOptionsChange({...options, jsonData});
    };

    // Secure field (only sent to the backend)
    onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {onOptionsChange, options} = this.props;
        console.log("SJD: ", options.secureJsonData)

        onOptionsChange({
            ...options,
            secureJsonData: {
                apiKey: event.target.value,
            },
        });


        if (finishedAPIKeyRegex.test(event.target.value)) {
            // Set apiKeyConfigured to true
            const jsonData = {
                ...options.jsonData,
                apiKeyConfigured: true,
            }
            onOptionsChange({...options, jsonData});
        }
    };

    onResetAPIKey = () => {
        const {onOptionsChange, options} = this.props;
        onOptionsChange({
            ...options,
            secureJsonFields: {
                ...options.secureJsonFields,
                apiKey: false,
            },
            secureJsonData: {
                ...options.secureJsonData,
                apiKey: '',
            },
        });
    };

    onInputConfigurationAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            ...this.state,
            configurationAPIKey: event.target.value,
        })
    };

    componentDidMount() {
        console.log("componentDidMount, state: ", this.state)
    }

    componentDidUpdate() {
        if (this.state === null) {
            return;
        }
        if (this.state.configurationAPIKey === null || this.state.configurationAPIKey === undefined) {
            return;
        }
        // Check if API was configured
        if (finishedAPIKeyRegex.test(this.state.configurationAPIKey)) {
            const baseUrl = this.props.options.jsonData.baseURL;
            const customerID = this.props.options.jsonData.customerID;
            const url = baseUrl + "/api/v2/" + customerID + "/configuration";
            fetchAPIRequest({
                url: url,
            })
            console.log("API key configured, state: ", this.state)
        }
    }


    render() {
        const {options} = this.props;
        const {jsonData} = options;
        console.log("Options: ", options);
        return (
            <div>
                <React.StrictMode>
                    <div className="gf-form-group">
                        <div className="gf-form">
                            <FormField
                                label="Base URL"
                                labelWidth={10}
                                inputWidth={20}
                                onChange={this.onBaseURLChange}
                                value={jsonData.baseURL || ''}
                                tooltip="This is the URL of the factoryinsight instance. Starts with http:// or https:// and ends with /"
                                placeholder="http://united-manufacturing-hub-factoryinsight-service/"
                                required
                            />
                        </div>

                        <div className="gf-form">
                            <FormField
                                label="Enterprise name"
                                labelWidth={10}
                                inputWidth={20}
                                onChange={this.onEnterpriseNameChange}
                                value={jsonData.customerID || ''}
                                tooltip="Defaults to factoryinsight"
                                placeholder="factoryinsight"
                            />
                        </div>

                        <div className="gf-form-inline">
                            <div className="gf-form">
                                <SecretFormField
                                    isConfigured={jsonData.apiKeyConfigured !== undefined && jsonData.apiKeyConfigured}
                                    value={options.secureJsonData ? ("apiKey" in options.secureJsonData ? options.secureJsonData["apiKey"] : '') : ''}
                                    label="API Key"
                                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    labelWidth={10}
                                    inputWidth={20}
                                    tooltip="This can be found in Lens --> Secrets --> factoryinsight-secret --> apiKey"
                                    onReset={this.onResetAPIKey}
                                    onChange={this.onAPIKeyChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="gf-form-group">
                        <h1 className="page-heading">Configuration</h1>
                        <h2>API Key</h2>
                        <p>To see your configuration, you need to re-validate your API key.</p>
                        <div className="gf-form-inline">
                            <div className="gf-form">
                                <FormField
                                    label="API Key"
                                    labelWidth={10}
                                    inputWidth={20}
                                    onChange={this.onInputConfigurationAPIKeyChange}
                                />
                            </div>
                        </div>
                    </div>
                </React.StrictMode>
            </div>
        );
    }
}
