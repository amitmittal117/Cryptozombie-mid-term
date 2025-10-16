var safemath = artifacts.require("./safemath.sol");
var zombiefactory = artifacts.require("./zombiefactory.sol");
var zombiefeeding = artifacts.require("./zombiefeeding.sol");
var zombiehelper = artifacts.require("./zombiehelper.sol");
var zombieattack = artifacts.require("./zombieattack.sol");
var zombieownership = artifacts.require("./zombieownership.sol");
var Kitty = artifacts.require("KittyContract");

module.exports = function(deployer) {

    deployer.deploy(safemath);
    deployer.deploy(zombiefactory);
    deployer.deploy(zombiefeeding);
    deployer.deploy(zombiehelper);
    deployer.deploy(zombieattack);
    deployer.deploy(zombieownership);
            deployer.deploy(Kitty).then(function(kittyInstance) {
                return zombiefeeding.deployed().then(function(instance) {
                    return instance.setKittyContractAddress(kittyInstance.address);
                });
            });
}