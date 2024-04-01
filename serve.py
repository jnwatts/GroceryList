import http.server, ssl

server_address = ('0.0.0.0', 443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
context.load_verify_locations('./fullchain.pem')
httpd.socket = context.wrap_socket(httpd.socket, server_hostname="list.sroz.net")
httpd.serve_forever()

# httpd.socket = ssl.wrap_socket(httpd.socket,server_side=True,certfile='fullchain.pem')