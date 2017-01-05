'use strict';

function HttpsRequest () {
}

HttpsRequest.prototype = (function () {

  return {

    get: function (url, eventCallback, errorCallback) {
      var request = require('https');
      request.get(url, function (response) {
        var body = '';
        response.on('data', function (chunk) {
          body += chunk;
        });
        response.on('end', function () {
          eventCallback(body);
        });
      }).on('error', function (e) {
        console.log('Got error: ', e);
        errorCallback();
      });
    }
  };

})();

module.exports = HttpsRequest;