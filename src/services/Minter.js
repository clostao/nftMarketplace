import Web3 from "web3";

const TruffleContract = require("@truffle/contract");


class Minter {

    static contractArtifact = require('./Minter.json');

    provider;
    web3;

    accountInfoSubscribers = [];

    init() {
        if (window.web3) {
            this.provider = window.web3.currentProvider;
        } else {
            this.provider = new Web3.providers.WebsocketProvider('ws://localhost:7545');
        }
        this.web3 = new Web3(this.provider);
    }

    mintedTokenIdNonFungibleToken() {
        if (!this.web3) this.init();
        return new Promise((resolve, reject) => {
            return this.web3.eth.requestAccounts((err, accounts) => {
                if (err) {
                    reject(err)
                } else {
                    this.account = accounts[0];
                    let contract = TruffleContract(Minter.contractArtifact);
                    contract.setProvider(this.provider);
                    return contract.deployed().then(instance => {
                        instance.mint({from: this.account}).then(payload => resolve(payload.logs[0].args.tokenId.toNumber())).catch(err => reject(err));
                    });
                }
            });
        });
    }

    sellerIsOwner(account, tokenId) {
        if (!this.web3) this.init();
        return new Promise(resolve => {
            let contract = TruffleContract(Minter.contractArtifact);
            contract.setProvider(this.provider);
            return contract.deployed().then(async instance => {
                console.log("Adios", await instance.ownerOf(tokenId, {from: this.account}));
                resolve(await instance.ownerOf(tokenId, {from: this.account}));
            });
        });
    }

    approved(contractAddress, tokenId) {
        if (!this.web3) this.init();
        return new Promise(resolve => {
            let contract = TruffleContract(Minter.contractArtifact);
            contract.setProvider(this.provider);
            return contract.deployed().then(async instance => {
                resolve(contractAddress === await instance.getApproved(tokenId, {from: this.account}));
            });
        });
    }

    approve(authorisedAddress, tokenId) {
        if (!this.web3) this.init();
        return new Promise((resolve, reject) => {
            return this.web3.eth.requestAccounts((err, accounts) => {
                if (err) {
                    reject(err)
                } else {
                    this.account = accounts[0];
                    let contract = TruffleContract(Minter.contractArtifact);
                    contract.setProvider(this.provider);
                    return contract.deployed().then(async instance => {
                        let promise = await instance.approve(authorisedAddress, tokenId, { from: this.account });
                        resolve(promise);
                    });
                }
            });
        });
    }

    getTokensInfo(account) {
        if (!this.web3) this.init();
        return new Promise((resolve, reject) => {
            return this.web3.eth.requestAccounts((err, accounts) => {
                if (err) {
                    reject(err)
                } else {
                    let contract = TruffleContract(Minter.contractArtifact);
                    contract.setProvider(this.provider);
                    return contract.deployed().then(instance => {
                        instance.addressTokensInfo(account || accounts[0],{from: this.account}).then(payload => resolve(payload)).catch(err => reject(err));
                    });
                }
            })
        });
    }

    checkNftAuthorisation(address,tokenId) {
        if (!this.web3) this.init();
        return new Promise((resolve, reject) => {
            return this.web3.eth.requestAccounts((err, accounts) => {
                if (err) {
                    reject(err)
                } else {
                    let contract = TruffleContract(Minter.contractArtifact);
                    contract.setProvider(this.provider);
                    return contract.deployed().then(instance => {
                        instance.getApproved(tokenId, {from: this.account}).then(payload => resolve(payload === address)).catch(err => reject(err));
                    });
                }
            })
        });
    }

    getInfoFromId(tokenId) {
        if (!this.web3) this.init();
        return new Promise((resolve, reject) => {
            return this.web3.eth.requestAccounts((err, accounts) => {
                if (err) {
                    reject(err)
                } else {
                    let contract = TruffleContract(Minter.contractArtifact);
                    contract.setProvider(this.provider);
                    return contract.deployed().then(instance => {
                        instance.tokenURI(tokenId, {from: this.account}).then(payload => resolve(payload)).catch(err => reject(err));
                    });
                }
            })
        });
    }

}

export default Minter;