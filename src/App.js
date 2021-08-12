import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Spinner, Col, Navbar, Container, Row, Button, Modal, Form} from "react-bootstrap";

import {useEffect, useState} from "react";
import ProductRow from "./components/ProductRow";

import Minter from './components/Minter';

import { Link, Switch, Route, BrowserRouter as Router } from 'react-router-dom';

import contract from './marketplace'

function App() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [account, setAccount] = useState(["0x0", 0])
  const [show, setShow] = useState(false);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  useEffect(() => {
      initContractConnection(function (err, products, account) {
          setProducts(products);
          setLoading(false);
          setAccount(account);
          contract.subscribeSellEvent((err, event) => {
              if (err) {
                  console.error("Error in log subscription.");
              } else {
                  contract.getProducts().then(_products => {
                      _products = _products[0].concat(products).reduce((acc, prod) => {
                          acc[prod.productId] = prod;
                          return acc;
                      }, {})
                      setProducts(Object.values(_products));
                  }).catch((e) => console.log("Error reading products: " + (e.msg || e)));
              }
          });
          contract.subscribeAccountInfoUpdate((err, account) => {
              if (err) {
                  console.error("Error reading updating account info: " + err.msg ||err);
              } else {
                setAccount(account);
              }
          });
      });
  }, [])
  return (
    <Router>
        <div className="appComponent">
            <Navbar bg="dark" variant="dark" className="header-wrapper">
                <Container>
                    <Navbar.Brand className="header">
                        <Link to="/">
                            <img
                                alt=""
                                src="https://i-invdn-com.investing.com/ico_flags/80x80/v32/bitcoin.png"
                                width="30"
                                height="30"
                                className="d-inline-block align-top"
                            />{' '}
                            My First Exchange
                        </Link>
                    </Navbar.Brand>
                    <Link to="/minter/">
                        Mint your own NFTs
                    </Link>
                </Container>
            </Navbar>
            <Switch>
                <Route path="/" exact>
                    <Modal show={show} onHide={() => setShow(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add product to sell</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Name:</Form.Label>
                                    <Form.Control type="text" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)}/>
                                    <Form.Label>Description:</Form.Label>
                                    <Form.Control type="text" placeholder="Product description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                                    <Form.Label>Price in Wei:</Form.Label>
                                    <Form.Control type="number" placeholder="Price (Wei)" value={price} onChange={(e) => setPrice(e.target.value)}/>
                                </Form.Group>
                            </Form>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                            <Button variant="primary" onClick={async () => {
                                await contract.addProductToSell(description, name, price);
                                setShow(false);
                            }}>Save changes</Button>
                        </Modal.Footer>
                    </Modal>
                    <Container bg="light" variant="light" className="board">
                        <Container className="wallet-info">
                            <Row>
                                Address:
                            </Row>
                            <Row>
                                { account[0] }
                            </Row>
                            <Row>
                                Balance
                            </Row>
                            <Row>
                                { account[1] / (10 ** 9) } GWei
                            </Row>
                        </Container>
                        <Container className="board-header">
                            Sell and Buy your products
                        </Container>
                        {

                            !loading &&
                            <Container className="board-content">
                                <Button className="btn btn-primary" onClick={() => setShow(true)}> Add product </Button>
                                <Row className="header product">
                                    <Col className="product-name col-1">
                                        Name
                                    </Col>
                                    <Col className="product-description col-3">
                                        Description
                                    </Col>
                                    <Col product-name="product-seller col-6">
                                        Seller Address
                                    </Col>
                                    <Col className="product-price col-2">
                                        Price (GWi)
                                    </Col>
                                </Row>
                                {
                                    products.map((product, i) => (
                                        <ProductRow key={i} account={account} product={product}/>))
                                }
                            </Container>
                        }
                        {
                            loading && <Container className="board-load-spinner">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </Container>
                        }
                    </Container>
                </Route>
                <Route path="/minter" exact>
                    <Minter>

                    </Minter>
                </Route>
            </Switch>
        </div>
    </Router>
  );
}

async function initContractConnection(cb) {
    let accountInfo = await contract.getAccount();
    console.log(accountInfo)
    await contract.getProducts().then(res => cb(null, ...res, accountInfo)).catch((err) => {
        cb(err, [], accountInfo)
    });
}

export default App;
