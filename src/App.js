import React, { Component } from 'react';
import {DropdownButton, ButtonGroup, MenuItem, Button, Carousel} from 'react-bootstrap';
import logo from './logo.svg';
import './lib/bootstrap.css';
import './lib/lumen.css';
import './lib/animate.css';
import './App.css';

class TopBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropDownStates: Array(2).fill(false),
            searching: false
        };
        this.handleHover = this.handleHover.bind(this);
        this.handleSearching = this.handleSearching.bind(this);
    }

    handleHover(i){
        const dropDownStates = this.state.dropDownStates.slice();
        dropDownStates[i] = !dropDownStates[i];
        this.setState({
            dropDownStates: dropDownStates
        });
    }

    handleSearching(e) {
        this.setState({ searching: e.target.value !== '' });
    }

    render() {
        const dropDownClass = [0, 1].map((i) => "dropdown" + this.state.dropDownStates[i]? " open" : "");

        return (
            <div>
                <nav className = "navbar navbar-expand-lg navbar-dark navbar-fixed-top bg-dark">
                    <div className="container-fluid">
                        <div className = "collapse navbar-collapse bs-navbar-collapse">
                            <ul className = "topbar-left">
                                <img className = "logo animated infinite tada" src={logo} alt="Axiom"></img>

                                <ButtonGroup>
                                    <DropdownButton bsStyle="danger" bsSize="large" title="primary" key="0" className={"navbtn " + dropDownClass[0]} noCaret onClick={this.handleHover} onMouseLeave={this.handleHover} id = "bg-nested-dropdwn">
                                      <MenuItem eventKey="1" href="https://github.com/Innoviox/">GitHub</MenuItem>
                                      <MenuItem eventKey="2">Another action</MenuItem>
                                      <MenuItem eventKey="3" active>Active Item</MenuItem>
                                      <MenuItem divider />
                                      <MenuItem eventKey="4">Separated link</MenuItem>
                                    </DropdownButton>
                                </ButtonGroup>
                            </ul>
                            <ul className = "topbar-right">
                                <form className="form-inline my-2 my-lg-0 search-form">
                                    <input className="form-control mr-sm-2" type="text" placeholder="Search the docs..." onInput = {this.handleSearching}></input>
                                    <button className={"btn " + (this.state.searching?"btn-primary":"btn-info")} type="submit" disabled={!this.state.searching}>Search</button>
                                </form>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        )
    }
}


const App = () =>
      <div className="App">
        <TopBar />
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>

export default App;
