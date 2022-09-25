import './App.css';
import {styles} from "./styles.js";
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);

    //state contains a string representing what is currently displayed on Screen, as well as the values currently entered in the username and password text boxes
    this.state = {
      screenState: 'login',
      currentUser: '',
      currentPass: ''
    }

    //bind functions
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.resetScreen = this.resetScreen.bind(this)
  }

  //this function is called when login button is pressed, changes screen state to that of home screen, or logged in screen
  handleClick () {
    this.setState({screenState: 'home'});
  }

  //this function is called when login is failed, and screen needs to reset to it's default state
  resetScreen (){
    this.setState({screenState: 'login'});
  }

  //this function handles when the values in the text boxes are changed
  handleChange (val) {
    if (val.target.id=="user"){
      this.setState({currentUser: val.target.value});
    }
    else if (val.target.id=="pass"){
      this.setState({currentPass: val.target.value});
    }
  }

  render() {
    const { screenState } = this.state;

    //if current screen state is Login, handle rendering of the login screen i.e. username password text boxes and a login button
    if (screenState == 'login'){
      return (
        <center>
          <PNSTitle />
          <div>
            <div>
              <h2 style={{display: 'inline-block'}}>Username:</h2>
              <input type="text" id="user" name="user" onChange={this.handleChange} style={{marginLeft: '1em'}}></input>
            </div>
            <div>
              <h2 style={{display: 'inline-block'}}>Password:</h2>
              <input type="text" id="pass" name="pass" onChange={this.handleChange} style={{marginLeft: '1em'}}></input>
            </div>
            <button onClick={this.handleClick}>Login</button>
          </div> 
        </center>
      )
    }
    //if not login screen, render the home screen instead, and pass the current username and password values to attempt login
    else {
      return (
        <center>
          <PNSTitle />
          <HomeScreen username = {this.state.currentUser} password = {this.state.currentPass} resetScreen = {this.resetScreen}/>
        </center>
      )
    }
  };
}

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    //state contains a value to represent which menu is currently displayed, the list of notifications and personal details recieved from the database after logging in,
    //as well as how many notifications are new since last login, and whether or not data loading has completed.
    this.state = {
      curDisplay: 'home',
      notifications: [],
      details: [],
      steps: [],
      weights: [],
      unreadNotifications: 0,
      tooltip: [],
      tooltipSubject: '',
      tooltipBody:'',
      dataIsLoaded: false
    };

    //bind functions
    this.fetchData = this.fetchData.bind(this)
    this.updateTooltip = this.updateTooltip.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  //when a button is pressed, it returns a value for which menu to display, set the new display to that of the passed value, and if the notifications menu is opened, then set the value of unread notification to 0
  handleClick (selection) {
    if (selection == 'notis'){
      this.setState({unreadNotifications: 0});
    }
    this.setState({curDisplay: selection});
  }

  //function used to attempt login, and retrieve data from the database to store in state
  fetchData = () => {
    //create fetch request
    try {
    fetch('https://547wxir4gi.execute-api.ap-southeast-2.amazonaws.com/Stage-two/', {
      method: "POST",
      mode: "cors",
      dataType: "JSON",
      headers: {
        "Content-Type": "application/json;",
      },
      body: JSON.stringify({
          username: this.props.username,
          password: this.props.password
      })
    })
    //after response retrieved parse the response as JSON
    .then(response => response.json())
    //then update the state values, set state to Home (main menu), notifications, details and unreadNotifications as the values retrieved from the database, and set DataIsLoaded to true.
    //.then(response => this.setState({ curDisplay: 'home', notifications: response.notifications, details: response.patientData, unreadNotifications: response.newNotifications, dataIsLoaded: true }));
    .then(response => this.setState({ curDisplay: 'home', notifications: response.notifications, details: response.patientData, steps: response.steps, weights: response.weights, unreadNotifications: response.newNotifications, dataIsLoaded: true }));
    }
    catch {
      this.props.resetScreen()
      alert("Failed to connect to server")
    }
  }

  updateTooltip (tooltipValues) {
    this.setState({tooltip: tooltipValues});
  }

  //when this component is loaded successfully, run the fetchData function
  componentDidMount() {
    this.fetchData();
  }

  render() {
    //if data hasn't finished loading, display a loading message
    if (!this.state.dataIsLoaded){
      return (
        <div>Loading...</div>
      )
    }
    //if the loading did not return valid data, reset to the login screen
    else if (this.state.details == undefined){
      this.props.resetScreen();
      alert("Incorrect login details");
    }
    //if the current display is Home, render the main menu i.e. buttons representing extended menus
    else if (this.state.curDisplay == 'home'){
      return (
        <div>
          <h1>Hello {String(this.state.details).split(",")[0]}</h1>
          <button onClick={() => this.handleClick("details")} style={{display: 'inline-block'}}>details</button>
          <button onClick={() => {this.updateTooltip(["Select a notification", "it's details will be displayed here", ""]); this.handleClick("notis")}} style={{display: 'inline-block'}}>notifications ({this.state.unreadNotifications})</button>
          <button onClick={() => this.handleClick("weights")}>weight entries</button>
          <button onClick={() => this.handleClick("steps")}>step entries</button>
        </div>
      )
    }
    //if the current display is details, display all details one after another
    else if (this.state.curDisplay == 'details'){
        return (
          <div>
            <button onClick={() => this.handleClick("home")} ><b>back</b></button>
            <center style={{lineHeight: '0', maxWidth: '55ch', textAlign: 'left', backgroundColor: 'powderblue', border: '1px solid black', borderRadius: '15px'}}>
              <p style={{marginLeft: '3ch', width: '8ch', display:'inline-block'}}><b>Name:</b></p>
              <p style={{display:'inline'}}>{this.state.details[0][0]}</p>
              <p></p>
              <p style={{marginLeft: '3ch', width: '8ch', display:'inline-block'}}><b>E-mail:</b></p>
              <p style={{display:'inline'}}>{this.state.details[0][1]}</p>
              <p></p>
              <p style={{marginLeft: '3ch', width: '8ch', display:'inline-block'}}><b>Age:</b></p>
              <p style={{display:'inline'}}>{this.state.details[0][2]}</p>
            </center>
          </div>
        )
    }
    //if the current display is notis, create a list group and populate it with all notifications then display it
    else if (this.state.curDisplay == 'notis'){
      return (
        <center style={{maxWidth: '55ch'}}>
          <button onClick={() => this.handleClick("home")}><b>back</b></button>
          <div style={{backgroundColor: 'powderblue', border: '1px solid black', borderRadius: '15px'}}>
            <h2>{this.state.tooltip[0]}</h2>
            <p>{this.state.tooltip[1]}</p>
            <p>{this.state.tooltip[2]}</p>  
          </div>
          <ul className="list-group" style={{marginLeft: '-4.5ch'}}>
            {this.state.notifications.map(listitem => (
              <li style={styles.listObject} onClick={() => this.updateTooltip([listitem[1], listitem[2], `${listitem[0][2]}/${listitem[0][1]}/${listitem[0][0]}`])} key={`${listitem[0][2]} - ${listitem[0][1]} - ${listitem[0][0]} - ${listitem[0][3]} - ${listitem[0][4]} - ${listitem[0][5]}`}>
                <p style={styles.dateString}><b>Date:</b> {`${listitem[0][2]}/${listitem[0][1]}/${listitem[0][0]}`} </p>
                <p style={{display: 'inline-block'}}><b>Subject:</b> {listitem[1]}</p>
              </li>
            ))}
          </ul>
        </center>
      )
    }
    //if the current display is weights, create a list group and populate it with all weight values then display it
    else if (this.state.curDisplay == 'weights'){
      return (
        <center style={{maxWidth: '39ch'}}>
          <button onClick={() => this.handleClick("home")} ><b>back</b></button>
          <ul className="list-group" style={{marginLeft: '-4ch'}}>
            {this.state.weights.map(listitem => (
              <li style={styles.listObject} key={`${listitem[0][2]} - ${listitem[0][1]} - ${listitem[0][0]} - ${listitem[0][3]} - ${listitem[0][4]} - ${listitem[0][5]}`}>
                <p style={styles.dateString}><b>Date:</b> {`${listitem[0][2]}/${listitem[0][1]}/${listitem[0][0]}`} </p>
                <p style={{display: 'inline-block'}}><b>Weight:</b> {listitem[1]}<b>kg</b></p>
              </li>
            ))}
          </ul>
        </center>
      )
    }
    //if the current display is steps, create a list group and populate it with all step values then display it
    else if (this.state.curDisplay == 'steps'){
      return (
        <center style={{maxWidth: '36ch'}}>
          <button onClick={() => this.handleClick("home")} ><b>back</b></button>
          <ul className="list-group" style={{marginLeft: '-4ch'}}>
            {this.state.steps.map(listitem => (
              <li style={styles.listObject} key={`${listitem[0][2]} - ${listitem[0][1]} - ${listitem[0][0]} - ${listitem[0][3]} - ${listitem[0][4]} - ${listitem[0][5]}`}>
                <p style={styles.dateString}><b>Date:</b> {`${listitem[0][2]}/${listitem[0][1]}/${listitem[0][0]}`} </p>
                <p style={{display: 'inline-block'}}><b>Steps:</b> {listitem[1]}</p>
              </li>
            ))}
          </ul>
        </center>
      )
    }
  }
}

class PNSTitle extends React.Component {
  render() {
    return (
      <div>
        <h1>Patient Notifier System</h1>
      </div>
    )
  }
}

export default App;
