<template>
  <div ref="mapContainerRef" class="map-container">
    <div id="popup" ref="layerSettingsEditionPopupRef">
      <LayerSettingsEditionPopup
          v-if='layerSelected && map'
          :layerName='layerSelected.id'
          :mapInstance='map' />
    </div>
    <div id='mode' ref='drawingMethodSelectRef'>
      <DrawMethodSelector
          v-if='map && mapDrawer && mapDrawerModes && drawPluginEnabled'
          :map='map'
          :mapDrawer='mapDrawer'
          :mapDrawerModes='mapDrawerModes' />
    </div>
  </div>
</template>

<script lang="ts">
import DrawMethodSelector from '@/components/draw/DrawMethodSelector.vue'
import LayerSettingsEditionPopup from '@/components/popups/LayerSettingsEditionPopup.vue'
import type { IsochroneData } from '@/models/isochrone/IsochroneData'
import useIsochroneState from '@/stores/isochrone'
import useMapboxState, { type MapboxPosition } from '@/stores/mapbox'
// @ts-ignore
import MapboxGLDraw from '@mapbox/mapbox-gl-draw'
// @ts-ignore
import MapboxGL, { type AnySourceImpl, type FillLayer, GeoJSONSource, type LngLatLike, Map, Marker } from 'mapbox-gl'
// @ts-ignore
import * as MapboxDrawGeodesic from 'mapbox-gl-draw-geodesic'
import { storeToRefs } from 'pinia'
import { computed, defineComponent, onMounted, onUnmounted, type PropType, ref, watch } from 'vue'


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
  components: { DrawMethodSelector, LayerSettingsEditionPopup },
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
    const drawPluginEnabled = ref<boolean>(false)
    const mapDrawerModes = ref<MapboxDrawGeodesic.modes | undefined>()
    const mapDrawer = computed<MapboxGLDraw | undefined>(() => {
      let modes = MapboxGLDraw.modes
      modes = MapboxDrawGeodesic.enable(modes)

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      mapDrawerModes.value = modes

      return new MapboxGLDraw({
        modes: modes as any,
        displayControlsDefault: false,
        controls: {
          trash: true
        }
      })
    })
    const layerSelected = ref<FillLayer | undefined>()
    const layerSettingsEditionPopupRef = ref<HTMLDivElement | null>()
    const drawingMethodSelectRef = ref<HTMLDivElement | null>()

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
        style: 'mapbox://styles/alarestomax/clvgm9ap900u201o0699nhn83',
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
      drawPluginEnabled.value = true

      if (!mapDrawer.value || !map.value) {
        return
      }

      map.value?.addControl(mapDrawer.value, 'bottom-right')
    }

    const disableDrawingPlugin = () => {
      drawPluginEnabled.value = false

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
        console.log(`${isochroneLayerName} clicked :: `, e)
        layerSelected.value = map.value?.getLayer(isochroneLayerName) as FillLayer

        const coordinates: LngLatLike = [ marker.value.lng, marker.value.lat ]

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : - 360
        }

        new MapboxGL.Popup()
            .setLngLat(coordinates)
            .setDOMContent(layerSettingsEditionPopupRef.value!)
            .addTo(map.value!)
            .on('close', () => {
              layerSelected.value = undefined
            })
      })

      ;(source as GeoJSONSource).setData(data as any)
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
      drawingMethodSelectRef,
      map,
      mapDrawer,
      layerSelected,
      drawPluginEnabled,
      mapDrawerModes
    }
  }
})
</script>

<style>
div.map-container {
  flex: 1;
}
</style>