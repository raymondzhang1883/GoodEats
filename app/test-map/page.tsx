'use client'

import { GoogleMap, LoadScript } from '@react-google-maps/api'

export default function TestMapPage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1 style={{ padding: '20px', background: 'white' }}>Simple Map Test</h1>
      <div style={{ width: '100%', height: 'calc(100vh - 70px)' }}>
        <LoadScript 
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
          onLoad={() => alert('Maps loaded!')}
          onError={() => alert('Maps failed to load!')}
        >
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: 37.7749, lng: -122.4194 }}
            zoom={10}
          >
            <div>Map should be here</div>
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  )
}

