import React, { Component } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import Elections from "./components/Elections";
import Metamask from "./components/Metamask";
import MetamaskWrongNetwork from "./components/MetamaskWrongNetwork";
import Register from "./components/Register";
import About from "./components/About";
import Error from "./components/Error";
import Header from "./components/Header";
import { Container } from "semantic-ui-react";
import ViewElection from "./components/ViewElection";
import CreateNewElection from "./components/CreateNewElection";
import RegistrationAuthority from "./components/RegistrationAuthority";

class App extends Component {
    render() {
        return (
            <HashRouter>
                <Container style={{ margin: "1em" }}>
                    <Header />
                    <link
                        rel="stylesheet"
                        href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
                    />

                    <Switch>
                        <Route path="/" exact component={Elections} />
                        <Route path="/metamask" component={Metamask} />
                        <Route
                            path="/wrongnetwork"
                            component={MetamaskWrongNetwork}
                        />
                        <Route path="/register" component={Register} />
                        <Route
                            path="/registrationauthority"
                            component={RegistrationAuthority}
                        />
                        <Route path="/about" component={About} />
                        <Route
                            path="/election/:address"
                            component={ViewElection}
                        />
                        <Route path="/new" component={CreateNewElection} />
                        <Route component={Error} />
                    </Switch>
                </Container>
            </HashRouter>
        );
    }
}

export default App;
