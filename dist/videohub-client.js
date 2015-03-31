// Source: src/videohub-client/videohub-api.js
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
        },
        'after-fetch-many': function () {
          _.each(this, function (record) {
            gatherKeywords(record);
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
            return Video.$buildRaw(video);
          });
        }
      }
    });

    return Video;
  });

// Source: src/videohub-client/videohub-client.js
angular.module('VideohubClient', [
  'VideohubClient.api',
  'VideohubClient.suggest.directive',
  'VideohubClient.picker.directive'
]);

// Source: src/videohub-client/videohub-settings.js
angular.module('VideohubClient.settings', [])
  .value('VIDEOHUB_API_BASE_URL', 'http://videohub.local/api/v0')
  .value('VIDEOHUB_DEFAULT_CHANNEL', 'The Onion')
  .value('VIDEOHUB_SEARCH_DEBOUNCE_MS', 200)
  .value('VIDEOHUB_SECRET_TOKEN', 'BLAH BLAH');

// Source: src/videohub-client/videohub-suggest/videohub-picker-directive.js
angular.module('VideohubClient.picker.directive', [
  'VideohubClient.suggest.directive'
]).directive('videohubVideoPicker', function () {
  return {
    restrict: 'E',
    scope: {
      onSelectAttr: '&onSelect',
      channel: '@'
    },
    templateUrl: 'src/videohub-client/videohub-suggest/videohub-picker-directive.html',
    controller: function ($scope) {
      $scope.video = null;

      $scope.reset = function () {
        $scope.video = null;
        $scope.onSelectAttr({video: null});
      };

      $scope.onSelect = function (video) {
        $scope.video = video;
        $scope.onSelectAttr({video: video});
      };

    }
  };
});

// Source: src/videohub-client/videohub-suggest/videohub-suggest-directive.js
angular.module('VideohubClient.suggest.directive', [
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest',
  'VideohubClient.api',
  'VideohubClient.settings'
]).directive('videohubSuggest', function () {
    return {
      replace: false,
      restrict: 'E',
      templateUrl: 'src/videohub-client/videohub-suggest/videohub-suggest-directive.html',
      scope: {
        onSelect: '&',
        givenChannel: '@channel'
      },
      controller: function ($scope, $q, Video, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
          VIDEOHUB_DEFAULT_CHANNEL, VIDEOHUB_SEARCH_DEBOUNCE_MS) {

        $scope.channel = $scope.givenChannel || VIDEOHUB_DEFAULT_CHANNEL;

        $scope.writables = {
          searchTerm: ''
        };

        var $getItems = function () {
          var defer = $q.defer();
          if ($scope.writables.searchTerm) {
            var params = {
              query: $scope.writables.searchTerm
            };
            if ($scope.channel) {
              params.filters = {
                channel: $scope.channel
              };
            }
            Video.$postSearch(params).then(function (videos) {
              defer.resolve(videos);
            });
          } else {
            defer.resolve([]);
          }
          return defer.promise;
        };

        $scope.suggestFormatter = function(item) {
          return item.title;
        };

        $scope.updateAutocomplete = _.debounce(function() {
          $getItems().then(function(results) {
            $scope.autocompleteItems = results;
          });
        }, VIDEOHUB_SEARCH_DEBOUNCE_MS);

        $scope.handleSelect = function(item) {
          $scope.clearAutocomplete();
          $scope.onSelect({video: item});
        };

        $scope.delayClearAutocomplete = function () {
          _.delay(function () {
            $scope.clearAutocomplete();
            $scope.$digest();
          }, 200);
        };

        $scope.clearAutocomplete = function () {
          $scope.writables.searchTerm = '';
          $scope.autocompleteItems = [];
        };

        $scope.handleKeypress = function ($event) {
          if ($event.keyCode === 27) {
            // esc, close dropdown
            $scope.clearAutocomplete();
          } else {
            $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, $event);
          }
        };

      }
    };
  });

// Source: .tmp/videohub-client-templates.js
angular.module('VideohubClient').run(['$templateCache', function($templateCache) {
$templateCache.put('src/videohub-client/videohub-suggest/videohub-picker-directive.html',
    "<div class=videohub-video-picker><div ng-show=!video><videohub-suggest on-select=onSelect(video) channel=\"{{ channel }}\"></videohub-suggest></div><div ng-show=video class=videohub-video-picker-choice><span ng-bind=video.title></span> <button class=\"btn btn-link glyphicon glyphicon-remove-sign\" ng-click=reset()><span class=hidden>Clear</span></button></div></div>"
  );


  $templateCache.put('src/videohub-client/videohub-suggest/videohub-suggest-directive.html',
    "<input class=form-control ng-model=writables.searchTerm ng-change=updateAutocomplete() ng-blur=delayClearAutocomplete() ng-keydown=handleKeypress($event) ng-attr-placeholder=\"Search {{ channel || 'All' }} Videos\"><div ng-show=writables.searchTerm class=results-wrapper><bulbs-autocomplete-suggest ng-show=\"autocompleteItems.length > 0\" formatter=item.title items=autocompleteItems on-select=handleSelect(selection)></bulbs-autocomplete-suggest><div ng-show=\"autocompleteItems.length === 0\" class=no-results>No results found in {{ channel || 'all' }} videos</div></div>"
  );

}]);
