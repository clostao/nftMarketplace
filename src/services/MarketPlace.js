import Web3 from "web3";

const TruffleContract = require("@truffle/contract");

class MarketPlace {

    static contractArtifact = require('./MarketPlace.json');

    provider;
    web3;

    accountInfoSubscribers = [];

    getAccount(cb) {
        if (window.web3) {
            this.provider = window.web3.currentProvider;
            window.ethereum.on('accountsChanged', accounts => {
                this.account = accounts[0];
                this._publishAccountChanges()
            });
        } else {
            this.provider = new Web3.providers.WebsocketProvider('ws://localhost:7545');
        }
        this.web3 = new Web3(this.provider);
        return new Promise((res,rej) => {
            this.updateAccountInfo(function (err, account) {
                if (err) {
                    rej(err);
                } else {
                    res(account);
                }
            });
        });
    }

    updateAccountInfo(cb) {
        this.web3.eth.requestAccounts((err, accounts) => {
            if(err === null) {
                this.account = accounts[0];
                this.web3.eth.getBalance(this.account, (err, balance) => {
                    if (err) {
                        setImmediate(cb, err);
                    } else {
                        setImmediate(cb, null, [this.account, Number(balance, 10)]);
                    }
                });
            } else {
                setImmediate(cb, err);
            }
        });
    }

    getProducts() {
        return new Promise((res, rej) => {
            this.contract = TruffleContract(MarketPlace.contractArtifact);
            this.contract.setProvider(this.provider);
            this.contract.deployed().then(async instance => {
                this._address = instance.contract._address;
                return instance.getProductsInSell();
            }).then((products) => {
                res([products])
            }).catch(e => console.error(e));
        })
    }

    buyProduct(pid, price) {
        return this.contract.deployed().then(async _instance => {
            let promise = await _instance.buyProduct(pid, {from: this.account, value: price });
            this._publishAccountChanges();
            return promise;
        });
    }

    addProductToSell(tokenId, price) {
        return this.contract.deployed().then(async instance => {
            let promise = await instance.addProductToSell(tokenId, price, { from: this.account });
            this._publishAccountChanges();
            return promise;
        });
    }

    subscribeAccountInfoUpdate(cb) {
       this.accountInfoSubscribers.push(cb);
    }

    subscribeSellEvent(cb) {
        this.contract.deployed().then(async _instance => {
            _instance.LogProductInSell({fromBlock: 'latest'}, function (err, value) {
                cb(err, value?.returnValues);
            });
        });
    }

    subscribeSoldEvent(cb) {
        this.contract.deployed().then(async _instance => {
            _instance.LogProductBought({fromBlock: 'latest'}, function (err, value) {
                cb(err, value?.returnValues);
            });
        });
    }

    _publishAccountChanges() {
        this.updateAccountInfo((err, account) => {
            this.accountInfoSubscribers.forEach(cb => setImmediate(cb, err, account));
        });
    }
}

export default MarketPlace;