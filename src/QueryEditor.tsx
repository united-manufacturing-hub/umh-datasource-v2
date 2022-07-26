

import React, { PureComponent } from 'react';
import { AsyncSelect } from '@grafana/ui';
import { QueryEditorProps , SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { FactoryinsightDataSourceOptions, FactoryinsightQuery} from './types';

type Props = QueryEditorProps<DataSource, FactoryinsightQuery, FactoryinsightDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {

    defaultSelectableLocation: SelectableValue<string> = { label: 'Select Location', value: '' }
    defaultSelectableAsset: SelectableValue<string> = { label: 'Select Asset', value: '' }

    locationOptions: Array<SelectableValue<string>> = [];
    assetOptions: Array<SelectableValue<string>> = [];
    selectableLocation: SelectableValue<string>
    selectableAsset: SelectableValue<string>

    loadLocationOptions = () => {
        console.log("loadLocationOptions");
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.props.datasource.GetLocations().then(locations  => {
                this.locationOptions = locations.map(location => {
                    return {
                        value: location,
                        label: location,
                    }
                });
                resolve(this.locationOptions);
            });
        });
    };

    loadAssetOptions = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.props.datasource.GetAssets(this.selectableLocation.value)
                .then(assets  => {
                    this.assetOptions = assets.map(asset => {
                        return {
                            value: asset,
                            label: asset,
                        }
                    });
                    resolve(this.assetOptions);
                })
                .catch(error => {
                    console.log(error)
                    resolve(this.assetOptions);
                });

        });
    };

    isLocationSelected = () => {
        return this.selectableLocation.value !== '';
    }

    constructor(props: Props) {
        super(props);

        this.selectableLocation = this.defaultSelectableLocation;
        this.selectableAsset = this.defaultSelectableAsset;
    }

    onLocationChange = (event: SelectableValue<string>) => {
        // set location in query
        const { onChange, query } = this.props;
        onChange({ ...query, location: event.value });

        // and also in QueryEditor
        this.selectableLocation = event;

        // Reload assets
        this.selectableAsset = this.defaultSelectableAsset;
        this.loadAssetOptions().then(() => {
            this.forceUpdate();
        });

    };
    onAssetChange = (event: SelectableValue<string>) => {
        // set asset in query
        const { onChange, query } = this.props;
        onChange({ ...query, asset: event.value });

        // and also in QueryEditor
        this.selectableAsset = event;
    };


  render() {

    //const query = defaults(this.props.query, defaultFactoryinsightQuery);

    //const { location, asset } = query;

    return (
      <div className="gf-form">
          <label className="gf-form-label">Location</label>
          <AsyncSelect
              value={this.selectableLocation}
              onChange={this.onLocationChange}
              loadOptions={this.loadLocationOptions}
              loadingMessage={'Loading locations...'}
              defaultOptions={true}
              isSearchable={false}
              cacheOptions={false}
          />
          <label className="gf-form-label">Asset</label>
          <AsyncSelect
              value={this.selectableAsset}
              onChange={this.onAssetChange}
              loadOptions={this.loadAssetOptions}
              loadingMessage={'Loading assets...'}
              disabled={!this.isLocationSelected()}
              onOpenMenu={this.loadAssetOptions}
              isSearchable={false}
              cacheOptions={false}
              defaultOptions={this.assetOptions}
          />
      </div>
    );
  }
}
