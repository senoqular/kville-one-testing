onmessage = function(event) {

  // event.data is an object from the community page
  // the type property tells you what kind of message is sent

  if (event.data.type === 'ping') {

    // use postMessage() to send anything you want back
    // to the main community page!

    postMessage('Pinged: ' + event.data.value);
  }
};
