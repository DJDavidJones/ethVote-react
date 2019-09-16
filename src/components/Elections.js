import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Card, Dimmer, Loader, Image, Segment } from "semantic-ui-react";
import Web3 from "web3";
import RegistrationAuthority from "../ethereum/RegistrationAuthority.json";
import ElectionFactory from "../ethereum/ElectionFactory.json";
import Election from "../ethereum/Election.json";
import ElectionMenu from "./electionComponents/ElectionMenu";
import ElectionCards from "./electionComponents/ElectionCards";

class Elections extends Component {
    state = {
        redirect: false,
        showLoader: true,
        activeItem: "current",
        elections: []
    };

    async componentDidMount() {
        await this.loadAllRelevantData();
    }

    async loadAllRelevantData() {
        let web3, regAuthority, electionFactory;
        try {
            // Get Web3 and contracts
            await window.web3.currentProvider.enable();
            web3 = new Web3(window.web3.currentProvider);
            regAuthority = this.getRegistrationAuthority(web3);
            electionFactory = this.getElectionFactory(web3);

            // Get Elections
            const addresses = await electionFactory.methods
                .getDeployedElections()
                .call();

            // forEach doesn't await all instructions
            // See: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
            await Promise.all(
                addresses.map(async e => {
                    const contract = this.getElectionContract(web3, e);
                    const contractDetails = {
                        title: await contract.methods.title().call(),
                        description: await contract.methods
                            .description()
                            .call(),
                        startTime: await contract.methods.startTime().call(),
                        timeLimit: await contract.methods.timeLimit().call()
                    };

                    this.setState({
                        elections: [...this.state.elections, contractDetails]
                    });
                })
            );

            this.setState(function(prevState, props) {
                return {
                    showLoader: false,
                    web3,
                    regAuthority,
                    electionFactory
                };
            });
        } catch (err) {
            this.setState(function(prevState, props) {
                return { redirect: true };
            });
        }
    }

    getRegistrationAuthority(web3) {
        const address = "0x74F3F1d24c4bE46e1ef261f48EA87768831cA2C2";
        const abi = JSON.parse(RegistrationAuthority.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    getElectionFactory(web3) {
        const address = "0xdCaCCc422B7A2d580Ccaa95909b6A9B2E5b0fc05";
        const abi = JSON.parse(ElectionFactory.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    getElectionContract(web3, address) {
        const abi = JSON.parse(Election.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });

    render() {
        return (
            <React.Fragment>
                <ElectionMenu
                    activeItem={this.state.activeItem}
                    onItemClick={this.handleItemClick}
                />

                {this.state.redirect ? <Redirect to="/metamask" /> : null}

                {this.state.showLoader ? (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader>Loading</Loader>
                        </Dimmer>
                        <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                    </Segment>
                ) : null}

                <ElectionCards
                    elections={this.state.elections}
                    activeItem={this.state.activeItem}
                />
            </React.Fragment>
        );
    }

    renderList() {
        let items;
        const currentTime = Math.floor(Date.now() / 1000);
        if (this.state.activeItem === "past") {
            items = this.state.elections.filter(e => e.timeLimit < currentTime);
        } else if (this.state.activeItem === "current") {
            items = this.state.elections.filter(
                e => e.startTime < currentTime && e.timeLimit > currentTime
            );
        } else if (this.state.activeItem === "upcoming") {
            items = this.state.elections.filter(e => e.startTime > currentTime);
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
}

export default Elections;
