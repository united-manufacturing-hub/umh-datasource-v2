import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import {defaultFactoryinsightQuery, FactoryinsightDataSourceOptions, FactoryinsightQuery} from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, FactoryinsightQuery, FactoryinsightDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {

  //   onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const { onChange, query } = this.props;
  //   onChange({ ...query, queryText: event.target.value });
  // };
    onLocationChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onChange, query } = this.props;
        onChange({ ...query, location: event.target.value });
        };
    onAssetChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onChange, query } = this.props;
        onChange({ ...query, asset: event.target.value });
    };


  render() {

    const query = defaults(this.props.query, defaultFactoryinsightQuery);

    const { location, asset } = query;
    console.log(location, asset)
    return (
      <div className="gf-form">
          <FormField
              width={4}
              value={location}
              onChange={this.onLocationChange}
              label="Location"
              type="string"
          />
          <FormField
              width={4}
              value={asset}
              onChange={this.onAssetChange}
              label="Asset"
              type="string"
          />
      </div>
    );
  }
}
