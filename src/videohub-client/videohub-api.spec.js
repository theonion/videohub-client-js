'use strict';

describe('Factory: Video', function () {
  var $httpBackend;
  var searchEndpoint;
  var singleEndpoint;
  var Video;
  var VIDEOHUB_SECRET_TOKEN;

  beforeEach(function () {
    module('VideohubClient.api');

    inject(function (_$httpBackend_, _Video_, _VIDEOHUB_SECRET_TOKEN_,
        VIDEOHUB_API_BASE_URL) {
      $httpBackend = _$httpBackend_;
      searchEndpoint = new RegExp(VIDEOHUB_API_BASE_URL + '/videos/search\/?$');
      singleEndpoint = new RegExp(VIDEOHUB_API_BASE_URL + '/videos/(\\d+)\/?$');
      Video = _Video_;
      VIDEOHUB_SECRET_TOKEN = _VIDEOHUB_SECRET_TOKEN_;
    });
  });

  describe('should provide an authorization token when', function () {
    var requestHeaders;

    beforeEach(function () {
      requestHeaders = {};
    });

    it('retrieving a single video', function () {
      Video.$find(1);

      $httpBackend.expectGET(singleEndpoint)
        .respond(function (method, url, data, headers) {
          requestHeaders = headers;
          return [200, {}]
        });
      $httpBackend.flush();
    });

    it('searching for videos', function () {
      Video.$postSearch();

      $httpBackend.expectPOST(searchEndpoint)
        .respond(function (method, url, data, headers) {
          requestHeaders = headers;
          return [200, {}]
        });
      $httpBackend.flush();
    });

    afterEach(function () {
      expect(requestHeaders.Authorization).toBe('Token ' + VIDEOHUB_SECRET_TOKEN);
    });
  });

  describe('should ensure channel is an object with a name property when', function () {

    it('retrieving a single video', function () {
      var name = 'some video blah blah';
      var video = Video.$find(1);

      $httpBackend.expectGET(singleEndpoint).respond(function () {
        return [200, {
          id: 123,
          channel: {
            name: name
          }
        }]
      });
      $httpBackend.flush();

      expect(video.channel.name).toBe(name);
    });

    it('searching for videos', function () {
      var name = 'some video blah blah';

      var videos;
      Video.$postSearch().then(function (results) {
        videos = results;
      });

      $httpBackend.expectPOST(searchEndpoint).respond(function () {
        return [200, {
          results: [{
            id: 123,
            channel: name
          }]
        }]
      });
      $httpBackend.flush();

      expect(videos[0].channel.name).toBe(name);
    });
  });
});
