[![Tests](https://github.com/tellor-io/UsingTellorLayer/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/tellor-io/UsingTellorLayer/actions/workflows/tests.yml)

# UsingTellorLayer

Use this package to install the Tellor user contracts and integrate Tellor into your contracts.

Once installed this will allow your contracts to inherit the functions from ITellorDataBridge.

## How to Use

```solidity
import "usingtellorlayer/contracts/interfaces/ITellorDataBridge.sol";

contract PriceContract {
    ITellorDataBridge public dataBridge;
    uint256 public price;

    constructor(address _dataBridge) {
        dataBridge = ITellorDataBridge(_dataBridge);
    }

    function resolveMarket(
        OracleAttestationData calldata _attestData,
        Validator[] calldata _currentValidatorSet,
        Signature[] calldata _sigs
    ) public {
        // verify that data came from tellor chain
        dataBridge.verifyOracleData(_attestData, _currentValidatorSet, _sigs);
        // NOTE: This is a simplified example. More security checks should be done
        // in production to ensure data integrity.
        price = abi.decode(_attestData.report.value, (uint256));
    }
}
```

### Addresses:
Find Tellor contract addresses [here](https://docs.tellor.io/layer-docs/using-tellor-data/integrating-tellor-data#contract-addresses).

## Testing
Open a git bash terminal and run this code:

```bash
git clone https://github.com/tellor-io/UsingTellorLayer.git
cd UsingTellorLayer
npm i
npx hardhat test
```

## Secure Integrations

For secure integrations, refer to the [tellor docs](https://docs.tellor.io/layer-docs/using-tellor-data/integrating-tellor-data#contract-addresses). Also, see example integrations in the [SampleLayerUser repo](https://github.com/tellor-io/SampleLayerUser).

## Maintainers
@themandalore
@brendaloya

## How to Contribute
Check out our issues log here on Github out in our [Discord](https://discord.gg/teAMSZAfJZ)

## Contributors
This repository is maintained by the Tellor team - www.tellor.io

## Copyright
Tellor Inc. 2025