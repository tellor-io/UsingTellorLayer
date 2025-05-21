const { ethers, network } = require("hardhat");
const hash = ethers.keccak256;
var assert = require('assert');
// const { impersonateAccount, takeSnapshot } = require("@nomicfoundation/hardhat-network-helpers");

var assert = require('assert');
const abiCoder = new ethers.AbiCoder();

const takeFifteen = async () => {
  await advanceTime(60 * 18);
};

advanceTime = async (time) => {
  await network.provider.send("evm_increaseTime", [time])
  await network.provider.send("evm_mine")
}

async function expectThrow(promise) {
  try {
    await promise;
  } catch (error) {
    const invalidOpcode = error.message.search("invalid opcode") >= 0;
    const outOfGas = error.message.search("out of gas") >= 0;
    const revert = error.message.search("revert") >= 0;
    assert(
      invalidOpcode || outOfGas || revert,
      "Expected throw, got '" + error + "' instead"
    );
    return;
  }
  assert.fail("Expected throw not received");
}

function to18(n) {
  return ethers.BigNumber.from(n).mul(ethers.BigNumber.from(10).pow(18))
}

function tob32(n) {
  return ethers.formatBytes32String(n)
}

function uintTob32(n){
  let vars = ethers.hexlify(n)
  vars = vars.slice(2)
  while(vars.length < 64){
    vars = "0" + vars
  }
  vars = "0x" + vars
  return vars
}

function bytes(n){
  return ethers.hexlify(n)
}

function getBlock(){
  return ethers.provider.getBlock()
}

function toWei(n){
  return ethers.parseEther(n)
}

function fromWei(n){
  return ethers.formatEther(n)
}

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}


calculateValCheckpoint = (valHash, threshold, valTimestamp) => {
  domainSeparator = "0x636865636b706f696e7400000000000000000000000000000000000000000000"
  enc = abiCoder.encode(["bytes32", "uint256", "uint256", "bytes32"], [domainSeparator, threshold, valTimestamp, valHash])
  valCheckpoint = hash(enc)
  //valCheckpoint = ethers.solidityPackedKeccak256(["bytes32", "uint256", "uint256", "bytes32"], [domainSeparator, threshold, valTimestamp, valHash])
  //valCheckpoint = ethers.solidityPackedKeccak256(enc)
  return valCheckpoint
}

calculateValHash = (valSet, powers) => {
  structArray = []
  for (i = 0; i < valSet.length; i++) {
    structArray[i] = {
      addr: valSet[i],
      power: powers[i]
    }
  }
  // encode the array of Validator struct objects into bytes so they can be hashed
  enc = abiCoder.encode(["tuple(address addr, uint256 power)[]"], [structArray])
  // hash the encoded bytes
  valHash = hash(enc)
  return valHash
}

getEthSignedMessageHash = (messageHash) => {
  const prefix = "\x19Ethereum Signed Message:\n32";
  const messageHashBytes = ethers.getBytes(messageHash);
  const prefixBytes = ethers.getBytes(prefix);
  const combined = ethers.concat([prefixBytes, messageHashBytes]);
  const digest = ethers.keccak256(combined);
  return digest;
}

getDataDigest = (queryId, value, timestamp, aggregatePower, previousTimestamp, nextTimestamp, valCheckpoint, attestationTimestamp, lastConsensusTimestamp) => {
  const DOMAIN_SEPARATOR = "0x74656c6c6f7243757272656e744174746573746174696f6e0000000000000000"
  enc = abiCoder.encode(["bytes32", "bytes32", "bytes", "uint256", "uint256", "uint256", "uint256", "bytes32", "uint256", "uint256"],
    [DOMAIN_SEPARATOR, queryId, value, timestamp, aggregatePower, previousTimestamp, nextTimestamp, valCheckpoint, attestationTimestamp, lastConsensusTimestamp])
  return hash(enc)
}


getValSetStructArray = (valAddrs, powers) => {
  structArray = []
  for (i = 0; i < valAddrs.length; i++) {
    structArray[i] = {
      addr: valAddrs[i],
      power: powers[i]
    }
  }
  return structArray
}

