function glImage(imgSrc, options) {
  options = options || {}

  let img = new Image()
  img.src = imgSrc

  // Need to make sure the image is loaded before we can get the height and width
  img.onload = () => {
    let width = img.width
    let height = img.height

    /* Initialize a map instance so that we can use the .unproject method before
       adding the image to the canvas */
    let map = new mapboxgl.Map({
        container: options.container || "gl-image-zoom",
        maxZoom: 10,
        minZoom: 0,
        zoom: 5,
        center: [0, 0],
        style: {
            "version": 8,
            "name": "image-zoom",
            "sources": {},
            "layers": [{
              "id": "background",
              "type": "background",
              "paint": {
                "background-color": "#111"
              }
            }]
        },
        maxBounds: [
          [-179, -85],
          [179, 85]
        ],
    })

    // Get the height and width of the window
    let windowWidth = window.innerWidth
    let windowHeight = window.innerHeight

    // Determine a scaling ratio to resize the image to fit the viewport
    let ratio = Math.min( (windowWidth/width), (windowHeight/height))

    // Convert the image dimensions to projected coordinates
    let sw = map.unproject([0, height*ratio])
    let ne = map.unproject([width*ratio, 0])

    // Wait for the map to fire a "load" before adding the image
    /* NB: 'image' sources don't have a method for updating the url, so it must
       be added after the map has loaded */
    map.on("load", ()=> {
      // Add the image as a new source
      map.addSource("overlay", {
          "type": "image",
          "url": img.src,
          "coordinates": [
              [sw.lng, ne.lat],
              [ne.lng, ne.lat],
              [ne.lng, sw.lat],
              [sw.lng, sw.lat],
          ]
      })
      // Add the image layer
      map.addLayer({
          "id": "overlay",
          "source": "overlay",
          "type": "raster",
          "paint": {
            "raster-opacity": 1
          }
      })

      // Get the bounds of the map, and fit the map to them
      var bounds = new mapboxgl.LngLatBounds(sw, ne)
      map.fitBounds(bounds)

      // Lock the viewport to the bounds of image
      // NB: Need to wait until the animation of `.fitBounds` is done
      setTimeout(function() {
        map.setMaxBounds(map.getBounds())
      }, 300)
    })
  }
}
