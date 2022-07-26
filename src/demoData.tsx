
    var getDefaultProductionLine = (enterprise: string, site: string, area: string, productionLine: string) => {
        var defaultString = enterprise+"/"+site+"/"+area+"/"+productionLine+"/";
        return [
            {
                label: 'KZE',
                value: defaultString+'KZE',
            },
            {
                label: 'Filler',
                value: defaultString+'filler',
            },
            {
                label: 'Labeler',
                value: defaultString+'labeler',
            },
            {
                label: 'Packer',
                value: defaultString+'packer',
            },
            {
                label: 'Palletizer',
                value: defaultString+'palletizer',
            }
        ]
    }

    var getDefaultArea = (enterprise: string, site: string, area: string) => {
        var defaultString = enterprise+"/"+site+"/"+area+"/";
        return [
            {
                label: 'Filling 12-18 (0.33l)',
                value: defaultString+'12-18',
                items: getDefaultProductionLine(enterprise, site, area, '12-18')
            },
            {
                label: 'Filling 18-24 (0.33l)',
                value: defaultString+'18-24',
                items: getDefaultProductionLine(enterprise, site, area, '18-24'),
            },
            {
                label: 'Filling 24-30 (0.33l)',
                value: defaultString+'24-30',
                items: getDefaultProductionLine(enterprise, site, area, '24-30'),
            },
            {
                label: 'Filling 30-36 (0.5l)',
                value: defaultString+'30-36',
                items: getDefaultProductionLine(enterprise, site, area, '30-36'),
            },
            {
                label: 'Filling 36-42 (special)',
                value: defaultString+'36-42',
                items: getDefaultProductionLine(enterprise, site, area, '36-42'),
            }
        ]
    }

    var getDefaultSite = (enterprise: string, site: string) => {
        var defaultString = enterprise+"/"+site+"/";
        return [
            {
                label: 'hall_1',
                value: defaultString+'hall_1',
                items: getDefaultArea(enterprise, site, 'hall_1')
            },
            {
                label: 'hall_2',
                value: defaultString+'hall_2',
                items: getDefaultArea(enterprise, site, 'hall_2'),
            },
            {
                label: 'hall_3_4',
                value: defaultString+'hall_3_4',
                items: getDefaultArea(enterprise, site, 'hall_3_4'),
            },
        ]
    }


    export var GetDefaultEnterprise = (enterprise: string) => {
        var defaultString = enterprise+"/";
        return [
            {
                label: 'Aachen',
                value: defaultString+'Aachen',
                items: getDefaultSite(enterprise, 'Aachen'),
            } ,
            {
                label: 'Berlin',
                value: defaultString+'Berlin',
                items: getDefaultSite(enterprise, 'Berlin'),
            },
            {
                label: 'Frankfurt',
                value: defaultString+'Frankfurt',
                items: getDefaultSite(enterprise, 'Frankfurt'),
            },
            {
                label: 'Hamburg',
                value: defaultString+'Hamburg',
                items: getDefaultSite(enterprise, 'Hamburg'),
            },
        ]

    }

    export var DefaultWorkCellTags = [
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

    export var DefaultTags = [
        {
            label: 'outside_temperature',
            value: 'tags/outside_temperature',
        },
    ]
    export var DefaultKPIs = [
        { label: 'OEE', value: 'kpi/oee' },
        { label: 'Availability', value: 'kpi/availability' },
        { label: 'Performance', value: 'kpi/performance' },
        { label: 'Quality', value: 'kpi/quality' },
        { label: 'Shifts', value: 'kpi/shifts' },
        { label: 'Job list', value: 'kpi/joblist' }, //equals to /orders
        { label: 'Output', value: 'kpi/output' }, // equals to /count
        { label: 'Production Speed', value: 'kpi/output_derivative' },
    ]