// POC TODO
// Alerts using Grafana's Alerting system TODO
// Historian functions CHECK
// - statistical like avg, max, min, etc CHECK
// - gapfilling, last observation carried forward, downsampling. NEEDS time_bucket_gapfill() CHECK
// User defined functions TODO
// Export REST call to get data TODO

import React, { PureComponent } from 'react';
import {
  Cascader,
  CascaderOption,
  FieldSet,
  InlineField,
  InlineFieldRow,
  InlineLabel,
  InlineSwitch,
  Input,
  MultiSelect,
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
    { label: 'Minute', value: 'minute' },
    { label: 'Hour', value: 'hour' },
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];
  timeBucketEnabled: boolean = true;
  defaultTimeBucketSize: string = '1';
  selectedTimeBucketSize: string = this.defaultTimeBucketSize;
  defaultTimeBucketUnit: string = this.tagTimeBucketUnitOptions[0].value;
  selectedTimeBucketUnit: SelectableValue = this.tagTimeBucketUnitOptions[0];
  defaultConfigurationTimeBucket: string = this.defaultTimeBucketSize + ' ' + this.defaultTimeBucketUnit;
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

  tagIncludeLastDatapointOptions = [
    { label: 'Yes', value: 'yes', description: 'Include last datapoint' },
    { label: 'No', value: 'no', description: 'Do not include last datapoint' },
  ];
  defaultConfigurationIncludeLastDatapoint: SelectableValue = this.tagIncludeLastDatapointOptions[0];
  selectedConfigurationIncludeLastDatapoint: SelectableValue = this.defaultConfigurationIncludeLastDatapoint;

  tagIncludeNextDatapointOptions = [
    { label: 'Yes', value: 'yes', description: 'Include next datapoint' },
    { label: 'No', value: 'no', description: 'Do not include next datapoint' },
  ];
  defaultConfigurationIncludeNextDatapoint: SelectableValue = this.tagIncludeNextDatapointOptions[0];
  selectedConfigurationIncludeNextDatapoint: SelectableValue = this.defaultConfigurationIncludeNextDatapoint;

  tagIncludeRunningProcessesOptions = [
    { label: 'Yes', value: 'yes', description: 'Include running' },
    { label: 'No', value: 'no', description: 'Do not include running' },
  ];
  defaultConfigurationIncludeRunningProcesses: SelectableValue = this.tagIncludeRunningProcessesOptions[0];
  selectedConfigurationIncludeRunningProcesses: SelectableValue = this.defaultConfigurationIncludeRunningProcesses;

  tagKeepStatesOptions = [
    { label: 'Yes', value: 'yes', description: 'Keep states' },
    { label: 'No', value: 'no', description: 'Do not keep states' },
  ];
  defaultConfigurationKeepStates: SelectableValue = this.tagKeepStatesOptions[0];
  selectedConfigurationKeepStates: SelectableValue = this.defaultConfigurationKeepStates;

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

    console.log('Query Editor constructor');
    console.log('Saved selectedObject: ' + this.selectedObject);
    console.log('Saved selectedValue: ' + this.selectedValue);

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
        const currentTimeBucketSize = currentTimeBucket.split(' ')[0];
        if (this.isStringValidNumber(currentTimeBucketSize)) {
          this.selectedTimeBucketSize = currentTimeBucketSize;
          this.selectedTimeBucketUnit = currentOption;
          this.selectedConfigurationTimeBucket = currentTimeBucket;
        }
      }
    }
  }

  isObjectSelected = () => {
    console.log('isObjectSelected?', this.selectedObject !== '');
    console.log(this.selectedObject);
    return this.selectedObject !== '';
  };

  isObjectDataReady = () => {
    console.log('isObjectDataReady', this.valueStructure.length !== 0);
    console.log('valueStructure', JSON.parse(JSON.stringify(this.valueStructure)));
    console.log('Selected value', this.selectedValue);
    return this.valueStructure.length !== 0;
  };

  isValidValueSelected = () => {
    console.log('isValidValueSelected');
    if (this.selectedValue === '') {
      console.log('isValidValueSelected: false');
      return false;
    } else {
      console.log('isValidValueSelected: true selectedValue: ' + this.selectedValue);
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
      console.log('isValidValueSelected: true');
      const startsWithQueryParamC = this.selectedValue.includes(this.tagsQueryParameter + '/custom/');
      console.log('isCurrentSelectedValueACustomTag: ' + startsWithQueryParamC);
      return startsWithQueryParamC;
    } else {
      console.log('isCurrentSelectedValueACustomTag: false');
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
    console.log('getObjectStructure');
    console.log(this.objectStructure.length);
    if (this.objectStructure.length === 0) {
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
        console.log('Forced update');
      });
    }
  };

  getValueStructure = () => {
    console.log('getValueStructure');
    console.log('props: ', this.props);
    console.log('query: ', this.props.query);
    console.log('workCellName: ', this.props.query.workCellName);
    console.log('selectedObject: ', this.selectedObject);

    // if no work cell is in the query, no value should be shown
    // check if the query is correct. it should have enterprise/site/area/productionline/workcell for a total of 4 '/'
    if (this.selectedObject.split('/').length === 5) {
      const newValues: CascaderOption[] = [];
      let sVal: CascaderOption | null = null;
      this.props.datasource.GetValuesTree(this.selectedObject).then((response: any) => {
        console.log(response);
        // the response is weird. it's an object array, of which the first item (index 0) contains
        // another object array, of which the second item (index 1) contains the actual payload
        // the payload should have tree arrays of CascaderOptions, each named after 'tables' 'kpi' and 'tags'
        if (response[2][1] === null) {
          response[2][1] = [];
        }
        newValues.push({
          // 'tables' CascaderOption.
          label: 'tables',
          value: 'tables',
          items: response[2][1].map((tables: any) => {
            console.log(tables);
            // map the actual tables
            let v = {
              label: tables.label,
              value: tables.value,
            };
            if (this.selectedValue === tables.value) {
              sVal = v;
            }
            return v;
          }),
        });
        if (response[3][1] === null) {
          response[3][1] = [];
        }
        newValues.push({
          label: 'kpi',
          value: 'kpi',
          items: response[3][1].map((kpis: any) => {
            console.log(kpis);
            // map the actual kpis
            let v = {
              label: kpis.label,
              value: kpis.value,
            };
            if (this.selectedValue === kpis.value) {
              sVal = v;
            }
            return v;
          }),
        });
        if (response[4][1] === null) {
          response[4][1] = [];
        }
        newValues.push({
          label: 'tags',
          value: 'tags',
          items: response[4][1].map((groupTags: any) => {
            console.log(groupTags);
            // map the actual tags
            if (groupTags.entries === null) {
              groupTags.entries = [];
            }
            let vx = {
              label: groupTags.label,
              value: groupTags.value,
              items: groupTags.entries.map((tags: any) => {
                let v = {
                  label: tags.label,
                  value: tags.value,
                };
                if (this.selectedValue === tags.value) {
                  sVal = v;
                }
                return v;
              }),
            };
            if (this.selectedValue === groupTags.value) {
              sVal = vx;
            }
            return vx;
          }),
        });
        this.valueStructure = newValues;
        if (sVal !== null) {
          console.log('sVal: ', sVal);
          this.selectedValue = sVal.value;
        }
        console.log('Updated valueStructure');
        this.forceUpdate();
      });
    } else {
      console.log('The query is not correct' + this.selectedObject);
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

    console.log(
      'onObjectChange' + enterprise + ' / ' + site + ' / ' + area + ' / ' + productionLine + ' / ' + workCell
    );

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
    console.log('Object changed to : ' + val);

    // reset value and configuration
    this.selectedValue = '';
    this.selectedConfigurationGapfilling = this.defaultConfigurationGapfilling;

    // force render
    this.forceUpdate();
    this.getValueStructure();
  };

  onValueChange = (val: string) => {
    const { onChange, query } = this.props;
    const value = val;
    onChange({ ...query, value });

    // and also in QueryEditor
    this.selectedValue = val;
    console.log('Value changed to :' + val);

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

  onConfigurationIncludeLastDatapointChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    const configurationIncludeLastDatapoint = value.value;
    onChange({ ...query, configurationIncludeLastDatapoint });

    // and also in QueryEditor
    this.selectedConfigurationIncludeLastDatapoint = value;

    // force render
    this.forceUpdate();
  };

  onConfigurationIncludeNextDatapointChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    const configurationIncludeNextDatapoint = value.value;
    onChange({ ...query, configurationIncludeNextDatapoint });

    // and also in QueryEditor
    this.selectedConfigurationIncludeNextDatapoint = value;

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
      onChange({ ...query, configurationTimeBucket: 'none' });
    } else {
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
    if (this.isStringValidNumber(rawValue)) {
      const parsedValue = parseInt(rawValue);
      const stringValue = parsedValue.toString();
      const { onChange, query } = this.props;
      const configurationTimeBucket = stringValue + ' ' + this.selectedTimeBucketUnit.value;
      onChange({ ...query, configurationTimeBucket });

      // and also in QueryEditor
      this.selectedTimeBucketSize = stringValue;

      // force render
      this.forceUpdate();
    } else {
      // update in QueryEditor to show the error
      this.selectedTimeBucketSize = rawValue;
    }
  };

  onTimeBucketUnitChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    const configurationTimeBucket = this.selectedTimeBucketSize + ' ' + value.value;
    onChange({ ...query, configurationTimeBucket });

    // and also in QueryEditor
    this.selectedTimeBucketUnit = value.value;

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

  onConfigurationIncludeRunningProcessesChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    const configurationIncludeRunningProcesses = value.value;
    onChange({ ...query, configurationIncludeRunningProcesses });

    // and also in QueryEditor
    this.selectedConfigurationIncludeRunningProcesses = value;

    // force render
    this.forceUpdate();
  };

  onConfigurationKeepStatesChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    const configurationKeepStates = value.value;
    onChange({ ...query, configurationKeepStates });

    // and also in QueryEditor
    this.selectedConfigurationKeepStates = value;

    // force render
    this.forceUpdate();
  };

  delayedForceUpdate() {
    if (this.selectedObject === '') {
      console.log('Skip delayed force update (no selectedObject)');
      return;
    }
    if (this.selectedValue === '') {
      console.log('Skip delayed force update (no selectedValue)');
      return;
    }

    if (this.valueStructure.length > 0 && this.objectStructure.length > 0) {
      console.log('delayed forceUpdate');
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
    const numberRegEx: RegExp = /^\d+$/;
    return numberRegEx.test(input);
  }

  render() {
    if (this.objectStructure.length === 0) {
      return <div>Loading data, please wait...</div>;
    }
    console.log('rendering');
    console.log('this.selectedValue is: ', this.selectedValue);
    console.log('this.selectedObject is: ', this.selectedObject);
    console.log('this.valueStructure is: ', this.valueStructure);
    console.log('this.objectStructure is: ', this.objectStructure);
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
              initialValue={this.selectedObject}
              width={100}
            />
          </div>
          <div className="gf-form" hidden={!(this.isObjectDataReady() && this.isObjectSelected())}>
            <InlineLabel width={10} tooltip={'Select an automatic calculated KPI or a tag for the selected object'}>
              Value
            </InlineLabel>
            <Cascader
              options={this.valueStructure}
              onSelect={this.onValueChange}
              displayAllSelectedLevels={true}
              initialValue={this.selectedValue}
              width={100}
            />
          </div>
        </FieldSet>
        <FieldSet hidden={!this.isCurrentSelectedValueAvailability()}>
          <div className="gf-form">
            <InlineLabel width={'auto'} tooltip={'Include running processes'}>
              Include running processes
            </InlineLabel>
            <Select
              options={this.tagIncludeRunningProcessesOptions}
              width={30}
              defaultValue={this.defaultConfigurationIncludeRunningProcesses}
              value={this.selectedConfigurationIncludeRunningProcesses}
              onChange={this.onConfigurationIncludeRunningProcessesChange}
            />
          </div>
          <div className="gf-form">
            <InlineLabel width={'auto'} tooltip={'Keep states'}>
              Keep states
            </InlineLabel>
            <Select
              options={this.tagKeepStatesOptions}
              width={30}
              defaultValue={this.defaultConfigurationKeepStates}
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
            <InlineFieldRow>
              <InlineLabel width={'auto'} tooltip={'A time interval for how long each bucket is'}>
                Time Bucket
              </InlineLabel>
              <InlineSwitch
                label="Enable"
                showLabel={true}
                value={this.timeBucketEnabled}
                onClick={this.onTimeBucketEnabledChange}
                /*onChange={this.onTimeBucketEnabledChange}*/
              />
              <InlineField
                label={'Size'}
                invalid={this.isStringValidNumber(this.selectedTimeBucketSize)}
                error={'This input is required and must be a valid number'}
                disabled={!this.timeBucketEnabled}
              >
                <Input label={'Size'} value={this.selectedTimeBucketSize} onChange={this.onTimeBucketSizeChange} />
              </InlineField>
              <InlineField label={'Unit'} disabled={!this.timeBucketEnabled}>
                <Select
                  options={this.tagTimeBucketUnitOptions}
                  width={30}
                  defaultValue={this.defaultTimeBucketUnit}
                  value={this.selectedTimeBucketUnit}
                  onChange={this.onTimeBucketUnitChange}
                />
              </InlineField>
            </InlineFieldRow>

            {/* <Select
              options={this.tagTimeBucketOptions}
              width={30}
              defaultValue={this.defaultConfigurationTimeBucket}
              value={this.selectedConfigurationTimeBucket}
              onChange={this.onConfigurationTimeBucketChange}
            /> */}
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
          <div className={'gf-form'}>
            <InlineLabel width={'auto'} tooltip={'Include last datapoint before time interval'}>
              Include last datapoint before time interval
            </InlineLabel>
            <Select
              options={this.tagIncludeLastDatapointOptions}
              width={30}
              defaultValue={this.tagIncludeLastDatapointOptions[0]}
              value={this.selectedConfigurationIncludeLastDatapoint}
              onChange={this.onConfigurationIncludeLastDatapointChange}
            />
          </div>
          <div className={'gf-form'}>
            <InlineLabel width={'auto'} tooltip={'Include next datapoint after time interval'}>
              Include next datapoint after time interval
            </InlineLabel>
            <Select
              options={this.tagIncludeNextDatapointOptions}
              width={30}
              defaultValue={this.tagIncludeNextDatapointOptions[0]}
              value={this.selectedConfigurationIncludeNextDatapoint}
              onChange={this.onConfigurationIncludeNextDatapointChange}
            />
          </div>
        </FieldSet>
      </div>
    );
  }
}
