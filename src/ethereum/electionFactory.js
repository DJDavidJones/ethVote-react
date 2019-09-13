// IMPORTANT
// Update this file whenever the contracts are recompiled or redeployed. 
// This react app does not automatically fetch newly compiled and deployed contracts.

import web3 from '../web3';
import ElectionFactory from './ElectionFactory.json';

const address = '0xdCaCCc422B7A2d580Ccaa95909b6A9B2E5b0fc05';
const abi = ElectionFactory.interface;

export default new web3.eth.Contract(abi, address);