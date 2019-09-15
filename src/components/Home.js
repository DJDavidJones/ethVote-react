import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Menu, Card, Dimmer, Loader, Image, Segment } from "semantic-ui-react";
import Election from "../ethereum/Election.json";

class Home extends Component {
    state = {
        activeItem: "current",
        loadedElectionList: false
    };

    componentDidMount() {
        console.log(this.props);
    }

    async componentDidUpdate() {
        if (
            !this.state.loadedElectionList &&
            this.props.web3 &&
            this.props.loading === false
        ) {
            const electionAddresses = await this.props.electionFactory.methods
                .getDeployedElections()
                .call();

            let elections = [];
            electionAddresses.forEach(async e => {
                const contract = await this.getElectionContract(e);
                const contractDetails = {
                    title: contract.methods.title().call(),
                    description: contract.methods.description().call(),
                    startTime: contract.methods.startTime().call(),
                    timeLimit: contract.methods.timeLimit().call()
                };
                elections.push(contractDetails);
            });
            this.setState({ elections, loadedElectionList: true });
        }

        // Display list of elections (past, current, upcoming)
        console.log(this.state);
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });

    renderElections() {
        let items;
        if (
            this.state.elections &&
            this.props.web3 &&
            this.props.loading === false
        ) {
            items = this.state.elections.map(election => {
                console.log(election);
                return {
                    header: election.title,
                    description: election.description,
                    fluid: true
                };
            });
        }

        return (
            <Card.Group
                items={items}
                style={{ marginTop: "0.5em", overflow: "hidden" }}
            />
        );
    }

    render() {
        const { activeItem } = this.state;

        return (
            <React.Fragment>
                {this.props.web3 === undefined &&
                this.props.loading === false ? (
                    <Redirect to="/metamask" />
                ) : null}

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

                {this.props.loading ? (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader>Loading</Loader>
                        </Dimmer>
                        <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                    </Segment>
                ) : null}

                {this.renderElections()}
            </React.Fragment>
        );
    }

    async getElectionContract(address) {
        try {
            const { web3 } = this.props;
            const abi = JSON.parse(Election.interface);
            const contract = new web3.eth.Contract(abi, address);
            return contract;
        } catch (err) {
            console.log(err.message);
        }
    }
}

export default Home;
