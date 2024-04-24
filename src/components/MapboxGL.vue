<template>
  <div ref="mapContainer" class="map-container" />
</template>

<script lang="ts">
import useMapboxState from '@/stores/mapbox'

// @ts-ignore
import mapboxgl, { Map, Marker } from 'mapbox-gl'
import { storeToRefs } from 'pinia'
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    isochroneValues: Object
  },
  emits: [ 'update:modelValue', 'map:loaded' ],
  setup(props, { emit }) {
    const mapboxState = useMapboxState()
    const { current } = storeToRefs(mapboxState)
    const mapContainer = ref<HTMLElement | null>(null)
    const map = ref<Map | undefined>()

    watch(() => props.modelValue, (next) => {
      const curr = getLocation()
      const mapInstance = map.value

      if (!mapInstance || !curr) {
        return
      }

      if (curr.lng !== next.lng || curr.lat !== next.lat)
        mapInstance.setCenter({ lng: next.lng, lat: next.lat })
      if (curr.pitch !== next.pitch) mapInstance.setPitch(next.pitch)
      if (curr.bearing !== next.bearing) mapInstance.setBearing(next.bearing)
      if (curr.zoom !== next.zoom) mapInstance.setZoom(next.zoom)
    }, { deep: true })

    watch(() => props.isochroneValues, (data) => {
      if (!map.value || !props.isochroneValues) {
        return
      }

      const source = map.value?.getSource('isochrone')

      if (!source) {
        return
      }

      source.setData(data)
    }, { deep: true })

    onMounted(() => {
      if (!mapContainer.value) {
        return
      }

      const { lng, lat, zoom, bearing, pitch } = props.modelValue

      map.value = new Map({
        container: mapContainer.value,
        center: [ lng, lat ],
        bearing,
        pitch,
        zoom
      })

      map.value.on('load', handleOnLoad)

      map.value.on('move', updateLocation)
      map.value.on('zoom', updateLocation)
      map.value.on('rotate', updateLocation)
      map.value.on('pitch', updateLocation)
    })

    onUnmounted(() => {
      if (!map.value) {
        return
      }

      map.value.remove()
      map.value = undefined
    })

    const getLocation = () => {
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

    const updateLocation = () => {
      emit('update:modelValue', getLocation())
    }

    const createCurrentPositionMarker = () => {
      const marker: Marker = new Marker({
        color: '#314ccd',
        draggable: true
      })

      marker.setLngLat({ lat: current.value.lat, lng: current.value.lng }).addTo(map.value!)
      marker.on('dragend', () => {
        const currentMarkerPosition = marker.getLngLat()

        current.value.lat = currentMarkerPosition.lat
        current.value.lng = currentMarkerPosition.lng
      })
    }

    const createIsochroneView = () => {
      if (!map.value) {
        return
      }

      map.value.addSource('isochrone', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })

      map.value.addLayer(
          {
            id: 'isoLayer',
            type: 'fill',
            // Use "iso" as the data source for this layer
            source: 'isochrone',
            layout: {},
            paint: {
              // The fill color for the layer is set to a light purple
              'fill-color': '#5a3fc0',
              'fill-opacity': 0.3
            }
          }
      )
    }

    const handleOnLoad = () => {
      console.log('handleOnload', map)

      createCurrentPositionMarker()
      createIsochroneView()

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
.map-container {
  flex: 1;
}
</style>