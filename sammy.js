// dash.js will pick the highest bitrate <= 0.9*ewma
const safetyFactor = 0.9;

// Set up the player
var url = "https://video.brucespang.com/akamai/bbb_30fps/bbb_30fps.mpd";
var player = dashjs.MediaPlayer().create();
player.updateSettings({
    streaming: {
        abr: {
            ABRStrategy: "abrThroughput",
            bandwidthSafetyFactor: safetyFactor,
            additionalAbrRules: {
                insufficientBufferRule: false,
                switchHistoryRule: false,
                droppedFramesRule: false,
                abandonRequestsRule: false
            }
        }
    }
});

// Set up the controls
const urlParams = new URLSearchParams(window.location.search);
$("#enable-sammy").prop("checked", urlParams.get('sammy') !== "false");
$("#cc-algorithm").val(urlParams.get('cc') || 'cubic');

$('#empty-buffer-slider').slider({
    value: urlParams.get('empty') || 2.8,
    min: 0,
    max: 5,
    step: 0.1,
    create: function() {
        $('#empty-handle').text( $( this ).slider( "value" ) + "x" );
    },
    slide: function( event, ui ) {
        $('#empty-handle').text( ui.value + "x" );
    }
});

$('#full-buffer-slider').slider({
    // Pace rate when the buffer is full.
    // dash.js will pick highest bitrate <= 0.9*EWMA throughput, so ideally this would be 1/safetyFactor=1.1.
    // But set it a bit higher to deal with header overheads and such.
    value: urlParams.get('full') || 1.6,
    min: 0,
    max: 5,
    step: 0.1,
    create: function() {
        $('#full-handle').text( $( this ).slider( "value" ) + "x" );
    },
    slide: function( event, ui ) {
        $('#full-handle').text( ui.value + "x" );
    }
});

// Set the pacer
function Pacer(config) {
    function getConfig() {
        return {
            fullBufferLevel: 3.2,
            emptyBufferCoeff: $( "#empty-buffer-slider" ).slider( "value" ),
            fullBufferCoeff: $( "#full-buffer-slider" ).slider( "value" ),
        }
    }

    // Returns desired pacing rate in KBps
    function getPacingRate(bufferLevel, highestBitrate) {
        if (!$("#enable-sammy").prop('checked')) {
            return 1000000;
        }

        const config = getConfig();

        const bufferFrac = Math.min(bufferLevel / config.fullBufferLevel, 1);
        const multiplier = config.fullBufferCoeff * bufferFrac + config.emptyBufferCoeff * (1 - bufferFrac);
        
        return multiplier * highestBitrate;
    }   
    
    return {
        getPacingRate: getPacingRate
    }
}


const pacer = Pacer();

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

            xhr.setRequestHeader('CC-Algorithm', $('#cc-algorithm').find(":selected").val());

            // Update the graphs
            updateClientStats({
                bufferLevel: bufferLevel,
                throughput: throughput,
                selectedBitrate: selectedBitrate,
                highestBitrate: highestBitrate,
                paceRate: $("#enable-sammy").prop('checked') ? paceRate : undefined,
            })

            return xhr;
        },
        modifyRequestURL: function (url) {
            return url;
        }
    };
});

player.initialize(document.querySelector("#video-player"), url, true);
document.querySelector("#video-player").muted = true;