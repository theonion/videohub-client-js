// Source: src/videohub-client/videohub-api.js
angular.module('VideohubClient.api', ['restangular', 'VideohubClient.settings'])
  .factory('VideohubApi', function (Restangular, VIDEOHUB_API_BASE_URL, VIDEOHUB_SECRET_TOKEN) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setRequestSuffix('');
      RestangularConfigurer.setBaseUrl(VIDEOHUB_API_BASE_URL);
      RestangularConfigurer.setDefaultHeaders({
        Authorization: 'Token ' + VIDEOHUB_SECRET_TOKEN
      });
      RestangularConfigurer.addResponseInterceptor(function (data, operation, what) {
        if (what === 'search' && operation === 'post') {
          var newData = {
            count: data.count,
            results: _.map(data.results, function (value) {
              // extract some keywords for this video
              var keywords = [];
              if (value.channel) {
                keywords.push(value.channel.name);
                keywords.push(value.channel.description);
              }
              if (value.sponsor) {
                keywords.push(value.sponsor.name);
              }
              if (value.series) {
                keywords.push(value.series.name);
                keywords.push(value.series.description);
              }
              if (value.season) {
                keywords.push(value.season.name);
                keywords.push(value.season.number);
              }
              if (value.tags) {
                for (var i = 0; i < value.tags.length; i++) {
                  keywords.push(value.tags[i]);
                }
              }
              keywords = keywords.join(' ');
              return {
                id: value.id,
                title: value.title,
                description: value.description || '',
                keywords: keywords,
                image: null
              };
            })
          };
          return newData;
        }
        return data;
      });
    });
  })
  .factory('VideohubVideoApi', function (VideohubApi) {
    return VideohubApi.all('videos');
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
  .value('VIDEOHUB_SECRET_TOKEN', 'BLAH BLAH')
  .value('VIDEOHUB_DEFAULT_CHANNEL', 'The Onion');

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
      controller: function ($scope, $q, VideohubVideoApi, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
          VIDEOHUB_DEFAULT_CHANNEL) {

        $scope.channel = $scope.givenChannel || VIDEOHUB_DEFAULT_CHANNEL;

        $scope.placeholder = 'Search ' + ($scope.channel || 'All') + ' Videos';

        var $getItems = function () {
          var defer = $q.defer();
          if ($scope.searchTerm) {
            var params = {
              query: $scope.searchTerm
            };
            if ($scope.channel) {
              params.filters = {
                channel: $scope.channel
              };
            }
            VideohubVideoApi.all('search').post(params).then(function (data) {
              defer.resolve(data.results);
            });
          } else {
            defer.resolve([]);
          }
          return defer.promise;
        };

        $scope.suggestFormatter = function(item) {
          return item.title;
        };

        $scope.suggestSelect = function(item) {
          $scope.onSelect({video: item});
          $scope.autocompleteItems = [];
        };

        $scope.updateAutocomplete = function() {
          $getItems().then(function(results) {
            $scope.autocompleteItems = results;
          });
        };

        $scope.handleKeypress = function($event) {
          $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, $event);
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
    "<input class=form-control ng-model=searchTerm ng-change=updateAutocomplete() ng-keydown=handleKeypress($event) ng-keydown=handleKeypress($event) ng-attr-placeholder=\"{{ placeholder }}\"><bulbs-autocomplete-suggest formatter=suggestFormatter(item) items=autocompleteItems on-select=suggestSelect(selection)></bulbs-autocomplete-suggest>"
  );

}]);
