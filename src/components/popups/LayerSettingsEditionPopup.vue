<template>
  <div>
    <input
        :value='backgroundColor'
        name='background-color'
        type='color'
        @change='handleOnBackgroundColorChange' />
    <input
        :value='opacity'
        max='100' min='0'
        name='background-opacity'
        type='number'
        @change='handleOnOpacityChange' />
  </div>

</template>

<script lang='ts'>
import useIsochroneState from '@/stores/isochrone'
import { Map } from 'mapbox-gl'
import { storeToRefs } from 'pinia'
import { defineComponent, type PropType, ref } from 'vue'

export default defineComponent({
  props: {
    layerName: {
      type: String,
      required: true
    },
    mapInstance: {
      type: Object as PropType<Map>,
      required: true
    }
  },
  setup(props) {
    const isochroneState = useIsochroneState()
    const { settings } = storeToRefs(isochroneState)
    const mapboxInstance = ref<Map>(props.mapInstance)
    const backgroundColor = ref<string>(`#${settings.value.color}`)
    const opacity = ref<number>(settings.value.opacity)

    const handleOnBackgroundColorChange = ($event: Event) => {
      console.log('event :: ', $event)
      mapboxInstance.value.setPaintProperty(props.layerName, 'fill-color', ($event.target as any).value)
      isochroneState.settings.color = ($event.target as any).value.split('#')[1]
    }

    const handleOnOpacityChange = ($event: Event) => {
      console.log('event', ($event.target as any).valueAsNumber)
      mapboxInstance.value.setPaintProperty(props.layerName, 'fill-opacity', ($event.target as any).valueAsNumber / 100)
      isochroneState.settings.opacity = ($event.target as any).valueAsNumber
    }

    return {
      backgroundColor,
      opacity,
      handleOnBackgroundColorChange,
      handleOnOpacityChange
    }
  }
})
</script>