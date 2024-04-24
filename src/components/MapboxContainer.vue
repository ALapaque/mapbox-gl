<template>
  <div id="layout">
    <MapboxGL v-model="current" @update:modelValue='handleOnChange' />
    <SidebarsContainer />
  </div>
</template>

<script lang="ts">
import MapboxGL from '@/components/MapboxGL.vue'
import SidebarsContainer from '@/components/sidebars/SidebarsContainer.vue'
import useMapboxState from '@/stores/mapbox'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'

export default defineComponent({
  components: {
    SidebarsContainer,
    MapboxGL
  },
  setup() {
    const mapboxState = useMapboxState()
    const { current } = storeToRefs(mapboxState)

    const resetLocation = () => {
      mapboxState.$reset()
    }

    const handleOnChange = (value: any) => {
      console.log('handleOnChange :: ', value)
    }

    return {
      current,
      resetLocation,
      handleOnChange
    }
  }
})
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