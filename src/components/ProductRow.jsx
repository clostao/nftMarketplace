import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Col, Row} from "react-bootstrap";

import contract from '../marketplace'

import {useEffect, useState} from "react";

function ProductRow(props) {
    let product = props.product;
    useEffect(() => {
        contract.subscribeSoldEvent((err, value) => {
            if (product.productId === Number(value.productId, 10)) {
                setSelling(false)
            }
        });
    }, [product.productId]);
    const [selling, setSelling] = useState(true);
    const [pending, setPending] = useState(false);
    return (
    <Row className="product">
        <Col className="product-name col-1">
            {product.name}
        </Col>
        <Col className="product-description col-3">
            {product.description}
        </Col>
        <Col product-name="product-seller col-6">
            {(product.seller === props.account[0]) ? "YOU" : product.seller }
        </Col>
        <Col className="product-price col-2">
            {product.price / (10 ** 9)}
        </Col>
        <Button className={(!(console.log(selling),selling)) ? "button btn btn-success sold" : (pending) ? "button btn btn-warning pending" : "button btn btn-success"} onClick={async () => {
            setPending(true);
            await contract.buyProduct(product.productId, product.price).then(() => {
                setSelling(false);
            }).catch(e => {
                console.error(e);
            });
            setPending(false);
        }} disabled={!selling || product.seller === props.account[0] || pending}>
            {!selling ? "Sold"  : (pending) ? "Pending" : "Buy"}
        </Button>
    </Row>
    );
}

export default ProductRow;
