import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import mainLogo from'./utils/SYF.png';
import abi from "./utils/ERC721Identifier.json";
import Navbar from 'react-bootstrap/Navbar';
import './App.css';


function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [hasId, setHasId] = useState(false);
  const [buttonText, setButtonText] = useState("Connect Wallet");
  const [buttonPressed, setButtonPressed] = useState(false);
  // const [buttonState, setButtonState] = useState(false);
  const [directions, setDirections] = useState("Please connect wallet to login.  Make sure that your wallet is running on the Goerli testnet.");
  const [backgroundColor, setBackgroundColor] = useState("##777777f4");
  const [jsonId, setJsonId] = useState();

  const green = "#28b715b6"
  const red = "#ee0404b6"

  // The stuff that is commented out here is for an extra layer of security that could be implemented.  It is sort of redudant and I don't have time to figure out the datatypes right now.

  // const MINTER_ROLE = ethers.utils.formatBytes32String("MINTER_ROLE");

  // const syfWalletAddress = "0xAd661cb75C262c63cc34A705f8191Ef33AC90412";
  // let syfwalletAddressFormatted = ethers.utils.hexlify(syfWalletAddress);
  // syfwalletAddressFormatted = hexToBytes(syfWalletAddress);

  const contractAddress = "0xb8E16DDcaF389C84B61C56ab8B0A88E57ACe9053"; // to be added for the new contract that I make
  const contractABI = abi.abi;

  const isMetaMaskInstalled = async () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  }

  const checkIfWalletIsConnected = async () => {
    if (isMetaMaskInstalled() === false) {
      setDirections("Please download metamask in order to continue logging in");
      console.log("Get Metamask!");
      alert("Get Metamask!");
      return;
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
        verifyId();
      } else {
        console.log("No authorized account found");
        // Will have to flash this on screen, not sure how this is possible
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
      setButtonPressed(true);
      verifyId();
    } catch (error) {
      console.log(error)
    }
  }

  const verifyId = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const identifierContract = new ethers.Contract(contractAddress, contractABI, signer);

        const IdCount = (await identifierContract.balanceOf(currentAccount)).toNumber();
        
        if (IdCount === 1) {
          console.log("We have an id");
          setHasId(true);
          setBackgroundColor(green);
          setDirections("Found a valid digital ID in your wallet");
          // get the token ID and URI, then create an ID card to display on screen
          let ownedTokenId = (await identifierContract.tokenOfOwnerByIndex(currentAccount, 0)).toNumber(); // will get the first token id in a list of owner's owned tokens

          getId(await identifierContract.tokenURI(ownedTokenId));
          
        } else if (IdCount === 0) {
          setDirections("Could not find a valid digital ID in this wallet.  If you would like to apply for an account please head to the application page.");
          setBackgroundColor(red);
          setHasId(false);
          // behavior for sending them to the right place to mint an NFT
        } else {
          // Red flag, how do they have two IDs . . . should never get here
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
        console.log(this.response)
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
    checkIfWalletIsConnected();
  }, [currentAccount]) // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    if (hasId && buttonPressed) {
      setBackgroundColor(green);
    } else if (!hasId && buttonPressed) {
      setBackgroundColor(red);
      setJsonId('');
    }
    document.getElementById("connectWallet").style.background = (backgroundColor);
  }, [hasId, backgroundColor, buttonPressed, currentAccount])


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
        { jsonId && (
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
                {jsonId.email}
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
