pragma solidity ^0.4.25;

contract KittyContract {
  struct Kitty {
    bool isGestating;
    bool isReady;
    uint256 cooldownIndex;
    uint256 nextActionAt;
    uint256 siringWithId;
    uint256 birthTime;
    uint256 matronId;
    uint256 sireId;
    uint256 generation;
    uint256 genes;
  }

  Kitty[] public kitties;

  // simple creator for local testing
  function createKitty(uint256 _genes) public returns (uint256) {
    Kitty memory _kitty = Kitty({
      isGestating: false,
      isReady: true,
      cooldownIndex: 0,
      nextActionAt: 0,
      siringWithId: 0,
      birthTime: now,
      matronId: 0,
      sireId: 0,
      generation: 0,
      genes: _genes
    });
    kitties.push(_kitty);
    return kitties.length - 1;
  }

  function getKitty(uint256 _id) external view returns (
    bool isGestating,
    bool isReady,
    uint256 cooldownIndex,
    uint256 nextActionAt,
    uint256 siringWithId,
    uint256 birthTime,
    uint256 matronId,
    uint256 sireId,
    uint256 generation,
    uint256 genes
  ) {
    Kitty storage k = kitties[_id];
    return (
      k.isGestating,
      k.isReady,
      k.cooldownIndex,
      k.nextActionAt,
      k.siringWithId,
      k.birthTime,
      k.matronId,
      k.sireId,
      k.generation,
      k.genes
    );
  }
}
