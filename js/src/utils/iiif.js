(function ($) {

  $.Iiif = {

    getImageUrl: function (cavas) {
      return $.Iiif._getImageUrl(cavas.images[0]);
    },

    _getImageUrl: function (image) {
      if (!image.resource.service) {
        id = image.resource['default'].service['@id'];
        id = id.replace(/\/$/, "");
        return id;
      }
      var id = image.resource.service['@id'];
      id = id.replace(/\/$/, "");

      return id;
    },

    getVersionFromContext: function (context) {
      if (context == "http://iiif.io/api/image/2/context.json") {
        return "2.0";
      } else {
        return "1.1";
      }
    },

    makeUriWithWidth: function (uri, width, version) {
      uri = uri.replace(/\/$/, '');
      if (version[0] == '1') {
        return uri + '/full/' + width + ',/0/native.jpg';
      } else {
        return uri + '/full/' + width + ',/0/default.jpg';
      }
    },

    getImageHostUrl: function (json) {
      var regex,
        matches = [];

      if (!json.hasOwnProperty('image_host')) {

        json.image_host = json.tilesUrl || json['@id'] || '';

        if (json.hasOwnProperty('identifier')) {
          regex = new RegExp('/?' + json.identifier + '/?$', 'i');
          json.image_host = json.image_host.replace(regex, '');

        } else {
          regex = new RegExp('(.*)\/(.*)$');
          matches = regex.exec(json.image_host);

          if (matches.length > 1) {
            json.image_host = matches[1];
            json.identifier = matches[2];
          }
        }
      }

      return json.image_host;
    },

    getThumbnailForImage: function (image, width) {
      if (image && image.resource && image.resource && image.resource.service) {
        var version = $.Iiif.getVersionFromContext(image.resource.service['@context']);
        return $.Iiif.makeUriWithWidth(image.resource.service['@id'], width, version);
      }
    },

    getAllImagesFromManifest: function (manifest) {
      var images = {};

      if (manifest.sequences) {
        manifest.sequences.forEach(function (sequence) {
          if (sequence.canvases) {
            sequence.canvases.forEach(function (canvas) {
              if (canvas.images) {
                canvas.images.forEach(function (image) {
                  if (image.resource.service) {
                    var imageId = image.resource.service['@id'];
                    images[imageId] = image;
                  }
                });
              }
            });
          }
        });
      }
      return images;
    }
  };

}(Mirador));

