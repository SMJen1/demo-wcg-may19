window.onload = init;

function init(){
  const mapCenterCoordinate = [-12080385.539375868, 7567433.0297847847]
  const map = new ol.Map({
    view: new ol.View({
      center: mapCenterCoordinate,
      zoom: 4,
      extent: [-30012345.865909653, 1501234.262171041, -2345.92760313, 9501234.2147866394],   
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    target: 'openlayers-map'
  })

  // North America GeoJSON
  const mapCitiesStyle = function(feature){
    let cityID = feature.get('Id');
    let cityIDString = cityID.toString();
    const styles = [
      new ol.style.Style({
        image: new ol.style.Circle({
          fill: new ol.style.Fill({
            color: [77, 219, 105, 0.6]
          }),
          stroke: new ol.style.Stroke({
            color: [6, 125, 34, 1],
            width: 2
          }),
          radius: 12
        }),
        text: new ol.style.Text({
          text: cityIDString,
          scale: 1.5,
          fill: new ol.style.Fill({
            color: [232, 26, 26, 1]
          }),
          stroke: new ol.style.Stroke({
            color: [232, 26, 26, 1],
            width:0.3
          })
        })
      })
    ]
    return styles
  }

  const styleForSelect = function(feature){
    let cityID = feature.get('Id');
    let cityIDString = cityID.toString();
    const styles = [
      new ol.style.Style({
        image: new ol.style.Circle({
          fill: new ol.style.Fill({
            color: [247, 26, 10, 0.5]
          }),
          stroke: new ol.style.Stroke({
            color: [6, 125, 34, 1],
            width: 2
          }),
          radius: 12
        }),
        text: new ol.style.Text({
          text: cityIDString,
          scale: 1.5,
          fill: new ol.style.Fill({
            color: [87, 9, 9, 1]
          }),
          stroke: new ol.style.Stroke({
            color: [87, 9, 9, 1],
            width:0.5
          })
        })
      })
    ]
    return styles
  }

  const mapCitiesLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: './data/northam_img.geojson'
      //URL: './data/northam_img.geojson'
    }),
    style: mapCitiesStyle
  })
  map.addLayer(mapCitiesLayer);

  // Map Features Click Logic
  const navElements = document.querySelector('.column-navigation');
  const cityNameElement = document.getElementById('cityname');
  const cityImageElement = document.getElementById('cityimage');
  const mapView = map.getView();

  map.on('singleclick', function(evt){
    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
      let featureName = feature.get('city');
      let navElement = navElements.children.namedItem(featureName);      
      mainLogic(feature, navElement)
    })
  })

  function mainLogic(feature, clickedAnchorElement){
    // Re-assign active class to the clicked element
    let currentActiveStyledElement = document.querySelector('.active');
    currentActiveStyledElement.className = currentActiveStyledElement.className.replace('active', '');
    clickedAnchorElement.className = 'active';

    // Default style for all features
    let mapCitiesFeatures = mapCitiesLayer.getSource().getFeatures();
    mapCitiesFeatures.forEach(function(feature){
      feature.setStyle(mapCitiesStyle);
    })    

    // Home Element : Change content in the menu to HOME
    if(clickedAnchorElement.id === 'Home'){ 
      mapView.animate({center: mapCenterCoordinate}, {zoom: 4})
      cityNameElement.innerHTML  = 'Starfleet -Intel_identity ML Demonstation';
      cityImageElement.setAttribute('src', './data/City_images/starfleet_Image.jpg');
    } 
    // Change view, and content in the menu based on the feature
    else {
      feature.setStyle(styleForSelect)
      let featureCoordinates = feature.get('geometry').getCoordinates();
      mapView.animate({center: featureCoordinates}, {zoom: 5})
      let featureName = feature.get('city');
      let featureImage = feature.get('id_image');
      //cityNameElement.innerHTML = 'Vehicle/Objects Identification: ' + featureName
      cityNameElement.innerHTML = 'Vehicle/Objects Identification: '
      cityImageElement.setAttribute('src', './data/City_images/' + featureImage + '.jpg');
    }   
  }

  // Navigation Button Logic
  const anchorNavElements = document.querySelectorAll('.column-navigation > a');
  for(let anchorNavElement of anchorNavElements){
    anchorNavElement.addEventListener('click', function(e){
      let clickedAnchorElement = e.currentTarget;
      let clickedAnchorElementID = clickedAnchorElement.id;
      let aussieCitiesFeatures = mapCitiesLayer.getSource().getFeatures();
      aussieCitiesFeatures.forEach(function(feature){
        let featureCityName = feature.get('city');
        if(clickedAnchorElementID === featureCityName){
          mainLogic(feature, clickedAnchorElement);
        }
      })

      // Home Navigation Case
      if(clickedAnchorElementID === 'Home'){
        mainLogic(undefined, clickedAnchorElement)
      }
    })
  }

  // Features Hover Logic
  const popoverTextElement = document.getElementById('popover-text');
  const popoverTextLayer = new ol.Overlay({
    element: popoverTextElement,
    positioning: 'bottom-center',
    stopEvent: false
  })
  map.addOverlay(popoverTextLayer);

  map.on('pointermove', function(evt){
    let isFeatureAtPixel = map.hasFeatureAtPixel(evt.pixel);
    if(isFeatureAtPixel){
      let featureAtPixel = map.getFeaturesAtPixel(evt.pixel);
      let featureName = featureAtPixel[0].get('city');
      popoverTextLayer.setPosition(evt.coordinate);
      popoverTextElement.innerHTML = featureName;
      map.getViewport().style.cursor = 'pointer';
    } else {
      popoverTextLayer.setPosition(undefined)
      map.getViewport().style.cursor = '';
    }
  })
}