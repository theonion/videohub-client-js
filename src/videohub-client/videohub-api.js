'use strict';

angular.module('VideohubClient.api', ['restangular', 'VideohubClient.settings'])
  .factory('VideohubApi', function (Restangular, videohubApiBaseUrl, videohubSecretToken) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setRequestSuffix('');
      RestangularConfigurer.setBaseUrl(videohubApiBaseUrl);
      RestangularConfigurer.setDefaultHeaders({
        Authorization: 'Token ' + videohubSecretToken
      });
      RestangularConfigurer.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
        if (what == 'search' && operation === 'post') {
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