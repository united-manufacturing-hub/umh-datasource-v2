import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import {FactoryinsightDataSourceOptions, FactoryinsightQuery} from './types';

export const plugin = new DataSourcePlugin<DataSource, FactoryinsightQuery, FactoryinsightDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
