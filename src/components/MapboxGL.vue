<template>
  <div ref="mapContainer" class="map-container" />
</template>

<script lang="ts">
import type { IsochroneState } from '@/stores/isochrone'
import useMapboxState from '@/stores/mapbox'
// @ts-ignore
import MapboxGLDraw from '@mapbox/mapbox-gl-draw'
// @ts-ignore
import MapboxGL, { type AnySourceImpl, GeoJSONSource, Map, Marker } from 'mapbox-gl'
import { storeToRefs } from 'pinia'
import { defineComponent, onMounted, onUnmounted, type PropType, ref, watch } from 'vue'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN

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
    const mapDrawer = ref<MapboxGLDraw | undefined>()

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
        style: 'mapbox://styles/mapbox/outdoors-v12',
        container: mapContainer.value,
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

    const configureDrawingPlugin = () => {
      if (!map.value) {
        return
      }

      mapDrawer.value = new MapboxGLDraw({
        // this is used to allow for custom properties for styling
        // it appends the word "user_" to the property
        userProperties: true,
        controls: {
          'combine_features': false,
          'uncombine_features': false
        },
        styles: [
          // default themes provided by MB Draw
          // default themes provided by MB Draw
          // default themes provided by MB Draw
          // default themes provided by MB Draw


          {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': [ 'all', [ '==', 'active', 'false' ],
              [ '==', '$type', 'Polygon' ],
              [ '!=', 'mode', 'static' ]
            ],
            'paint': {
              'fill-color': '#3bb2d0',
              'fill-outline-color': '#3bb2d0',
              'fill-opacity': 0.1
            }
          },
          {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': [ 'all', [ '==', 'active', 'true' ],
              [ '==', '$type', 'Polygon' ]
            ],
            'paint': {
              'fill-color': '#fbb03b',
              'fill-outline-color': '#fbb03b',
              'fill-opacity': 0.1
            }
          },
          {
            'id': 'gl-draw-polygon-midpoint',
            'type': 'circle',
            'filter': [ 'all', [ '==', '$type', 'Point' ],
              [ '==', 'meta', 'midpoint' ]
            ],
            'paint': {
              'circle-radius': 3,
              'circle-color': '#fbb03b'
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': [ 'all', [ '==', 'active', 'false' ],
              [ '==', '$type', 'Polygon' ],
              [ '!=', 'mode', 'static' ]
            ],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#3bb2d0',
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': [ 'all', [ '==', 'active', 'true' ],
              [ '==', '$type', 'Polygon' ]
            ],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#fbb03b',
              'line-dasharray': [ 0.2, 2 ],
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-line-inactive',
            'type': 'line',
            'filter': [ 'all', [ '==', 'active', 'false' ],
              [ '==', '$type', 'LineString' ],
              [ '!=', 'mode', 'static' ]
            ],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#3bb2d0',
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-line-active',
            'type': 'line',
            'filter': [ 'all', [ '==', '$type', 'LineString' ],
              [ '==', 'active', 'true' ]
            ],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#fbb03b',
              'line-dasharray': [ 0.2, 2 ],
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
            'type': 'circle',
            'filter': [ 'all', [ '==', 'meta', 'vertex' ],
              [ '==', '$type', 'Point' ],
              [ '!=', 'mode', 'static' ]
            ],
            'paint': {
              'circle-radius': 5,
              'circle-color': '#fff'
            }
          },
          {
            'id': 'gl-draw-polygon-and-line-vertex-inactive',
            'type': 'circle',
            'filter': [ 'all', [ '==', 'meta', 'vertex' ],
              [ '==', '$type', 'Point' ],
              [ '!=', 'mode', 'static' ]
            ],
            'paint': {
              'circle-radius': 3,
              'circle-color': '#fbb03b'
            }
          },
          {
            'id': 'gl-draw-point-point-stroke-inactive',
            'type': 'circle',
            'filter': [ 'all', [ '==', 'active', 'false' ],
              [ '==', '$type', 'Point' ],
              [ '==', 'meta', 'feature' ],
              [ '!=', 'mode', 'static' ]
            ],
            'paint': {
              'circle-radius': 5,
              'circle-opacity': 1,
              'circle-color': '#fff'
            }
          },
          {
            'id': 'gl-draw-point-inactive',
            'type': 'circle',
            'filter': [ 'all', [ '==', 'active', 'false' ],
              [ '==', '$type', 'Point' ],
              [ '==', 'meta', 'feature' ],
              [ '!=', 'mode', 'static' ]
            ],
            'paint': {
              'circle-radius': 3,
              'circle-color': '#3bb2d0'
            }
          },
          {
            'id': 'gl-draw-point-stroke-active',
            'type': 'circle',
            'filter': [ 'all', [ '==', '$type', 'Point' ],
              [ '==', 'active', 'true' ],
              [ '!=', 'meta', 'midpoint' ]
            ],
            'paint': {
              'circle-radius': 7,
              'circle-color': '#fff'
            }
          },
          {
            'id': 'gl-draw-point-active',
            'type': 'circle',
            'filter': [ 'all', [ '==', '$type', 'Point' ],
              [ '!=', 'meta', 'midpoint' ],
              [ '==', 'active', 'true' ]
            ],
            'paint': {
              'circle-radius': 5,
              'circle-color': '#fbb03b'
            }
          },
          {
            'id': 'gl-draw-polygon-fill-static',
            'type': 'fill',
            'filter': [ 'all', [ '==', 'mode', 'static' ],
              [ '==', '$type', 'Polygon' ]
            ],
            'paint': {
              'fill-color': '#404040',
              'fill-outline-color': '#404040',
              'fill-opacity': 0.1
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-static',
            'type': 'line',
            'filter': [ 'all', [ '==', 'mode', 'static' ],
              [ '==', '$type', 'Polygon' ]
            ],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#404040',
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-line-static',
            'type': 'line',
            'filter': [ 'all', [ '==', 'mode', 'static' ],
              [ '==', '$type', 'LineString' ]
            ],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#404040',
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-point-static',
            'type': 'circle',
            'filter': [ 'all', [ '==', 'mode', 'static' ],
              [ '==', '$type', 'Point' ]
            ],
            'paint': {
              'circle-radius': 5,
              'circle-color': '#404040'
            }
          },

          // end default themes provided by MB Draw
          // end default themes provided by MB Draw
          // end default themes provided by MB Draw
          // end default themes provided by MB Draw


          // new styles for toggling colors
          // new styles for toggling colors
          // new styles for toggling colors
          // new styles for toggling colors

          {
            'id': 'gl-draw-polygon-color-picker',
            'type': 'fill',
            'filter': [ 'all', [ '==', '$type', 'Polygon' ],
              [ 'has', 'user_portColor' ]
            ],
            'paint': {
              'fill-color': [ 'get', 'user_portColor' ],
              'fill-outline-color': [ 'get', 'user_portColor' ],
              'fill-opacity': 0.5
            }
          },
          {
            'id': 'gl-draw-line-color-picker',
            'type': 'line',
            'filter': [ 'all', [ '==', '$type', 'LineString' ],
              [ 'has', 'user_portColor' ]
            ],
            'paint': {
              'line-color': [ 'get', 'user_portColor' ],
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-point-color-picker',
            'type': 'circle',
            'filter': [ 'all', [ '==', '$type', 'Point' ],
              [ 'has', 'user_portColor' ]
            ],
            'paint': {
              'circle-radius': 3,
              'circle-color': [ 'get', 'user_portColor' ]
            }
          }
        ]
      })

      map.value?.addControl(mapDrawer.value, 'bottom-right')
    }
    const configureIsochroneLayer = () => {
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
      configureDrawingPlugin()
      configureIsochroneLayer()

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
div.map-container {
  flex: 1;
}
</style>