'use strict';

angular.module('VideohubClient.api.mocks', [
  'ngMockE2E',
  'VideohubClient.settings'
])
  .run(function ($httpBackend, VIDEOHUB_API_BASE_URL) {
    var videos = [{
      id: 1,
      title: 'An Onion Video 1',
      description: 'Good video',
      channel: {
        name: 'The Onion',
        description: 'News website'
      }
    }, {
      id: 2,
      title: 'An Onion Video 2',
      description: 'Good video',
      channel: {
        name: 'The Onion',
        description: 'News website'
      }
    },
    {
      id: 3,
      title: 'Another Video',
      description: 'Another Good video',
      channel: {
        name: 'ClickHole',
        description: 'Clicking website'
      }
    }];

    var allEndpoint = new RegExp(VIDEOHUB_API_BASE_URL + '/videos\/?$');
    $httpBackend.whenGET(allEndpoint).respond(videos);

    var singleEndpoint = new RegExp(VIDEOHUB_API_BASE_URL + '/videos/(\\d+)\/?$');
    $httpBackend.whenGET(singleEndpoint).respond(function (method, url) {
      var matches = url.match(singleEndpoint);
      var video = _.find(videos, {id: Number(matches[1])});

      if (_.isUndefined(video)) {
        return [404, null];
      }

      return [200, video];
    });

    var searchEndpoint = new RegExp(VIDEOHUB_API_BASE_URL + '/videos/search\/?$');
    $httpBackend.whenPOST(searchEndpoint).respond(function (method, url, body) {
        var data = JSON.parse(body);
        var results = videos;
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
  });
