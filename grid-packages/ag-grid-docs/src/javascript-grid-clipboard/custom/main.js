var gridOptions = {
    columnDefs: [
        { field: "athlete", minWidth: 200 },
        { field: "age" },
        { field: "country", minWidth: 150 },
        { field: "year" },
        { field: "date", minWidth: 150 },
        { field: "sport", minWidth: 150 },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" }
    ],

    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        resizable: true
    },

    enableRangeSelection: true,
    rowSelection: 'multiple',

    sendToClipboard: sendToClipboard
};

function sendToClipboard(params) {
    console.log('send to clipboard called with data:');
    console.log(params.data);
}

function onBtCopyRows() {
    gridOptions.api.copySelectedRowsToClipboard();
}

function onBtCopyRange() {
    gridOptions.api.copySelectedRangeToClipboard();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
