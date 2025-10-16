module.exports = async function(callback) {
  try {
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];

  const Kitty = artifacts.require("KittyContract");
  const ZombieOwnership = artifacts.require("ZombieOwnership");

  const kitty = await Kitty.deployed();
  // Use the top-level ZombieOwnership contract instance (has full inheritance/state)
  const zo = await ZombieOwnership.deployed();

    console.log("Accounts[0] =", owner);

    // create kitty
    let tx1 = await kitty.createKitty(123456789, { from: owner });
    console.log("createKitty tx:", tx1.tx);
    // the event is not emitted; kitty id is last index in array but createKitty returns transaction
    // call getKitty for id 0
    let kittyData = await kitty.getKitty.call(0);
    console.log("kitty[0].genes =", kittyData[9].toString());

    // create random zombie (owner must have 0 zombies)
    let zombies = await zo.getZombiesByOwner.call(owner);
    if (zombies.length === 0) {
      console.log("Creating random zombie for owner...");
      try {
        await zo.createRandomZombie("Tzombie", { from: owner });
      } catch (err) {
        console.error("createRandomZombie failed:", err.message || err);
      }
      zombies = await zo.getZombiesByOwner.call(owner);
    } else {
      console.log("Owner already has zombies, skipping createRandomZombie. Zombies:", zombies.map(n => n.toString()));
    }

    // feed on kitty (zombie id 0, kitty id 0)
    console.log("Advancing time by 1 day to bypass cooldown...");
    // Ganache supports evm_increaseTime and evm_mine
    await new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [86400], // 1 day
        id: new Date().getTime()
      }, (err) => {
        if (err) return reject(err);
        web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_mine', params: [], id: new Date().getTime() }, (err2) => {
          if (err2) return reject(err2);
          resolve();
        });
      });
    });

    console.log("Feeding zombie 0 on kitty 0...");
    try {
      await zo.feedOnKitty(0, 0, { from: owner });
      console.log("After feeding, getZombiesByOwner:", (await zo.getZombiesByOwner.call(owner)).map(n => n.toString()));
    } catch (err) {
      console.error("feedOnKitty failed:", err.message || err);
    }

    // level up: call on zo (ZombieOwnership contains levelUp via inheritance)
    console.log("Attempting to level up zombie 0 by sending fee...");
    try {
      await zo.levelUp(0, { from: owner, value: web3.utils.toWei("0.001", "ether") });
      console.log("levelUp tx success");
    } catch (err) {
      console.error("levelUp failed:", err.message || err);
    }

    // display zombie 0 details
    const zombie0 = await zo.zombies.call(0);
    console.log("Zombie 0:", { name: zombie0[0], dna: zombie0[1].toString(), level: zombie0[2].toString(), winCount: zombie0[4].toString(), lossCount: zombie0[5].toString() });

    callback();
  } catch (err) {
    callback(err);
  }
};
