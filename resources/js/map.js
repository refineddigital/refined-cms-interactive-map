interactiveMap = function(options) {
  const setZoom = bounds => {
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
  }

  let openInfoWindow = null;

  const config = {
    center: { lat: options.lat, lng: options.lng, },
    zoom: 12,
  }

  if (options.mapStyles) {
    config.styles = options.mapStyles;
  }

  const markers = [];
  const map = new window.google.maps.Map(document.getElementById(options.elementId), config);
  const bounds = new window.google.maps.LatLngBounds();

  options.data.forEach(category => {
    category.markers.forEach((mark, index) => {
      const markerOptions = {
        map,
        meta: {
          categoryId: category.id
        },
        title: mark.name,
        position: {
          lat: parseFloat(mark.latitude),
          lng: parseFloat(mark.longitude),
        },
        zIndex: index
      }
      if (options.marker.icon) {
        markerOptions.icon = {
          url: options.marker.icon
        }
      }
      const marker = new google.maps.Marker(markerOptions);


      markers.push(marker);
      bounds.extend(marker.getPosition());
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="maps__info-window">
            <h4 class="maps__info-window-heading">${mark.name }</h4>
            <div class="maps__info-window-content">${mark.content || '' }</div>
          </div>
        `
      })
      marker.addListener('click', function() {
        if (openInfoWindow) {
          openInfoWindow.close();
        }
        infoWindow.open(map, marker);
        openInfoWindow = infoWindow;
      })
    })
  })

  if (options.masterIcon) {
    // add the master icon
    const master =  new google.maps.Marker({
      map,
      meta: {
        categoryId: '*'
      },
      title: options.masterIcon.name,
      position: {
        lat: options.masterIcon.latitude,
        lng: options.masterIcon.longitude,
      },
      icon: {
        url: options.masterIcon.marker
      },
      zIndex: markers.length + 1
    });

    markers.push(master);
    bounds.extend(master.getPosition());
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="maps__info-window">
          <h4 class="maps__info-window-heading">${options.masterIcon.name}</h4>
        </div>
      `
    })
    master.addListener('click', function() {
      if (openInfoWindow) {
        openInfoWindow.close();
      }
      infoWindow.open(map, master);
      openInfoWindow = infoWindow;
    })
  }

  setZoom(bounds);

  const categories = document.querySelectorAll('.map__categories li');
  const klass = 'map__category-item--active';
  categories.forEach(cat => {
    cat.addEventListener('click', function() {
      categories.forEach(cat => { cat.classList.remove(klass) })
      cat.classList.add(klass)

      const bounds = new window.google.maps.LatLngBounds();
      const id = parseInt(this.dataset.id, 10);
      markers.forEach(marker => {
        const visible = marker.meta.categoryId === id || marker.meta.categoryId === '*';
        if (visible) {
          bounds.extend(marker.getPosition());
        }
        marker.setVisible(visible)
      })
      setZoom(bounds);
    });
  })
}
