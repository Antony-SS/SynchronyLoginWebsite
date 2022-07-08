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
  const [directions, setDirections] = useState("Please connect wallet to login.  Make sure that your wallet is running on the Goerli testnet.");
  const [backgroundColor, setBackgroundColor] = useState("#777777f4");

  const green = "#28b715b6"
  const red = "#ee0404b6"

  const MINTER_ROLE = ethers.utils.formatBytes32String("MINTER_ROLE");

  // const syfWalletAddress = "0xAd661cb75C262c63cc34A705f8191Ef33AC90412";
  // let syfwalletAddressFormatted = ethers.utils.hexlify(syfWalletAddress);
  // syfwalletAddressFormatted = hexToBytes(syfWalletAddress);

  const contractAddress = "0x73F78a5d451DCAb7cb935fEE198a0e13380bD578"; // to be added for the new contract that I make
  const contractABI = abi.abi;


  function hexToBytes(hex) {
    if (!hex) {
      return []
    } else {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    }
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

        // let authorizedContractCreator = identifierContract.hasRole(syfwalletAddressFormatted, MINTER_ROLE);

        // // if the contract address that is put into this code is correct, then this check is redundant, but it is an extra layer of security
        // if (!authorizedContractCreator) {
        //   setHasId(false);
        //   console.log("The ERC721 contract that you are attempting to reference for authentication was not created by an authorized party, in this case Synchrony");
        //   alert("The ERC721 contract that you are attempting to reference for authentication was not created by an authorized party, in this case, Synchrony");
        //   setDirections("WARNING: The ERC721 contract this code is referencing for Digital IDs was not created by the minter (Synchrony).  Please contact contact Synchrony immediately");
        //   return;
        // }

        // continuing now assuming that we are referencing the correct contract . . .
        // next step is to check their balance to see if they have an ID issued by this contract
        console.log("Entering Verify ID");
        const IdCountBig = await identifierContract.balanceOf(currentAccount);
        let IdCount = IdCountBig.toNumber();
        console.log(IdCount);
        if (IdCount === 1) {
          console.log("We have an id");
          setHasId(true);
          setDirections("Found a valid digital ID in your wallet");
          // get the token ID and URI, not change the view of screen
          // for the screen I want it to be black until verified or not, in which chase it will turn green.  Text will be white the entire time.
        } else if (IdCount === 0) {
          console.log("??");
          setDirections("Could not find a valid digital ID in this wallet.  If you would like to apply for an account please head to the application page.");
          setHasId(false);
          // behavior for sending them to the right place to mint an NFT
        } else {
          // Red flag, how do they have two IDs . . . should never get here
          console.log("entering section of for loop we should never reach")
        }
      } 
    } catch {
      console.error();
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  })

  useEffect(() => {
    if (hasId) {
      setBackgroundColor(green);
    } else {
      setBackgroundColor(red);
    }
    //document.getElementById("connectWallet").style.background = (backgroundColor);
  }, [hasId, currentAccount, backgroundColor])

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
      </div>
    </div>

    </div>
  );
}

export default App;