getSigStructArray = (sigs) => {
  structArray = []
  for (i = 0; i < sigs.length; i++) {
    if(sigs[i].v == 0){
      structArray[i] = {
        v: abiCoder.encode(["uint8"], [0]),
        r: abiCoder.encode(["bytes32"], ['0x0000000000000000000000000000000000000000000000000000000000000000']),
        s: abiCoder.encode(["bytes32"], ['0x0000000000000000000000000000000000000000000000000000000000000000'])
      }
    }
    else{
      // let { v, r, s } = ethers.Signature.from(sigs[i])
      structArray[i] = {
        v: abiCoder.encode(["uint8"], [sigs[i].v]),
        r: abiCoder.encode(["bytes32"], [sigs[i].r]),
        s: abiCoder.encode(["bytes32"], [sigs[i].s])
      }
    }
  }
  return structArray
}

getOracleDataStruct = (queryId, value, timestamp, aggregatePower, previousTimestamp, nextTimestamp, attestTimestamp, lastConsensusTimestamp) => {
  return {
    queryId: queryId,
    report: {
      value: value,
      timestamp: timestamp,
      aggregatePower: aggregatePower,
      previousTimestamp: previousTimestamp,
      nextTimestamp: nextTimestamp,
      lastConsensusTimestamp: lastConsensusTimestamp
    },
    attestationTimestamp: attestTimestamp
  }
}

getWithdrawValue = (_recipient, _sender, _amount) =>{
  myVal = abiCoder.encode(["address", "string", "uint256", "uint256"],
  // tip is 0 for withdrawals
  [_recipient, _sender, _amount, 0])
  return myVal
}

getCurrentAggregateReport = (_queryId, _value, _timestamp,_reporterPower) => {
    reportData = {
      value: _value,
      timestamp: _timestamp,
      aggregatePower: _reporterPower,
      previousTimestamp: 0,
      nextTimestamp: 0
    }
    oracleAttestationData = {
      queryId: _queryId,
      report: reportData,
      attestTimestamp: _timestamp
    }
    return oracleAttestationData
}

layerSign = (message, privateKey) => {
  // assumes message is bytesLike
  messageHash = ethers.sha256(message)
  signingKey = new ethers.SigningKey(privateKey)
  signature = signingKey.sign(messageHash)
  return signature
}

prepareOracleData = async (queryId, value, validators, powers, validatorCheckpoint) => {
  blocky = await getBlock()
  timestamp = (blocky.timestamp - 2) * 1000
  aggregatePower = powers.reduce((a, b) => a + b, 0)
  attestTimestamp = timestamp + 1000
  previousTimestamp = 0
  nextTimestamp = 0
  lastConsensusTimestamp = timestamp
  dataDigest = await getDataDigest(
      queryId,
      value,
      timestamp,
      aggregatePower,
      previousTimestamp,
      nextTimestamp,
      validatorCheckpoint,
      attestTimestamp,
      lastConsensusTimestamp
  )
  valAddrs = validators.map(v => v.address)
  currentValSetArray = await getValSetStructArray(valAddrs, powers)
  sigs = []
  for (i = 0; i < validators.length; i++) {
    sigs.push(layerSign(dataDigest, validators[i].privateKey))
  }
  sigStructArray = await getSigStructArray(sigs)
  oracleDataStruct = await getOracleDataStruct(
      queryId,
      value,
      timestamp,
      aggregatePower,
      previousTimestamp,
      nextTimestamp,
      attestTimestamp,
      lastConsensusTimestamp
  )
  return {
    attestData: oracleDataStruct,
    currentValidatorSet: currentValSetArray,
    sigs: sigStructArray
  }
}

module.exports = {
  getWithdrawValue,
  getCurrentAggregateReport,
  getOracleDataStruct,
  getSigStructArray,
  getValSetStructArray,
  getDataDigest,
  getEthSignedMessageHash,
  calculateValCheckpoint,
  calculateValHash,
  timeTarget: 240,
  hash,
  zeroAddress: "0x0000000000000000000000000000000000000000",
  to18,
  uintTob32,
  tob32,
  bytes,
  getBlock,
  advanceTime,
  takeFifteen,
  toWei,
  fromWei,
  expectThrow,
  sleep,
  layerSign,
  prepareOracleData
};

