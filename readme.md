# Sammy

## About
Video streaming traffic today takes up <a href="https://www.sandvine.com/global-internet-phenomena-report-2022">60-75% of all bytes sent on the internet</a>.
Sammy is a joint project between Netflix and Stanford researchers to make video traffic friendlier to neighboring applications sharing the same networks.

For more information, see [the research paper published at SIGCOMM 2023](/sammy.pdf)

## Dash.js Demo
This repo includes a demo of Sammy running with an unmodified version of dash.js. To view it live, please visit [the demo page.](https://sammy.brucespang.com/). To run it locally, clone the repository and open the [index.html](https://github.com/brucespang/sammy/blob/main/index.html) file in your favorite web browser. To make changes to the algorithm, edit the [sammy.js](https://github.com/brucespang/sammy/blob/main/sammy.js) file.

On the server-side, the demo uses the [Fastly](https://www.fastly.com/) content delivery network to serve the video and set the requested pace rate. You can set up your own Fastly service (with a free trial for small amounts of traffic) if you want to change anything on the server side. Fastly has a good [getting started guide](https://docs.fastly.com/en/guides/start-here), and the custom VCL configuration we used for the service [can be seen in the repo](https://github.com/brucespang/sammy/blob/master/fastly.vcl).
