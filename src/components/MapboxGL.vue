<template>
  <div ref="mapContainer" class="map-container" />
</template>

<script lang="ts">
import type { IsochroneData } from '@/models/isochrone/IsochroneData'
import useMapboxState from '@/stores/mapbox'
// @ts-ignore
import MapboxGLDraw from '@mapbox/mapbox-gl-draw'
// @ts-ignore
import MapboxGL, { type AnySourceImpl, GeoJSONSource, type LngLatLike, Map, Marker } from 'mapbox-gl'
import { storeToRefs } from 'pinia'
import { defineComponent, onMounted, onUnmounted, type PropType, ref, watch } from 'vue'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    markerPosition: {
      type: Object,
      required: true
    },
    isochroneValues: {
      type: Object as PropType<IsochroneData>
    }
  },
  emits: [ 'update:modelValue', 'map:loaded' ],
  setup(props, { emit }) {
    const mapboxState = useMapboxState()
    const { marker } = storeToRefs(mapboxState)
    const mapContainer = ref<HTMLElement | null>(null)
    const map = ref<Map | undefined>()
    const mapDrawer = ref<MapboxGLDraw | undefined>()

    watch(() => props.isochroneValues, (data) => {
      if (!map.value || !props.isochroneValues || !data) {
        return
      }

      createIsochroneLayers(data)
    }, { deep: true })

    onMounted(() => {
      if (!mapContainer.value) {
        return
      }

      const { lng, lat, zoom, bearing, pitch } = props.modelValue

      map.value = new Map({
        style: 'mapbox://styles/mapbox/outdoors-v12',
        container: mapContainer.value,
        center: [ lng, lat ],
        bearing,
        pitch,
        zoom
      })

      map.value.on('load', handleOnLoad)
    })

    onUnmounted(() => {
      if (!map.value) {
        return
      }

      map.value.remove()
      map.value = undefined
    })

    const getMapView = () => {
      if (!map.value) {
        return
      }

      return {
        ...map.value.getCenter(),
        bearing: map.value.getBearing(),
        pitch: map.value.getPitch(),
        zoom: map.value.getZoom()
      }
    }

    const updateMapView = () => {
      emit('update:modelValue', getMapView())
    }

    const configureCurrentPositionMarker = () => {
      const mapMarker: Marker = new Marker({
        color: '#314ccd',
        draggable: true
      })

      mapMarker.setLngLat({ lat: marker.value.lat, lng: marker.value.lng }).addTo(map.value!)
      mapMarker.on('dragend', () => {
        const currentMarkerPosition = mapMarker.getLngLat()

        marker.value.lat = currentMarkerPosition.lat
        marker.value.lng = currentMarkerPosition.lng
      })
    }

    const configureDrawingPlugin = () => {
      if (!map.value) {
        return
      }

      mapDrawer.value = new MapboxGLDraw({
        // this is used to allow for custom properties for styling
        // it appends the word "user_" to the property
        userProperties: true,
        controls: {
          'combine_features': false,
          'uncombine_features': false
        }
      })

      map.value?.addControl(mapDrawer.value, 'bottom-right')
    }

    const createIsochroneLayers = (data: IsochroneData) => {
      if (!map.value) {
        return
      }
      const source: AnySourceImpl = map.value?.getSource('isochrone_layer')

      if (!source) {
        map.value?.addSource('isochrone_layer', {
          type: 'geojson',
          data: data as any
        })

        map.value?.addLayer(
            {
              id: 'isoLayer',
              type: 'fill',
              // Use "iso" as the data source for this layer
              source: 'isochrone_layer',
              layout: {},
              paint: {
                // The fill color for the layer is set to a light purple
                'fill-color': data.features[0].properties.fillColor,
                'fill-opacity': data.features[0].properties.fillOpacity
              }
            }
        )

        map.value?.on('click', 'isoLayer', (e: any) => {
          console.log('isoLayer clicked :: ', e)

          // Copy coordinates array.
          const coordinates: LngLatLike = [ marker.value.lng, marker.value.lat ]
          const description = 'This is an ISO layer'

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : - 360
          }

          new MapboxGL.Popup()
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map.value!)

        })
      } else {
        (source as GeoJSONSource).setData(data as any)
      }
    }

    const initMapListeners = () => {
      if (!map.value) {
        return
      }

      map.value.on('move', updateMapView)
      map.value.on('zoom', updateMapView)
      map.value.on('rotate', updateMapView)
      map.value.on('pitch', updateMapView)
    }

    const handleOnLoad = () => {
      initMapListeners()

      configureCurrentPositionMarker()
      configureDrawingPlugin()

      emit('map:loaded')
    }

    return {
      mapContainer,
      map
    }
  }
})
</script>

<style>
div.map-container {
  flex: 1;
}
</style>