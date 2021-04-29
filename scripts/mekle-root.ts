import { BigNumber } from 'ethers'
import hre from 'hardhat'
import BalanceTree from '../src/balance-tree'

async function main() {
  const signers = await hre.ethers.getSigners()

  const tree = new BalanceTree([
    { account: signers[0].address, amount: BigNumber.from(100) },
    { account: signers[1].address, amount: BigNumber.from(101) },
  ])

  console.log(`Merkle root: ${tree.getHexRoot()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
