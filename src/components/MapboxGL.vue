<template>
  <div ref="mapContainerRef" class="map-container">
    <div id="popup" ref="layerSettingsEditionPopupRef">
      <LayerSettingsEditionPopup
          v-if='layerSelected && map'
          :layerName='layerSelected.id'
          :mapInstance='map' />
    </div>
  </div>
</template>

<script lang="ts">
import LayerSettingsEditionPopup from '@/components/popups/LayerSettingsEditionPopup.vue'
import type { IsochroneData } from '@/models/isochrone/IsochroneData'
import useIsochroneState from '@/stores/isochrone'
import useMapboxState, { type MapboxPosition } from '@/stores/mapbox'
// @ts-ignore
import MapboxGLDraw from '@mapbox/mapbox-gl-draw'
// @ts-ignore
import MapboxGL, { type AnySourceImpl, type FillLayer, GeoJSONSource, type LngLatLike, Map, Marker } from 'mapbox-gl'
import { storeToRefs } from 'pinia'
import { defineComponent, onMounted, onUnmounted, type PropType, ref, watch } from 'vue'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN

export type MapboxGLType = {
  plugins: {
    isochrone: {
      enable(): void,
      disable(): void,
    },
    drawing: {
      enable(): void,
      disable(): void
    }
  }
}

export default defineComponent({
  components: { LayerSettingsEditionPopup },
  props: {
    modelValue: {
      type: Object as PropType<MapboxPosition>,
      required: true
    },
    markerPosition: {
      type: Object as PropType<MapboxPosition>,
      required: true
    },
    isochroneValues: {
      type: Object as PropType<IsochroneData>
    }
  },
  expose: [ 'enableIsochronePlugin', 'disableIsochronePlugin', 'enableDrawingPlugin', 'disableDrawingPlugin' ],
  emits: [ 'update:modelValue', 'map:loaded' ],
  setup(props, { emit, expose }) {
    const isochroneSourceName: string = 'isochrone_source'
    const isochroneLayerName: string = 'isochrone_layer'
    const mapboxState = useMapboxState()
    const { marker } = storeToRefs(mapboxState)
    const isochroneState = useIsochroneState()
    const { settings } = storeToRefs(isochroneState)
    const mapContainerRef = ref<HTMLElement | null>()
    const map = ref<Map | undefined>()
    const mapDrawer = ref<MapboxGLDraw | undefined>(new MapboxGLDraw({
      // this is used to allow for custom properties for styling
      // it appends the word "user_" to the property
      userProperties: true
    }))
    const layerSelected = ref<FillLayer | undefined>()
    const layerSettingsEditionPopupRef = ref<HTMLDivElement | null>()

    watch(() => props.isochroneValues, (data) => {
      console.log('MapboxGL > watcher > () => props.isochroneValues ')
      if (!props.isochroneValues || !map.value || !data) {
        return
      }

      attachIsochroneLayerToSource(isochroneSourceName, data)
    }, { deep: true })

    onMounted(() => {
      if (!mapContainerRef.value) {
        return
      }

      const { lng, lat, zoom, bearing, pitch } = props.modelValue

      map.value = new Map({
        container: mapContainerRef.value,
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

    const enableDrawingPlugin = () => {
      if (!mapDrawer.value || !map.value) {
        return
      }

      map.value?.addControl(mapDrawer.value, 'bottom-right')
    }

    const disableDrawingPlugin = () => {
      if (!mapDrawer.value || !map.value) {
        return
      }

      if (map.value?.hasControl(mapDrawer.value)) {
        map.value?.removeControl(mapDrawer.value)
      }
    }

    const enableIsochronePlugin = () => {
      if (!map.value || map.value?.getSource(isochroneSourceName)) {
        return
      }

      map.value?.addSource(isochroneSourceName, {
        type: 'geojson',
        data: {
          features: [],
          type: 'FeatureCollection'
        }
      })
    }

    const disableIsochronePlugin = () => {
      if (!map.value) {
        return
      }


      if (map.value?.getLayer(isochroneLayerName)) {
        map.value?.removeLayer(isochroneLayerName)
      }

      if (map.value?.getSource(isochroneSourceName)) {
        map.value?.removeSource(isochroneSourceName)
      }
    }

    const attachIsochroneLayerToSource = (sourceName: string, data: IsochroneData) => {
      if (!map.value) {
        return
      }

      const source: AnySourceImpl = map.value?.getSource(isochroneSourceName)

      if (map.value?.getLayer(isochroneLayerName)) {
        map.value?.removeLayer(isochroneLayerName)
      }

      const layer: FillLayer = {
        id: isochroneLayerName,
        type: 'fill',
        source: sourceName,
        layout: {},
        paint: {
          'fill-color': `#${settings.value.color}`,
          'fill-opacity': settings.value.opacity / 100
        }
      }

      map.value?.addLayer(layer)

      map.value?.on('click', isochroneLayerName, (e: any) => {
        console.log('isoLayer clicked :: ', e)
        layerSelected.value = map.value?.getLayer(isochroneLayerName) as FillLayer

        const coordinates: LngLatLike = [ marker.value.lng, marker.value.lat ]

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : - 360
        }


        const h1 = document.createElement('h1')
        h1.innerHTML = 'Hey there'

        new MapboxGL.Popup()
            .setLngLat(coordinates)
            .setDOMContent(layerSettingsEditionPopupRef.value!)
            .addTo(map.value!)
            .on('close', () => {
              layerSelected.value = undefined
            })
      });

      (source as GeoJSONSource).setData(data as any)
    }

    const initMapListeners = () => {
      if (!map.value) {
        return
      }

      map.value?.on('move', updateMapView)
      map.value?.on('zoom', updateMapView)
      map.value?.on('rotate', updateMapView)
      map.value?.on('pitch', updateMapView)
    }

    const handleOnLoad = () => {
      initMapListeners()

      configureCurrentPositionMarker()

      emit('map:loaded')
    }

    const popupClicked = () => {
      console.log('popup clicked')
    }

    expose({
      plugins: {
        isochrone: {
          enable: enableIsochronePlugin,
          disable: disableIsochronePlugin
        },
        drawing: {
          enable: enableDrawingPlugin,
          disable: disableDrawingPlugin
        }
      }
    })

    return {
      layerSettingsEditionPopupRef,
      mapContainerRef,
      popupClicked,
      layerSelected,
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