
Plotly.newPlot('client-graph', [
    {
        y: [],
        mode: 'lines',
        name: 'Throughput (EWMA)',
        line: {color: '#622194', width: 3}
    },
    {
        y: [],
        mode: 'lines',
        name: 'Pace Rate',
        line: {color: '#B84D88', width: 3}
    },
    {
        y: [],
        mode: 'lines',
        name: 'Highest Bitrate',
        line: {color: '#E49499', width: 3}
    },
    {
        y: [],
        mode: 'markers',
        name: 'Selected Bitrate',
        line: {color: '#E49499', width: 0},
        marker: {
            shape: 'x'
        },
    }
], {
    title: 'Client-side metrics',
    xaxis: {
        title: 'Chunk Index',
        showgrid: false,
        zeroline: false
    },
    yaxis: {
        title: 'Mbps',
        rangemode: 'tozero',
        showline: false
    }
}, {responsive: true});


Plotly.newPlot('buffer-graph', [
    {
        y: [],
        mode: 'lines',
        name: 'Buffer (sec)',
        line: {color: '#622194', width: 3}
    }
], {
    title: 'Client-side buffer level',
    xaxis: {
        title: 'Chunk Index',
        showgrid: false,
        zeroline: false
    },
    yaxis: {
        title: 'Sec',
        rangemode: 'tozero',
        showline: false
    }
}, {responsive: true});

function updateClientStats(clientStats) {
    Plotly.extendTraces('client-graph', {
        y: [
            [clientStats.throughput/1000. || null],
            [clientStats.paceRate/1000.],
            [clientStats.highestBitrate/1000.],
            [clientStats.selectedBitrate/1000.],
        ]
    }, [0, 1, 2, 3]);


    Plotly.extendTraces('buffer-graph', {
        y: [
            [clientStats.bufferLevel],
        ]
    }, [0]);
}

Plotly.newPlot('rtt-graph', [
    {
        y: [],
        mode: 'lines',
        line: {color: '#622194', width: 3}
    },
], {
    title: 'Server measured RTT',
    xaxis: {
        title: 'Chunk Index',
        showgrid: false,
        zeroline: false
    },
    yaxis: {
        title: 'ms',
        rangemode: 'tozero',
        showline: false
    }
}, {responsive: true});

Plotly.newPlot('retrans-graph', [
    {
        y: [],
        mode: 'lines',
        line: {color: '#622194', width: 3}
    },
], {
    title: 'Server-side cumulative retransmitted packets',
    xaxis: {
        title: 'Chunk Index',
        showgrid: false,
        zeroline: false
    },
    yaxis: {
        title: '# Packets',
        rangemode: 'tozero',
        showline: false
    }
}, {responsive: true});

function updateServerStats(serverTiming) {
    Plotly.extendTraces('rtt-graph', {y: [[serverTiming['tcpi_rtt']/1000. || null]]}, [0]);
    Plotly.extendTraces('retrans-graph', {y: [[serverTiming['tcpi_total_retrans'] || null]]}, [0]);
}