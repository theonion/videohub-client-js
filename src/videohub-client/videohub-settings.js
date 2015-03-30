'use strict';

angular.module('VideohubClient.settings', [])
  .value('VIDEOHUB_API_BASE_URL', 'http://videohub.local/api/v0')
  .value('VIDEOHUB_SECRET_TOKEN', 'BLAH BLAH')
  .value('VIDEOHUB_DEFAULT_CHANNEL', 'The Onion');
