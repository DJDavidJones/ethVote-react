import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Menu, Card, Dimmer, Loader, Image, Segment } from "semantic-ui-react";

class Home extends Component {
    state = {
        activeItem: "current",
        loadedElectionList: false
    };

    async componentDidUpdate() {
        if (this.props.web3 && this.props.loading === false) {
            if (!this.state.loadedElectionList) {
                const elections = await this.props.electionFactory.methods
                    .getDeployedElections()
                    .call();
                this.setState({ elections });
                this.state.loadedElectionList = true;
            }

            // Display list of elections (past, current, upcoming)
        }
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });

    renderElections() {
        let items;
        if (
            this.state.elections &&
            this.props.web3 &&
            this.props.loading === false
        ) {
            items = this.state.elections.map(address => {
                return {
                    header: "Election",
                    meta: address,
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
}

export default Home;
