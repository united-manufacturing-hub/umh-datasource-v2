

import React, { PureComponent } from 'react';
import {Cascader, CascaderOption, Label, Alert} from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { FactoryinsightDataSourceOptions, FactoryinsightQuery} from './types';

import { GetDefaultEnterprise, DefaultTags, DefaultKPIs, DefaultWorkCellTags } from './demoData'

type Props = QueryEditorProps<DataSource, FactoryinsightQuery, FactoryinsightDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {

    objectStructure: Array<CascaderOption> = [];
    KPIStructure: Array<CascaderOption> = [];

    tagsValueID: string = 'tags'
    KPIValueID: string = 'kpi'

    selectedObject: string = '';
    selectedKPI: string = '';

    constructor(props: Props) {
        super(props);
    }


    isObjectSelected = () => {
        return this.selectedObject !== '';
    }

    isValidKPISelected = () => {
        if (this.selectedKPI === '') {
            return false;
        } else if (this.selectedKPI === this.KPIValueID || this.selectedKPI === this.tagsValueID) {
            return false;
        } else {
            return true
        }
    }

    getObjectStructure = () => {
        this.objectStructure = [
            {
                label: 'BreweryCo',
                value: 'BreweryCo',
                items: GetDefaultEnterprise('BreweryCo')
            }
        ]
        return this.objectStructure;
    }

    getKPIStructure = () => {
        if (this.props.query.workCell === '' || this.props.query.workCell === undefined) {
            this.KPIStructure = [
                {
                    label: 'Tags',
                    value: this.tagsValueID,
                    items: DefaultTags
                },
                {
                    label: 'KPIs',
                    value: this.KPIValueID,
                    items: DefaultKPIs
                }
            ]
        } else {
            this.KPIStructure = [
                {
                    label: 'Tags',
                    value: this.tagsValueID,
                    items: DefaultWorkCellTags
                },
                {
                    label: 'KPIs',
                    value: this.KPIValueID,
                    items: DefaultKPIs
                }
            ]
        }

        return this.KPIStructure;

    }

    onObjectChange = (val: string) => {

        // split object into enterprise, area, production line, work cell
        const { onChange, query } = this.props;
        const object = val;
        const enterprise = object.split('/')[0];
        const site = object.split('/')[1];
        const area = object.split('/')[2];
        const productionLine = object.split('/')[3];
        const workCell = object.split('/')[4];

        onChange({ ...query, enterprise, site, area, productionLine, workCell });

        // and also in QueryEditor
        this.selectedObject = val;

        // force render
        this.forceUpdate();
    }

    onKPIChange = (val: string) => {

        const { onChange, query } = this.props;
        const kpi = val;
        onChange({ ...query, kpi });

        // and also in QueryEditor
        this.selectedKPI = val;

        // force render
        this.forceUpdate();

    }


  render() {
              return (
                  <div>
                    <div className="gf-form">
                        <Label className="gf-form-label width-10">Object</Label>
                        <Cascader
                            options={this.getObjectStructure()}
                            onSelect={this.onObjectChange}
                            displayAllSelectedLevels={true}
                            width={60}
                        />
                    </div>
                    <div
                        className="gf-form"
                        hidden={!this.isObjectSelected()}
                    >
                        <label className="gf-form-label width-10">Value</label>
                        <Cascader
                            options={this.getKPIStructure()}
                            onSelect={this.onKPIChange}
                            displayAllSelectedLevels={true}
                            width={60}
                        />
                    </div>
                  <Alert
                      title="Please select a value from the dropdown menu"
                      severity="error"
                      hidden={this.isValidKPISelected() || !this.isObjectSelected()}
                  >
                      "Tags" or "KPIs" are not valid values for the "Element" field.
                  </Alert>
              </div>)
          }
}
