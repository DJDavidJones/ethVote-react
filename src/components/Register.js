import React, { Component } from "react";
import { Header, Icon, Segment, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";

class Register extends Component {
    render() {
        return (
            <Segment placeholder color="yellow">
                <Header icon>
                    <Icon name="user add" />
                    You can contact your local Registration Authority to be
                    registered as a voter. Remember to bring your passport and
                    Ethereum address.
                </Header>
                <Button as={Link} animated="fade" to={`/`} color="yellow">
                    <Button.Content visible>Take me home</Button.Content>
                    <Button.Content hidden>
                        <Icon name="home" />
                    </Button.Content>
                </Button>
            </Segment>
        );
    }
}

export default Register;
