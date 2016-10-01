(function(){
'use strict';

var PLOT_WORKER_PATH = '/src/plot/index.worker.js';
var PLOT_CLASSNAME = 'plot';
var PLOT_CONTAINER_ID = 'plots';
var LOGS_CONTAINER_ID = 'output';


var workers = {};

function log (msg) {
  var output = document.getElementById(LOGS_CONTAINER_ID);
  if (output) {
    output.textContent = msg + '\n' + output.textContent;
  }
  console.log(msg);
}

function loadText (url, callback) {

  var xhr = new XMLHttpRequest();
  xhr.onload = function() {

    if (xhr.status === 200) {
      // TODO: error handling
      callback(xhr.responseText);
    }
  };

  xhr.open('GET', url);
  xhr.send();
}

function loadWorkersFromForks () {
  
  // based off of github url in form of http://<user>.github.io/<repo>/
  var user = location.host.slice(0, location.host.indexOf('.'));
  var repo = location.pathname.slice(1, location.pathname.indexOf('/', 1));
  
  var forksUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/forks';
  loadText(forksUrl, function (text) {
    
    try {
      
      var forks = JSON.parse(text);
      log(forks.length + ' plots (forks of this repo) found');

      forks.forEach(function (fork) {
        
        var repo = fork.name;
        var user = fork.owner.login;
        addWorker(user, repo);
      });
      
    } catch (error) {
      log('Error getting forks data: ' + error.message);
    }
    
  });
}

function addWorker (user, repo) {

  log('Adding worker for ' + user + '/' + repo);
  
  // grabbing from hosted github pages url (via gh-pages branch)
  var srcUrl = 'https://' + user + '.github.io/' + repo + PLOT_WORKER_PATH;
  
  loadText(srcUrl, function (text) {
    
    // cors for workers
    var blob = new Blob([text], { type: 'text/javascript' });
    var url = URL.createObjectURL(blob);
    var worker = new Worker(url);
    
    var plotId = getPlotId(user, repo);
    workers[plotId] = {
      worker: worker,
      data: { pingCount: 0 }
    };
    
    addWorkerView(user, repo);
    
    worker.onmessage = function (event) {
      onUserMessage(user, repo, event.data);
    };

  });
}

function getPlotId (user, repo) {
  return PLOT_CLASSNAME + '-' + user + '-' + repo;
}

function addWorkerView (user, repo) {

  var dest = document.getElementById(PLOT_CONTAINER_ID);
  if (!dest) {
    return;
  }
  
  var plotId = getPlotId(user, repo);
  var plotEl = document.createElement('div');
  plotEl.id = plotId;
  plotEl.className = PLOT_CLASSNAME;
  plotEl.textContent = 'Click Me';
  
  plotEl.addEventListener('click', function (event) {
    var workerInfo = workers[plotId];
    var worker = workerInfo.worker;
    var data = workerInfo.data;
    var packet = { type: 'ping', value: ++data.pingCount };
    
    log('Sending ' + JSON.stringify(packet) + ' to ' + user + '/' + repo);
    worker.postMessage(packet);
  });
  
  dest.appendChild(plotEl);
}

function onUserMessage (user, repo, data) {
  var plotId = getPlotId(user, repo);
  var plotEl = document.getElementById(plotId);
  plotEl.textContent = String(data);
}

// init
loadWorkersFromForks();

})();