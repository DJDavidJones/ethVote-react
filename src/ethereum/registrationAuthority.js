// IMPORTANT
// Update this file whenever the contracts are recompiled or redeployed. 
// This react app does not automatically fetch newly compiled and deployed contracts.

import web3 from '../web3';
import RegistrationAuthority from './RegistrationAuthority.json';

const address = '0x74F3F1d24c4bE46e1ef261f48EA87768831cA2C2';
const abi = JSON.parse(RegistrationAuthority.interface);

export default new web3.eth.Contract(abi, address);