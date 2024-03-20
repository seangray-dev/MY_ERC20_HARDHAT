import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('ERC20', function () {
  // only runs once and then basically a snapshot is taken of the blockchain
  // anytime we want to load or want to test again that calls this function...
  // it realizes we already have a snapshot of that and loads it
  async function deployAndMockERC20() {
    const [alice, bob] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory('ERC20Mock');
    const erc20Token = await ERC20.deploy('Name', 'SYM', 18);

    await erc20Token.mint(alice, 300);

    return { alice, bob, erc20Token };
  }

  it('transfers tokens correctly', async function () {
    const { alice, bob, erc20Token } = await loadFixture(deployAndMockERC20);

    await erc20Token.connect(alice).transfer(bob.address, 100);

    const aliceBalance = await erc20Token.balanceOf(alice.address);
    const bobBalance = await erc20Token.balanceOf(bob.address);

    expect(aliceBalance).to.equal(200);
    expect(bobBalance).to.equal(100);
  });

  it('should revert if sender has insufficient balance', async function () {
    const [alice, bob] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory('ERC20Mock');
    const erc20Token = await ERC20.deploy('Name', 'SYM', 18);

    await erc20Token.mint(alice, 300);

    await expect(erc20Token.transfer(bob.address, 400)).to.be.revertedWith(
      'ERC20: Insufficient sender balance'
    );
  });

  it('should emit Transfer event on transfers', async function () {
    const [alice, bob] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory('ERC20Mock');
    const erc20Token = await ERC20.deploy('Name', 'SYM', 18);

    await erc20Token.mint(alice, 300);

    await expect(erc20Token.transfer(bob.address, 200))
      .to.emit(erc20Token, 'Transfer')
      .withArgs(alice.address, bob.address, 200);
  });
});
