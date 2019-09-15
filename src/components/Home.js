import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Menu } from "semantic-ui-react";

class Home extends Component {
    state = {
        activeItem: "current"
    };

    async componentDidUpdate() {
        if (this.props.web3 && this.props.loading === false) {
            console.log(
                "factory manager",
                await this.props.electionFactory.methods.factoryManager().call()
            );
        }
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });

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
            </React.Fragment>
        );
    }
}

export default Home;
