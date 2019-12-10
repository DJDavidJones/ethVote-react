import React from "react";
import { Header, Icon, Segment, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";

export default function MetamaskWrongNetwork() {
    return (
        <Segment placeholder color="orange">
            <Header icon>
                <Icon name="warning sign" />
                Please change to the Rinkeby Test Network in MetaMask.
            </Header>
            <Button as={Link} animated="fade" to={`/`} color="orange">
                <Button.Content visible>Now take me back</Button.Content>
                <Button.Content hidden>
                    <Icon name="home" />
                </Button.Content>
            </Button>
        </Segment>
    );
}
