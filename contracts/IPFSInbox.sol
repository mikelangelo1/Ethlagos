pragma solidity >=0.4.21 <0.7.0;

contract IPFSInbox {
    // structures
    mapping (address => string) ipfsInbox;

    // events
    event ipfsSent(string _ipfsHash, address _address);
    event inboxResponse(string response);

    // modifiers
    modifier notFull (string memory _string) {bytes memory stringTest = bytes(_string); require (stringTest.length == 0); _;}

    // an empty constructor that creates an insaance of the contract
    constructor() public {}

    // a function that takes in the receiver's address and the IPFS adress. Places the IPFS adress in the receiver's inbox.
    function sentIPFS(address _address, string memory _ipfsHash)
        notFull(ipfsInbox[_address])
        public
    {
        ipfsInbox[_address] = _ipfsHash;
        emit ipfsSent(_ipfsHash, _address);
    }

    // a function that checks your inbox and empties it afterwards. Returns an address if there is none, or "Emtpty inbox"
    function checkInbox()
        public
    {
        string memory ipfs_hash = ipfsInbox[msg.sender];
        if(bytes(ipfs_hash).length == 0) {
            emit inboxResponse("Empty Inbox");
        } else {
            ipfsInbox[msg.sender] = "";
            emit inboxResponse(ipfs_hash);
        }

    }
}
