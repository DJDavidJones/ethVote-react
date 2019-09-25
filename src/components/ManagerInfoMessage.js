import React from "react";
import { Link } from "react-router-dom";
import { Message, Button } from "semantic-ui-react";

export default function ManagerInfoMessage() {
    return (
        <Message info>
            <Button basic floated="right" as={Link} to="/new">
                Create New
            </Button>
            <Message.Header>You are the Election Manager.</Message.Header>
            <Message.List>
                <Message.Item>
                    To create a new election, press the button to the right.
                </Message.Item>
                <Message.Item>
                    To add options to an upcoming election, visit the election
                    page and use the form.
                </Message.Item>
                <Message.Item>
                    To decrypt and publish a result, visit the election page and
                    enter your private decryption key.
                </Message.Item>
            </Message.List>
        </Message>
    );
}
