import { ChartBuilder } from "../../../builder/chartBuilder";
import { DoughnutChartOptions, CaptionOptions, _ } from "ag-grid-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PieSeries } from "../../../../charts/chart/series/pieSeries";
import { PolarChartProxy } from "./polarChartProxy";

export class DoughnutChartProxy extends PolarChartProxy<DoughnutChartOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder.createDoughnutChart(params.parentElement, this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const doughnutChart = this.chart;
        const fieldIds = params.fields.map(f => f.colId);
        const seriesMap: { [id: string]: PieSeries } = {};

        doughnutChart.series.forEach(series => {
            const pieSeries = series as PieSeries;
            const id = pieSeries.angleField;

            if (_.includes(fieldIds, id)) {
                seriesMap[id] = pieSeries;
            }
        });

        const seriesOptions = this.chartOptions.seriesDefaults!;
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

        // Use `Object.create` to prevent mutating the original user config that is possibly reused.
        const title = (seriesOptions.title ? Object.create(seriesOptions.title) : {}) as CaptionOptions;
        seriesOptions.title = title;

        let offset = 0;

        params.fields.forEach((f, index) => {
            const existingSeries = seriesMap[f.colId];

            title.text = f.displayName;

            seriesOptions.angleField = f.colId;
            seriesOptions.showInLegend = index === 0; // show legend items for the first series only

            const calloutColors = seriesOptions.calloutColors;
            const pieSeries = existingSeries || ChartBuilder.createSeries(seriesOptions) as PieSeries;

            pieSeries.labelField = params.category.id;
            pieSeries.data = params.data;
            pieSeries.fills = fills;
            pieSeries.strokes = strokes;

            // Normally all series provide legend items for every slice.
            // For our use case, where all series have the same number of slices in the same order with the same labels
            // (all of which can be different in other use cases) we don't want to show repeating labels in the legend,
            // so we only show legend items for the first series, and then when the user toggles the slices of the
            // first series in the legend, we programmatically toggle the corresponding slices of other series.
            if (index === 0) {
                pieSeries.toggleSeriesItem = (itemId: any, enabled: boolean) => {
                    const chart = pieSeries.chart;

                    if (chart) {
                        chart.series.forEach(series => {
                            (series as PieSeries).dataEnabled[itemId] = enabled;
                        });
                    }

                    pieSeries.scheduleData();
                };
            }

            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;

            if (calloutColors) {
                pieSeries.calloutColors = calloutColors;
            }

            if (!existingSeries) {
                seriesMap[f.colId] = pieSeries;
            }
        });

        // Because repaints are automatic, it's important to remove/add/update series at once,
        // so that we don't get painted twice.
        doughnutChart.series = _.values(seriesMap);
    }

    protected getDefaultOptions(): DoughnutChartOptions {
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const labelColor = this.getLabelColor();
        const labelFontWeight = 'normal';
        const labelFontSize = 12;
        const labelFontFamily = 'Verdana, sans-serif';

        return {
            background: {
                fill: this.getBackgroundColor()
            },
            width: 800,
            height: 400,
            padding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            legendPosition: 'right',
            legendPadding: 20,
            legend: {
                enabled: true,
                labelFontWeight,
                labelFontSize,
                labelFontFamily,
                labelColor,
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerStrokeWidth: 1
            },
            seriesDefaults: {
                type: 'pie',
                fills,
                strokes,
                strokeWidth: 1,
                strokeOpacity: 1,
                fillOpacity: 1,
                calloutColors: strokes,
                calloutLength: 10,
                calloutStrokeWidth: 1,
                labelOffset: 3,
                labelEnabled: false,
                labelFontWeight,
                labelFontSize,
                labelFontFamily,
                labelColor,
                labelMinAngle: 0,
                tooltipEnabled: true,
                showInLegend: true,
                shadow: {
                    enabled: false,
                    blur: 5,
                    xOffset: 3,
                    yOffset: 3,
                    color: 'rgba(0, 0, 0, 0.5)'
                }
            }
        };
    }
}
