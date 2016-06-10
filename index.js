var amqp = require('amqp');

module.exports.attach = function (broker) {
  var brokerOptions = broker.options.brokerOptions;
  var instanceId = broker.instanceId;

  var resetErrorHandler = function (client) {
    client.removeAllListeners('error');
    client.on('error', function (err) {
      broker.emit('error', err);
    });
  };

  var destroyChannelExchange = function (channelName) {
    var rabbitExchange = rabbitClient.exchange(channelName, {noDeclare: true, passive: true});
    resetErrorHandler(rabbitClient);
    var rabbitQueue = rabbitClient.queue('', {exclusive: true});
    rabbitExchange.destroy();
  };

  var queueMap = {};

  var rabbitClient = amqp.createConnection(brokerOptions);

  rabbitClient.on('ready', function () {
    broker.on('subscribe', function (channelName) {
      rabbitClient.exchange(channelName, {type: 'fanout', durable: true, autoDelete: false}, function (rabbitExchange) {
        if (!queueMap[channelName]) {
          queueMap[channelName] = rabbitClient.queue('', {exclusive: true}, function (rabbitQueue) {
            rabbitQueue.bind(rabbitExchange, '');
            rabbitQueue.subscribe(function (packet) {
              if (packet && packet.instanceId != instanceId) {
                broker.publish(channelName, packet.data);
              }
            })
          });
        }
      });
    });
    broker.on('unsubscribe', function (channelName) {
      destroyChannelExchange(channelName);
    });
    broker.on('publish', function (channelName, data) {
      var packet = {
        instanceId: instanceId,
        data: data
      };
      rabbitClient.exchange(channelName, {type: 'fanout', durable: true, autoDelete: false}, function (rabbitExchange) {
        rabbitExchange.publish('', packet, {
          contentType: 'application/json'
        });
      });
    });
  });
};
