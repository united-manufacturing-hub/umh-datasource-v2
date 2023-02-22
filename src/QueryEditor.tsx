// POC TODO
// Alerts using Grafana's Alerting system TODO
// Historian functions CHECK
// - statistical like avg, max, min, etc CHECK
// - gapfilling, last observation carried forward, downsampling. NEEDS time_bucket_gapfill() CHECK
// User defined functions TODO
// Export REST call to get data TODO

import React, {PureComponent} from 'react';
import {
    Cascader,
    CascaderOption,
    Collapse,
    ControlledCollapse,
    Field,
    FieldSet,
    HorizontalGroup,
    InlineField,
    InlineFieldRow,
    InlineSwitch,
    Input,
    LoadingPlaceholder,
    MultiSelect,
    Select,
    Switch,
    Tab,
    TabContent,
    TabsBar,
    TagList,
    VerticalGroup,
} from '@grafana/ui';
import {QueryEditorProps, SelectableValue} from '@grafana/data';
import {DataSource} from './datasource';
import {
    CustomerConfiguration,
    DatabaseStatistics,
    FactoryinsightDataSourceOptions,
    FactoryinsightQuery, GetValuesQueryReturn,
    HyperTableCompression,
    HyperTableRetention,
    HypertableStats,
    MaybeString,
    NormalTableStats,
    TableStatistic, ValueSubTree
} from './types';
import {filesize} from "filesize";
import {sha256} from "js-sha256";

type Props = QueryEditorProps<DataSource, FactoryinsightQuery, FactoryinsightDataSourceOptions>;

interface State {
    customerConfigurationIsOpen: boolean;
    customerConfiguration: CustomerConfiguration | null;
    databaseStatisticsIsOpen: boolean;
    databaseTables: Map<string, JSX.Element> | null;
    databaseTableActive: string | null;
    databaseStatistics: DatabaseStatistics | null;
}


export class QueryEditor extends PureComponent<Props, State> {

    enterpriseName = this.props.datasource.enterpriseName;
    valueStructure: CascaderOption[] = [];
    objectStructure: CascaderOption[] = [];

    tagsQueryParameter = 'tags';
    kpisQueryParameter = 'kpi';
    tablesQueryParameter = 'tables';

    selectedObject = '';
    selectedWorkCellDisplayed = '';
    selectedValue = '';
    selectedValueDisplayed = '';

    // Aggregates configuration
    tagAggregatesOptions = [
        {label: 'Average', value: 'avg', description: 'The average value of all values in the time bucket'},
        {label: 'Minimum', value: 'min', description: 'The minimum value of all values in the time bucket'},
        {label: 'Maximum', value: 'max', description: 'The maximum value of all values in the time bucket'},
        {label: 'Sum', value: 'sum', description: 'The sum of all values in the time bucket'},
        {label: 'Count', value: 'count', description: 'The number of values in the time bucket'},
    ];
    defaultConfigurationAggregates: SelectableValue = this.tagAggregatesOptions[0];
    selectedConfigurationAggregates: SelectableValue[] = [];

