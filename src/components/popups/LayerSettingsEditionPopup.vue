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
import { Map } from 'mapbox-gl'
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
    const mapboxInstance = ref<Map>(props.mapInstance)
    const backgroundColor = ref<string>(mapboxInstance.value.getPaintProperty(props.layerName, 'fill-color') ?? '')
    const opacity = ref<number>(mapboxInstance.value.getPaintProperty(props.layerName, 'fill-opacity') * 100 ?? 0)

    const handleOnBackgroundColorChange = ($event: Event) => {
      console.log('event :: ', $event)
      mapboxInstance.value.setPaintProperty(props.layerName, 'fill-color', ($event.target as any).value)
    }

    const handleOnOpacityChange = ($event: Event) => {
      console.log('event', ($event.target as any).valueAsNumber)
      mapboxInstance.value.setPaintProperty(props.layerName, 'fill-opacity', ($event.target as any).valueAsNumber / 100)
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