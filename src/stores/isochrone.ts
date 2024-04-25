import type { IsochroneData } from '@/models/isochrone/IsochroneData'
import useMapboxState from '@/stores/mapbox'
// @ts-ignore
import { defineStore } from 'pinia'

export type IsochroneState = {
  loading: boolean,
  settings: {
    mode: 'walking' | 'cycling' | 'driving',
    distance: number,
    color: string,
    opacity: number
  },
  data: IsochroneData | undefined,
  api: {
    baseUrl: string,
    accessToken: string
  }
}

const defaultState = (): IsochroneState => ({
  loading: false,
  settings: {
    mode: 'walking',
    distance: 1000,
    color: '2cb27b',
    opacity: 44
  },
  data: undefined,
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
        const url = new URL(`${this.api.baseUrl}${this.settings.mode}/${mapboxState.marker.lng},${mapboxState.marker.lat}`)

        const params = new URLSearchParams()
        params.append('contours_meters', this.settings.distance.toString())
        params.append('polygons', 'true')
        params.append('access_token', this.api.accessToken)
        params.append('contours_colors', '2cb27b')
        url.search = params.toString()

        const query = await fetch(
          url,
          { method: 'GET' }
        )
        const data: IsochroneData = await query.json()

        if (!data) {
          this.data = undefined

          return
        }

        this.data = data
        return data
      } catch (_) {

      } finally {
        this.loading = false
      }
    }
  }
})

export default useIsochroneState
