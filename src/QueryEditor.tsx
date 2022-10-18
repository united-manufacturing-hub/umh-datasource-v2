// POC TODO
// Alerts using Grafana's Alerting system TODO
// Historian functions CHECK
// - statistical like avg, max, min, etc CHECK
// - gapfilling, last observation carried forward, downsampling. NEEDS time_bucket_gapfill() CHECK
// User defined functions TODO
// Export REST call to get data TODO

import React, { PureComponent } from 'react';
import { Cascader, CascaderOption, InlineLabel, Alert, FieldSet, Select, MultiSelect, Input } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import {
  defaultFactoryinsightQuery,
  Enterprise,
  FactoryinsightDataSourceOptions,
  FactoryinsightQuery,
  Site,
  TreeStructure,
} from './types';

import { GetDefaultEnterprise, DefaultTags, DefaultKPIs, DefaultWorkCellTags, DefaultTables } from './demoData';
import defaults from 'lodash/defaults';

type Props = QueryEditorProps<DataSource, FactoryinsightQuery, FactoryinsightDataSourceOptions>;
type State = {
  selectedEnterprise: { label: string; index: number };
  selectedSite?: { label: string; index: number };
  selectedArea?: { label: string; index: number };
  selectedProductionLine?: { label: string; index: number };
  selectedWorkCell?: { label: string; index: number };
  selectedDataFormat?: { label: string; index: number };
  selectedTagGroup?: { label: string; index: number };
  selectedTag?: { label: string; index: number };
  selectedKpiMethod?: { label: string; index: number };
  selectedTableType?: { label: string; index: number };
  labelsField?: string;
  siteOptions?: SelectableValue[];
  areaOptions?: SelectableValue[];
  productionLineOptions: SelectableValue[];
  workCellOptions: SelectableValue[];
  dataFormatOptions: SelectableValue[];
  tagGroupOptions: SelectableValue[];
  tagOptions: SelectableValue[];
  kpiMethodOptions: SelectableValue[];
  tableTypeOptions: SelectableValue[];
  objectOptions: CascaderOption[];
  parameterString?: string;
  uriPathExtension?: string;
};
export class QueryEditor extends PureComponent<Props, State> {
  enterpriseName = this.props.datasource.enterpriseName;
  objectStructure: CascaderOption[] = [];
  valueStructure: CascaderOption[] = [];

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

