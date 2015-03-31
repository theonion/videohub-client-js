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

        $scope.updateAutocomplete = function() {
          $getItems().then(function(results) {
            $scope.autocompleteItems = results;
          });
        };

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
