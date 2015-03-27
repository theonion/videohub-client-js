'use strict';

angular.module('VideohubClient.suggest.directive', [
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest',
  'VideohubClient.api'
]).directive('videohubSuggest', function () {
    return {
      replace: false,
      restrict: 'E',
      templateUrl: 'src/videohub-client/videohub-suggest/videohub-suggest-directive.html',
      scope: {
        'video': '=',
        'channel': '@'
      },
      controller: function ($scope, $q, VideohubVideoApi, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS) {
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
          $scope.video = item;
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