  constructor(props: Readonly<Props>) {
    super(props);

    const query = defaults(this.props.query, defaultFactoryinsightQuery);
    this.state = {
      selectedEnterprise: { label: this.enterpriseName, index: 0 },
      selectedSite: query.siteName,
      selectedArea: query.areaName,
      selectedProductionLine: query.productionLineName,
      selectedWorkCell: query.workCellName,
      selectedDataFormat: query.dataFormat,
      selectedTagGroup: query.tagGroup,
      selectedTag: query.tag,
      selectedKpiMethod: query.kpiMethod,
      selectedTableType: query.tableType,
      labelsField: query.labelsField,
      siteOptions: [{ label: '', value: 0 }],
      areaOptions: [{ label: '', value: 0 }],
      productionLineOptions: [{ label: '', value: 0 }],
      workCellOptions: [{ label: '', value: 0 }],
      dataFormatOptions: [{ label: '', value: 0 }],
      tagGroupOptions: [{ label: '', value: 0 }],
      tagOptions: [{ label: '', value: 0 }],
      kpiMethodOptions: [{ label: '', value: 0 }],
      tableTypeOptions: [{ label: '', value: 0 }],
      objectOptions: [{ label: '', value: 0 }],
      parameterString: query.parameterString,
      uriPathExtension: query.uriPathExtension,
    };

    this.props.datasource.GetSites((sitesArray: any[]) => {
      console.log('Got sites: ', sitesArray);

      const siteIndex = this.state.selectedSite!.index;

      const newSiteLabel = sitesArray[siteIndex];
      const newSiteOptions = sitesArray.map((site, index) => {
        return { label: site, index: index };
      });
      this.setState({
        selectedSite: { label: newSiteLabel, index: siteIndex },
        siteOptions: newSiteOptions,
      });
    });

    this.selectedObject = this.props.query.fullTagName || '';
    //this.selectedValue = this.props.query.value || '';

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

  // Event handler for the Site dropdown
  onSiteChange = (event: SelectableValue) => {
    // Prevent change if the current value is the same as the new value
    if (event.value === this.state.selectedSite!.index) {
      return;
    }

    // Update the state with the selected site. When the site changes, everything else should be reset.
    this.setState({
      selectedSite: { label: event.label || '', index: event.value || 0 },
      selectedArea: { label: '', index: 0 },
      selectedProductionLine: { label: '', index: 0 },
      selectedWorkCell: { label: '', index: 0 },
      parameterString: '',
      uriPathExtension: '',
    });

    // Get the areas for the selected site
    this.props.datasource.GetAreas(event.label || '', this.setAreasOptions);
  };

  // Event handler for the Area dropdown
  onAreaChange = (event: SelectableValue) => {
    // Prevent change if the current value is the same as the new value
    if (event.value === this.state.selectedArea!.index) {
      return;
    }

    // Update the state with the selected area. When the area changes, everything else should be reset.
    this.setState({
      selectedArea: { label: event.label || '', index: event.value || 0 },
      selectedProductionLine: { label: '', index: 0 },
      selectedWorkCell: { label: '', index: 0 },
      parameterString: '',
      uriPathExtension: '',
    });

    // Get the production lines for the selected area
    this.props.datasource.GetProductionLines(
      this.state.selectedSite!.label,
      event.label || '',
      this.setProductionLinesOptions
    );
  };

  // Event handler for the Production Line dropdown
  onProductionLineChange = (event: SelectableValue) => {
    // Prevent change if the current value is the same as the new value
    if (event.value === this.state.selectedProductionLine!.index) {
      return;
    }

    // Update the state with the selected production line. When the production line changes, everything else should be reset.
    this.setState({
      selectedProductionLine: { label: event.label || '', index: event.value || 0 },
      selectedWorkCell: { label: '', index: 0 },
      parameterString: '',
      uriPathExtension: '',
    });

    // Get the work cells for the selected production line
    this.props.datasource.GetWorkCells(
      this.state.selectedSite!.label,
      this.state.selectedArea!.label,
      event.label || '',
      this.setWorkCellsOptions
    );
  };

  onWorkCellChange = (event: SelectableValue) => {
    // Prevent change if the current value is the same as the new value
    if (event.value === this.state.selectedWorkCell!.index) {
      return;
    }

    // Update the state with the selected work cell
    this.setState({
      selectedWorkCell: { label: event.label || '', index: event.value || 0 },
      parameterString: '',
      uriPathExtension: '',
    });

    // Get data formats available for the selected work cell
    this.props.datasource.GetDataFormats(
      this.state.selectedSite!.label,
      this.state.selectedArea!.label,
      this.state.selectedProductionLine!.label,
      event.label || '',
      this.setDataFormatsOptions
    );
  };

  onDataFormatChange = (event: SelectableValue) => {
    // Prevent change if the current value is the same as the new value
    if (event.value === this.state.selectedDataFormat!.index) {
      return;
    }

    // Update the state with the selected data format
    this.setState({
      selectedDataFormat: { label: event.label || '', index: event.value || 0 },
      parameterString: '',
      uriPathExtension: '',
    });

    // Get options available for the selected data format
    switch (event.label) {
      case 'tags':
        this.props.datasource.GetTagGroups(
          this.state.selectedSite!.label,
          this.state.selectedArea!.label,
          this.state.selectedProductionLine!.label,
          this.state.selectedWorkCell!.label,
          this.setTagGroupsOptions
        );
        break;
      case 'kpis':
        this.props.datasource.GetKpiMethods(
          this.state.selectedSite!.label,
          this.state.selectedArea!.label,
          this.state.selectedProductionLine!.label,
          this.state.selectedWorkCell!.label,
          this.setKpiMethodsOptions
        );
        break;
      case 'tables':
        this.props.datasource.GetTableTypes(
          this.state.selectedSite!.label,
          this.state.selectedArea!.label,
          this.state.selectedProductionLine!.label,
          this.state.selectedWorkCell!.label,
          this.setTableTypesOptions
        );
      default:
        break;
    }
  };

  onTagGroupChange = (event: SelectableValue) => {
    // Prevent change if the current value is the same as the new value
    if (event.value === this.state.selectedTagGroup!.index) {
      return;
    }

    // Update the state with the selected tag group
    this.setState({
      selectedTagGroup: { label: event.label || '', index: event.value || 0 },
      parameterString: '',
      uriPathExtension: '',
    });

    // Get tags for the selected tag group
    this.props.datasource.GetTags(
      this.state.selectedSite!.label,
      this.state.selectedArea!.label,
      this.state.selectedProductionLine!.label,
      this.state.selectedWorkCell!.label,
      event.label || '',
      this.setTagsOptions
    );
  };

  onTagChange = (event: SelectableValue) => {
    // Prevent change if the current value is the same as the new value
    if (event.value === this.state.selectedTag!.index) {
      return;
    }

    // Update the state with the selected tag
    this.setState({
      selectedTag: { label: event.label || '', index: event.value || 0 },
      parameterString: '',
      uriPathExtension: '',
    });
  };

  onKpiMethodChange = (event: SelectableValue) => {
    // Prevent change if the current value is the same as the new value
    if (event.value === this.state.selectedKpiMethod!.index) {
      return;
    }

    // Update the state with the selected KPI method
    this.setState({
      selectedKpiMethod: { label: event.label || '', index: event.value || 0 },
      parameterString: '',
      uriPathExtension: '',
    });
  };

  onTableTypeChange = (event: SelectableValue) => {
    // Prevent change if the current value is the same as the new value
    if (event.value === this.state.selectedTableType!.index) {
      return;
    }

    // Update the state with the selected table type
    this.setState({
      selectedTableType: { label: event.label || '', index: event.value || 0 },
      parameterString: '',
      uriPathExtension: '',
    });
  };

  setAreasOptions = (areasArray: any[]) => {
    // Get last area
    const areaIndex = this.state.selectedArea!.index;

    // Update state with new site options
    const newAreaLabel = areasArray[areaIndex];
    const newAreaOptions = areasArray.map((area, index) => {
      return { label: area, index: index };
    });
    this.setState({
      selectedArea: { label: newAreaLabel, index: areaIndex },
      areaOptions: newAreaOptions,
    });

    // Get the production lines for the selected site
    this.props.datasource.GetProductionLines(
      this.state.selectedSite!.label,
      newAreaLabel,
      this.setProductionLinesOptions
    );
  };

  setProductionLinesOptions = (productionLinesArray: any[]) => {
    // Get last production line
    const productionLineIndex = this.state.selectedProductionLine!.index;

    // Update state with new production line options
    const newProductionLineLabel = productionLinesArray[productionLineIndex];
    const newProductionLineOptions = productionLinesArray.map((productionLine, index) => {
      return { label: productionLine, index: index };
    });
    this.setState({
      selectedProductionLine: { label: newProductionLineLabel, index: productionLineIndex },
      productionLineOptions: newProductionLineOptions,
    });

    // Get the work cells for the selected site
    this.props.datasource.GetWorkCells(
      this.state.selectedSite!.label,
      this.state.selectedArea!.label,
      newProductionLineLabel,
      this.setWorkCellsOptions
    );
  };

  setWorkCellsOptions = (workCellsArray: any[]) => {
    // Get last work cell
    const workCellIndex = this.state.selectedWorkCell!.index;

    // Update state with new work cell options
    const newWorkCellLabel = workCellsArray[workCellIndex];
    const newWorkCellOptions = workCellsArray.map((workCell, index) => {
      return { label: workCell, index: index };
    });
    this.setState({
      selectedWorkCell: { label: newWorkCellLabel, index: workCellIndex },
      workCellOptions: newWorkCellOptions,
    });
  };

  setDataFormatsOptions = (dataFormatsArray: any[]) => {
    // Get last data format
    const dataFormatIndex = this.state.selectedDataFormat!.index;

    // Update state with new data format options
    const newDataFormatLabel = dataFormatsArray[dataFormatIndex];
    const newDataFormatOptions = dataFormatsArray.map((dataFormat, index) => {
      return { label: dataFormat, index: index };
    });
    this.setState({
      selectedDataFormat: { label: newDataFormatLabel, index: dataFormatIndex },
      dataFormatOptions: newDataFormatOptions,
    });
  };

  setTagGroupsOptions = (tagGroupsArray: any[]) => {
    // Get last tag group
    const tagGroupIndex = this.state.selectedTagGroup!.index;

    // Update state with new tag group options
    const newTagGroupLabel = tagGroupsArray[tagGroupIndex];
    const newTagGroupOptions = tagGroupsArray.map((tagGroup, index) => {
      return { label: tagGroup, index: index };
    });
    this.setState({
      selectedTagGroup: { label: newTagGroupLabel, index: tagGroupIndex },
      tagGroupOptions: newTagGroupOptions,
    });
  };

  setTagsOptions = (tagsArray: any[]) => {
    // Get last tag
    const tagIndex = this.state.selectedTag!.index;

    // Update state with new tag options
    const newTagLabel = tagsArray[tagIndex];
    const newTagOptions = tagsArray.map((tag, index) => {
      return { label: tag, index: index };
    });
    this.setState({
      selectedTag: { label: newTagLabel, index: tagIndex },
      tagOptions: newTagOptions,
    });
  };

  setKpiMethodsOptions = (kpiMethodsArray: any[]) => {
    // Get last kpi method
    const kpiMethodIndex = this.state.selectedKpiMethod!.index;

    // Update state with new kpi method options
    const newKpiMethodLabel = kpiMethodsArray[kpiMethodIndex];
    const newKpiMethodOptions = kpiMethodsArray.map((kpiMethod, index) => {
      return { label: kpiMethod, index: index };
    });
    this.setState({
      selectedKpiMethod: { label: newKpiMethodLabel, index: kpiMethodIndex },
      kpiMethodOptions: newKpiMethodOptions,
    });
  };

  setTableTypesOptions = (tableTypesArray: any[]) => {
    // Get last table type
    const tableTypeIndex = this.state.selectedTableType!.index;

    // Update state with new table type options
    const newTableTypeLabel = tableTypesArray[tableTypeIndex];
    const newTableTypeOptions = tableTypesArray.map((tableType, index) => {
      return { label: tableType, index: index };
    });
    this.setState({
      selectedTableType: { label: newTableTypeLabel, index: tableTypeIndex },
      tableTypeOptions: newTableTypeOptions,
    });
  };

  isWorkCellSelected = () => {
    return this.state.selectedWorkCell!.label !== '';
  };

  isDataFormatSelected = () => {
    return this.state.selectedDataFormat!.label !== '';
  };

  isTagDataFormatSelected = () => {
    return this.state.selectedTagGroup!.label !== '';
  };

  isKpiDataFormatSelected = () => {
    return this.state.selectedKpiMethod!.label !== '';
  };

  isTableDataFormatSelected = () => {
    return this.state.selectedTableType!.label !== '';
  };

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

  getEnterprise = () => {
    console.log(this.props.datasource.enterpriseName);
    let a: SelectableValue = {
      value: this.props.datasource.enterpriseName || '',
    };
    return a;
  };

  getObjectStructure = () => {
    this.props.datasource.GetResourceTree().then((response) => {
      const result = Object.entries(response.data);
      console.log(result);
    });

    return this.objectStructure;
  };

  setObjectStructure = (objectStructure: any) => {
    const result = Object.entries(objectStructure);
    console.log(result);
    return { value: 'a', label: 'a' };
    // const newObjectOptions: CascaderOption[] = objectStructure.map((object: TreeStructure) => {
    //   let siteCascader: CascaderOption = {

    //   }
    //   let enterpriseCascader: CascaderOption = {
    //     value: this.enterpriseName,
    //     label: this.enterpriseName,
    //     children: siteCascader,
    //   };
    //   let sites = object.get(this.enterpriseName)!.sites.keys();
    //   let site: Site = enterprise.sites.get()!;

    //   let newObject: CascaderOption = {
    //   label: this.enterpriseName,
    //   value: this.enterpriseName,
    //   children: object.get(this.enterpriseName)
    //   }
    //   return {[{label: }]};
    // });

    // this.setState({
    //   objectOptions: newObjectOptions,
    // })
  };

  getValueStructure = () => {
    // if (this.props.query.workCellName === '' || this.props.query.workCellName === undefined) {
    //   this.valueStructure = [
    //     {
    //       label: 'Tags',
    //       value: this.tagsQueryParameter,
    //       items: DefaultTags,
    //     },
    //   ];
    // } else {
    //   this.valueStructure = [
    //     {
    //       label: 'Tags',
    //       value: this.tagsQueryParameter,
    //       items: DefaultWorkCellTags,
    //     },
    //     {
    //       label: 'KPIs',
    //       value: this.kpisQueryParameter,
    //       items: DefaultKPIs,
    //     },
    //     {
    //       label: 'Tables',
    //       value: 'table',
    //       items: DefaultTables,
    //     },
    //   ];
    // }

    return this.valueStructure;
  };

  onObjectChange = (val: string) => {
    // split object into enterprise, area, production line, work cell
    //const { onChange, query } = this.props;
    const fullTagName = val;
    const enterprise = fullTagName.split('/')[0];
    const site = fullTagName.split('/')[1];
    const area = fullTagName.split('/')[2];
    const productionLine = fullTagName.split('/')[3];
    const workCell = fullTagName.split('/')[4];

    // onChange({
    //   ...query,
    //   enterpriseName: enterprise,
    //   siteName: site,
    //   areaName: area,
    //   productionLineName: productionLine,
    //   workCellName: workCell,
    //   fullTagName,
    // });

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
    onChange({ ...query });

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

  render() {
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
              displayAllSelectedLevels={true}
              options={this.getObjectStructure()}
              onSelect={this.onObjectChange}
              width={60}
            />
            {/* <label className="gf-form-label">Area</label>
            <Select
              options={this.state.areaOptions}
              onChange={this.onAreaChange}
              value={this.state.selectedArea?.index}
            />
            <label className="gf-form-label">Production line</label>
            <Select
              options={this.state.productionLineOptions}
              onChange={this.onProductionLineChange}
              value={this.state.selectedProductionLine?.index}
            />
            <label className="gf-form-label">Work cell</label>
            <Select
              options={this.state.workCellOptions}
              onChange={this.onWorkCellChange}
              value={this.state.selectedWorkCell?.index}
    /> */}
          </div>
        </FieldSet>
        {/* <div hidden={!this.isWorkCellSelected()}>
          <span className="gf-from-pre">Transformations</span>
          <div className="gf-form">
            <label className="gf-form-label">Data format</label>
            <Select
              options={this.state.dataFormatOptions}
              onChange={this.onDataFormatChange}
              value={this.state.selectedDataFormat?.index}
            />
          </div>
        </div>
        <div hidden={!this.isDataFormatSelected()}>
          <div hidden={!this.isTagDataFormatSelected()}>
            <div className="gf-form">
              <label className="gf-form-label">Tag group</label>
              <Select
                options={this.state.tagGroupOptions}
                onChange={this.onTagGroupChange}
                value={this.state.selectedTagGroup?.index}
              />
            </div>
          </div>
          <div hidden={!this.isKpiDataFormatSelected()}>
            <div className="gf-form">
              <label className="gf-form-label">KPIs</label>
              <Select
                options={this.state.kpiMethodOptions}
                onChange={this.onKpiMethodChange}
                value={this.state.selectedTagGroup?.index}
              />
            </div>
          </div>
          <div hidden={!this.isTableDataFormatSelected()}>
            <div className="gf-form">
              <label className="gf-form-label">Tag group</label>
              <Select
                options={this.state.tableTypeOptions}
                onChange={this.onTableTypeChange}
                value={this.state.selectedTagGroup?.index}
              />
            </div>
          </div>
        </div> */}
        {/* <div className="gf-form" hidden={!this.isObjectSelected()}>
          <InlineLabel width={10} tooltip={'Select an automatic calculated KPI or a tag for the selected object'}>
            Value
          </InlineLabel>
          <Cascader
            options={this.getValueStructure()}
            onSelect={this.onValueChange}
            displayAllSelectedLevels={true}
            value={this.selectedValue}
            width={60}
          />
    </div> */}

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
