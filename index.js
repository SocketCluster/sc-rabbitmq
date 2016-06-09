var _ = require('lodash');
var amqp = require('amqp');

module.exports.attach = function (broker) {
  var brokerOptions = broker.options.brokerOptions;
  var instanceId = broker.instanceId;

  var channelQueueMap = {};

  var rabbitClient = amqp.createConnection(brokerOptions);
  rabbitClient.on('ready', function () {
    broker.on('subscribe', function (channelName) {
      if (!channelQueueMap[channelName]) {
        rabbitClient.queue(channelName, function (rabbitQueue) {
          rabbitQueue.subscribe(function (packet) {
            if (packet && packet.instanceId != instanceId) {
              broker.publish(channelName, packet.data);
            }
          }).addCallback(function (ok) {
            channelQueueMap[channelName] = {
              consumerTag: ok.consumerTag
            };
          });
        });
      }
    });
    broker.on('unsubscribe', function (channelName) {
      var rabbitQueue = rabbitClient.queue(channelName);
      if (rabbitQueue && channelQueueMap[channelName]) {
        rabbitQueue.unsubscribe(channelQueueMap[channelName].consumerTag);
        delete channelQueueMap[channelName];
      }
    });
    broker.on('publish', function (channelName, data) {
      var packet = {
        instanceId: instanceId,
        data: data
      };
      rabbitClient.publish(channelName, packet, {
        contentType: 'application/json'
      });
    });
  });
};
