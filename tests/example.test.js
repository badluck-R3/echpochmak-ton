const MyContract = require('./testContract');
describe('Asserts', () => {
  let manager;
  beforeEach(async () => {
    await restart();
    manager = new Manager();
    await manager.createClient(['http://localhost:8080/graphql']);
    const myC = await new MyContract(
      './tests/contract/9_PiggyBank.tvc',
      './tests/contract/9_PiggyBank.abi.json',
      manager.client,
      await manager.createKeysAndReturn()
    );
    manager.addCustomContract(myC, 'gg');
    await manager.loadContract(
      './tests/contract/InitParams.tvc',
      './tests/contract/InitParams.abi.json'
    );
    await manager.loadContract(
      './tests/contract/9_PiggyBank.tvc',
      './tests/contract/9_PiggyBank.abi.json'
    );
    await manager.loadContract(
      './tests/contract/9_PiggyBank_Owner.tvc',
      './tests/contract/9_PiggyBank_Owner.abi.json'
    );
    await manager.loadContract(
      './tests/contract/9_PiggyBank_Stranger.tvc',
      './tests/contract/9_PiggyBank_Stranger.abi.json'
    );

    await manager.contracts['9_PiggyBank_Owner'].deployContract();
    await manager.contracts['9_PiggyBank_Stranger'].deployContract();
    await manager.contracts['gg'].deployContract({
      own: manager.contracts['9_PiggyBank_Owner'].address,
      lim: 1000000,
    });
  });

  it('test one', async () => {
    await manager.contracts['9_PiggyBank_Owner'].runContract('addToDeposit', {
      bankAddress: manager.contracts['gg'].address,
      amount: 100000,
    });
    manager.giveToAddress(manager.contracts['gg'].address);
    await assertError(
      async () => {
        await manager.contracts['gg'].runContract('getData', {});
      },
      3025,
      'getData'
    );
    const res = await manager.contracts['gg'].getData();
    console.log(res);
  });
});
