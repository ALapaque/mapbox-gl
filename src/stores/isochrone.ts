import { defineStore } from 'pinia'

export type IsochroneState = {
  settings: {
    mode: 'walking' | 'cycling' | 'driving',
    duration: number
  },
  values: any[]
}

const defaultState = (): IsochroneState => ({
  settings: {
    mode: 'driving',
    duration: 10
  },
  values: []
})

const id: string = 'isochrone-state'

const useIsochroneState = defineStore<typeof id, IsochroneState>(id, {
  state: defaultState
})

export default useIsochroneState
