// POC TODO
// Alerts using Grafana's Alerting system TODO
// Historian functions CHECK
// - statistical like avg, max, min, etc CHECK
// - gapfilling, last observation carried forward, downsampling. NEEDS time_bucket_gapfill() CHECK
// User defined functions TODO
// Export REST call to get data TODO

import React, { PureComponent } from 'react';
import { Cascader, CascaderOption, InlineLabel, FieldSet } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { FactoryinsightDataSourceOptions, FactoryinsightQuery } from './types';

type Props = QueryEditorProps<DataSource, FactoryinsightQuery, FactoryinsightDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {

  enterpriseName = this.props.datasource.enterpriseName;
  valueStructure: CascaderOption[] = [];
  objectStructure: CascaderOption[] = [];

  tagsQueryParameter = 'tags';
  kpisQueryParameter = 'kpi';
  tablesQueryParameter = 'tables';

  selectedObject = '';
  selectedValue = '';

  // Aggregates configuration
  tagAggregatesOptions = [
    { label: 'Average', value: 'avg', description: 'The average value of all values in the time bucket' },
    { label: 'Minimum', value: 'min', description: 'The minimum value of all values in the time bucket' },
    { label: 'Maximum', value: 'max', description: 'The maximum value of all values in the time bucket' },
    { label: 'Sum', value: 'sum', description: 'The sum of all values in the time bucket' },
    { label: 'Count', value: 'count', description: 'The number of values in the time bucket' },
  ];
  defaultConfigurationAggregates: SelectableValue = this.tagAggregatesOptions[0];
  selectedConfigurationAggregates: SelectableValue[] = [this.defaultConfigurationAggregates];

  // time bucket configuration
  tagTimeBucketOptions = [
    { label: '1 minute', value: 'minute', description: 'Aggregate data from the last minute' },
    { label: '1 hour', value: 'hour', description: 'Aggregate data from the last hour' },
    { label: '1 day', value: 'dat', description: 'Aggregate data from the last day' },
    { label: '1 week', value: 'week', description: 'Aggregate data from the last week' },
    { label: '1 month', value: 'month', description: 'Aggregate data from the last month' },
    { label: '1 year', value: 'year', description: 'Aggregate data from the last year' },
  ];
  defaultConfigurationTimeBucket: SelectableValue = this.tagTimeBucketOptions[0];
  selectedConfigurationTimeBucket: SelectableValue = this.defaultConfigurationTimeBucket;

  // Gapfilling configuration
  tagGapfillingOptions = [
    { label: 'Show as NULL (default)', value: 'null', description: 'Missing data will show as NULL' },
    {
      label: 'Interpolate',
      value: 'interpolation',
      description: 'The interpolate function does linear interpolation for missing values.',
    },
    {
      label: 'LOCF',
      value: 'locf',
      description:
        'The LOCF (last observation carried forward) function allows you to carry the last seen value in an aggregation group forward. ',
    },
  ];
  defaultConfigurationGapfilling: SelectableValue = this.tagGapfillingOptions[0];
  selectedConfigurationGapfilling: SelectableValue = this.defaultConfigurationGapfilling;

  constructor(props: Props) {
    super(props);

    this.selectedObject = this.props.query.fullTagName || '';
    this.selectedValue = this.props.query.value || '';

    // loop through this.props.query.configurationTagAggregates and add to selectedConfigurationAggregates
    const currentConfigurationAggregates = this.props.query.configurationTagAggregates || [
      this.defaultConfigurationAggregates,
    ];
    for (let i = 0; i < currentConfigurationAggregates.length; i++) {
      const currentValue = currentConfigurationAggregates[i];

      // check if currentValue is in this.tagAggregatesOptions
      for (let j = 0; j < this.tagAggregatesOptions.length; j++) {
        const currentOption = this.tagAggregatesOptions[j];
        if (currentValue === currentOption.value) {
          this.selectedConfigurationAggregates.push(currentOption);
        }
      }
    }

    // check this.props.query.configurationTagGapfilling and add to selectedConfigurationGapfilling
    const currentGapfill = this.props.query.configurationTagGapfilling || this.defaultConfigurationGapfilling.value;
    for (let i = 0; i < this.tagGapfillingOptions.length; i++) {
      const currentOption = this.tagGapfillingOptions[i];
      if (currentGapfill === currentOption.value) {
        this.selectedConfigurationGapfilling = currentOption;
      }
    }

    // check this.props.query.configurationTagTimeBucket and add to selectedConfigurationTimeBucket
    const currentTimeBucket = this.props.query.configurationTimeBucket || this.defaultConfigurationTimeBucket.value;
    for (let i = 0; i < this.tagTimeBucketOptions.length; i++) {
      const currentOption = this.tagTimeBucketOptions[i];
      if (currentTimeBucket === currentOption.value) {
        this.selectedConfigurationTimeBucket = currentOption;
      }
    }
  }

  isObjectSelected = () => {
    return this.selectedObject !== '';
  };

  isValidValueSelected = () => {
    if (this.selectedValue === '') {
      return false;
    } else if (
      this.selectedValue === this.kpisQueryParameter ||
      this.selectedValue === this.tagsQueryParameter ||
      this.selectedValue === this.tagsQueryParameter + '/custom' ||
      this.selectedValue === this.tagsQueryParameter + '/automated'
    ) {
      return false;
    } else {
      return true;
    }
  };

  // isCurrentSelectedValueACustomTag checks whether the current selected value is a tag and therefore, begins with tagsValueID
  isCurrentSelectedValueACustomTag = () => {
    if (this.isValidValueSelected()) {
      return this.selectedValue.startsWith(this.tagsQueryParameter + '/custom');
    } else {
      return false;
    }
  };

  getObjectStructure = () => {
    // only load new resources if there are no resources
    console.log('getObjectStructure');
    console.log(this.objectStructure.length);
    if (this.objectStructure.length == 0) {
      const newObject: CascaderOption[] = [];
      this.props.datasource.GetResourceTree().then((response: any) => {
        console.log(response[0][1]);
        // the response is weird. it's an object array, of which the first item (index 0) contains
        // another object array, of which the second item (index 1) contains the actual payload
        const payload = response[0][1];
        // the one and only CascaderOption at the top of the tree is the enterprise one
        newObject.push({
          label: payload.label,
          value: payload.value,
          items: payload.entries.map((sites: any) => {
            // map all the sites relative to the enterprise
            return {
              label: sites.label,
              value: sites.value,
              items: sites.entries.map((areas: any) => {
                // map all the areas relative to all the sites
                return {
                  label: areas.label,
                  value: areas.value,
                  items: areas.entries.map((productionLines: any) => {
                    // map all the production lines relative to all the areas
                    return {
                      label: productionLines.label,
                      value: productionLines.value,
                      items: productionLines.entries.map((workCells: any) => {
                        // map all the work cells relative to all the production lines
                        return {
                          label: workCells.label,
                          value: workCells.value,
                        };
                      }),
                    };
                  }),
                };
              }),
            };
          }),
        });
        this.objectStructure = newObject;
        this.forceUpdate();
        console.log("Forced update");
      });
    }
  };

  getValueStructure = () => {
    // if no work cell is in the query, no value should be shown
    if (this.props.query.workCellName === '' || this.props.query.workCellName === undefined) {
      this.valueStructure = [];
    } else {
      // check if the query is correct. it should have enterprise/site/area/productionline/workcell for a total of 4 '/'
      if (this.selectedObject.match('/')?.length == 4 || false) {
        const newValues: CascaderOption[] = [];
        this.props.datasource.GetValuesTree(this.selectedObject).then((response: any) => {
          console.log(response[0][1]);
          // the response is weird. it's an object array, of which the first item (index 0) contains
          // another object array, of which the second item (index 1) contains the actual payload
          const payload = response[0][1];
          // the payload should have tree arrays of CascaderOptions, each named after 'tables' 'kpi' and 'tags'
          newValues.push({
            // 'tables' CascaderOption.
            label: 'tables',
            value: 'tables',
            items: payload.tables.map((tables: any) => {
              // map the actual tables
              return {
                label: tables.label,
                value: tables.value,
              };
            }),
          });
          newValues.push({
            label: 'kpi',
            value: 'kpi',
            items: payload.kpi.map((kpis: any) => {
              // map the actual kpis
              return {
                label: kpis.label,
                value: kpis.value,
              };
            }),
          });
          newValues.push({
            label: 'tags',
            value: 'tags',
            items: payload.tags.map((groupTags: any) => {
              // map the actual tags
              return {
                label: groupTags.label,
                value: groupTags.value,
                items: groupTags.entries.map((tags: any) => {
                  return {
                    label: tags.label,
                    value: tags.label,
                  };
                }),
              };
            }),
          });
        });
        this.valueStructure = newValues;
      }
    }

    return this.valueStructure;
  };

  onObjectChange = (val: string) => {
    // split object into enterprise, area, production line, work cell
    const { onChange, query } = this.props;
    const fullTagName = val;
    const enterprise = fullTagName.split('/')[0];
    const site = fullTagName.split('/')[1];
    const area = fullTagName.split('/')[2];
    const productionLine = fullTagName.split('/')[3];
    const workCell = fullTagName.split('/')[4];

    onChange({
      ...query,
      enterpriseName: enterprise,
      siteName: site,
      areaName: area,
      productionLineName: productionLine,
      workCellName: workCell,
      fullTagName,
    });

    // and also in QueryEditor
    this.selectedObject = val;

    // reset value and configuration
    this.selectedValue = '';
    this.selectedConfigurationGapfilling = this.defaultConfigurationGapfilling;

    // force render
    this.forceUpdate();
  };

  onValueChange = (val: string) => {
    const { onChange, query } = this.props;
    const value = val;
    onChange({ ...query, value });

    // and also in QueryEditor
    this.selectedValue = val;

    // reset configuration
    this.selectedConfigurationGapfilling = this.defaultConfigurationGapfilling;

    // force render
    this.forceUpdate();
  };

  onConfigurationGapfillingChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    const configurationTagGapfilling = value.value;
    onChange({ ...query, configurationTagGapfilling });

    // and also in QueryEditor
    this.selectedConfigurationGapfilling = value;

    // force render
    this.forceUpdate();
  };

  onConfigurationAggregatesChange = (value: SelectableValue[]) => {
    const { onChange, query } = this.props;
    const configurationTagAggregates = value.map((v) => v.value);
    onChange({ ...query, configurationTagAggregates });

    // and also in QueryEditor
    this.selectedConfigurationAggregates = value;

    // force render
    this.forceUpdate();
  };

  onConfigurationTimeBucketChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    const configurationTimeBucket = value.value;
    onChange({ ...query, configurationTimeBucket });

    // and also in QueryEditor
    this.selectedConfigurationTimeBucket = value.value;

    // force render
    this.forceUpdate();
  };

  componentDidMount() {
    this.getObjectStructure();
  }

  render() {
    if (this.objectStructure.length == 0) {
      console.log('objectStructure is empty');
      return <div>{this.objectStructure.length}</div>;
    }else{
      console.log("rendering content");
    }
  return (
          <div className="gf-form-group">
            <FieldSet>
              <div className="gf-form">
                <InlineLabel
                    width={10}
                    tooltip={'Select site, area, production line and work cell you want to see the data of'}
                >
                  Object
                </InlineLabel>
                <Cascader
                    options={this.objectStructure}
                    onSelect={this.onObjectChange}
                    displayAllSelectedLevels={true}
                    //value={this.selectedObject}
                    width={60}
                />
              </div>
              <div className="gf-form" hidden={!this.isObjectSelected()}>
                <InlineLabel width={10} tooltip={'Select an automatic calculated KPI or a tag for the selected object'}>
                  Value
                </InlineLabel>
                <Cascader
                    options={this.getValueStructure()}
                    onSelect={this.onValueChange}
                    displayAllSelectedLevels={true}
                    //value={this.selectedValue}
                    width={60}
                />
              </div>
            </FieldSet>

            {/* <Alert
          title="Please select a value from the dropdown menu"
          severity="error"
          hidden={this.isValidValueSelected() || !this.isObjectSelected()}
        >
          &quot;Tags&quot; or &quot;KPIs&quot; are not valid values for the &quot;Element&quot; field.
        </Alert>

        <FieldSet
          hidden={!this.isCurrentSelectedValueACustomTag()}
          // Configure the tag. If you are unsure, leave the defaults
        >
          <div className={'gf-form'}>
            <InlineLabel width={'auto'} tooltip={'Common statistical aggregates'}>
              Aggregates
            </InlineLabel>
            <MultiSelect
              options={this.tagAggregatesOptions}
              width={30}
              defaultValue={this.defaultConfigurationAggregates}
              value={this.selectedConfigurationAggregates}
              onChange={this.onConfigurationAggregatesChange}
            />
          </div>
          <div className={'gf-form'}>
            <InlineLabel width={'auto'} tooltip={'A time interval for how long each bucket is'}>
              Time Bucket
            </InlineLabel>
            <Select
              options={this.tagTimeBucketOptions}
              width={30}
              defaultValue={this.defaultConfigurationTimeBucket}
              value={this.selectedConfigurationTimeBucket}
              onChange={this.onConfigurationTimeBucketChange}
            />
          </div>
          <div className={'gf-form'}>
            <InlineLabel
              width={'auto'}
              tooltip={'How missing data should be filled. For more information, please visit our documentation.'}
            >
              Handling missing values
            </InlineLabel>
            <Select
              options={this.tagGapfillingOptions}
              width={30}
              defaultValue={this.tagGapfillingOptions[0]}
              value={this.selectedConfigurationGapfilling}
              onChange={this.onConfigurationGapfillingChange}
            />
          </div>
        </FieldSet>
      </div> */}
      </div>
    );
  }
}
