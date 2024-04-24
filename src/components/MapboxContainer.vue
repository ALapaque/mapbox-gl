<template>
  <div id="layout">
    <div id="sidebar">
      Longitude: {{ location.lng.toFixed(4) }} | Latitude: {{ location.lat.toFixed(4) }} | Zoom: {{ location.zoom.toFixed(2) }} |
      <template v-if="location.bearing">
        Bearing: {{ location.bearing.toFixed(2) }} |
      </template>
      <template v-if="location.pitch">
        Pitch: {{ location.pitch.toFixed(2) }} |
      </template>
      <button @click="resetLocation">
        Reset
      </button>
    </div>
    <MapboxGL v-model="location" @update:modelValue='handleOnChange'/>
  </div>
</template>

<script lang="ts">
import MapboxGL from '@/components/MapboxGL.vue'
import { defineComponent, ref } from 'vue';
import 'mapbox-gl/dist/mapbox-gl.css';

export type Position = {
  lng: number,
  lat: number,
  bearing: number,
  pitch: number,
  zoom: number
}

export default defineComponent({
  components: {
    MapboxGL,
  },
  setup() {
    const basePosition: Position = {
      lng: 4.586389684507004,
      lat: 50.730783284021605,
      bearing: 0,
      pitch: 0,
      zoom: 15
    }
    const location = ref<Position>(basePosition)

    const resetLocation = () => {
      location.value = basePosition
    }

    const handleOnChange = (value: any) => {
      console.log('handleOnChange :: ', value)
    }

    return {
      location,
      resetLocation,
      handleOnChange
    }
  }
});
</script>

<style>
#layout {
  flex: 1;
  display: flex;
}

#sidebar {
  background-color: rgb(35 55 75 / 90%);
  color: #fff;
  padding: 6px 12px;
  font-family: monospace;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  margin: 12px;
  border-radius: 4px;
}
</style>