    // time bucket configuration
    tagTimeBucketUnitOptions = [
        {label: 'Minute', value: 'm'},
        {label: 'Hour', value: 'h'},
        {label: 'Day', value: 'd'},
        {label: 'Week', value: 'w'},
        {label: 'Month', value: 'M'},
        {label: 'Year', value: 'y'},
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
        {label: 'Show as NULL (default)', value: 'null', description: 'Missing data will show as NULL'},
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

        this.state = {
            databaseStatisticsIsOpen: false,
            customerConfiguration: null,
            customerConfigurationIsOpen: false,
            databaseTables: null,
            databaseTableActive: null,
            databaseStatistics: null,
        }

        if (this.props.query.fullTagName === undefined) {
            this.props.query.fullTagName = '';
        } else {
            this.selectedObject = this.props.query.fullTagName;
            this.selectedWorkCellDisplayed = this.selectedObject !== '' ? this.selectedObject : 'No selected work cell';
        }
        if (this.props.query.value === undefined) {
            this.selectedValue = '';
        } else {
            this.selectedValue = this.props.query.value;
            this.selectedValueDisplayed =
                this.selectedValue !== '' ? this.selectedValue.split("/").slice(5).join("/") : 'No selected object';
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

        // check this.props.query.configurationTagIncludeLastDatapoint and add to selectedConfigurationIncludeLastDatapoint
        const currentIncludeLastDatapoint = this.props.query.configurationIncludeLastDatapoint;
        if (currentIncludeLastDatapoint !== undefined) {
            this.selectedConfigurationIncludeLastDatapoint = currentIncludeLastDatapoint;
        }

        // check this.props.query.configurationTagIncludeNextDatapoint and add to selectedConfigurationIncludeNextDatapoint
        const currentIncludeNextDatapoint = this.props.query.configurationIncludeNextDatapoint;
        if (currentIncludeNextDatapoint !== undefined) {
            this.selectedConfigurationIncludeNextDatapoint = currentIncludeNextDatapoint;
        }

        // check this.props.query.configurationKeepStates and add to selectedConfigurationKeepStates
        const currentKeepStates = this.props.query.configurationKeepStates;
        if (currentKeepStates !== undefined) {
            this.selectedConfigurationKeepStates = currentKeepStates;
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
            return this.selectedValue.includes(this.tagsQueryParameter + '/custom/');
        }
        return false;
    };

    // isCurrentSelectedValueAStandardTag checks whether the current selected value is a tag and therefore, begins with tagsValueID
    isCurrentSelectedValueAStandardTag = () => {
        if (this.isValidValueSelected()) {
            return this.selectedValue.includes(this.tagsQueryParameter + '/standard/');
        }
        return false;
    };

    // isStateTag checks whether the current selected standard tag is a state tag
    isStandardTagState = () => {
        if (this.isCurrentSelectedValueAStandardTag()) {
            return this.selectedValue.includes(this.tagsQueryParameter + '/standard/state');
        }
        return false;
    };

    isCurrentSelectedValueAvailability = () => {
        if (this.isValidValueSelected()) {
            return this.selectedValue.includes(this.tablesQueryParameter + '/availability');
        }
        return false;
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
            this.props.datasource.GetValuesTree(this.selectedObject).then((response: GetValuesQueryReturn) => {

                newValues.push({
                    label: 'kpi',
                    value: 'kpi',
                    items: response.kpi?.map((kpi: ValueSubTree) => {
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

                newValues.push({
                    label: 'table',
                    value: 'table',
                    items: response.tables?.map((table: any) => {
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

                newValues.push({
                    label: 'tags',
                    value: 'tags',
                    items: response.tags?.map((groupTag: any) => {
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

                /*
                for (const key in response) {
                    if (response.hasOwnProperty(key)) {
                        const element = response[key];
                        switch (element[0]) {
                            case 'kpis':
                                if (element[1] !== null && element[1] !== undefined) {
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
                                }
                                break;
                            case 'tables':
                                if (element[1] !== null && element[1] !== undefined) {
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
                                }
                                break;
                            case 'tags':
                                if (element[1] !== null && element[1] !== undefined) {
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
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
                */
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
        const {onChange, query} = this.props;
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
        this.selectedWorkCellDisplayed = val !== '' ? val : 'No selected work cell';

        // reset value and configuration
        this.selectedValue = '';
        this.selectedValueDisplayed = 'No selected value';
        this.selectedConfigurationGapfilling = this.defaultConfigurationGapfilling;

        // force render
        this.forceUpdate();
        this.getValueStructure();
    };

    onValueChange = (val: string) => {
        const {onChange, query} = this.props;
        onChange({...query, value: val});

        // and also in QueryEditor
        this.selectedValue = val;
        this.selectedValueDisplayed = val !== '' ? val.split("/").slice(5).join("/") : 'No selected value';

        // reset configuration
        this.selectedConfigurationGapfilling = this.defaultConfigurationGapfilling;

        // force render
        this.forceUpdate();
    };

    onConfigurationGapfillingChange = (value: SelectableValue) => {
        const {onChange, query} = this.props;
        const configurationTagGapfilling = value.value;
        onChange({...query, configurationTagGapfilling});

        // and also in QueryEditor
        this.selectedConfigurationGapfilling = value;

        // force render
        this.forceUpdate();
    };

    onConfigurationIncludeLastDatapointChange = (event: React.FormEvent<HTMLInputElement>) => {
        const configurationIncludeLastDatapoint = event.currentTarget.checked;
        const {onChange, query} = this.props;
        onChange({...query, configurationIncludeLastDatapoint});

        // and also in QueryEditor
        this.selectedConfigurationIncludeLastDatapoint = configurationIncludeLastDatapoint;

        // force render
        this.forceUpdate();
    };

    onConfigurationIncludeNextDatapointChange = (event: React.FormEvent<HTMLInputElement>) => {
        const configurationIncludeNextDatapoint = event.currentTarget.checked;
        const {onChange, query} = this.props;
        onChange({...query, configurationIncludeNextDatapoint});

        // and also in QueryEditor
        this.selectedConfigurationIncludeNextDatapoint = configurationIncludeNextDatapoint;

        // force render
        this.forceUpdate();
    };

    onConfigurationAggregatesChange = (value: SelectableValue[]) => {
        const {onChange, query} = this.props;
        const configurationTagAggregates = value.map((v) => v.value);
        onChange({...query, configurationTagAggregates});

        // and also in QueryEditor
        this.selectedConfigurationAggregates = value;

        // force render
        this.forceUpdate();
    };

    onTimeBucketEnabledChange = (event: React.FormEvent<HTMLInputElement>) => {
        const value = event.currentTarget.checked;
        const {onChange, query} = this.props;
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
            onChange({...query, configurationTimeBucket});
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
            const {onChange, query} = this.props;
            const configurationTimeBucket = stringValue + this.selectedTimeBucketUnit.value;
            onChange({...query, configurationTimeBucket});

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
        const {onChange, query} = this.props;
        const configurationTimeBucket = this.selectedTimeBucketSize + value.value;
        onChange({...query, configurationTimeBucket});

        // and also in QueryEditor
        this.selectedTimeBucketUnit = value;
        this.selectedConfigurationTimeBucket = configurationTimeBucket;

        // force render
        this.forceUpdate();
    };

    onConfigurationTimeBucketChange = (value: SelectableValue) => {
        const {onChange, query} = this.props;
        const configurationTimeBucket = value.value;
        onChange({...query, configurationTimeBucket});

        // and also in QueryEditor
        this.selectedConfigurationTimeBucket = value.value;

        // force render
        this.forceUpdate();
    };

    onConfigurationIncludeRunningProcessesChange = (event: React.FormEvent<HTMLInputElement>) => {
        const configurationIncludeRunningProcesses = event.currentTarget.checked;
        const {onChange, query} = this.props;
        onChange({...query, configurationIncludeRunningProcesses});

        // and also in QueryEditor
        this.selectedConfigurationIncludeRunningProcesses = configurationIncludeRunningProcesses;

        // force render
        this.forceUpdate();
    };

    onConfigurationKeepStatesChange = (event: React.FormEvent<HTMLInputElement>) => {
        const configurationKeepStates = event.currentTarget.checked;
        const {onChange, query} = this.props;
        onChange({...query, configurationKeepStates});

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

        this.fetchCustomerConfiguration(this.props)
        this.fetchDatabaseStatistics(this.props)
    }

    async fetchCustomerConfiguration(props: Readonly<Props>) {
        const configuration = await props.datasource.getCustomerConfiguration();
        if (configuration) {
            this.setState({
                customerConfiguration: configuration
            });
        }
    }

    async fetchDatabaseStatistics(props: Readonly<Props>) {
        const configuration = await props.datasource.getDatabaseStatistics();
        if (configuration) {
            const tables: Array<[string, JSX.Element]> = Object.entries(configuration.TableStatistics).map(([key, value]) => {
                return [key, this.generateDatabaseTable(key, value)];
            })

            // Convert array of tuples to map and store in state
            this.setState({
                databaseTables: new Map(tables),
                databaseTableActive: tables[0][0],
                databaseStatistics: configuration
            });
        }
    }

    isStringValidNumber(input: string): boolean {
        const numberRegEx = /^\d+$/;
        return numberRegEx.test(input);
    }

    generateBooleanOption(label: string, description: string, value: boolean | undefined): JSX.Element {
        return (<Field label={label}
                       description={description} horizontal={true}><Switch
            value={value ? value : false}
            disabled={true}></Switch></Field>)
    }

    generateNumberArrayOption(label: string, description: string, value: number[] | undefined): JSX.Element {
        return this.generateStringArrayOption(label, description, value?.map((v) => v.toString()));
    }


    generateStringArrayOption(label: string, description: string, value: string[] | undefined): JSX.Element {
        function generateNewTagListEveryNEntries(tags: string[], n: number) {
            // Set n to tags.length if n is greater than tags.length
            n = n > tags.length ? tags.length : n;

            // Split tags into chunks of n elements
            const chunks = [];
            for (let i = 0; i < tags.length; i += n) {
                chunks.push(tags.slice(i, i + n));
            }

            // For each chunk generate a <TagList> element
            return chunks.map((chunk, index) => {
                return <TagList key={index} tags={chunk}/>
            })
        }

        const tags = value ? value.map((v) => v.toString()) : ["undefined"];
        return (<Field label={label}
                       description={description} horizontal={true}>
            <div>{generateNewTagListEveryNEntries(tags, 6)}</div>
        </Field>)
    }


    generateNumberOption(label: string, description: string, value: number | undefined): JSX.Element {
        // I hate that 0 is falsy
        return this.generateNumberArrayOption(label, description, (value !== undefined) ? [value] : undefined)
    }

    generateStringOption(label: string, description: string, value: string | undefined): JSX.Element {
        return this.generateStringArrayOption(label, description, (value !== undefined) ? [value] : undefined)
    }

    generateByteOption(label: string, description: string, value: number | undefined): JSX.Element {
        if (value === undefined) {
            return this.generateNumberArrayOption(label, description, undefined)
        }
        // use filesize lib to display as human-readable (KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB)
        const fs: string = filesize(value, {output: "string"}).toString();
        return this.generateStringOption(label, description, fs)
    }

    generateMaybeStringOption(label: string, description: string, value: MaybeString, placeholder: string): JSX.Element {
        if (value.Valid) {
            return this.generateStringOption(label, description, value.String)
        } else {
            return this.generateStringOption(label, description, placeholder)
        }
    }

    generateHyperTableStatistics(key: string, value: HypertableStats[] | null): JSX.Element {
        if (value === null) {
            return <div>no statistics available</div>
        } else {
            const chunkValues: JSX.Element[] = value.map((v, k) => {
                const hash = sha256.create();
                hash.update(JSON.stringify(v));
                hash.update(k.toString());
                hash.update(key);
                const hashValue = hash.hex();
                const args = {
                    label: "Chunk-" + k
                }
                return (
                    <div key={hashValue}>
                        <ControlledCollapse {...args}>
                            {this.generateByteOption("Table bytes", "The size of the table in bytes", v.TableBytes)}
                            {this.generateByteOption("Index bytes", "The size of the index in bytes", v.IndexBytes)}
                            {this.generateByteOption("Toast bytes", "The size of the toast in bytes", v.ToastBytes)}
                            {this.generateByteOption("Total bytes", "The total size of the table", v.TotalBytes)}
                            {this.generateMaybeStringOption("Node", "The node where the table is stored", v.NodeName, "/")}
                        </ControlledCollapse>
                    </div>
                )
            })
            // reduce to single div element
            return (<div>{chunkValues.reduce((prev, curr) => {
                return (<div>{prev}{curr}</div>)
            })}</div>)
        }
    }

    generateNormalTableStatistics(value: NormalTableStats): JSX.Element {
        return (<div>
            {this.generateByteOption("Table size", "The size of the table in bytes", value.PgTableSize)}
            {this.generateByteOption("Total relation size", "The total size of the table", value.PgTotalRelationSize)}
            {this.generateByteOption("Index size", "The size of the index in bytes", value.PgIndexesSize)}
            {this.generateByteOption("Relation size (Main)", "The size of the main relation in bytes", value.PgRelationSizeMain)}
            {this.generateByteOption("Relation size (FSM)", "The size of the FSM relation in bytes", value.PgRelationSizeFsm)}
            {this.generateByteOption("Relation size (VM)", "The size of the VM relation in bytes", value.PgRelationSizeVm)}
            {this.generateByteOption("Relation size (Init)", "The size of the Init relation in bytes", value.PgRelationSizeInit)}
        </div>)
    }

    generateScheduleConfigOption(label: string, description: string, value: HyperTableRetention | HyperTableCompression): JSX.Element {
        if (value.Config.length === 0) {
            return this.generateStringOption(label, description, "not set")
        } else {
            const args = {
                label: label,
            }
            return (
                <ControlledCollapse {...args}>
                    {this.generateStringOption("Schedule", "The schedule to run the configured operation", value.ScheduleInterval)}
                    {this.generateStringOption("Operation", "The operation to run", value.Config)}
                </ControlledCollapse>
            )
        }
    }


    generateDatabaseTable(key: string, value: TableStatistic): JSX.Element {
        return (
            <div key={key}>
                {this.generateNumberOption("Rows", "Approximate number of rows", value.ApproximateRows)}
                {this.generateMaybeStringOption("Last auto analyze", "Last time the table was analyzed automatically", value.LastAutoAnalyze, "never")}
                {this.generateMaybeStringOption("Last auto vacuum", "Last time the table was vacuumed automatically", value.LastAutoVacuum, "never")}
                {this.generateMaybeStringOption("Last analyze", "Last time the table was analyzed", value.LastAnalyze, "never")}
                {this.generateMaybeStringOption("Last vacuum", "Last time the table was vacuumed", value.LastVacuum, "never")}
                {this.generateBooleanOption("Is Hypertable", "Is this table a TimescaleDB hypertable?", value.IsHyperTable)}
                {value.IsHyperTable ? this.generateScheduleConfigOption("Retention Policy", "The retention policy for this hypertable", value.HyperRetention) : null}
                {value.IsHyperTable ? this.generateScheduleConfigOption("Compression Policy", "The compression policy for this hypertable", value.HyperCompression) : null}
                {value.IsHyperTable ? this.generateHyperTableStatistics(key, value.HyperStats) : this.generateNormalTableStatistics(value.NormalStats)}
            </div>
        )
    }

    getDatabaseStatisticsTable() {
        const collapseProps = {
            label: "Database Statistics",
            isOpen: this.state.databaseStatisticsIsOpen,
            loading: false,

            onToggle: () => {
                this.setState({
                    databaseStatisticsIsOpen: !this.state.databaseStatisticsIsOpen
                })
            }
        }

        if (this.state.databaseTables === undefined || this.state.databaseTables === null || this.state.databaseTableActive === undefined || this.state.databaseTableActive === null || this.state.databaseStatistics === undefined || this.state.databaseStatistics === null) {
            collapseProps.loading = true;
            return (
                <div>
                    <Collapse {...collapseProps}>
                    </Collapse>
                </div>
            )
        }


        return (
            <div>
                <Collapse {...collapseProps}>
                    <div>
                        {this.generateByteOption("Database size", "Exact size: " + this.state.databaseStatistics.DatabaseSizeInBytes + " byte", this.state.databaseStatistics.DatabaseSizeInBytes)}
                    </div>
                    <div>
                        <TabsBar>
                            {Array.from(this.state.databaseTables).map((v, k) => {
                                // @ts-ignore //This cannot be null, as we check for that above
                                const counter = this.state.databaseStatistics.TableStatistics[v[0]].ApproximateRows;
                                return (
                                    <Tab label={v[0]}
                                         key={v[0]}
                                         active={this.state.databaseTableActive === v[0]}
                                         onChangeTab={() => {
                                             console.log("changed: " + v[0])
                                             this.setState({
                                                 databaseTableActive: v[0]
                                             })
                                         }}
                                         counter={counter}

                                    />
                                )
                            })}
                        </TabsBar>
                        <TabContent>
                            {
                                this.state.databaseTables.get(this.state.databaseTableActive)
                            }
                        </TabContent>
                    </div>
                </Collapse>
            </div>
        )
    }

    getCustomerConfigurationCollapsible() {
        const collapseProps = {
            label: "Customer configuration",
            isOpen: this.state.customerConfigurationIsOpen,
            loading: false,

            onToggle: () => {
                this.setState({
                    customerConfigurationIsOpen: !this.state.customerConfigurationIsOpen
                })
            }
        }

        if (this.state.customerConfiguration === undefined || this.state.customerConfiguration === null) {
            collapseProps.loading = true;
            return (
                <div>
                    <Collapse {...collapseProps}>
                    </Collapse>
                </div>
            )
        }
        return (
            <div>
                <Collapse {...collapseProps}>
                    <div>
                        {this.generateBooleanOption("Automatically identify changeovers", "TODO: Add description", this.state.customerConfiguration?.AutomaticallyIdentifyChangeovers)}
                    </div>
                    <div>
                        {this.generateNumberArrayOption("Availability loss states", "TODO: Add description", this.state.customerConfiguration?.AvailabilityLossStates)}
                    </div>
                    <div>
                        {this.generateNumberOption("Ignore microstop under this duration in seconds", "TODO: Add description", this.state.customerConfiguration?.IgnoreMicrostopUnderThisDurationInSeconds)}
                    </div>
                    <div>
                        {this.generateNumberOption("Language code", "TODO: Add description", this.state.customerConfiguration?.LanguageCode)}
                    </div>
                    <div>
                        {this.generateNumberOption("Low speed threshold in pcs/hour", "TODO: Add description", this.state.customerConfiguration?.LowSpeedThresholdInPcsPerHour)}
                    </div>
                    <div>
                        {this.generateNumberOption("Microstop duration in seconds", "TODO: Add description", this.state.customerConfiguration?.MicrostopDurationInSeconds)}
                    </div>
                    <div>
                        {this.generateNumberOption("Minimum running time in seconds", "TODO: Add description", this.state.customerConfiguration?.MinimumRunningTimeInSeconds)}
                    </div>
                    <div>
                        {this.generateNumberArrayOption("Performance loss states", "TODO: Add description", this.state.customerConfiguration?.PerformanceLossStates)}
                    </div>
                    <div>
                        {this.generateNumberOption("Threshold for no shifts to considered break in seconds", "TODO: Add description", this.state.customerConfiguration?.ThresholdForNoShiftsConsideredBreakInSeconds)}
                    </div>
                </Collapse>
            </div>
        )

    }

    render() {
        if (this.objectStructure.length === 0) {
            return <LoadingPlaceholder text="Loading data, please wait..."/>;
        }

        return (
            <div>
                <VerticalGroup>
                    <HorizontalGroup>
                        <div className="gf-form-group">
                            <React.StrictMode>
                                <FieldSet label="Work cell to query">
                                    <InlineField
                                        label="Selected work cell"
                                        labelWidth={23}
                                        disabled={true}
                                        tooltip="This is the currently selected object, even if in the menu below is empty"
                                    >
                                        <Input width={100} value={this.selectedWorkCellDisplayed}
                                               placeholder="No selected work cell"/>
                                    </InlineField>
                                    <InlineField
                                        label="Select new work cell"
                                        labelWidth={23}
                                        tooltip={'Select the specific work cell you want to see the data of'}
                                    >
                                        <Cascader
                                            separator=" / "
                                            options={this.objectStructure}
                                            onSelect={this.onObjectChange}
                                            displayAllSelectedLevels={false}
                                            initialValue={this.selectedObject}
                                            width={100}
                                        />
                                    </InlineField>
                                </FieldSet>
                                <FieldSet label="Value to query"
                                          hidden={!(this.isObjectDataReady() && this.isObjectSelected())}>
                                    <InlineField
                                        label="Selected value"
                                        labelWidth={23}
                                        disabled={true}
                                        tooltip="This is the currently selected value, even if in the menu below is empty"
                                    >
                                        <Input width={100} value={this.selectedValueDisplayed}
                                               placeholder="No selected value"/>
                                    </InlineField>
                                    <InlineField
                                        label="Select new value"
                                        labelWidth={23}
                                        tooltip={'Select an automatically calculated KPI or a tag for the selected work cell'}
                                    >
                                        <Cascader
                                            separator=" / "
                                            options={this.valueStructure}
                                            onSelect={this.onValueChange}
                                            displayAllSelectedLevels={false}
                                            initialValue={this.selectedValue}
                                            width={100}
                                        />
                                    </InlineField>
                                </FieldSet>
                                <FieldSet label="Options" hidden={!this.isCurrentSelectedValueAvailability()}>
                                    <InlineField label="Include running processes" labelWidth={'auto'}
                                                 tooltip={'Include running processes'}>
                                        <InlineSwitch
                                            value={this.selectedConfigurationIncludeRunningProcesses}
                                            onClick={this.onConfigurationIncludeRunningProcessesChange}
                                        />
                                    </InlineField>
                                    <InlineField label="Keep states" labelWidth={'auto'} tooltip={'Keep states'}>
                                        <InlineSwitch value={this.selectedConfigurationKeepStates}
                                                      onClick={this.onConfigurationKeepStatesChange}/>
                                    </InlineField>
                                </FieldSet>
                                <FieldSet label="Options" hidden={!this.isCurrentSelectedValueACustomTag()}>
                                    <InlineFieldRow>
                                        <InlineField
                                            label="Time bucket"
                                            labelWidth={'auto'}
                                            tooltip="Enable if you want to group data in a time bucket"
                                        >
                                            <InlineSwitch
                                                label="Enable"
                                                showLabel={true}
                                                value={this.timeBucketEnabled}
                                                onClick={this.onTimeBucketEnabledChange}
                                            />
                                        </InlineField>
                                        <InlineField
                                            label={'Size'}
                                            invalid={!this.isStringValidNumber(this.selectedTimeBucketSize)}
                                            error={'This input is required and must be a valid number'}
                                            disabled={!this.timeBucketEnabled}
                                        >
                                            <Input value={this.selectedTimeBucketSize}
                                                   onChange={this.onTimeBucketSizeChange}
                                                   width={20}/>
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
                                    <FieldSet hidden={!this.timeBucketEnabled}>
                                        <InlineField label="Aggregates" labelWidth={'auto'}
                                                     tooltip={'Common statistical aggregates'}>
                                            <MultiSelect
                                                options={this.tagAggregatesOptions}
                                                width={30}
                                                defaultValue={this.defaultConfigurationAggregates}
                                                value={this.selectedConfigurationAggregates}
                                                onChange={this.onConfigurationAggregatesChange}
                                            />
                                        </InlineField>
                                        <InlineField
                                            label="Handling missing values"
                                            labelWidth={35}
                                            tooltip={'How missing data should be filled. For more information, please visit our documentation.'}
                                        >
                                            <Select
                                                options={this.tagGapfillingOptions}
                                                width={30}
                                                defaultValue={this.tagGapfillingOptions[0]}
                                                value={this.selectedConfigurationGapfilling}
                                                onChange={this.onConfigurationGapfillingChange}
                                            />
                                        </InlineField>
                                        <InlineField
                                            label="Include last datapoint before time interval"
                                            labelWidth={35}
                                            tooltip={'Include last datapoint before time interval'}
                                        >
                                            <InlineSwitch
                                                value={this.selectedConfigurationIncludeLastDatapoint}
                                                onClick={this.onConfigurationIncludeLastDatapointChange}
                                            />
                                        </InlineField>
                                        <InlineField
                                            label="Include next datapoint after time interval"
                                            labelWidth={35}
                                            tooltip={'Include next datapoint after time interval'}
                                        >
                                            <InlineSwitch
                                                value={this.selectedConfigurationIncludeNextDatapoint}
                                                onClick={this.onConfigurationIncludeNextDatapointChange}
                                            />
                                        </InlineField>
                                    </FieldSet>
                                </FieldSet>
                                <FieldSet label="Options" hidden={!this.isCurrentSelectedValueAStandardTag()}>
                                    <InlineField
                                        label="Keep state integer"
                                        labelWidth={'auto'}
                                        tooltip={'Keep state as integer instead of converting them to their string value'}
                                        hidden={!this.isStandardTagState()}
                                    >
                                        <InlineSwitch value={this.selectedConfigurationKeepStates}
                                                      onClick={this.onConfigurationKeepStatesChange}/>
                                    </InlineField>
                                </FieldSet>
                            </React.StrictMode>
                        </div>
                        <div>
                            {this.getCustomerConfigurationCollapsible()}
                        </div>
                    </HorizontalGroup>
                    {this.getDatabaseStatisticsTable()}
                </VerticalGroup>
            </div>
        );
    }
}
