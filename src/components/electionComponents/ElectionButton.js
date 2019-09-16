import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";

class ElectionButton extends Component {
    render() {
        return (
            <Button
                as={Link}
                to={`election/${this.props.contractAddress}`}
                floated="right"
                color={
                    this.props.activeItem === "past"
                        ? "blue"
                        : this.props.activeItem === "current"
                        ? this.props.userIsRegisteredVoter
                            ? this.props.userHasVoted
                                ? "olive"
                                : "green"
                            : "blue"
                        : "blue"
                }
                animated="fade"
            >
                <Button.Content visible>
                    {this.props.activeItem === "past"
                        ? "View Results"
                        : this.props.activeItem === "current"
                        ? this.props.userIsRegisteredVoter
                            ? this.props.userHasVoted
                                ? "Change Vote"
                                : "Vote"
                            : "View"
                        : "View Options"}
                </Button.Content>
                <Button.Content hidden>
                    {this.props.activeItem === "past" ? (
                        <Icon name="envelope open" />
                    ) : this.props.activeItem === "current" ? (
                        this.props.userIsRegisteredVoter ? (
                            <Icon name="pencil" />
                        ) : (
                            <Icon name="eye" />
                        )
                    ) : (
                        <Icon name="users" />
                    )}
                </Button.Content>
            </Button>
        );
    }
}

export default ElectionButton;
