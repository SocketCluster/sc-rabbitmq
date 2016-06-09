# SC-RabbitMQ
RabbitMQ adapter for SocketCluster
======

This is a RabbitMQ adapter for SocketCluster: http://socketcluster.io/
It allows you to interact with SocketCluster channels via RabbitMQ and vice-versa and allows
multiple distributed SC instances to share channels with each other via RabbitMQ.

## Install

```bash
npm install sc-rabbitmq
```

Make sure that you have the latest version of SocketCluster installed.

## Usage

Put the following code inside the SocketCluster sample app - Inside **broker.js**:

```js
var scRabbit = require('sc-rabbitmq');

module.exports.run = function (broker) {
  console.log('   >> Broker PID:', process.pid);
  scRabbit.attach(broker);
};
```

You will need to provide some brokerOptions to SocketCluster (in **server.js**) - These will automatically be added as an options property on your broker object.
Example (substitute with relevant values):

```js
var socketCluster = new SocketCluster({
  // ...
  brokerOptions: {
    host: '54.204.147.15',
    port: 5672
  }
});
```

Note that SC-RabbitMQ uses the Node AMQP client to hook into RabbitMQ.
Any option described here: https://www.npmjs.com/package/amqp#connection-options-and-url can be provided as a broker option - In production you may want to provide the 'login' and 'password' properties.

Feel free to modify server.js to get some of these options from the command line if appropriate (instead of having them hard-coded inside server.js).

To test, you need to launch a RabbitMQ broker (on the host and port you specified in brokerOptions).
Then you need to launch your SC server using (make sure your RabbitMQ broker is running before you launch your SC instance):

```bash
node server
```

Open your browser window and connect to your SC server... By default it's at: http://localhost:8000/ - Then open the developer console.
Note that your client will subscribe to a 'pong' channel on SocketCluster. SC-RabbitMQ will automatically handle all the synchronization work.

On the host on which your RabbitMQ broker is running, you can interact with it using any AMQP client (e.g. https://www.npmjs.com/package/amqp).
When publishing to RabbitMQ, use `'application/json'` as the `contentType` option.

You should see the object appear in your browser's developer console (from SocketCluster client).


## Contributing

SC-RabbitMQ is currently 'experimental'. It still needs a bit of polishing before you can use it in production.

- Better error logging (capture errors from AMQP client and emit 'error' on broker object?)
- Reconnect behavior (in case AMQP client connection drops out).

Pull requests are welcome.


## License

(The MIT License)

Copyright (c) 2013-2015 SocketCluster

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
