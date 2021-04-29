import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import BalanceTree from '../src/balance-tree'
import { MerkleDistributor, MerkleDistributor__factory, TestERC20, TestERC20__factory } from '../typechain'

describe('MerkleDistributor', () => {
  let wallet0: SignerWithAddress
  let wallet1: SignerWithAddress

  let token: TestERC20

  let erc20Factory: TestERC20__factory
  let distributorFactory: MerkleDistributor__factory

  before(async () => {
    ;[wallet0, wallet1] = await ethers.getSigners()
    erc20Factory = (await ethers.getContractFactory('TestERC20')) as TestERC20__factory
    distributorFactory = (await ethers.getContractFactory('MerkleDistributor')) as MerkleDistributor__factory
  })

  beforeEach('deploy token', async () => {
    token = await erc20Factory.deploy('Token', 'TKN', 0)
  })

  describe('#token', () => {
    it('returns the token address', async () => {
      const distributor = await distributorFactory.deploy(token.address, ethers.constants.HashZero)
      expect(await distributor.token()).to.eq(token.address)
    })
  })

  describe('#merkleRoot', () => {
    it('returns the zero merkle root', async () => {
      const distributor = await distributorFactory.deploy(token.address, ethers.constants.HashZero)
      expect(await distributor.merkleRoot()).to.eq(ethers.constants.HashZero)
    })
  })

  describe('#claim', () => {
    it('fails for empty proof', async () => {
      const distributor = await distributorFactory.deploy(token.address, ethers.constants.HashZero)
      await expect(distributor.claim(0, wallet0.address, 10, [])).to.be.revertedWith(
        'MerkleDistributor: Invalid proof.'
      )
    })

    describe('two account tree', () => {
      let distributor: MerkleDistributor
      let tree: BalanceTree

      beforeEach('deploy', async () => {
        tree = new BalanceTree([
          { account: wallet0.address, amount: BigNumber.from(100) },
          { account: wallet1.address, amount: BigNumber.from(101) },
        ])
        distributor = await distributorFactory.deploy(token.address, tree.getHexRoot())
        await token.setBalance(distributor.address, 201)
      })

      it('successful claim', async () => {
        const proof0 = tree.getProof(0, wallet0.address, BigNumber.from(100))
        await expect(distributor.claim(0, wallet0.address, BigNumber.from(100), proof0))
          .to.emit(distributor, 'Claimed')
          .withArgs(0, wallet0.address, BigNumber.from(100))
        expect(await token.balanceOf(wallet0.address)).to.eq(BigNumber.from(100))
      })

      it('sets #isClaimed', async () => {
        const proof0 = tree.getProof(0, wallet0.address, BigNumber.from(100))
        expect(await distributor.isClaimed(0)).to.eq(false)
        await distributor.claim(0, wallet0.address, BigNumber.from(100), proof0)
        expect(await distributor.isClaimed(0)).to.eq(true)
      })

      it('cannot allow two claims', async () => {
        const proof0 = tree.getProof(0, wallet0.address, BigNumber.from(100))
        await distributor.claim(0, wallet0.address, BigNumber.from(100), proof0)
        await expect(distributor.claim(0, wallet0.address, BigNumber.from(100), proof0)).to.be.revertedWith(
          'MerkleDistributor: Drop already claimed.'
        )
      })
    })
  })
})
