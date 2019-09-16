import React, { Component } from "react";
import ElectionCard from "./ElectionCard";
import { Card } from "semantic-ui-react";

class ElectionCards extends Component {
    render() {
        const activeItem = this.props.activeItem;
        return (
            <Card.Group style={{ marginTop: "0.1em" }}>
                {this.props.elections
                    .filter(function(e) {
                        const currentTime = Math.floor(Date.now() / 1000);
                        switch (activeItem) {
                            case "past":
                                return e.timeLimit < currentTime;
                            case "current":
                                return (
                                    e.startTime < currentTime &&
                                    e.timeLimit > currentTime
                                );
                            case "upcoming":
                                return e.startTime > currentTime;
                            default:
                                return false;
                        }
                    })
                    .sort(function(a, b) {
                        if (activeItem === "past") {
                            // recently ended first
                            return a.timeLimit - b.timeLimit ? -1 : 1; // -1 : 1 reverses the order
                        } else if (activeItem === "current") {
                            // ending soon first
                            return a.timeLimit - b.timeLimit;
                        } else {
                            // starting soon first
                            return a.startTime - b.startTime;
                        }
                    })
                    .map((election, i) => (
                        <ElectionCard
                            key={i}
                            address={election.address}
                            activeItem={activeItem}
                            title={election.title}
                            description={election.description}
                            startTime={election.startTime}
                            timeLimit={election.timeLimit}
                            userHasVoted={election.userHasVoted}
                            userIsRegisteredVoter={
                                this.props.userIsRegisteredVoter
                            }
                        />
                    ))}
            </Card.Group>
        );
    }
}

export default ElectionCards;
