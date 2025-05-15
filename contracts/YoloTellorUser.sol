// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/ITellorDataBridge.sol";

contract YoloTellorUser {
    ITellorDataBridge public dataBridge;
    OracleData[] public oracleData;

    struct OracleData {
        uint256 value; // reported value
        uint256 timestamp; // aggregate report timestamp
    }

    constructor(address _dataBridge) {
        dataBridge = ITellorDataBridge(_dataBridge);
    }

    function updateOracleData(
        OracleAttestationData calldata _attestData,
        Validator[] calldata _currentValidatorSet,
        Signature[] calldata _sigs
    ) external {
        dataBridge.verifyOracleData(_attestData, _currentValidatorSet, _sigs);
        uint256 _value = abi.decode(_attestData.report.value, (uint256));
        oracleData.push(OracleData(
            _value, 
            _attestData.report.timestamp
        ));
    }

    function getCurrentOracleData() external view returns (OracleData memory) {
        return oracleData[oracleData.length - 1];
    }

    function getValueCount() external view returns (uint256) {
        return oracleData.length;
    }
}