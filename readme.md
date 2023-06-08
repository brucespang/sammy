# Sammy

## About
Video streaming traffic today takes up <a href="https://www.sandvine.com/global-internet-phenomena-report-2022">60-75% of all bytes sent on the internet</a>.
Sammy is a joint project between Netflix and Stanford researchers to make video traffic friendlier to neighboring applications sharing the same networks.

For more information, see [the research paper published at SIGCOMM 2023](/sammy.pdf)

## Dash.js Demo
This repo includes a demo of Sammy running with an unmodified version of dash.js. To view it live, please visit [the demo page.](https://sammy.brucespang.com/)

The custom VCL configuration used to set up the Fastly service [can be seen here](https://github.com/brucespang/sammy/blob/master/fastly.vcl).