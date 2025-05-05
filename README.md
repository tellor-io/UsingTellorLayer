# UsingTellorLayer

Use this package to install the Tellor user contracts and integrate Tellor into your contracts.

Once installed this will allow your contracts to inherit the functions from IBlobstreamO.

## How to Use

```solidity
import "usingtellorlayer/contracts/interfaces/IBlobstreamO.sol";

contract PriceContract {
    IBlobstreamO public blobstream;
    uint256 public price;

    constructor(address _blobstreamO) {
        blobstream = IBlobstreamO(_blobstreamO);
    }

    function resolveMarket(
        OracleAttestationData calldata _attestData,
        Validator[] calldata _currentValidatorSet,
        Signature[] calldata _sigs
    ) public {
        // verify that data came from tellor chain
        blobstream.verifyOracleData(_attestData, _currentValidatorSet, _sigs);
        // NOTE: This is a simplified example. More security checks should be done
        // in production to ensure data integrity.
        price = abi.decode(_attestData.report.value, (uint256));
    }
}
```

### Addresses:
Find Tellor contract addresses [here](https://docs.tellor.io/layer-docs/using-tellor-data/integrating-tellor-data).

## Testing
Open a git bash terminal and run this code:

```bash
git clone https://github.com/tellor-io/YoloTellorUser.git
cd YoloTellorUser
npm i
npx hardhat test
```