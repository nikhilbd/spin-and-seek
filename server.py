"""Lightweight HTTP server for Spin & Seek: The Cluttered Curiosity Room."""

import http.server
import os
import socket
import socketserver
import sys

PORT = int(os.environ.get("PORT", "8888"))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):

  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=DIRECTORY, **kwargs)

  def end_headers(self):
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
    super().end_headers()


class ReusableTCPServer(socketserver.TCPServer):
  allow_reuse_address = True


def run():
  port = PORT
  while port < PORT + 50:
    try:
      with ReusableTCPServer(("", port), Handler) as httpd:
        host = socket.getfqdn()
        print(f"Server started at http://{host}:{port}/")
        print(f"Local URL: http://localhost:{port}/")
        sys.stdout.flush()
        httpd.serve_forever()
    except OSError as e:
      if e.errno == 98:  # Address already in use
        port += 1
      else:
        raise


if __name__ == "__main__":
  run()
