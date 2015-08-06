'use strict';

angular.module('VideohubClient.api', ['restmod', 'VideohubClient.settings'])
  .factory('Video', [
    'restmod', 'VIDEOHUB_API_BASE_URL', 'VIDEOHUB_SECRET_TOKEN',
    function (restmod, VIDEOHUB_API_BASE_URL, VIDEOHUB_SECRET_TOKEN) {
      return restmod.model('/videos').mix({
        $config: {
          urlPrefix: VIDEOHUB_API_BASE_URL,
          primaryKey: 'id',
          name: 'Video',
          plural: 'Videos'
        },
        $hooks: {
          'before-request': function (_req) {
            // ensure the videohub authorization token is on every request
            _req.headers = angular.extend(_req.headers || {}, {
              Authorization: 'Token ' + VIDEOHUB_SECRET_TOKEN
            });
          }
        }
      });
    }]);
