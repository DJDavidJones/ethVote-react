import React, { Component } from "react";
import { Container, Header } from "semantic-ui-react";

class About extends Component {
    render() {
        return (
            <Container>
                <Header as="h1">About this project</Header>
                <p>
                    <i>
                        This project researches possible solutions to Internet
                        Voting systems that would satisfy the security
                        requirements of a real election. A solution is proposed
                        that safely stores and manages votes on the Ethereum
                        blockchain, encrypts and tallies votes using homomorphic
                        encryption, and proves the correctness of votes and
                        final tallies with non-interactive zero-knowledge
                        proofs. A proof-of-concept is presented that implements
                        Ethereum smart contracts and a front-end application to
                        interact with the system. While we believe it is
                        possible, we were not able to implement zero-knowledge
                        proofs in this project. We conclude that the proposed
                        solution is secure, but would likely fail in real-life
                        due to the trust required by voters, which is unlikely
                        to be given to a complex system that is hard to
                        understand without a technical background.
                    </i>
                </p>
                <p>
                    The project was conducted by Johannes Mols at Aalborg
                    University in Copenhagen in the context of a semester
                    project. The project report can be found on{" "}
                    <a
                        href="https://github.com/johannesmols/ethVote/blob/master/report/P5_Project.pdf"
                        target="_blank"
                    >
                        GitHub
                    </a>
                    , together with the source code.
                </p>
            </Container>
        );
    }
}

export default About;
