<template>
  <div ref="mapContainer" class="map-container" />
</template>

<script lang="ts">
import type { IsochroneState } from '@/stores/isochrone'
import useMapboxState from '@/stores/mapbox'

// @ts-ignore
import mapboxgl, { type AnySourceImpl, GeoJSONSource, Map, Marker } from 'mapbox-gl'
import { storeToRefs } from 'pinia'
import { defineComponent, onMounted, onUnmounted, type PropType, ref, watch } from 'vue'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN

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
      type: Object as PropType<IsochroneState['data']>
    }
  },
  emits: [ 'update:modelValue', 'map:loaded' ],
  setup(props, { emit }) {
    const mapboxState = useMapboxState()
    const { marker } = storeToRefs(mapboxState)
    const mapContainer = ref<HTMLElement | null>(null)
    const map = ref<Map | undefined>()

    watch(() => props.modelValue, (next) => {
      const curr = getMapView()
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
      if (!map.value || !props.isochroneValues || !data) {
        return
      }

      const source: AnySourceImpl = map.value?.getSource('isochrone')

      if (!source) {
        return
      }

      (source as GeoJSONSource).setData(data as any)
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

      map.value.on('move', updateMapView)
      map.value.on('zoom', updateMapView)
      map.value.on('rotate', updateMapView)
      map.value.on('pitch', updateMapView)
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

    const createCurrentPositionMarker = () => {
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