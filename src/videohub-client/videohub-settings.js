'use strict';

angular.module('VideohubClient.settings', [])
  .value('VIDEOHUB_API_BASE_URL', 'http://videohub.local/api/v0')
  .value('VIDEOHUB_DEFAULT_CHANNEL', 'The Onion')
  .value('VIDEOHUB_SEARCH_DEBOUNCE_MS', 200)
  .value('VIDEOHUB_SECRET_TOKEN', 'BLAH BLAH');
