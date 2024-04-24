import useMapboxState from '@/stores/mapbox'
import { defineStore } from 'pinia'

export type IsochroneState = {
  loading: boolean,
  settings: {
    mode: 'walking' | 'cycling' | 'driving',
    duration: number
  },
  values: any,
  api: {
    baseUrl: string,
    accessToken: string
  }
}

const defaultState = (): IsochroneState => ({
  loading: false,
  settings: {
    mode: 'walking',
    duration: 10
  },
  values: undefined,
  api: {
    baseUrl: 'https://api.mapbox.com/isochrone/v1/mapbox/',
    accessToken: import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN
  }
})

const id: string = 'isochrone-state'

const useIsochroneState = defineStore(id, {
  state: defaultState,
  actions: {
    async getIsochroneValue(): Promise<any> {
      const mapboxState = useMapboxState()

      this.loading = true

      try {
        const query = await fetch(
          `${this.api.baseUrl}${this.settings.mode}/${mapboxState.current.lng},${mapboxState.current.lat}?contours_minutes=${this.settings.duration}&polygons=true&access_token=${this.api.accessToken}`,
          { method: 'GET' }
        )
        const data: any = await query.json()

        if (!data) {
          this.values = undefined

          return
        }

        this.values = data
        console.log('getIsochroneValue :: ', data)
        return data
      } catch (_) {

      } finally {
        this.loading = false
      }
    }
  }
})

export default useIsochroneState
