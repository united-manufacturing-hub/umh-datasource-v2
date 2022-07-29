import {FactoryinsightQuery} from "./types";
import {FieldType, MutableDataFrame} from "@grafana/data";
import {CascaderOption} from "@grafana/ui";

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

    var aggregates = query.configurationTagAggregates;
    // if aggregates is empty or undefined, then we use the default aggregates of avg
    if (!aggregates || aggregates.length === 0) {
        aggregates = ['avg'];
    }

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
        aggregates.forEach(aggregate => {
            data.addField({
                name: aggregate,
                type: FieldType.number,
                values: [],
            });
        });

        // now add some data to the dataframe for each aggregate in aggregatesToUse
        // starting from from and going to to
        // using the data.addRow function
        for (let i = from; i < to; i = i + 1000) {

            let newRow: any[] = [];

            const avg = Math.random() * 100;
            aggregates.forEach(aggregate => {
                switch (aggregate) {
                    case 'avg':
                        newRow[aggregate] = avg;
                        break;
                    case 'min':
                        newRow[aggregate] = avg - Math.random() * 5;
                        break;
                    case 'max':
                        newRow[aggregate] = avg + Math.random() * 5;
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
    } else if (query.value === 'table/finished_jobs') {
        let data = new MutableDataFrame({
            name: 'factoryinsight',
            refId: query.refId,
            meta: {
                preferredVisualisationType: 'table',
            },
            fields: [],
        });

        // add Job ID field
        data.addField({
            name: "Job ID",
            values: ["107117",
                "107118",
                "107792",
                "107793",
                "107119",
                "107796",
                "107829",
                "107782",
                "107765",
                "107823",
                "107799",
                "107791"],
        });

        // add product ID field
        data.addField({
            name: "Product ID",
            values: ["product107117",
                "product107118",
                "product107792",
                "product107793",
                "product107119",
                "product107796",
                "product107829",
                "product107782",
                "product107765",
                "product107823",
                "product107799",
                "product107791"],
        });

        // add begin timestamp field
        data.addField({
            name: "Begin",
            values: [1606089943000,
                1606094730000,
                1606243321000,
                1606255888000,
                1606265579000,
                1606269189000,
                1606330275000,
                1606340592000,
                1606352142000,
                1606357912000,
                1606362037000,
                1606407827000],
            type: FieldType.time,
        });

        // add end timestamp field
        data.addField({
            name: "End",
            values: [1606094711000,
                1606100771000,
                1606253181000,
                1606265565000,
                1606267349000,
                1606279029000,
                1606332283000,
                1606348944000,
                1606357896000,
                1606360297000,
                1606367208000,
                1606416662000],
            type: FieldType.time,
        });

        // add target units field
        data.addField({
            name: "Target Units",
            values: [1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1],
        });

        // add actual units field
        data.addField({
            name: "Actual Units",
            values: [0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0],
        });

        // add target duration field
        data.addField({
            name: "Target Duration",
            values: [0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0],
            type: FieldType.number,
        });

        // add actual duration field
        data.addField({
            name: "Actual Duration",
            values: [4768,
                6041,
                9860,
                9677,
                1770,
                9840,
                2008,
                8352,
                5754,
                2385,
                5171,
                8835],
            type: FieldType.number,
        });

        // add producing field
        data.addField({
            name: "Producing",
            values: [2199,
                1446,
                6197,
                4665,
                1233,
                5825,
                1001,
                2599,
                2370,
                1337,
                2840,
                5836],
            type: FieldType.number,
        });
        return data
    }

    return new MutableDataFrame<any>();
}

export let DefaultWorkCellTags = [
    {
        label: 'Automated',
        value: 'tags/automated',
        items: [
            {
                label: 'State',
                value: 'tags/automated/state',
            },
            {
                label: 'Shifts',
                value: 'tags/automated/shifts',
            },
            {
                label: 'Orders',
                value: 'tags/automated/orders',
            },
        ]
    },
    {
        label: 'Custom',
        value: 'tags/custom',
        items: [
            {
                label: 'temperature',
                value: 'tags/custom/temperature',
            },
            {
                label: 'X85_3_STOER',
                value: 'tags/custom/X85_3_STOER',
            },
            {
                label: 'X85_4_STOER',
                value: 'tags/custom/X85_4_STOER',
            },
        ]
    },
]

export let DefaultTags = [
    {
        label: 'Custom',
        value: 'tags/custom',
        items: [
            {
                label: 'outside_temperature',
                value: 'tags/custom/outside_temperature',
            },
        ]
    },
]

let DefaultOEE: CascaderOption =
    {
        label: 'OEE',
        value: 'kpi/oee',
        items: [
            {
                label: 'Availability',
                value: 'kpi/oee/availability',
                //description: "The availability of the equipment as defined in the configuration. To drill-down, use the shopfloorLosses table.",
            },
            {
                label: 'Performance',
                value: 'kpi/oee/performance',
                //description: "The performance of the equipment as defined in the configuration. To drill-down, use the shopfloorLosses table.",
            },
            {
                label: 'Quality',
                value: 'kpi/oee/quality',
                //description: "The quality of the equipment as defined in the configuration. To drill-down, use the shopfloorLosses table.",
            },
        ]
    }

export let DefaultKPIs: CascaderOption[] = [
    DefaultOEE,
    {
        label: 'Throughput',
        value: 'kpi/throughput',
        //description: "Output / time. Also known as production speed.",
    }, //equals to production speed
    {
        label: 'Quality Rate',
        value: 'kpi/quality_rate',
        //description: "Good units / total units.",
    }, //equals to production speed
    {
        label: 'Accumulated output',
        value: 'kpi/accumulated_output',
        //description: "Total output of the machine over time.",
    }, // equals to /count
]

export let DefaultTables = [
    {
        label: 'Shopfloor losses',
        value: 'table/shopfloor_losses',
        //description: "Used to drill-down into OEE.",
        items: [
            {
                label: 'Duration',
                value: 'table/shopfloor_losses/duration',
                //description: "Duration of all shopfloor losses.",
            },
            {
                label: 'Frequency / histogram',
                value: 'table/shopfloor_losses/histogram',
                //description: "Frequency of all shopfloor losses.",
            }
            ]
    },
    {
        label: 'Finished jobs',
        value: 'table/finished_jobs',//equals to orderTable
        //description: "Table of finished orders including their duration and their shopfloor losses.",
    },
    {
        label: 'Open jobs',
        value: 'table/open_jobs',//equals to /nstartedOrderTable
        //description: "Table of unstarted orders including.",
    },
    {
        label: "Products",
        value: 'table/products',
        //description: "Table of products.",
    },
    {
        label: 'Shifts',
        value: 'table/shifts',
        //description: "Table of shifts.",
    },

]