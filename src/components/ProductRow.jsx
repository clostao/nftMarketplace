import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Col, Row} from "react-bootstrap";

import {useEffect, useState} from "react";

import contracts from '../services/index'
import axios from 'axios';

let marketContract = contracts.marketPlace;
let nftContract = contracts.minter;

function ProductRow(props) {
    let product = props.product;
    const [data, setData] = useState({})
    const [selling, setSelling] = useState(true);
    const [pending, setPending] = useState(false);
    useEffect(() => {
        marketContract.subscribeSoldEvent((err, value) => {
            if (product.productId === Number(value.productId, 10)) {
                setSelling(false)
            }
        });
        nftContract.getInfoFromId(product.tokenId).then((uri) => axios.get(uri)).then(payload => (console.log(payload.data), setData(payload.data)));
    }, [product.productId]);
    return (
    <Row className="product">
        <Col className="product-name col-1">
            {data.name}
        </Col>
        <Col className="product-image col-1">
            <img src={data.image} width="100%"/>
        </Col>
        <Col className="product-description col-2">
            {data.description}
        </Col>
        <Col product-name="product-seller col-6">
            {(product.owner === props.account[0]) ? "YOU" : product.owner }
        </Col>
        <Col className="product-price col-2">
            {product.price / (10 ** 9)}
        </Col>
        <Button className={(!(console.log(selling),selling)) ? "button btn btn-success sold" : (pending) ? "button btn btn-warning pending" : "button btn btn-success"} onClick={async () => {
            setPending(true);
            await marketContract.buyProduct(product.productId, product.price).then(() => {
                setSelling(false);
            }).catch(e => {
                console.error(e);
            });
            setPending(false);
        }} disabled={!selling || product.owner === props.account[0] || pending}>
            {!selling ? "Sold"  : (pending) ? "Pending" : "Buy"}
        </Button>
    </Row>
    );
}

export default ProductRow;
