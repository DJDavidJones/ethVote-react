import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Menu, Card, Dimmer, Loader, Image, Segment } from "semantic-ui-react";
import Web3 from "web3";
import RegistrationAuthority from "../ethereum/RegistrationAuthority.json";
import ElectionFactory from "../ethereum/ElectionFactory.json";
import Election from "../ethereum/Election.json";

class Elections extends Component {
    state = {
        loading: true,
        metamask: false,
        activeItem: "current"
    };

    async componentDidMount() {
        await this.loadWeb3AndContracts();
    }

    render() {
        const { loading, metamask } = this.state;
        return (
            <React.Fragment>
                {this.renderMenu()}
                {loading ? (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader>Loading</Loader>
                        </Dimmer>
                        <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                    </Segment>
                ) : metamask ? (
                    this.renderList()
                ) : (
                    <Redirect to="/metamask" />
                )}
            </React.Fragment>
        );
    }

    renderMenu() {
        const { activeItem } = this.state;
        return (
            <Menu pointing secondary compact widths={"3"}>
                <Menu.Item
                    name="past"
                    active={activeItem === "past"}
                    onClick={this.handleItemClick}
                />
                <Menu.Item
                    name="current"
                    active={activeItem === "current"}
                    onClick={this.handleItemClick}
                />
                <Menu.Item
                    name="upcoming"
                    active={activeItem === "upcoming"}
                    onClick={this.handleItemClick}
                />
            </Menu>
        );
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });

    renderList() {
        const { elections, activeItem } = this.state;

        let items;
        const currentTime = Math.floor(Date.now() / 1000);
        if (activeItem === "past") {
            items = elections.filter(e => e.timeLimit < currentTime);
        } else if (activeItem === "current") {
            items = elections.filter(
                e => e.startTime < currentTime && e.timeLimit > currentTime
            );
        } else if (activeItem === "upcoming") {
            items = elections.filter(e => e.startTime > currentTime);
        }

        const options = {
            day: "2-digit",
            year: "numeric",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        };
        items = items.map(election => {
            return {
                header: election.title,
                meta: election.description,
                description:
                    new Date(election.startTime * 1000).toLocaleDateString(
                        "da",
                        options
                    ) +
                    " until " +
                    new Date(election.timeLimit * 1000).toLocaleDateString(
                        "en-gb",
                        options
                    ),
                fluid: true
            };
        });

        return (
            <Card.Group
                items={items}
                style={{ marginTop: "0.5em", overflow: "hidden" }}
            />
        );
    }

    async loadWeb3AndContracts() {
        try {
            await window.web3.currentProvider.enable();
            this.setState({ web3: new Web3(window.web3.currentProvider) });
            this.getRegistrationAuthority();
            this.getElectionFactory();
            await this.retrieveDeployedElections();
            this.setState({ loading: false, metamask: true });
        } catch (err) {
            this.setState({ loading: false, metamask: false });
        }
    }

    async retrieveDeployedElections() {
        const { electionFactory } = this.state;
        const addresses = await electionFactory.methods
            .getDeployedElections()
            .call();
        let elections = [];
        addresses.forEach(async e => {
            const contract = this.getElectionContract(e);
            const contractDetails = {
                title: await contract.methods.title().call(),
                description: await contract.methods.description().call(),
                startTime: await contract.methods.startTime().call(),
                timeLimit: await contract.methods.timeLimit().call()
            };
            elections.push(contractDetails);
        });
        this.setState({ elections });
    }

    getRegistrationAuthority() {
        const { web3 } = this.state;
        const address = "0x74F3F1d24c4bE46e1ef261f48EA87768831cA2C2";
        const abi = JSON.parse(RegistrationAuthority.interface);
        const contract = new web3.eth.Contract(abi, address);
        this.setState({ registrationAuthority: contract });
    }

    getElectionFactory() {
        const { web3 } = this.state;
        const address = "0xdCaCCc422B7A2d580Ccaa95909b6A9B2E5b0fc05";
        const abi = JSON.parse(ElectionFactory.interface);
        const contract = new web3.eth.Contract(abi, address);
        this.setState({ electionFactory: contract });
    }

    getElectionContract(address) {
        try {
            const { web3 } = this.state;
            const abi = JSON.parse(Election.interface);
            const contract = new web3.eth.Contract(abi, address);
            return contract;
        } catch (err) {
            console.log(err.message);
        }
    }
}

export default Elections;
