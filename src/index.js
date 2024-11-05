const lcjs = require('@lightningchart/lcjs')
const { lightningChart, Themes, LUT, regularColorSteps, LegendBoxBuilders } = lcjs

const exampleContainer = document.getElementById('chart') || document.body
if (exampleContainer === document.body) {
    exampleContainer.style.width = '100vw'
    exampleContainer.style.height = '100vh'
    exampleContainer.style.margin = '0px'
}
const containerChart1 = document.createElement('div')
const containerChart2 = document.createElement('div')
exampleContainer.append(containerChart1)
exampleContainer.append(containerChart2)
containerChart1.style.width = '100%'
containerChart1.style.height = '50%'
containerChart2.style.width = '100%'
containerChart2.style.height = '50%'

const lc = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
const parallelCoordinateChart = lc
    .ParallelCoordinateChart({
        container: containerChart1,
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('Double click on axis to filter')

const dataGrid = lc
    .DataGrid({
        container: containerChart2,
        // theme: Themes.darkGold
    })
    .setTitle('')

fetch(document.head.baseURI + 'examples/assets/1702/machine-learning-accuracy-data.json')
    .then((r) => r.json())
    .then((data) => {
        const theme = parallelCoordinateChart.getTheme()
        const Axes = {
            batch_size: 0,
            channels_one: 1,
            learning_rate: 2,
            accuracy: 3,
        }
        parallelCoordinateChart.setAxes(Axes)
        parallelCoordinateChart.getAxis(Axes.accuracy).setInterval({ start: 0, end: 1 })
        parallelCoordinateChart.setLUT({
            axis: parallelCoordinateChart.getAxis(Axes.accuracy),
            lut: new LUT({
                interpolate: true,
                steps: regularColorSteps(0, 1, theme.examples.badGoodColorPalette),
            }),
        })
        data.forEach((sample) => parallelCoordinateChart.addSeries().setData(sample))

        const legend = parallelCoordinateChart.addLegendBox(LegendBoxBuilders.VerticalLegendBox).add(parallelCoordinateChart)
        parallelCoordinateChart.setPadding({ right: 140 })

        // Display data of parallel coordinate chart selected series using Data Grid
        parallelCoordinateChart.onSelectedSeriesChanged((_, selectedSeries) => {
            selectedSeries.sort((a, b) => b.getData()['accuracy'] - a.getData()['accuracy'])
            const tableContent = [['batch_size', 'channels_one', 'learning_rate', 'accuracy']]
            selectedSeries.forEach((series) => {
                const data = series.getData()
                const row = []
                tableContent.push(row)
                row.push(Math.round(data['batch_size']))
                row.push(Math.round(data['channels_one']))
                row.push(data['learning_rate'].toFixed(3))
                row.push(data['accuracy'].toFixed(3))
            })
            dataGrid
                .removeCells()
                .setTableContent(tableContent)
                .setRowTextFont(0, (font) => font.setWeight('bold'))
        })

        // Add range selector programmatically.
        // Range selectors can also be added by double clicking on any Axis.
        // Similarly, existing range selectors can be moved by dragging on them, or removed by double clicking on them.
        parallelCoordinateChart.getAxis(Axes.accuracy).addRangeSelector().setInterval(0.85, 1.0)
    })
