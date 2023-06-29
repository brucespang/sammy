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

Plotly.newPlot('retrans-graph', [], {
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

const connIds = {};
var chunkIdx = 0;
function updateServerStats(serverTiming) {
    const addr = serverTiming['client-ip'] + ":" + serverTiming['client-port'];
    if (connIds[addr] === undefined) {
        connIds[addr] = Object.keys(connIds).length;
        Plotly.addTraces('retrans-graph', {x: [], y: [], name: 'Conn. ' + addr}, [connIds[addr]])
    }
    const connId = connIds[addr];
    Plotly.extendTraces('rtt-graph', {y: [[serverTiming['tcpi_rtt']/1000. || null]]}, [0]);
    Plotly.extendTraces('retrans-graph', {x: [[chunkIdx]],  y: [[serverTiming['tcpi_total_retrans'] || null]]}, [connId]);
    chunkIdx += 1;
}

// Parses Server-Timing responses
function parseServerTiming(serverTiming) {
    const stats = (serverTiming || "").split(",").reduce(function(map, x) {
    const split = x.split(";");
    if (split.length != 2) {
        return;
    }
    
    const key = split[0];
    const val = split[1].split("=")[1];
    const parsed = parseInt(val);
    if (isNaN(parsed) || ["client-ip"].includes(key)) {
        map[key] = val;
    } else {
        map[key] = parsed;
    }
    return map;
    }, {});

    return stats;
}

// Add a hook to log server timing headers on each HTTP response
var origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {
    this.addEventListener('load', function() {
        const serverTiming = this.getResponseHeader('server-timing');
        if (serverTiming) {
            updateServerStats(parseServerTiming(serverTiming));
        }
    });
    origOpen.apply(this, arguments);
};