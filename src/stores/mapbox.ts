import { defineStore } from 'pinia'

export type MapboxPosition = {
  lng: number,
  lat: number,
  bearing: number,
  pitch: number,
  zoom: number
}

export type MapboxState = {
  base: MapboxPosition,
  current: MapboxPosition
}

const defaultState = (): MapboxState => ({
  base: {
    lng: 4.586389684507004,
    lat: 50.730783284021605,
    bearing: 0,
    pitch: 0,
    zoom: 15
  },
  current: {
    lng: 4.586389684507004,
    lat: 50.730783284021605,
    bearing: 0,
    pitch: 0,
    zoom: 15
  }
})

const id: string = 'mapbox-state'

const useMapboxState = defineStore<typeof id, MapboxState>(id, {
  state: defaultState
})

export default useMapboxState
