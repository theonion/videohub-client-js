'use strict';

angular.module('VideohubClient.api.mocks', ['VideohubClient.settings', 'ngMockE2E'])
  .run(function ($httpBackend, videohubApiBaseUrl) {
    $httpBackend.whenPOST(videohubApiBaseUrl + '/videos/search').respond(
      function (method, url, body) {
        var data = JSON.parse(body);
        var results = [
          {
            id: 1,
            title: 'A Video',
            description: 'Good video',
            channel: {
              name: 'The Onion',
              description: 'News website'
            }
          },
          {
            id: 2,
            title: 'Another Video',
            description: 'Another Good video',
            channel: {
              name: 'ClickHole',
              description: 'Clicking website'
            }
          }
        ];
        if (data.filters && data.filters.channel) {
          results = _.filter(results, function (video) {
            return video.channel.name === data.filters.channel;
          });
        }
        return [200, {
          count: 2,
          results: results
        }];
      }
    );
  }
);
