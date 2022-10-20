import React, {ChangeEvent, PureComponent} from 'react';
import {LegacyForms} from '@grafana/ui';
import {DataSourcePluginOptionsEditorProps} from '@grafana/data';
import {FactoryinsightDataSourceOptions} from './types';

const {SecretFormField, FormField} = LegacyForms;

interface Props
    extends DataSourcePluginOptionsEditorProps<FactoryinsightDataSourceOptions> {
}

interface State {
}

export class ConfigEditor extends PureComponent<Props, State> {
    onBaseURLChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {onOptionsChange, options} = this.props;
        const jsonData = {
            ...options.jsonData,
            baseURL: event.target.value,
        };
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
        onOptionsChange({
            ...options,
            secureJsonData: {
                apiKey: event.target.value,
            },
        });
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

    render() {
        const {options} = this.props;
        const {jsonData} = options;
        return (
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
                            value={jsonData.apiKey || ''}
                            label="API Key"
                            placeholder="Basic xxxxxxxxx"
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
        );
    }
}
