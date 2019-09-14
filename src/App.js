import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Web3 from "web3";
import RegistrationAuthority from "./ethereum/RegistrationAuthority.json";
import ElectionFactory from "./ethereum/ElectionFactory.json";
import Home from "./components/Home";
import Metamask from "./components/Metamask";
import Error from "./components/Error";

class App extends Component {
    state = {
        loading: true
    };

    async componentDidMount() {
        await this.getWeb3AndContracts();

        // to not throw errors in browsers that don't have metamask installed
        if (this.state.web3) {
            console.log(
                "factory manager",
                await this.state.electionFactory.methods.factoryManager().call()
            );
        }
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
        return (
            <BrowserRouter>
                {this.state.web3 === undefined &&
                this.state.loading === false ? (
                    <Redirect to="/metamask" />
                ) : null}
                <Switch>
                    <Route path="/" component={Home} exact />
                    <Route path="/metamask" component={Metamask} />
                    <Route component={Error} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
