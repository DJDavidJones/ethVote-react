import React, { Component } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import Elections from "./components/Elections";
import Metamask from "./components/Metamask";
import Register from "./components/Register";
import About from "./components/About";
import Error from "./components/Error";
import Header from "./components/Header";
import { Container } from "semantic-ui-react";

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
                        <Route path="/register" component={Register} />
                        <Route path="/about" component={About} />
                        <Route component={Error} />
                    </Switch>
                </Container>
            </HashRouter>
        );
    }
}

export default App;
