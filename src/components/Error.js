import React, { Component } from "react";
import { Header, Icon, Segment, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";

class Error extends Component {
    render() {
        return (
            <Segment placeholder color="red">
                <Header icon>
                    <Icon name="warning sign" />
                    Sorry, we couldn't find that page.
                </Header>
                <Button as={Link} animated="fade" to={`/`} color="red">
                    <Button.Content visible>Take me home</Button.Content>
                    <Button.Content hidden>
                        <Icon name="home" />
                    </Button.Content>
                </Button>
            </Segment>
        );
    }
}

export default Error;
