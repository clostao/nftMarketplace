import './Wallet.scss';

import axios from 'axios'

import Container from 'react-bootstrap/Container';


import { Button, Form } from "react-bootstrap";
import { Modal } from "react-bootstrap";

import { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';

import contracts  from '../services/index';

let { minter } = contracts;

function Wallet() {
    let [tokensInfo, setTokensInfo] = useState(null);
    let [tokenId, setTokenId] = useState(null);
    let [price, setPrice] = useState(1);
    useEffect(() => {
        let contract = minter;
        contract.getTokensInfo().then(info => (console.log(info),Promise.all(info.map(e => axios.get(e).then(response => ({index: parseInt(e.split('/').slice(-1)[0]),...response.data})))))).then(info => setTokensInfo(info));
    },[])
    return <div className="wallet">
        <div className="header">
            <h1>My NFTs</h1>
        </div>
            {
                tokensInfo === null ? 
                <Spinner className="spinner" animation="border" /> :
                <Container className="nft-list">
                    {
                        tokensInfo.map((e, i) => <Container className="nft" key={i}>
                            <span>
                                <img src={e.image} alt={e.description}/>
                            </span>
                            <span>
                                <Button variant="primary" onClick={() => setTokenId(e.index)}>
                                    Sell
                                </Button>
                            </span>
                            <span className="nft-description">
                                {`${e.name}: ${e.description}`}
                            </span>
                        </Container>)
                    }
                    <Modal show={tokenId != null} onHide={() => setTokenId(null)}>
                        <Modal.Header closeButton>
                        <Modal.Title>Sell NFT (id = {tokenId})</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                You're about to sell your nft.
                                Remind that selling your NFT consists of this two steps:
                                <ul>
                                    <li>Give the smart contract permission to transfer the selling NFT. Remember that by design <b>the contract cannot have a malicious behaviour.</b></li>
                                    <li>Create the selling offer in the smart contract</li>
                                </ul>
                                Price: <input onChange={(e) => setPrice(e.target.value)}/>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => setTokenId(null)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => {
                            sellNft(tokenId, price);
                            setTokenId(null);
                        }}>
                            Go ahead
                        </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            }
        </div>
}

function sellNft(tokenId, price) {
    if (!contracts.marketPlace._address) return;
    contracts.minter.checkNftAuthorisation(contracts.marketPlace._address, tokenId).then(async approved => {
        if (!approved) {
            await contracts.minter.approve(contracts.marketPlace._address, tokenId);
        }
        contracts.marketPlace.addProductToSell(tokenId, price);
    });
}

export default Wallet;