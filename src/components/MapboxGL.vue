<template>
  <div ref="mapContainerRef" class="map-container" />
</template>

<script lang="ts">
import type { IsochroneData } from '@/models/isochrone/IsochroneData'
import useMapboxState, { type MapboxPosition } from '@/stores/mapbox'
// @ts-ignore
import MapboxGLDraw from '@mapbox/mapbox-gl-draw'
// @ts-ignore
import MapboxGL, {
  type AnyLayer,
  type AnySourceImpl,
  type FillLayer,
  GeoJSONSource,
  type LngLatLike,
  Map,
  Marker
} from 'mapbox-gl'
import { storeToRefs } from 'pinia'
import { defineComponent, onMounted, onUnmounted, type PropType, ref, watch } from 'vue'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<MapboxPosition>,
      required: true
    },
    markerPosition: {
      type: Object as PropType<MapboxPosition>,
      required: true
    },
    drawingPlugin: Boolean,
    isochronePlugin: Boolean,
    isochroneValues: {
      type: Object as PropType<IsochroneData>
    }
  },
  emits: [ 'update:modelValue', 'map:loaded' ],
  setup(props, { emit }) {
    const isochroneSourceName: string = 'isochrone_source'
    const isochroneLayerName: string = 'isochrone_layer'
    const mapboxState = useMapboxState()
    const { marker } = storeToRefs(mapboxState)
    const mapContainerRef = ref<HTMLElement | null>(null)
    const map = ref<Map | undefined>()
    const mapDrawer = ref<MapboxGLDraw | undefined>(new MapboxGLDraw({
      // this is used to allow for custom properties for styling
      // it appends the word "user_" to the property
      userProperties: true
    }))

    watch(() => props.isochronePlugin, (isActive: boolean) => {
      console.log('MapboxGL > watcher > () => props.isochronePlugin ')
      if (!map.value) {
        return
      }

      if (isActive) {
        enableIsochronePlugin()
      } else {
        disableIsochronePlugin()
      }
    })

    watch(() => props.drawingPlugin, (isActive: boolean) => {
      console.log('MapboxGL > watcher > () => props.drawingPlugin ')
      if (!map.value) {
        return
      }

      if (isActive) {
        enableDrawingPlugin()
      } else {
        disableDrawingPlugin()
      }
    })

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

    const configurePlugins = () => {
      if (props.drawingPlugin) {
        enableDrawingPlugin()
      } else {
        disableDrawingPlugin()
      }

      if (props.isochronePlugin) {
        enableIsochronePlugin()
      } else {
        disableIsochronePlugin()
      }
    }

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

      map.value?.addLayer(
          {
            id: isochroneLayerName,
            type: 'fill',
            source: sourceName,
            layout: {},
            paint: {
              'fill-color': data.features[0].properties.fillColor,
              'fill-opacity': data.features[0].properties.fillOpacity
            }
          }
      )
      map.value?.on('click', isochroneLayerName, (e: any) => {
        console.log('isoLayer clicked :: ', e)

        const coordinates: LngLatLike = [ marker.value.lng, marker.value.lat ]
        const description = 'This is an ISO layer'

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : - 360
        }

        map.value?.setPaintProperty(isochroneLayerName, 'fill-color', '#193c63')

        new MapboxGL.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map.value!)
            .on('close', () => {
              map.value?.setPaintProperty(isochroneLayerName, 'fill-color', data.features[0].properties.fillColor)
            })

      });

      (source as GeoJSONSource).setData(data as any)
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
      configurePlugins()

      emit('map:loaded')
    }

    return {
      mapContainerRef,
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