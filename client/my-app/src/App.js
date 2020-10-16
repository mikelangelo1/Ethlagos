import React, { Component } from "react";
import truffleContract from "@truffle/contract";
import IPFSInboxContract from "./contracts/IPFSInbox.json";
import getWeb3 from "./getWeb3";
import ipfs from './ipfs';

import "./App.css";

class App extends Component {
  constructor(props) {
    super (props)
    this.state = {
      web3: null,
      accounts: null,
      contract: null,
      ipfsHash: null,
      formIPFS: "",
      formAddress: "",
      receivedIPFS: ""
    };

    this.handleChangeAddress = this.handleChangeAddress.bind(this);
    this.handleChangeIPFS = this.handleChangeIPFS.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleReceiveIPFS = this.handleReceiveIPFS.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(IPFSInboxContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
      this.setEventListeners();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  // Turn the File submitted into a buffer
  captureFile = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => this.convertToBuffer(reader);
  };

  // Helper function for turning a file into a buffer
  convertToBuffer = async (reader) => {
    const buffer =  await Buffer.from(reader.result);
    this.setState({buffer});
  };

  // Function for sending the buffer to the
  // ipfs node and show the ipfs hash on the UI
  onIPFSSubmit =  async(event) => {
    event.preventDefault();
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err, ipfsHash);
      this.setState({ipfsHash:ipfsHash[0].hash});
    })
  };

  setEventListeners = () => {
    this.state.contract.inboxResponse()
      .on('data', result => {
        this.setState({receivedIPFS:result.args[0]});
      });
  }

  handleChangeAddress = (event) => {
    this.setState({formAddress: event.target.value});
  }

  handleChangeIPFS = (event) => {
    this.setState({formIPFS: event.target.value});
  }

  handleSend = (event) => {
    event.preventDefault();
    const contract = this.state.contract;
    const account = this.state.accounts[0];

    document.getElementById('new-notification-form').reset();
    this.setState({showNotification: true});
    contract.sentIPFS(this.state.formAddress, this.state.formIPFS, {from: account})
      .then(result => {
        this.setState({formAddress: ""});
        this.setState({formIPFS: ""});
      })
  }

  handleReceiveIPFS = (event) => {
    event.preventDefault();
    const contract = this.state.contract;
    const account = this.state.accounts[0];
    contract.checkInbox({from: account});
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>1. Add a file to IPFS here</h2>
        <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>
          <input type="file" onChange={this.captureFile} />
          <button type="submit">Send It</button>
        </form>
        <p>The IPFS hash is: {this.state.ipfsHash}</p>

        <h2>2. Send Notification here.</h2>
        <form id="new-notification-form" className="scep-form" onSubmit={this.handleSend}>
          <label>
            Receiver Address:
            <input type="text" value={this.state.value} onChange={this.handleChangeAddress} />
          </label>
          <label>
            IPFS Address:
            <input type="text" value={this.state.value} onChange={this.handleChangeIPFS} />
          </label>
          <input type="submit" value="submit" />
        </form>

        <h2>3. Receive Notifications</h2>
        <button onClick={this.handleReceiveIPFS}>Receive IPFS</button>
        <p>{this.state.receivedIPFS}</p>
      </div>
    );
  }
}

export default App;
