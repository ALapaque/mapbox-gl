<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script lang="ts">
import mapboxgl from 'mapbox-gl'
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const map = ref<mapboxgl.Map>()

    watch(() => props.modelValue, (next) => {
      const curr = getLocation()
      const mapInstance = map.value

      if (curr.lng !== next.lng || curr.lat !== next.lat)
        mapInstance.setCenter({ lng: next.lng, lat: next.lat })
      if (curr.pitch !== next.pitch) mapInstance.setPitch(next.pitch)
      if (curr.bearing !== next.bearing) mapInstance.setBearing(next.bearing)
      if (curr.zoom !== next.zoom) mapInstance.setZoom(next.zoom)
    }, { deep: true })

    onMounted(() => {
      const { lng, lat, zoom, bearing, pitch } = props.modelValue

      map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [ lng, lat ],
        bearing,
        pitch,
        zoom
      })

      const updateLocation = () =>
          emit('update:modelValue', getLocation())

      map.value.on('move', updateLocation)
      map.value.on('zoom', updateLocation)
      map.value.on('rotate', updateLocation)
      map.value.on('pitch', updateLocation)
    })

    onUnmounted(() => {
      map.value.remove()
      map.value = null
    })

    function getLocation() {
      return {
        ...map.value.getCenter(),
        bearing: map.value.getBearing(),
        pitch: map.value.getPitch(),
        zoom: map.value.getZoom()
      }
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