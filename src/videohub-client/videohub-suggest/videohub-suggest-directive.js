'use strict';

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
