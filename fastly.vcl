sub vcl_recv {
  #FASTLY recv;

  if (std.atoi(req.http.Pacing-Rate-KBps) > 0) {
    set client.socket.pace = std.atoi(req.http.Pacing-Rate-KBps);
  }

  return (lookup);
}

sub vcl_deliver {
  #FASTLY deliver;

  if (req.http.CC-Algorithm) {
    set client.socket.congestion_algorithm = req.http.CC-Algorithm;
  }

  set resp.http.Access-Control-Allow-Origin = "*";
  set resp.http.Access-Control-Allow-Headers = "*";
  set resp.http.Access-Control-Expose-Headers = "*";
  set resp.http.Timing-Allow-Origin = "*";
  
  set resp.http.Pacing-Rate-KBps = client.socket.pace;
  set resp.http.Server-Timing =
    "client-ip;desc=" client.ip
    ",client-port;desc=" client.port
    ",time-start-msec;dur=" time.start.msec
    ",time-elapsed;dur=" time.elapsed.msec
    ",fastly-pop;desc=" server.datacenter
    ",hit-state;desc=" fastly_info.state
    ",tcpi_advmss;desc=" client.socket.tcpi_advmss
    ",tcpi_bytes_acked;desc=" client.socket.tcpi_bytes_acked
    ",tcpi_bytes_received;desc=" client.socket.tcpi_bytes_received
    ",tcpi_data_segs_in;desc=" client.socket.tcpi_data_segs_in
    ",tcpi_data_segs_out;desc=" client.socket.tcpi_data_segs_out
    ",tcpi_delivery_rate;desc=" client.socket.tcpi_delivery_rate
    ",tcpi_delta_retrans;desc=" client.socket.tcpi_delta_retrans
    ",tcpi_last_data_sent;desc=" client.socket.tcpi_last_data_sent
    ",tcpi_max_pacing_rate;desc=" client.socket.tcpi_max_pacing_rate
    ",tcpi_min_rtt;desc=" client.socket.tcpi_min_rtt
    ",tcpi_notsent_bytes;desc=" client.socket.tcpi_notsent_bytes
    ",tcpi_pacing_rate;desc=" client.socket.tcpi_pacing_rate
    ",tcpi_pmtu;desc=" client.socket.tcpi_pmtu
    ",tcpi_rcv_mss;desc=" client.socket.tcpi_rcv_mss
    ",tcpi_rcv_rtt;desc=" client.socket.tcpi_rcv_rtt
    ",tcpi_rcv_space;desc=" client.socket.tcpi_rcv_space
    ",tcpi_rcv_ssthresh;desc=" client.socket.tcpi_rcv_ssthresh
    ",tcpi_reordering;desc=" client.socket.tcpi_reordering
    ",tcpi_rtt;desc=" client.socket.tcpi_rtt
    ",tcpi_rttvar;desc=" client.socket.tcpi_rttvar
    ",tcpi_segs_in;desc=" client.socket.tcpi_segs_in
    ",tcpi_segs_out;desc=" client.socket.tcpi_segs_out
    ",tcpi_snd_cwnd;desc=" client.socket.tcpi_snd_cwnd
    ",tcpi_snd_mss;desc=" client.socket.tcpi_snd_mss
    ",tcpi_snd_ssthresh;desc=" client.socket.tcpi_snd_ssthresh
    ",tcpi_total_retrans;desc=" client.socket.tcpi_total_retrans
  ;
  set resp.http.x-trailer-server-timing = "rtt,timestamp,retrans";
}
