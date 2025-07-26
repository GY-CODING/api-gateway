const { createProxyServer } = require('http-proxy');

function setupWebSocketProxy(servicePath, server) {
  const wsProxy = createProxyServer({
    target: `ws://${servicePath}`,
    ws: true,
  });

  server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/ws/chat')) {
      console.log('Proxying WebSocket: ', req.url);
      wsProxy.ws(req, socket, head);
    } else {
      socket.destroy(); // Rechazar si no es un path válido
    }
  });
}

module.exports = setupWebSocketProxy;
