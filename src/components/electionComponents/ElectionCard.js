import React from "react";
import { Card } from "semantic-ui-react";

export default function ElectionCard(props) {
    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>{props.title}</Card.Header>
                <Card.Meta>{props.description}</Card.Meta>
            </Card.Content>
        </Card>
    );
}
