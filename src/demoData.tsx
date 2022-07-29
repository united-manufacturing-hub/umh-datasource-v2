import {FactoryinsightQuery} from "./types";
import {FieldType, MutableDataFrame} from "@grafana/data";

let getDefaultProductionLine = (enterprise: string, site: string, area: string, productionLine: string) => {
    let defaultString = enterprise + "/" + site + "/" + area + "/" + productionLine + "/";
    return [
        {
            label: 'KZE',
            value: defaultString + 'KZE',
        },
        {
            label: 'Filler',
            value: defaultString + 'filler',
        },
        {
            label: 'Labeler',
            value: defaultString + 'labeler',
        },
        {
            label: 'Packer',
            value: defaultString + 'packer',
        },
        {
            label: 'Palletizer',
            value: defaultString + 'palletizer',
        }
    ]
}

let getDefaultArea = (enterprise: string, site: string, area: string) => {
    let defaultString = enterprise + "/" + site + "/" + area + "/";
    return [
        {
            label: 'Filling 12-18 (0.33l)',
            value: defaultString + '12-18',
            items: getDefaultProductionLine(enterprise, site, area, '12-18')
        },
        {
            label: 'Filling 18-24 (0.33l)',
            value: defaultString + '18-24',
            items: getDefaultProductionLine(enterprise, site, area, '18-24'),
        },
        {
            label: 'Filling 24-30 (0.33l)',
            value: defaultString + '24-30',
            items: getDefaultProductionLine(enterprise, site, area, '24-30'),
        },
        {
            label: 'Filling 30-36 (0.5l)',
            value: defaultString + '30-36',
            items: getDefaultProductionLine(enterprise, site, area, '30-36'),
        },
        {
            label: 'Filling 36-42 (special)',
            value: defaultString + '36-42',
            items: getDefaultProductionLine(enterprise, site, area, '36-42'),
        }
    ]
}

let getDefaultSite = (enterprise: string, site: string) => {
    let defaultString = enterprise + "/" + site + "/";
    return [
        {
            label: 'hall_1',
            value: defaultString + 'hall_1',
            items: getDefaultArea(enterprise, site, 'hall_1')
        },
        {
            label: 'hall_2',
            value: defaultString + 'hall_2',
            items: getDefaultArea(enterprise, site, 'hall_2'),
        },
        {
            label: 'hall_3_4',
            value: defaultString + 'hall_3_4',
            items: getDefaultArea(enterprise, site, 'hall_3_4'),
        },
    ]
}


export let GetDefaultEnterprise = (enterprise: string) => {
    let defaultString = enterprise + "/";
    return [
        {
            label: 'Aachen',
            value: defaultString + 'Aachen',
            items: getDefaultSite(enterprise, 'Aachen'),
        },
        {
            label: 'Berlin',
            value: defaultString + 'Berlin',
            items: getDefaultSite(enterprise, 'Berlin'),
        },
        {
            label: 'Frankfurt',
            value: defaultString + 'Frankfurt',
            items: getDefaultSite(enterprise, 'Frankfurt'),
        },
        {
            label: 'Hamburg',
            value: defaultString + 'Hamburg',
            items: getDefaultSite(enterprise, 'Hamburg'),
        },
    ]

}

export function getDemoTimeseriesData(query: FactoryinsightQuery, from: number, to: number): MutableDataFrame {

    const fullTagName = query.fullTagName || 'undefined';
    if (fullTagName === 'undefined') {
        return new MutableDataFrame<any>();
    }

    const aggregates = query.configurationTagAggregates;
    // if aggregates is empty or undefined, then we use the default aggregates of avg
    const aggregatesToUse = aggregates ? aggregates : ['avg'];

    // if it is a tag query, return default time series data
    const isTag = (query.value?.startsWith('tags'))
    if (isTag) {
        let data = new MutableDataFrame({
            name: 'factoryinsight',
            refId: query.refId,
            fields: [],
        });

        // add time field
        data.addField({
            name: "Time",
            values: [],
        });

        // foreach aggregate in aggregatesToUse, create a new row in data.fields
        aggregatesToUse.forEach(aggregate => {
            data.addField({
                name: aggregate,
                type: FieldType.number,
                values: [],
            });
        });

        // now add some data to the dataframe for each aggregate in aggregatesToUse
        // starting from from and going to to
        // using the data.addRow function
        for (let i = from; i < to; i=i+1000) {

            let newRow: any[] = [];

            const avg = Math.random() * 100;
            aggregatesToUse.forEach(aggregate => {
                switch(aggregate) {
                    case 'avg':
                        newRow[aggregate] = avg;
                        break;
                    case 'min':
                        newRow[aggregate] = avg - Math.random()*5;
                        break;
                    case 'max':
                        newRow[aggregate] = avg + Math.random()*5;
                        break;
                    case 'count':
                        newRow[aggregate] = Math.floor(Math.random() * 100);
                        break;
                    case 'sum':
                        newRow[aggregate] = avg * Math.floor(Math.random() * 100);
                        break;

                }
            });

            data.add(
                {
                    Time: i,
                    ...newRow,
                }
            );
            }

        return data;
    }

    return new MutableDataFrame<any>();
}

export let DefaultWorkCellTags = [
    {
        label: 'temperature',
        value: 'tags/temperature',
    },
    {
        label: 'X85_3_STOER',
        value: 'tags/X85_3_STOER',
    },
    {
        label: 'X85_4_STOER',
        value: 'tags/X85_4_STOER',
    },
]

export let DefaultTags = [
    {
        label: 'outside_temperature',
        value: 'tags/outside_temperature',
    },
]
export let DefaultKPIs = [
    {label: 'OEE', value: 'kpi/oee'},
    {label: 'Availability', value: 'kpi/availability'},
    {label: 'Performance', value: 'kpi/performance'},
    {label: 'Quality', value: 'kpi/quality'},
    {label: 'Shifts', value: 'kpi/shifts'},
    {label: 'Job list', value: 'kpi/joblist'}, //equals to /orders
    {label: 'Output', value: 'kpi/output'}, // equals to /count
    {label: 'Production Speed', value: 'kpi/output_derivative'},
]