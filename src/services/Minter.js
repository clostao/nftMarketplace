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
            })
        });
    }

}

export default Minter;