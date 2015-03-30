'use strict';

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
