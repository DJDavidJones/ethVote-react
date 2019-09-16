import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Message, Button } from "semantic-ui-react";

class NotRegisteredWarning extends Component {
    render() {
        return (
            <Message warning>
                <Button basic floated="right" as={Link} to="/register">
                    Get Help
                </Button>
                <Message.Header>You are not registered to vote.</Message.Header>
                <p>
                    Please go to your local registration authority to register.
                </p>
            </Message>
        );
    }
}

export default NotRegisteredWarning;
