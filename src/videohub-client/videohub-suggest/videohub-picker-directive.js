'use strict';

angular.module('VideohubClient.picker.directive', [
  'VideohubClient.suggest.directive'
]).directive('videohubVideoPicker', function () {
  return {
    restrict: 'E',
    scope: {
      video: '=',
      channel: '@'
    },
    templateUrl: 'src/videohub-client/videohub-suggest/videohub-picker-directive.html',
    controller: function ($scope) {
      $scope.reset = function reset () {
        $scope.video = null;
      };
    }
  };
});
