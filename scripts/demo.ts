import hre from 'hardhat'

async function main() {
  // PROVIDER

  const defaultProvider = hre.ethers.getDefaultProvider()

  const hardhatProvider = hre.ethers.provider

  // ACCOUNT METHODS

  const balance = await hardhatProvider.getBalance('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
  console.log('Balance:', hre.ethers.utils.formatUnits(balance))

  const code = await hardhatProvider.getCode('0xF543AdDb0b5D34Aa10751AD03e217029553244D2')
  console.log('Code:', code)

  const nonce = await hardhatProvider.getTransactionCount('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
  console.log('Nonce:', nonce)

  // ENS METHODS

  const name = await defaultProvider.lookupAddress('0x2802d6dB02b8aB125f97d5977e4C822ae88808a7')
  console.log('ENS name:', name)

  const address = await defaultProvider.resolveName('dai.tokens.ethers.eth')
  console.log('Resolve address:', address)

  // SIGNER

  const signer = hardhatProvider.getSigner()

  // SIGN METHODS

  const signedMessage = await signer.signMessage('Hello World!')
  console.log('Signed message:', signedMessage)

  const transactionRequestClaim = {
    to: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    data:
      '0x2e7ba6ef0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001824d1f41e544b2ff4775bb03a676ebf376d32f2bbfcbd61e65871c28d9304671',
    value: 0,
    nonce: nonce,
    gasLimit: 950000,
  }

  const transactionResponse = await signer.sendTransaction(transactionRequestClaim)
  console.log('Transction request:', transactionResponse)

  const transactionRecipt = await transactionResponse.wait()
  console.log('Transction response:', transactionRecipt)

  // CONTRACT

  const daiAddress = 'dai.tokens.ethers.eth'

  const daiAbi = ['function symbol() view returns (string)']

  const daiContract = new hre.ethers.Contract(daiAddress, daiAbi, defaultProvider)

  const daiSymbol = await daiContract.symbol()
  console.log('Symbol:', daiSymbol)

  // CONTRACT FACTORY

  const erc20Articat = await hre.artifacts.readArtifact('TestERC20')

  const factory = new hre.ethers.ContractFactory(erc20Articat.abi, erc20Articat.bytecode)

  const bytecode = factory.bytecode
  console.log('Bytecode:', bytecode)

  const erc20 = await factory.deploy('Token', 'TKN', 10000)

  const erc20Symbol = await erc20.symbol()
  console.log('Symbol: ', erc20Symbol)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
