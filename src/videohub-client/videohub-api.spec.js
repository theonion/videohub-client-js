'use strict';

describe('Factory: Video', function () {
  var $httpBackend;
  var searchEndpoint;
  var singleEndpoint;
  var Video;
  var VIDEOHUB_SECRET_TOKEN;

  beforeEach(function () {
    module('VideohubClient.api');

    inject(function (_$httpBackend_, _Video_, VIDEOHUB_API_BASE_URL) {
      $httpBackend = _$httpBackend_;
      singleEndpoint = new RegExp(VIDEOHUB_API_BASE_URL + '/videos/(\\d+)\/?$');
      Video = _Video_;
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
      Video.$search({});

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
});
