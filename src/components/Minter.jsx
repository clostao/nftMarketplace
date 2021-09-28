import './Minter.scss';

import { ProgressBar, Col, Row, Button, Form, Alert } from "react-bootstrap";

import axios from "axios";

import { useState } from "react";

import contracts  from '../services/index';

let contract = contracts.minter;

function Minter() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState("");
    const [progress, setProgress] = useState(0);
    const [alert, setAlert] = useState({type: null, msg: ""});
    return <div className="minter">
        <Form>
            <Row>
                <Col className="col-6">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/>
                </Col>
            </Row>
            <Row>
                <Col className="col-12">
                    <Form.Label>Description:</Form.Label>
                    <Form.Control type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                </Col>
            </Row>
            <Row>
                <Col className="col-12">
                    <Form.Label>File:</Form.Label>
                    <Form.Control type="file" placeholder="Image or file to mint" onChange={(e) => setFile(e.target.files[0])}/>
                </Col>
            </Row>
            <Row>
                <Col className="col-2 button-wrapper">
                    <Button disabled={progress > 0} onClick={async () => {
                        setProgress(1);
                        let mintedTokenId = await contract.mintedTokenIdNonFungibleToken().catch(e => {
                            setProgress(0);
                        });
                        if (mintedTokenId === undefined) {
                            setAlert({type: "warning", msg: "Error interacting with the smart contract: NFT was not mint"});
                            return setTimeout(() => setAlert({type: null, msg: ""}),10000);
                        }
                        console.log(`The minted token id is: ${mintedTokenId}`);
                        await contract.getTokensInfo().then(e => console.log(e)).catch(err => console.error(err));
                        await onUpload(1, file, {description: description, name: name}).then(_ => null).catch(e => e);
                        await onUpload(2, file, {description: description, name: name}).then(_ => null).catch(e => e);
                        await onUpload(3, file, {description: description, name: name}).then(_ => null).catch(e => e);
                        let response = await onUpload(mintedTokenId, file, {description: description, name: name}).then(_ => null).catch(e => e);
                        console.log(response)
                        if (response !== null) {
                            console.error(response.message || response);
                            return setProgress(0);
                        }
                        setProgress(50);

                    }} className="btn-success">Submit</Button>
                </Col>
            </Row>
            <Row>
                <Col className="col-12 button-wrapper">
                    <ProgressBar now={progress} label={(progress === 0 ? "" : `${progress}%`)} />
                </Col>
            </Row>
                {
                    alert.type && <Row>
                        <Alert variant={alert.type} className="col-12 button-wrapper">
                            { alert.msg }
                        </Alert>
                    </Row>
                }
        </Form>
    </div>
}

function onUpload(tokenId, file, params) {
    return axios.post(`https://nft-file-sever.appspot.com/nfts/${tokenId}`, file, {
        params: {
            description: params.description,
            name: params.name
        },
        headers: {
            'Content-Type': file.type
        }
    });
}

export default Minter;