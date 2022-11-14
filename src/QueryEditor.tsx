// POC TODO
// Alerts using Grafana's Alerting system TODO
// Historian functions CHECK
// - statistical like avg, max, min, etc CHECK
// - gapfilling, last observation carried forward, downsampling. NEEDS time_bucket_gapfill() CHECK
// User defined functions TODO
// Export REST call to get data TODO

import React, { PureComponent } from 'react';
import {
  Card,
  Cascader,
  CascaderOption,
  FieldSet,
  InlineField,
  InlineFieldRow,
  InlineLabel,
  InlineSwitch,
  Input,
  LoadingPlaceholder,
  MultiSelect,
  PanelChrome,
  PanelContainer,
  Select,
} from '@grafana/ui';
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
  selectedConfigurationAggregates: SelectableValue[] = [];

  // time bucket configuration
  tagTimeBucketUnitOptions = [
    { label: 'Minute', value: 'm' },
    { label: 'Hour', value: 'h' },
    { label: 'Day', value: 'd' },
    { label: 'Week', value: 'w' },
    { label: 'Month', value: 'M' },
    { label: 'Year', value: 'y' },
  ];
  timeBucketEnabled = true;
  defaultTimeBucketSize = '1';
  selectedTimeBucketSize: string = this.defaultTimeBucketSize;
  defaultTimeBucketUnit: SelectableValue = this.tagTimeBucketUnitOptions[0];
  selectedTimeBucketUnit: SelectableValue = this.tagTimeBucketUnitOptions[0];
  defaultConfigurationTimeBucket: string = this.defaultTimeBucketSize + this.defaultTimeBucketUnit.value;
  selectedConfigurationTimeBucket: string = this.defaultConfigurationTimeBucket;

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

  selectedConfigurationIncludeLastDatapoint = true;
  selectedConfigurationIncludeNextDatapoint = true;

  selectedConfigurationIncludeRunningProcesses = true;
  selectedConfigurationKeepStates = true;

  constructor(props: Props) {
    super(props);

    if (this.props.query.fullTagName === undefined) {
      this.props.query.fullTagName = '';
    } else {
      this.selectedObject = this.props.query.fullTagName;
    }
    if (this.props.query.value === undefined) {
      this.selectedValue = '';
    } else {
      this.selectedValue = this.props.query.value;
    }

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
    // Only push default if no other values are selected
    if (this.selectedConfigurationAggregates.length === 0) {
      this.selectedConfigurationAggregates.push(this.defaultConfigurationAggregates);
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
    const currentTimeBucket = this.props.query.configurationTimeBucket || this.defaultConfigurationTimeBucket;
    for (let i = 0; i < this.tagTimeBucketUnitOptions.length; i++) {
      const currentOption = this.tagTimeBucketUnitOptions[i];
      if (currentTimeBucket.includes(currentOption.value)) {
        const currentTimeBucketSize = currentTimeBucket.slice(0, -1);
        if (this.isStringValidNumber(currentTimeBucketSize)) {
          this.selectedTimeBucketSize = currentTimeBucketSize;
          this.selectedTimeBucketUnit = currentOption;
          this.selectedConfigurationTimeBucket = currentTimeBucket;
        }
      }
      if (currentTimeBucket === 'none') {
        this.timeBucketEnabled = false;
        this.selectedConfigurationTimeBucket = currentTimeBucket;
      }
    }
  }

  isObjectSelected = () => {
    return this.selectedObject !== '';
  };

  isObjectDataReady = () => {
    return this.valueStructure.length !== 0;
  };

  isValidValueSelected = () => {
    if (this.selectedValue === '') {
      return false;
    } else {
      return !(
        this.selectedValue === this.kpisQueryParameter ||
        this.selectedValue === this.tablesQueryParameter ||
        this.selectedValue === this.tagsQueryParameter + '/custom' ||
        this.selectedValue === this.tagsQueryParameter + '/standard'
      );
    }
  };

  // isCurrentSelectedValueACustomTag checks whether the current selected value is a tag and therefore, begins with tagsValueID
  isCurrentSelectedValueACustomTag = () => {
    if (this.isValidValueSelected()) {
      const startsWithQueryParamC = this.selectedValue.includes(this.tagsQueryParameter + '/custom/');

      return startsWithQueryParamC;
    } else {
      return false;
    }
  };

  isCurrentSelectedValueAvailability = () => {
    if (this.isValidValueSelected()) {
      return this.selectedValue.includes(this.tablesQueryParameter + '/availability');
    } else {
      return false;
    }
  };

  getObjectStructure = () => {
    // only load new resources if there are no resources

    if (this.objectStructure.length === 0) {
      const newObject: CascaderOption[] = [];
      this.props.datasource.GetResourceTree().then((response: any) => {
        // the response is weird. it's an object array, of which the first item (index 0) contains
        // another object array, of which the second item (index 1) contains the actual payload
        const payload = response[0][1];
        newObject.push({
          label: payload.label,
          value: payload.value,
          items: this.mapToCascaderOptions(payload.entries, false),
        });
        this.objectStructure = newObject;
        this.forceUpdate();
      });
    }
  };

  // funtion to map JSON objects to an array of CascaderOptions
  mapToCascaderOptions = (map: any, isValueStructure: boolean) => {
    if (map === undefined || map === null) {
      return undefined;
    }
    var array: CascaderOption[] = [];
    for (const key in map) {
      if (map.hasOwnProperty(key)) {
        const element = map[key];
        if (isValueStructure) {
          if (this.selectedValue === element.value) {
            this.selectedValue = element.value;
          }
        }
        array.push({
          label: element.label,
          value: element.value,
          items: this.mapToCascaderOptions(element.entries, isValueStructure),
        });
      }
    }
    return array;
  };

  getValueStructure = () => {
    // if no work cell is in the query, no value should be shown
    // check if the query is correct. it should have enterprise/site/area/productionline/workcell for a total of 4 '/'
    if (this.selectedObject.split('/').length === 5) {
      const newValues: CascaderOption[] = [];
      let sVal: CascaderOption | null = null;
      this.props.datasource.GetValuesTree(this.selectedObject).then((response: any) => {
        for (const key in response) {
          if (response.hasOwnProperty(key)) {
            const element = response[key];
            switch (element[0]) {
              case 'kpis':
                newValues.push({
                  label: 'kpi',
                  value: 'kpi',
                  items: element[1].map((kpi: any) => {
                    let v = {
                      label: kpi.label,
                      value: kpi.value,
                    };
                    if (this.selectedValue === kpi.value) {
                      sVal = v;
                    }
                    return v;
                  }),
                });
                break;
              case 'tables':
                newValues.push({
                  label: 'table',
                  value: 'table',
                  items: element[1].map((table: any) => {
                    let v = {
                      label: table.label,
                      value: table.value,
                    };
                    if (this.selectedValue === table.value) {
                      sVal = v;
                    }
                    return v;
                  }),
                });
                break;
              case 'tags':
                newValues.push({
                  label: 'tags',
                  value: 'tags',
                  items: element[1].map((groupTag: any) => {
                    if (groupTag.entries === null) {
                      groupTag.entries = [];
                    }
                    let vx = {
                      label: groupTag.label,
                      value: groupTag.value,
                      items: this.mapToCascaderOptions(groupTag.entries, true),
                    };
                    if (this.selectedValue === groupTag.value) {
                      sVal = vx;
                    }
                    return vx;
                  }),
                });
                break;
              default:
                break;
            }
          }
        }
        this.valueStructure = newValues;
        if (sVal !== null) {
          this.selectedValue = sVal.value;
        }

        this.forceUpdate();
      });
    } else {
      this.valueStructure = [];
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
    this.getValueStructure();
  };

  onValueChange = (val: string) => {
    const { onChange, query } = this.props;
    onChange({ ...query, value: val });

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

  onConfigurationIncludeLastDatapointChange = (event: React.FormEvent<HTMLInputElement>) => {
    const configurationIncludeLastDatapoint = event.currentTarget.checked;
    const { onChange, query } = this.props;
    onChange({ ...query, configurationIncludeLastDatapoint });

    // and also in QueryEditor
    this.selectedConfigurationIncludeLastDatapoint = configurationIncludeLastDatapoint;

    // force render
    this.forceUpdate();
  };

  onConfigurationIncludeNextDatapointChange = (event: React.FormEvent<HTMLInputElement>) => {
    const configurationIncludeNextDatapoint = event.currentTarget.checked;
    const { onChange, query } = this.props;
    onChange({ ...query, configurationIncludeNextDatapoint });

    // and also in QueryEditor
    this.selectedConfigurationIncludeNextDatapoint = configurationIncludeNextDatapoint;

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

  onTimeBucketEnabledChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.checked;
    const { onChange, query } = this.props;
    if (!value) {
      onChange({
        ...query,
        configurationTimeBucket: 'none',
        configurationTagGapfilling: this.defaultConfigurationGapfilling.value,
        configurationIncludeLastDatapoint: this.selectedConfigurationIncludeLastDatapoint,
        configurationIncludeNextDatapoint: this.selectedConfigurationIncludeNextDatapoint,
      });
    } else {
      this.selectedConfigurationTimeBucket = this.selectedTimeBucketSize + this.selectedTimeBucketUnit.value;
      const configurationTimeBucket = this.selectedConfigurationTimeBucket;
      onChange({ ...query, configurationTimeBucket });
    }

    // and also in QueryEditor
    this.timeBucketEnabled = value;

    // force render
    this.forceUpdate();
  };

  onTimeBucketSizeChange = (event: React.FormEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value;
    // change query only if the value is a valid number
    if (this.isStringValidNumber(rawValue)) {
      const parsedValue = parseInt(rawValue, 10);
      const stringValue = parsedValue.toString();
      const { onChange, query } = this.props;
      const configurationTimeBucket = stringValue + this.selectedTimeBucketUnit.value;
      onChange({ ...query, configurationTimeBucket });

      // and also in QueryEditor
      this.selectedTimeBucketSize = stringValue;
      this.selectedConfigurationTimeBucket = configurationTimeBucket;

      // force render
      this.forceUpdate();
    } else {
      this.selectedTimeBucketSize = rawValue;
      // force render
      this.forceUpdate();
    }
  };

  onTimeBucketUnitChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    const configurationTimeBucket = this.selectedTimeBucketSize + value.value;
    onChange({ ...query, configurationTimeBucket });

    // and also in QueryEditor
    this.selectedTimeBucketUnit = value;
    this.selectedConfigurationTimeBucket = configurationTimeBucket;

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

  onConfigurationIncludeRunningProcessesChange = (event: React.FormEvent<HTMLInputElement>) => {
    const configurationIncludeRunningProcesses = event.currentTarget.checked;
    const { onChange, query } = this.props;
    onChange({ ...query, configurationIncludeRunningProcesses });

    // and also in QueryEditor
    this.selectedConfigurationIncludeRunningProcesses = configurationIncludeRunningProcesses;

    // force render
    this.forceUpdate();
  };

  onConfigurationKeepStatesChange = (event: React.FormEvent<HTMLInputElement>) => {
    const configurationKeepStates = event.currentTarget.checked;
    const { onChange, query } = this.props;
    onChange({ ...query, configurationKeepStates });

    // and also in QueryEditor
    this.selectedConfigurationKeepStates = configurationKeepStates;

    // force render
    this.forceUpdate();
  };

  delayedForceUpdate() {
    if (this.selectedObject === '') {
      return;
    }
    if (this.selectedValue === '') {
      return;
    }

    if (this.valueStructure.length > 0 && this.objectStructure.length > 0) {
      this.forceUpdate();
      return;
    }
    setTimeout(this.delayedForceUpdate.bind(this), 500);
  }

  componentDidMount() {
    this.getObjectStructure();
    this.getValueStructure();
    setTimeout(this.delayedForceUpdate.bind(this), 1000);
  }

  isStringValidNumber(input: string): boolean {
    const numberRegEx = /^\d+$/;
    return numberRegEx.test(input);
  }

  render() {
    if (this.objectStructure.length === 0) {
      return <LoadingPlaceholder text="Loading data, please wait..." />;
    }

    return (
      <div className="gf-form-group">
        <Card>
          <Card.Heading>Object to query</Card.Heading>
          <Card.Meta>
            <div className="gf-form-inline">
              <InlineLabel width={17}>Selected object</InlineLabel>
              <Input
                width={100}
                value={this.selectedObject != '' ? this.selectedObject : 'No selected object'}
                placeholder="No selected object"
                disabled={true}
              />
            </div>
            <div className="gf-form">
              <InlineLabel width={17} tooltip={'Select the specific work cell you want to see the data of'}>
                Select work cell
              </InlineLabel>
              <Cascader
                separator=" / "
                options={this.objectStructure}
                onSelect={this.onObjectChange}
                displayAllSelectedLevels={true}
                initialValue={this.selectedObject}
                width={100}
              />
            </div>
          </Card.Meta>
        </Card>
        <Card>
          <Card.Heading>Value to query</Card.Heading>
          <Card.Meta>
            <div className="gf-form-inline">
              <InlineLabel width={17}>Selected value</InlineLabel>
              <Input
                width={100}
                value={this.selectedValue != '' ? this.selectedValue : 'No selected value'}
                placeholder="No selected value"
                disabled={true}
              />
            </div>
            <div className="gf-form" hidden={!(this.isObjectDataReady() && this.isObjectSelected())}>
              <InlineLabel width={17} tooltip={'Select an automatic calculated KPI or a tag for the selected object'}>
                Value
              </InlineLabel>
              <Cascader
                separator=" / "
                options={this.valueStructure}
                onSelect={this.onValueChange}
                displayAllSelectedLevels={true}
                initialValue={this.selectedValue}
                width={100}
              />
            </div>
          </Card.Meta>
        </Card>
        <FieldSet hidden={!this.isCurrentSelectedValueAvailability()}>
          <div className="gf-form">
            <InlineLabel width={'auto'} tooltip={'Include running processes'}>
              Include running processes
            </InlineLabel>
            <InlineSwitch
              value={this.selectedConfigurationIncludeRunningProcesses}
              onChange={this.onConfigurationIncludeRunningProcessesChange}
            />
          </div>
          <div className="gf-form">
            <InlineLabel width={'auto'} tooltip={'Keep states'}>
              Keep states
            </InlineLabel>
            <InlineSwitch
              value={this.selectedConfigurationKeepStates}
              onChange={this.onConfigurationKeepStatesChange}
            />
          </div>
        </FieldSet>
        <FieldSet
          hidden={!this.isCurrentSelectedValueACustomTag()}
          // Configure the tag. If you are unsure, leave the defaults
        >
          <div className={'gf-form'}>
            <InlineFieldRow>
              <InlineLabel width={'auto'} tooltip={'A time interval for how long each bucket is'}>
                Time Bucket
              </InlineLabel>
              <InlineSwitch
                label="Enable"
                showLabel={true}
                value={this.timeBucketEnabled}
                onClick={this.onTimeBucketEnabledChange}
              />
              <InlineField
                label={'Size'}
                invalid={!this.isStringValidNumber(this.selectedTimeBucketSize)}
                error={'This input is required and must be a valid number'}
                disabled={!this.timeBucketEnabled}
              >
                <Input
                  label={'Size'}
                  value={this.selectedTimeBucketSize}
                  onChange={this.onTimeBucketSizeChange}
                  width={20}
                />
              </InlineField>
              <InlineField label={'Unit'} disabled={!this.timeBucketEnabled}>
                <Select
                  options={this.tagTimeBucketUnitOptions}
                  width={20}
                  defaultValue={this.defaultTimeBucketUnit.value}
                  value={this.selectedTimeBucketUnit}
                  onChange={this.onTimeBucketUnitChange}
                />
              </InlineField>
            </InlineFieldRow>
          </div>
          <FieldSet hidden={!this.timeBucketEnabled}>
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
              <InlineLabel
                width={35}
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
            <div className={'gf-form'}>
              <InlineLabel width={35} tooltip={'Include last datapoint before time interval'}>
                Include last datapoint before time interval
              </InlineLabel>
              <InlineSwitch
                value={this.selectedConfigurationIncludeLastDatapoint}
                onClick={this.onConfigurationIncludeLastDatapointChange}
              />
            </div>
            <div className={'gf-form'}>
              <InlineLabel width={35} tooltip={'Include next datapoint after time interval'}>
                Include next datapoint after time interval
              </InlineLabel>
              <InlineSwitch
                value={this.selectedConfigurationIncludeNextDatapoint}
                onClick={this.onConfigurationIncludeNextDatapointChange}
              />
            </div>
          </FieldSet>
        </FieldSet>
      </div>
    );
  }
}
