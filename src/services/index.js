import Minter from './Minter';
import MarketPlace from './MarketPlace';

let marketPlace = new MarketPlace();
let minter = new Minter();
minter.init();
marketPlace.getAccount();

export default { marketPlace: marketPlace,  minter: new Minter() };
