'use strict';

angular.module('VideohubClient.settings', [])
  .value('videohubApiBaseUrl', 'http://videohub.local/api/v0')
  .value('videohubSecretToken', 'BLAH BLAH')
  .value('videohubDefaultChannel', 'The Onion');
