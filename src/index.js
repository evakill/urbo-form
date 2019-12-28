import React from 'react';
import ReactDOM from 'react-dom';
import Autocomplete from 'react-google-autocomplete'
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps'
import Geocode from 'react-geocode'
import s from 'styled-components'
import { WHITE, SNOW, LGRAY, DGRAY, GREEN } from './colors'

Geocode.setApiKey('AIzaSyDpGqbEEnWyjUZuNaShzMYLcCcM5spQKng');

const Page = s.div`
  background-color: ${SNOW};
  font-family: sans-serif;
  font-size: 16px;
  color: ${DGRAY};
  margin: 6rem 20rem;
  @media (max-width:800px) {
    margin: 2rem 3rem;
  }
  @media (max-width:1200px) {
    margin: 6rem 10rem;
  }
`

const Icon = s.span`
  font-size: 16px;
  margin-left: 5px;
  padding: 2px;
`

const ReadMore = s.div`
  &:hover p {
    display: block;
  }
`

const Description = s.p`
  display: none
  transition: display 3s ease;
  margin: 15px;
`

const GoogleInput = s.div`
  padding: 7px;
  border: 1px solid #dadada;
  border-top: none;
  font-size: 16;
  color: ${DGRAY};
`

const MyMapComponent = withGoogleMap(props => {
  const { lat, lng, zoom, address, dropMarker } = props
  return (
    <GoogleMap
      zoom={zoom || 12}
      center={{ lat, lng }}>
      <Marker
        draggable
        position={{ lat, lng }}
        onDragEnd={({ latLng }) => dropMarker(latLng)} />
    </GoogleMap>
  )
})

class Form extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      city: '',
      name: '',
      desc: '',
      lat: '',
      lng: '',
      address: '',
      instr: '',
      email: '',
      cities: [],
      valid: true,
      submitted: false,
      err: false
    }
  }

  componentWillMount() {
    fetch('http://localhost:8000/cities')
    .then(resp => resp.json())
    .then(cities => this.setState({ cities, city: cities[0] }))
  }

  dropMarker (latLng) {
    const lat = latLng.lat()
    const lng = latLng.lng()
    Geocode.fromLatLng(lat, lng).then(
      response => {
        const address = response.results[0].formatted_address;
        this.setState({ address, lat, lng })
      },
      error => {
        console.error(error);
      }
    );
  }

  setPlace(place) {
    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    const address = place.formatted_address
    this.setState({ lat, lng, address })
  }

  validateForm() {
    const { city, name, desc, lat, lng, address, instr} = this.state
    console.log(this.state)
    if (!city || !name || !desc || !address || !instr) this.setState({valid: false})
    else {
      this.setState({ valid: true })
      fetch('http://localhost:8000/dest/new', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ city, name, desc, lat, lng, instr })
      })
      .then(resp => this.setState({submitted: true}))
      .catch(err => this.setState({err: true}))
    }
  }

  reset() {
    this.setState({
        name: '',
        desc: '',
        lat: '',
        lng: '',
        address: '',
        instr: '',
        email: '',
        valid: true,
        submitted: false,
        err: false
      })
    this.forceUpdate()
  }

  render () {
    const { cities, city, lat, lng, address, valid, submitted, err } = this.state
    if (submitted) {
      return (
        <Page>
          <h1 className="title">URBO</h1>
          <p className="is-size-5"> Thank you for your contribution to URBO! Stay tuned for the release of the app. </p>
          <br/>
          <p className="is-size-6">In the mean time, why not submit a couple more...</p>
          <div className="is-flex" style={{ justifyContent: 'flex-end'}}>
            <button class="button is-success" onClick={() => this.reset()}>Back to Form</button>
          </div>
        </Page>
      )
    }
    return (
      <Page>
        <h1 className="title">URBO</h1>
        <ReadMore className="is-size-6">
          Read more about the project
          <Icon>
            <i className="fas fa-chevron-down"></i>
          </Icon>
          <Description>This form collects data for an app I'm building, URBO. The app will present users with a map of their city marked with special locations. To discover more information about these destinations, users must physically visit the site. The goal is not to be convenient, or efficient, or useful––it's to explore and discover new and unexpected parts of a city, whether you're a tourist or long-time resident. I hope to democratize access to the free and public uniquities that make cities hubs of life, interaction, and creativity.
          </Description>
        </ReadMore>
        <br/>
        <p className="is-size-6">For these purposes, define a <em>destination</em> as a place in a city to discover, explore, and share. It could be public artwork, a nice park, a cool view, a beautiful mural, a historic building, or a pretty neighborhood. It should be public, free, and interesting. Feel free to interpret this however you choose! </p>
        <br/>
        <div className="field">
          <label className="label">City</label>
          <div className="control">
            <div className="select" style={{ width: '100%'}}>
              <select
                onChange={(e) => this.setState({ city: cities.find(city => city.name === e.target.value) })}
                style={{ width: '100%'}}>
                { cities.map(city => <option key={city._id}>{city.name}</option>)}
              </select>
            </div>
          </div>
          <p className="help">
            More coming soon! Email <a href="mailto:evakillenberg@gmail.com">evakillenberg@gmail.com</a> with suggestions
          </p>
        </div>

        <div className="field">
          <label className="label">Name of Destination</label>
          <div className="control">
            <input
              className="input"
              type="text"
              placeholder="Name"
              onChange={(e) => this.setState({ name: e.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Description</label>
          <div className="control">
            <textarea
              className="textarea"
              placeholder="Description"
              onChange={(e) => this.setState({ desc: e.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Place of Destination</label>

          <div>{address}</div>

          <div className="help">Search for a location or drag the marker to set the place. Be exact as possible.</div>
        </div>

        { (lat && lng) ? (
          <MyMapComponent
            isMarkerShown
            lat={lat}
            lng={lng}
            address={address}
            zoom={18}
            googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `400px` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            dropMarker={this.dropMarker.bind(this)}
          />
        ) : city ? (
          <MyMapComponent
            lat={city.lat}
            lng={city.lng}
            address={address}
            googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `400px` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            dropMarker={this.dropMarker.bind(this)}
          />
        ) : <div style={{ height: 400, backgroundColor: LGRAY }}></div>}

        <GoogleInput className="control">
          <Autocomplete
            style={{ border: 0, fontSize: 16, outline: 'none', width: '100%' }}
            onPlaceSelected={place => this.setPlace(place)}
            types={['geocode', 'establishment']}
          />
        </GoogleInput>

        <br/>

        <div className="field">
          <label className="label">Instructions</label>
          <div className="control">
            <textarea
              className="textarea"
              placeholder="Intructions"
              onChange={(e) => this.setState({ instr: e.target.value })}
            />
            <p className="help">How can someone best get to, see, and/or experience the destination?</p>
          </div>
        </div>
        <br/>
        <div className="is-flex" style={{ justifyContent: 'flex-end'}}>
          <button class="button is-success" onClick={() => this.validateForm()}>Submit</button>
        </div>
        { !valid ? <div class="help" style={{ color: 'red' }}>Please fill out all required fields!</div> : '' }
        { err ? <div class="help" style={{ color: 'red' }}>Sorry! There was an error with this submission. Check your inputs and try again. If the error persists, please contact <a href="mailto:evakillenberg@gmail.com">evakillenberg@gmail.com</a>.</div> : '' }
        <br/>
        <p> Thank you for contributing! Please direct questions or comments to <a href="mailto:evakillenberg@gmail.com">evakillenberg@gmail.com</a>. Happy exploring! </p>
      </Page>
    )
  }
}

ReactDOM.render(<Form />, document.getElementById('root'));
