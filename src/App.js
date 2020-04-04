import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import SignIn from './components/SignIn/SignIn';
import Register from './components/register/Register';
import Facerecognition from './components/facerecognition/Facerecognition';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import Rank from './components/rank/Rank';
import './App.css';

const particleoptions = {
  particles: {
    number: {
      value: 90,
      density: {
        enable: true,
        value_area: 800

      }
    }
  }
}

const initialstate = {
    input: '',
    imageURL: '',
    box: {},
    route: 'SignIn',
    isSignedin: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
}

 class App extends Component {
  constructor() {
    super();
    this.state = initialstate;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }
    })
  }
  calculatefacelocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftcol: clarifaiFace.left_col * width,
      toprow: clarifaiFace.top_row * height,
      rightcol: width - (clarifaiFace.right_col * width),
      bottomrow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayfacebox = (box) => {
    this.setState({box: box});
  }

  onInputchange = (event) => {
    this.setState({input:event.target.value});
  }
  onSubmit = () => {
    this.setState({imageURL:this.state.input});
    fetch('https://quiet-dawn-14948.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response => {
      if (response) {
        fetch('https://quiet-dawn-14948.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
            })
          })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count}))
        })
        .catch(console.log)
      }
      this.displayfacebox(this.calculatefacelocation(response))
    })
    .catch(err => console.log(err));
  }
  onRouteChange = (route) => {
    if (route==='signout') {
      this.setState(initialstate);
    }
    else if (route==='home') {
      this.setState({isSignedin: true});
    }
    this.setState({route: route});
  }
  render() {
    return (
      <div className="App">
        <Particles className='particles'
              params={particleoptions}
            />
        <Navigation onRouteChange={this.onRouteChange} isSignedin={this.state.isSignedin}/>
        { this.state.route === 'home'
        ? <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm onInputchange={ this.onInputchange } onSubmit={ this.onSubmit }/>
            <Facerecognition box={this.state.box} imageURL={this.state.imageURL}/>
          </div>
          : ( this.state.route === 'SignIn' || this.state.route === 'signout'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }
}

export default App;
