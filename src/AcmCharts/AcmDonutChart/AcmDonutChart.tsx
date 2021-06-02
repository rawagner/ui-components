/* Copyright Contributors to the Open Cluster Management project */

import React from 'react'
import { Card, CardTitle, Badge, Skeleton } from '@patternfly/react-core'
import { ChartDonut, ChartLabel, ChartLegend } from '@patternfly/react-charts'
import { makeStyles } from '@material-ui/styles'
import { useViewport } from '../AcmChartGroup'

type StyleProps = {
    danger?: boolean
    viewWidth: number
}
type Data = {
    key: string
    value: number
    isPrimary?: boolean
    isDanger?: boolean
    link?: string
}
type LegendData = {
    name?: string
    link?: string
}

/* istanbul ignore next */
const useStyles = makeStyles({
    card: {
        maxHeight: '259px',
        minWidth: (props: StyleProps) => (props.viewWidth > 376 ? '376px' : undefined),
        maxWidth: (props: StyleProps) => (props.viewWidth < 376 ? '376px' : undefined),
        '& .pf-c-chart > svg g path:last-of-type': {
            fill: (props: StyleProps) => (props.danger ? '#E62325 !important' : undefined),
        },
    },
    cardTitle: {
        paddingBottom: 'unset !important',
    },
    chartContainer: {
        maxWidth: '376px',
    },
})

export const loadingDonutChart = (title: string) => {
    const useStyles = makeStyles({
        chartContainer: {
            maxWidth: '376px',
        },
        skeleton: {
            margin: '0 0 20px 35px',
        },
    })
    const classes = useStyles()
    return (
        <Card>
            <CardTitle>{title}</CardTitle>
            <div className={classes.chartContainer}>
                <Skeleton shape="circle" width="45%" className={classes.skeleton} />
            </div>
        </Card>
    )
}

const LegendLabel = ({ ...props }: { datum?: Data }) => {
    /*istanbul ignore next */
    const link = props.datum?.link
    return link ? (
        <a href={link}>
            <ChartLabel {...props} />
        </a>
    ) : (
        <ChartLabel {...props} />
    )
}

function buildLegendWithLinks(legendData: Array<LegendData>, colorScale?: string[]) {
    return <ChartLegend data={legendData} labelComponent={<LegendLabel />} colorScale={colorScale} />
}

export function AcmDonutChart(props: {
    title: string
    description: string
    data: Array<Data>
    loading?: boolean
    colorScale?: string[]
    donutTitle?: {
        title: string
        subTitle: string
    }
}) {
    const chartData = props.data.map((d) => ({ x: d.key, y: d.value }))
    const legendData: Array<LegendData> = props.data.map((d) => ({ name: `${d.value} ${d.key}`, link: d.link }))
    const total = props.data.reduce((a, b) => a + b.value, 0)
    /* istanbul ignore next */
    const primary = props.data.find((d) => d.isPrimary) || { key: '', value: 0 }
    let donutTitle = ''
    if (props.donutTitle) {
        donutTitle = props.donutTitle.title
    } else if (total === 0) {
        donutTitle = '0%'
    } else {
        donutTitle = `${Math.round((primary.value / total) * 100)}%`
    }

    const { viewWidth } = useViewport()
    const classes = useStyles({ ...props, danger: props.data.some((d) => d.isDanger), viewWidth } as StyleProps)

    if (props.loading) return loadingDonutChart(props.title)
    return (
        <Card className={classes.card} id={`${props.title.toLowerCase().replace(/\s+/g, '-')}-chart`}>
            <CardTitle className={classes.cardTitle}>
                {props.title} <Badge isRead>{total}</Badge>
            </CardTitle>
            <div className={classes.chartContainer}>
                <ChartDonut
                    ariaTitle={props.title}
                    ariaDesc={props.description}
                    legendOrientation="vertical"
                    legendPosition="right"
                    constrainToVisibleArea={true}
                    data={chartData}
                    legendData={legendData}
                    legendComponent={buildLegendWithLinks(legendData, props.colorScale)}
                    labels={({ datum }) => `${datum.x}: ${((datum.y / total) * 100).toFixed(2)}%`}
                    padding={{
                        bottom: 20,
                        left: 20,
                        right: 145,
                        top: 20,
                    }}
                    title={donutTitle}
                    subTitle={props.donutTitle?.subTitle ?? primary.key}
                    width={/* istanbul ignore next */ viewWidth < 376 ? viewWidth : 376}
                    height={/* istanbul ignore next */ viewWidth < 376 ? 150 : 200}
                    // Devs can supply an array of colors the donut chart will use ex: ['#E62325', '#EC7A08', '#F4C145', '#2B9AF3', '#72767B']
                    // Defaults to blue theme
                    colorScale={props.colorScale}
                />
            </div>
        </Card>
    )
}
