import React, { Component } from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import Web3 from "web3";
import RegistrationAuthority from "./ethereum/RegistrationAuthority.json";
import ElectionFactory from "./ethereum/ElectionFactory.json";
import Home from "./components/Home";
import Metamask from "./components/Metamask";
import Help from "./components/Help";
import About from "./components/About";
import Error from "./components/Error";
import Header from "./components/Header";
import { Container } from "semantic-ui-react";

class App extends Component {
    state = {
        loading: true
    };

    async componentDidMount() {
        await this.getWeb3AndContracts();
    }

    async getWeb3AndContracts() {
        try {
            await window.web3.currentProvider.enable();
            this.setState({ web3: new Web3(window.web3.currentProvider) });
            await this.getRegistrationAuthority();
            await this.getElectionFactory();
            this.setState({ loading: false });
        } catch (err) {
            this.setState({ loading: false });
        }
    }

    async getRegistrationAuthority() {
        const { web3 } = this.state;
        const address = "0x74F3F1d24c4bE46e1ef261f48EA87768831cA2C2";
        const abi = JSON.parse(RegistrationAuthority.interface);
        const contract = new web3.eth.Contract(abi, address);
        this.setState({ registrationAuthority: contract });
    }

    async getElectionFactory() {
        const { web3 } = this.state;
        const address = "0xdCaCCc422B7A2d580Ccaa95909b6A9B2E5b0fc05";
        const abi = JSON.parse(ElectionFactory.interface);
        const contract = new web3.eth.Contract(abi, address);
        this.setState({ electionFactory: contract });
    }

    render() {
        const {
            loading,
            web3,
            registrationAuthority,
            electionFactory
        } = this.state;
        return (
            <HashRouter>
                <Container style={{ margin: "1em" }}>
                    <Header />
                    <link
                        rel="stylesheet"
                        href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
                    />

                    {this.state.web3 === undefined &&
                    this.state.loading === false ? (
                        <Redirect to="/metamask" />
                    ) : null}

                    <Switch>
                        {/*prettier-ignore*/}
                        <Route
                            path="/"
                            exact
                            render={props => (
                                <Home
                                    {...props}
                                    loading={loading}
                                    web3={web3}
                                    registrationAuthority={registrationAuthority}
                                    electionFactory={electionFactory}
                                />
                            )}
                        />
                        <Route path="/metamask" component={Metamask} />
                        <Route path="/help" component={Help} />
                        <Route path="/about" component={About} />
                        <Route component={Error} />
                    </Switch>
                </Container>
            </HashRouter>
        );
    }
}

export default App;
