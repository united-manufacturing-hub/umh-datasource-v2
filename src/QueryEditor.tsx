

import React, { PureComponent } from 'react';
import { AsyncSelect } from '@grafana/ui';
import { QueryEditorProps , SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { FactoryinsightDataSourceOptions, FactoryinsightQuery, QueryType} from './types';

type Props = QueryEditorProps<DataSource, FactoryinsightQuery, FactoryinsightDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {

    defaultSelectableLocation: SelectableValue<string> = { label: 'Select Location', value: '' }
    defaultSelectableAsset: SelectableValue<string> = { label: 'Select Asset', value: '' }
    defaultSelectableEnterprise: SelectableValue<string> = { label: 'Select enterprise', value: '' }
    defaultSelectableSite: SelectableValue<string> = { label: 'none / select site', value: '' }
    defaultSelectableArea: SelectableValue<string> = { label: 'none / select area', value: '' }
    defaultSelectableProductionLine: SelectableValue<string> = { label: 'none / select production line', value: '' }
    defaultSelectableWorkCell: SelectableValue<string> = { label: 'none / select work cell', value: '' }
    defaultSelectableKPI: SelectableValue<string> = { label: 'Select KPI', value: '' }

    locationOptions: Array<SelectableValue<string>> = [];
    assetOptions: Array<SelectableValue<string>> = [];
    enterpriseOptions: Array<SelectableValue<string>> = [];
    siteOptions: Array<SelectableValue<string>> = [];
    areaOptions: Array<SelectableValue<string>> = [];
    productionLineOptions: Array<SelectableValue<string>> = [];
    workCellOptions: Array<SelectableValue<string>> = [];
    kpiOptions: Array<SelectableValue<string>> = [];

    selectableLocation: SelectableValue<string>
    selectableAsset: SelectableValue<string>
    selectableEnterprise: SelectableValue<string>
    selectableSite: SelectableValue<string>
    selectableArea: SelectableValue<string>
    selectableProductionLine: SelectableValue<string>
    selectableWorkCell: SelectableValue<string>

    selectableKPI: SelectableValue<string>

    queryType: QueryType = QueryType.enterprise

    loadDemoEnterprises = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.enterpriseOptions = [
                { label: 'BreweryCo', value: 'BreweryCo' },
                ]
            // put defaultSelectableEnterprise in first position
            this.enterpriseOptions.unshift(this.defaultSelectableEnterprise);

            resolve(this.enterpriseOptions);
        });
    };

    loadDemoSites = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.siteOptions = [
                { label: 'Aachen', value: 'Aachen' },
                { label: 'Bonn', value: 'Bonn' },
                { label: 'Cologne', value: 'Cologne' },
                ]
            // put defaultSelectableSite in first position
            this.siteOptions.unshift(this.defaultSelectableSite);
            resolve(this.siteOptions);
        });
    }

    loadDemoAreas = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.areaOptions = [
                { label: 'Hall 1', value: 'Hall 1' },
                { label: 'Hall 2', value: 'Hall 2' },
                { label: 'Hall 3/4', value: 'Hall 3/4' },
                ]
            // put defaultSelectableArea in first position
            this.areaOptions.unshift(this.defaultSelectableArea);

            resolve(this.areaOptions);
        });
    }

    loadDemoProductionLines = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.productionLineOptions = [
                { label: 'Filling 12-18 (0.33l)', value: '12-18' },
                { label: 'Filling 12-16 (0.33l)', value: '12-16' },
                { label: 'Filling 12-12 (0.5l)', value: '12-12' },
                { label: 'Filling 12-10 (special)', value: '12-10' },
                ]
            // put defaultSelectableProductionLine in first position
            this.productionLineOptions.unshift(this.defaultSelectableProductionLine);

            resolve(this.productionLineOptions);
        });
    }

    loadDemoWorkCells = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.workCellOptions = [
                { label: 'KZE', value: 'KZE' },
                { label: 'Filler', value: 'Filler' },
                { label: 'Labeler', value: 'Labeler' },
                { label: 'Palletizer', value: 'Palletizer' },
                ]
            // put defaultSelectableWorkCell in first position
            this.workCellOptions.unshift(this.defaultSelectableWorkCell);
            resolve(this.workCellOptions);
        });
    }

    loadDemoKPIs = () => {
        if (this.queryType === QueryType.enterprise) {
            return this.loadDemoEnterpriseKPI();
        }
        if (this.queryType === QueryType.site) {
            return this.loadDemoSiteKPI();
        }
        if (this.queryType === QueryType.area) {
            return this.loadDemoAreaKPI();
        }
        if (this.queryType === QueryType.productionLine) {
            return this.loadDemoProductionLineKPI();
        }
        if (this.queryType === QueryType.workCell) {
            return this.loadDemoWorkCellKPI();
        }
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.kpiOptions = []
            resolve(this.kpiOptions);
        });
    }

    loadDemoEnterpriseKPI = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.kpiOptions = [
                { label: 'Average OEE', value: 'oee_avg' },
                { label: 'Total output', value: 'count_total' },
                ]
            resolve(this.kpiOptions);
        });
    }

    loadDemoSiteKPI = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.kpiOptions = [
                { label: 'Average OEE', value: 'oee_avg' },
                { label: 'Total output', value: 'count_total' },
                ]
            resolve(this.kpiOptions);
        });
    }

    loadDemoAreaKPI = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.kpiOptions = [
                { label: 'Average OEE', value: 'oee_avg' },
                { label: 'Total output', value: 'count_total' },
                ]
            resolve(this.kpiOptions);
        });
    }

    loadDemoProductionLineKPI = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.kpiOptions = [
                { label: 'Average OEE', value: 'oee_avg' },
                { label: 'Total output', value: 'count_total' },
                ]
            resolve(this.kpiOptions);
        });
    }

    loadDemoWorkCellKPI = () => {
        return new Promise<Array<SelectableValue<string>>>((resolve) => {
            this.kpiOptions = [
                { label: 'OEE', value: 'oee' },
                { label: 'Availability', value: 'availability' },
                { label: 'Performance', value: 'performance' },
                { label: 'Quality', value: 'quality' },
                { label: 'Shifts', value: 'shifts' },
                { label: 'Job list', value: 'joblist' }, //equals to /orders
                { label: 'Output', value: 'output' }, // equals to /count
                { label: 'Production Speed', value: 'output_derivative' },
                ]
            resolve(this.kpiOptions);
        });
    }



    updateQueryType = () => {
        var oldQueryType = this.queryType;
        var newQueryType = this.queryType;

        if (this.isWorkCellSelected()) {
            newQueryType = QueryType.workCell
        } else if (this.isProductionLineSelected()) {
            newQueryType = QueryType.productionLine
        } else if (this.isAreaSelected()) {
            newQueryType = QueryType.area
        } else if (this.isSiteSelected()) {
            newQueryType = QueryType.site
        } else if (this.isEnterpriseSelected()) {
            newQueryType = QueryType.enterprise
        }

        if (oldQueryType !== newQueryType) {
            this.queryType = newQueryType;
            this.forceUpdate()
        }
    }

    onEnterpriseChange = (enterprise: SelectableValue<string>) => {
        this.selectableEnterprise = enterprise;
        this.selectableSite = this.defaultSelectableSite;
        this.selectableArea = this.defaultSelectableArea;
        this.selectableProductionLine = this.defaultSelectableProductionLine;
        this.selectableWorkCell = this.defaultSelectableWorkCell;
        this.props.onChange({ ...this.props.query, enterprise: enterprise.value });

        // Reload and reset all options
        this.loadDemoSites().then(() => {
            this.loadDemoAreas().then(() => {
                this.loadDemoProductionLines().then(() => {
                    this.loadDemoWorkCells().then(() => {
                        this.loadDemoKPIs().then(() => {
                            this.selectableSite = this.defaultSelectableSite;
                            this.selectableArea = this.defaultSelectableArea;
                            this.selectableProductionLine = this.defaultSelectableProductionLine;
                            this.selectableWorkCell = this.defaultSelectableWorkCell;
                            this.selectableKPI = this.defaultSelectableKPI;
                            this.forceUpdate();
                        });
                    });
                });
            });
        });
    }

    onSiteChange = (site: SelectableValue<string>) => {
        this.selectableSite = site;
        this.selectableArea = this.defaultSelectableArea;
        this.selectableProductionLine = this.defaultSelectableProductionLine;
        this.selectableWorkCell = this.defaultSelectableWorkCell;
        this.props.onChange({ ...this.props.query, site: site.value });
        this.updateQueryType();

        // Reload and reset all options
        this.loadDemoAreas().then(() => {
            this.loadDemoProductionLines().then(() => {
                this.loadDemoWorkCells().then(() => {
                    this.loadDemoKPIs().then(() => {
                        this.selectableArea = this.defaultSelectableArea;
                        this.selectableProductionLine = this.defaultSelectableProductionLine;
                        this.selectableWorkCell = this.defaultSelectableWorkCell;
                        this.selectableKPI = this.defaultSelectableKPI;
                        this.forceUpdate();
                    });
                });
            });
        }  );
    }

    onAreaChange = (area: SelectableValue<string>) => {
        this.selectableArea = area;
        this.selectableProductionLine = this.defaultSelectableProductionLine;
        this.selectableWorkCell = this.defaultSelectableWorkCell;
        this.props.onChange({ ...this.props.query, area: area.value });
        this.updateQueryType();

        // Reload and reset all options
        this.loadDemoProductionLines().then(() => {
            this.loadDemoWorkCells().then(() => {
                this.loadDemoKPIs().then(() => {
                    this.selectableProductionLine = this.defaultSelectableProductionLine;
                    this.selectableWorkCell = this.defaultSelectableWorkCell;
                    this.selectableKPI = this.defaultSelectableKPI;
                    this.forceUpdate();
                });
            });
        } );
    }

    onProductionLineChange = (productionLine: SelectableValue<string>) => {
        this.selectableProductionLine = productionLine;
        this.selectableWorkCell = this.defaultSelectableWorkCell;
        this.props.onChange({ ...this.props.query, productionLine: productionLine.value });
        this.updateQueryType();

        // Reload and reset all options
        this.loadDemoWorkCells().then(() => {
            this.loadDemoKPIs().then(() => {
                this.selectableWorkCell = this.defaultSelectableWorkCell;
                this.selectableKPI = this.defaultSelectableKPI;
                this.forceUpdate();
            });
        } );
    }

    onWorkCellChange = (workCell: SelectableValue<string>) => {
        this.selectableWorkCell = workCell;
        this.props.onChange({ ...this.props.query, workCell: workCell.value });
        this.updateQueryType();

        // Reload and reset all options
        this.loadDemoKPIs().then(() => {
            this.selectableKPI = this.defaultSelectableKPI;
            this.forceUpdate();
        } );
    }

    onKPIChange = (kpi: SelectableValue<string>) => {
        this.selectableKPI = kpi;
        this.props.onChange({ ...this.props.query, kpi: kpi.value });
    }

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

    isEnterpriseSelected = () => {
        return this.selectableEnterprise.value !== '';
    }

    isSiteSelected = () => {
        return this.selectableSite.value !== '';
    }

    isAreaSelected = () => {
        return this.selectableArea.value !== '';
    }

    isProductionLineSelected = () => {
        return this.selectableProductionLine.value !== '';
    }

    isWorkCellSelected = () => {
        return this.selectableWorkCell.value !== '';
    }

    constructor(props: Props) {
        super(props);

        this.selectableLocation = this.defaultSelectableLocation;
        this.selectableAsset = this.defaultSelectableAsset;

        this.selectableEnterprise = this.defaultSelectableEnterprise;
        this.selectableSite = this.defaultSelectableSite;
        this.selectableArea = this.defaultSelectableArea;
        this.selectableProductionLine = this.defaultSelectableProductionLine;
        this.selectableWorkCell = this.defaultSelectableWorkCell;

        this.selectableKPI = this.defaultSelectableKPI;
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

      if (this.props.datasource.demoMode) {
          return (
                <div>
              <div className="gf-form">
                  <label className="gf-form-label">Enterprise</label>
                  <AsyncSelect
                      value={this.selectableEnterprise}
                      onChange={this.onEnterpriseChange}
                      loadOptions={this.loadDemoEnterprises}
                      loadingMessage={'Loading enterprises...'}
                      defaultOptions={true}
                      isSearchable={false}
                  />
                    <label className="gf-form-label">Site</label>
                    <AsyncSelect
                        value={this.selectableSite}
                        onChange={this.onSiteChange}
                        loadOptions={this.loadDemoSites}
                        loadingMessage={'Loading sites...'}
                        defaultOptions={this.siteOptions}
                        isSearchable={false}
                        disabled={!this.isEnterpriseSelected()}
                    />
                    <label className="gf-form-label">Area</label>
                    <AsyncSelect
                        value={this.selectableArea}
                        onChange={this.onAreaChange}
                        loadOptions={this.loadDemoAreas}
                        loadingMessage={'Loading areas...'}
                        defaultOptions={this.areaOptions}
                        isSearchable={false}
                        disabled={!this.isSiteSelected()}
                    />
                    <label className="gf-form-label">Production Line</label>
                    <AsyncSelect
                        value={this.selectableProductionLine}
                        onChange={this.onProductionLineChange}
                        loadOptions={this.loadDemoProductionLines}
                        loadingMessage={'Loading production lines...'}
                        defaultOptions={this.productionLineOptions}
                        isSearchable={false}
                        disabled={!this.isAreaSelected()}
                    />
                    <label className="gf-form-label">Work Cell</label>
                    <AsyncSelect
                        value={this.selectableWorkCell}
                        onChange={this.onWorkCellChange}
                        loadOptions={this.loadDemoWorkCells}
                        loadingMessage={'Loading work cells...'}
                        defaultOptions={this.workCellOptions}
                        isSearchable={false}
                        disabled={!this.isProductionLineSelected()}
                    />

              </div>
          <div className="gf-form">
              <label className="gf-form-label">KPI for {this.queryType}</label>
              <AsyncSelect
                  value={this.selectableKPI}
                  onChange={this.onKPIChange}
                  loadOptions={this.loadDemoKPIs}
                  loadingMessage={'Loading KPI\'s for {this.queryType}...'}
                  defaultOptions={this.kpiOptions}
                  isSearchable={false}
                  disabled={!this.isEnterpriseSelected()}
              />

          </div>
                </div>
          );
      }

    return (
      <div className="gf-form">
          <label className="gf-form-label">Location</label>
          <AsyncSelect
              value={this.selectableLocation}
              onChange={this.onLocationChange}
              loadOptions={this.loadLocationOptions}
              loadingMessage={'Loading sites...'}
              defaultOptions={true}
              isSearchable={false}
              cacheOptions={false}
          />
          <label className="gf-form-label">Equipment</label>
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
