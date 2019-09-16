import React, { Component } from "react";
import { Button, Icon } from "semantic-ui-react";

class ElectionButton extends Component {
    render() {
        return this.props.activeItem !== "upcoming" ? (
            <Button floated="right" color="green" animated="fade">
                <Button.Content visible>
                    {this.props.activeItem === "past"
                        ? "View Results"
                        : this.props.activeItem === "current"
                        ? this.props.userHasVoted
                            ? "Change Vote"
                            : "Vote"
                        : null}
                </Button.Content>
                <Button.Content hidden>
                    {this.props.activeItem === "past" ? (
                        <Icon name="envelope open" />
                    ) : (
                        <Icon name="pencil" />
                    )}
                </Button.Content>
            </Button>
        ) : null;
    }
}

export default ElectionButton;
