import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { FactoryinsightDataSourceOptions, FactoryinsightSecureJsonData } from './types';

const { SecretFormField, FormField } = LegacyForms;

interface Props
  extends DataSourcePluginOptionsEditorProps<FactoryinsightDataSourceOptions, FactoryinsightSecureJsonData> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onBaseURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      baseURL: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onEnterpriseNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      customerId: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiKey: event.target.value,
      },
    });
  };

  onResetAPIKey = () => {
    const { onOptionsChange, options } = this.props;
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
    const { options } = this.props;
    const { jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as FactoryinsightSecureJsonData;

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
            value={jsonData.customerId || 'factoryinsight'}
            tooltip="Defaults to factoryinsight"
            placeholder="factoryinsight"
          />
        </div>

        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.apiKey) as boolean}
              value={secureJsonData.apiKey || ''}
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
