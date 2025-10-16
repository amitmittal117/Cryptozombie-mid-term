pragma solidity ^0.4.25;

contract KittyCore {
    struct Kitty {
        uint256 genes;
        uint64 birthTime;
        uint32 generation;
    }

    Kitty[] public kitties;
    mapping (uint256 => address) public kittyToOwner;

    function createTestKitty(uint256 _genes) external returns (uint) {
        Kitty memory _kitty = Kitty({
            genes: _genes,
            birthTime: uint64(now),
            generation: 1
        });
        uint256 newKittyId = kitties.push(_kitty) - 1;
        kittyToOwner[newKittyId] = msg.sender;
        return newKittyId;
    }

    function getKitty(uint256 _id) external view returns (
        uint256 genes,
        uint64 birthTime,
        uint32 generation
    ) {
        Kitty storage kitty = kitties[_id];
        return (
            kitty.genes,
            kitty.birthTime,
            kitty.generation
        );
    }
}