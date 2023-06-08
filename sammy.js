// dash.js will pick highest bitrate <= 0.9*EWMA throughput
const safetyFactor = 0.9;

// Set up the player
var url = "http://video.brucespang.com.global.prod.fastly.net/akamai/bbb_30fps/bbb_30fps.mpd";
var player = dashjs.MediaPlayer().create();
player.updateSettings({
    streaming: {
        abr: {
            ABRStrategy: "abrThroughput",
            bandwidthSafetyFactor: safetyFactor
        }
    }
});

function Pacer(config) {
    // Returns desired pacing rate in KBps
    function getPacingRate(bufferLevel, highestBitrate) {
        const bufferFrac = Math.min(bufferLevel / config.fullBufferLevel, 1);
        const multiplier = config.fullBufferCoeff * bufferFrac + config.emptyBufferCoeff * (1 - bufferFrac);
        
        return multiplier * highestBitrate;
    }   
    
    return {
        getPacingRate: getPacingRate
    }
}

const pacer = Pacer({
    fullBufferLevel: 15,
    emptyBufferCoeff: 3,
    // Pace rate when the buffer is full is set a bit higher than the safety factor
    // to deal with header overheads and such
    fullBufferCoeff: 1.2/safetyFactor, 
});

// When issuing a chunk request, pick a pace rate and add a header to ask the CDN to pace
player.extend("RequestModifier", function () {
    return {
        modifyRequestHeader: function (xhr) {
            // Collect necessary stats from the player
            const bufferLevel = player.getBufferLength();
            const bitrateInfos = player.getBitrateInfoListFor("video");
            if (bitrateInfos.length == 0) {
                return xhr;
            }
            const selectedIdx = player.getQualityFor("video");

            const selectedBitrate = bitrateInfos[selectedIdx].bitrate / 1000;
            const bitrates = bitrateInfos.map(function (x) { return x.bitrate });
            const highestBitrate = Math.max(...bitrates) / 1000;
            const throughput = player.getAverageThroughput("video");

            // Pick the pace rate
            var paceRate = pacer.getPacingRate(player.getBufferLength(), highestBitrate);

            // Set the pacing rate header the CDN will use to pace
            if (paceRate) {
                xhr.setRequestHeader('Pacing-Rate-KBps', parseInt(paceRate/8));
            }

            // Update the graphs
            updateClientStats({
                bufferLevel: bufferLevel,
                throughput: throughput,
                selectedBitrate: selectedBitrate,
                highestBitrate: highestBitrate,
                paceRate: paceRate,
            })

            return xhr;
        },
        modifyRequestURL: function (url) {
            return url;
        }
    };
});

player.initialize(document.querySelector("#video-player"), url, true);