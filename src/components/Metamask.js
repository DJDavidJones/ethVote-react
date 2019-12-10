import React, { Component } from "react";
import { Header, Icon, Segment, Button } from "semantic-ui-react";

class Metamask extends Component {
    handleClick = () => {
        window.open("https://metamask.io/", "_blank");
    };

    render() {
        return (
            <Segment placeholder color="blue">
                <Header icon>
                    <Icon name="info circle" />
                    MetaMask is required to use this application. Please install
                    it before continuing.
                </Header>
                <Button animated="fade" onClick={this.handleClick} color="blue">
                    <Button.Content visible>Take me there</Button.Content>
                    <Button.Content hidden>
                        <Icon name="world" />
                    </Button.Content>
                </Button>
            </Segment>
        );
    }
}

export default Metamask;
