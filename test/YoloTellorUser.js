const { ethers } = require("hardhat");
const h = require("./helpers/evmHelpers");
var assert = require('assert');
const abiCoder = new ethers.utils.AbiCoder();

describe("YoloTellorUser - Function Tests", async function () {

    let blobstream, user, accounts, guardian, initialPowers, initialValAddrs, valCheckpoint;
    let val1, val2, val3;
    const UNBONDING_PERIOD = 86400 * 7 * 3; // 3 weeks

    beforeEach(async function () {
        // init accounts
        accounts = await ethers.getSigners();
        guardian = accounts[10]
        // init validator info
        val1 = ethers.Wallet.createRandom()
        val2 = ethers.Wallet.createRandom()
        initialValAddrs = [val1.address, val2.address]
        initialPowers = [1, 2]
        threshold = 2
        blocky = await h.getBlock()
        valTimestamp = (blocky.timestamp - 2) * 1000
        newValHash = await h.calculateValHash(initialValAddrs, initialPowers)
        valCheckpoint = h.calculateValCheckpoint(newValHash, threshold, valTimestamp)
        // deploy blobstream
        blobstream = await ethers.deployContract("BlobstreamO", [guardian.address])
        await blobstream.init(threshold, valTimestamp, UNBONDING_PERIOD, valCheckpoint)
        // deploy user
        user = await ethers.deployContract("YoloTellorUser", [blobstream.address])
    });

    it("constructor", async function () {
        assert.equal(await user.blobstreamO(), await blobstream.address)
    })

    it("updateOracleData", async function () {
        initialValidators = [val1, val2]
        querydata = abiCoder.encode(["string"], ["myquery"])
        queryId = h.hash(querydata)
        value = abiCoder.encode(["uint256"], [2000])
        const { attestData, currentValidatorSet, sigs } = await h.prepareOracleData(queryId, value, initialValidators, initialPowers, valCheckpoint)
        await user.updateOracleData(attestData, currentValidatorSet, sigs)
        currentOracleData = await user.getCurrentOracleData()
        assert.equal(currentOracleData.value, 2000)
    })
})
