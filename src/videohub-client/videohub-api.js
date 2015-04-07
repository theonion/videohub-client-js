'use strict';

angular.module('VideohubClient.api', [
  'restmod',
  'VideohubClient.settings'
])
  .factory('Video', function (restmod, VIDEOHUB_API_BASE_URL, VIDEOHUB_SECRET_TOKEN) {

    var videosEndpoint = 'videos';
    var searchEndpoint = videosEndpoint + '/search';

    var videohubMix = {
      $config: {
        urlPrefix: VIDEOHUB_API_BASE_URL
      },

      $hooks: {
        'before-request': function (_req) {
          // ensure the videohub authorization token is on every request
          _req.headers = angular.extend(_req.headers || {}, {
            Authorization: 'Token ' + VIDEOHUB_SECRET_TOKEN
          });
        }
      }
    };

    /**
     * A quicker fix than changing videohub api, ensures that search endpoint and
     *  single video endpoint have the same structure for channels.
     *
     * @param {Model} record - record to transform.
     */
    var channelStringToObjectTransformer = function (record) {
      if (_.isString(record.channel)) {
        record.channel = {
          name: record.channel
        };
      }
    };

    var gatherKeywords = function (record) {
      // extract some keywords for this video
      var keywords = [];
      if (record.channel) {
        keywords.push(record.channel.name);
        keywords.push(record.channel.description);
      }
      if (record.sponsor) {
        keywords.push(record.sponsor.name);
      }
      if (record.series) {
        keywords.push(record.series.name);
        keywords.push(record.series.description);
      }
      if (record.season) {
        keywords.push(record.season.name);
        keywords.push(record.season.number);
      }
      if (record.tags) {
        for (var i = 0; i < record.tags.length; i++) {
          keywords.push(record.tags[i]);
        }
      }
      record.keywords = keywords.join(' ');
    };

    var Video = restmod.model(videosEndpoint).mix(videohubMix, {
      $config: {
        name: 'Video',
        plural: 'Videos',
        primaryKey: 'id'
      },

      title: {
        init: ''
      },
      description: {
        init: ''
      },
      keywords: {
        init: []
      },
      image: {
        init: null
      },

      $hooks: {
        'after-fetch': function () {
          gatherKeywords(this);
          channelStringToObjectTransformer(this);
        },
        'after-fetch-many': function () {
          _.each(this, function (record) {
            gatherKeywords(record);
            channelStringToObjectTransformer(record);
          });
        }
      },

      $extend: {
        Model: {
          $postSearch: function (params) {
            return VideoSearch.$create(params).$asPromise()
              .then(function (data) {
                // return video model array
                return data.results;
              });
          }
        }
      }
    });

    var VideoSearch = restmod.model(searchEndpoint).mix(videohubMix, {
      $hooks: {
        'after-create': function (_req) {
          this.results = _.map(_req.data.results, function (video) {
            gatherKeywords(video);
            channelStringToObjectTransformer(video);
            return Video.$buildRaw(video);
          });
        }
      }
    });

    return Video;
  });
