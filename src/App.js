import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import mainLogo from'./utils/SYF.png';
import abi from "./utils/ERC721Identifier.json";
import Navbar from 'react-bootstrap/Navbar';
import './App.css';


function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [buttonText, setButtonText] = useState("Connect Wallet");
  // const [buttonState, setButtonState] = useState(false);
  const [directions, setDirections] = useState("Please connect wallet to login.  Make sure that your wallet is running on the Goerli testnet.");
  const [jsonId, setJsonId] = useState();
  const [decryptedJsonId, setDecryptedJsonId] = useState();

  const green = "#28b715b6";
  const red = "#ee0404b6";

  const contractAddress = "0x356207B68202F712A8b7cc8E6eA34FafBfC4eD9f"; // to be added for the new contract that I make
  const contractABI = abi.abi;

  function decryptJsonId() {
    const { ethereum } = window;
    
    let temp = jsonId;
    // iterating through every value in the json object except walletAddress (since it is unencrypted)
    Object.keys(jsonId).forEach((key) => {
      if (key !== "walletAddress") {
        ethereum
          .request({
            method: 'eth_decrypt',
            params: [temp[key], currentAccount],
          })
          .then(function(decryptedMessage) { 
            console.log(decryptedMessage);
            temp[key] = decryptedMessage;
          })
          .catch((error) => console.log(error.message));
      }
    })
    setDecryptedJsonId(temp);
    setJsonId('');
    console.log("From newly decrypted object", decryptedJsonId.firstName);
  }

  const isMetaMaskInstalled = async () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  }

  const checkIfWalletIsConnected = async () => {
    if (isMetaMaskInstalled() === false) {
      setDirections("Please download metamask in order to continue logging in");
      console.log("Get Metamask!");
      alert("Get Metamask!");
      return false;
      // only logging to console for now, can add functionality to display a link . . .
    }
    
    try {

      const { ethereum } = window;
      
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        setButtonText("Connected with: " + currentAccount);
        return true;
      } else {
        console.log("No authorized account found");
        // Will have to flash this on screen, not sure how this is possible
        return false;
      }
    } catch {
      console.error();
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      await verifyId();
    } catch (error) {
      console.log(error)
    }
  }

  const verifyId = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        console.log("Calling verify!!")
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const identifierContract = new ethers.Contract(contractAddress, contractABI, signer);

        const IdCount = (await identifierContract.balanceOf(currentAccount)).toNumber();
        
        if (IdCount === 1) {
          console.log("We have an id");
          document.getElementById("connectWallet").style.background = green;
          setDirections("Found a valid digital ID in your wallet");

          // get the token ID and URI, then create an ID card to display on screen
          let ownedTokenId = await (await identifierContract.tokenOfOwnerByIndex(currentAccount, 0)).toNumber(); // will get the first token id in a list of owner's owned tokens
          await getId(await identifierContract.tokenURI(ownedTokenId));
          return;

        } else if (IdCount === 0) {
          console.log("Entering ID count = 0");
          document.getElementById("connectWallet").style.background = red;
          setJsonId('');
          setDirections("Could not find a valid digital ID in this wallet.  If you would like to apply for an account please head to the application page.");
          return;
          // behavior for sending them to the right place to mint an NFT
        } else {
          // Red flag, how do they have two IDs . . . should never get here . . . 
          console.log("entering section conditional we should never reach")
        }
      } 
    } catch {
      console.error();
    }
  }

  const getId = async(URL) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", URL);
    xhr.responseType = 'json';

    // function that specifies what to do with the response once received
    xhr.onload = function() {
      if (this.status === 200) {
        console.log("Request response is 200.")
        console.log(this.response);
        setJsonId(this.response);
      } else {
        console.log("Couldn't find the ID in records, this should never happen.  This indicates that the records must have been corrupted or the blockchain was hacked (not likely).");
        return ("Couldn't find the ID in records, this should never happen.  This indicates that the records must have been corrupted or the blockchain was hacked (not likely).");
      }
    }
// send GET
    xhr.send();
  }

  useEffect(() => {
    console.log("Calling small hook");
    checkIfWalletIsConnected();
    verifyId();
  }, [currentAccount, jsonId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="App">
      <Navbar variant='dark' bg='dark' sticky = 'top'>
        <div className= 'navbarContainer'>
          <div className = "imgContainer">
            <Navbar.Brand href="#home">
              <img src= {mainLogo} width='35' height='35' alt = 'synchrony               logo'className="d-inline-block align-top"
              />{' '}
              Synchrony
            </Navbar.Brand>
          </div>  
        </div>
      </Navbar>
    <div className="wrapper">
      <div className= "dataContainer">
        <div className="title">
          <h2>Login with Wallet</h2>
        </div>
        <div className="directions">{directions}</div>
        <button className="connectWallet" id="connectWallet" onClick= {connectWallet}>{buttonText}</button>
        { (jsonId && !decryptedJsonId) && (
          <>
            <div className="idCard">
              <div className="name">
                {jsonId.lastName}, {jsonId.middleName} {jsonId.firstName}
              </div>
              <div className="info">
                {jsonId.address}
              </div>
              <div className="info">
                {jsonId.city}, {jsonId.state}, {jsonId.zip}
              </div>
              <div className="info">
                {jsonId._birthdate}
              </div>
              <div className="info">
                {jsonId.email}
              </div>
              <div className="info">
                {jsonId.phone}
              </div>
              <div className="info">
                {jsonId.ssn}
              </div>
            </div>
            <button className="decryptId" onClick={decryptJsonId}>Decrypt ID!</button>
          </>
        )}
        { decryptedJsonId && (
          <>
          <div className="idCard">
              <div className="name">
                {decryptedJsonId.lastName}, {decryptedJsonId.middleName} {decryptedJsonId.firstName}
              </div>
              <div className="info">
                {decryptedJsonId.address}
              </div>
              <div className="info">
                {decryptedJsonId.city}, {decryptedJsonId.state}, {decryptedJsonId.zip}
              </div>
              <div className="info">
                {decryptedJsonId._birthdate}
              </div>
              <div className="info">
                {decryptedJsonId.email}
              </div>
              <div className="info">
                {decryptedJsonId.phone}
              </div>
              <div className="info">
                {decryptedJsonId.ssn}
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    </div>
  );
}

export default App;
