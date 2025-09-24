const { ethers } = require("hardhat");
const h = require("../src/helpers/evmHelpers");
var assert = require('assert');
const abiCoder = new ethers.AbiCoder();

describe("YoloTellorUser - Function Tests", async function () {

    let dataBridge, user, accounts, guardian, validatorSet;
    // for tellor mainnet, use "tellor-1"
    // for tellor palmito testnet, use "layertest-4"
    const TELLOR_CHAIN_ID = "layertest-4";
    const UNBONDING_PERIOD = 86400 * 7 * 3; // 3 weeks

    beforeEach(async function () {
        // init accounts
        accounts = await ethers.getSigners();
        guardian = accounts[10]
        // init tellor validator set
        validatorSet = await h.createTellorValset({tellorChainId: TELLOR_CHAIN_ID})
        // deploy dataBridge
        dataBridge = await ethers.deployContract("TellorDataBridge", [guardian.address, validatorSet.domainSeparator])
        await dataBridge.init(validatorSet.powerThreshold, validatorSet.timestamp, UNBONDING_PERIOD, validatorSet.checkpoint)
        // deploy user
        user = await ethers.deployContract("YoloTellorUser", [dataBridge.getAddress()])
    });

    it("constructor", async function () {
        assert.equal(await user.dataBridge(), await dataBridge.getAddress())
    })

    it("updateOracleData", async function () {
        querydata = abiCoder.encode(["string"], ["myquery"])
        queryId = h.hash(querydata)
        value = abiCoder.encode(["uint256"], [2000])
        const { attestData, currentValidatorSet, sigs } = await h.prepareOracleData(queryId, value, validatorSet.wallets, validatorSet.powers, validatorSet.checkpoint)
        await user.updateOracleData(attestData, currentValidatorSet, sigs)
        currentOracleData = await user.getCurrentOracleData()
        assert.equal(currentOracleData.value, 2000)
    })
})
