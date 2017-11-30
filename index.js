var WebSocket = require('faye-websocket');
var program = require('commander');
var defaults = { time: 60, count: 10, url: 'ws://lvh.me:3001/websocket' };

program
    .version('0.0.1')
    .option('-t, --time <n>', 'How long to keep connection open (in seconds)', parseInt)
    .option('-c, --count <n>', 'How many connections to create', parseInt)
    .option('-u, --url [url]', 'The url to smash')
    .parse(process.argv);

var time = program.time || defaults.time;
var count = program.count || defaults.count;
var url = program.url || defaults.url;

start(0);
function start(numberRun) {
    setTimeout(function(){
        if (numberRun < count) {
            newClient();
            start(numberRun+1);
        }
    }, 500);
}

function newClient(){
		var channel = getRandomChannel();
    var ws = new WebSocket.Client(url);
    ws.on('open', function(event) {
        console.log('open');
        var subscribeMsg = ["websocket_rails.subscribe",
                            { id: Date.now().toString(),
                              data: {
                                  channel: channel
                              }
                            }
                           ];

        ws.send(JSON.stringify(subscribeMsg));

    });

    ws.on('message', function(event) {
        var msg = JSON.parse(event.data);
        if (msg[0] && msg[0][0] === 'websocket_rails.ping') {
            var pongMsg = ["websocket_rails.pong", {id: Date.now().toString(), data: {}}]
            ws.send(JSON.stringify(pongMsg));
				}
    });

    ws.on('close', function(event) {
        console.log('Close: ', event.code, event.reason, event.data);
        if(timeoutId) {
            clearTimeout(timeoutId);
        }
    });

    ws.on('error', function(event) {
        console.log('Error: ', event.code, event.reason, event.data);
        if(timeoutId) {
            clearTimeout(timeoutId);
        }
    });

    var timeoutId = setTimeout(function() {
        ws.close();
    }, time*1000);
}

function getRandomChannel(){
  var channels = ['checkins', 'election', 'messages', 'nav_alerts']
  var number = Math.round(Math.random()*100)
  var channel = channels[Math.floor(Math.random()*channels.length)];
  return channel + "_" + number;
}
