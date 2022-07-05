import React, { useEffect, useState } from "react";
import { ethers, utils } from "ethers";
import abi from "./utils/ERC721Identifier.json";
import './App.css';


function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [hasId, setHasId] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [description, setDescription] = useState("");


  const MINTER_ROLE = ethers.utils.formatBytes32String("MINTER_ROLE");

  const syfWalletAddress = "0xAd661cb75C262c63cc34A705f8191Ef33AC90412";
  let syfwalletAddressFormatted = ethers.utils.hexlify(walletAddress)
  syfwalletAddressFormatted = hexToBytes(walletAddress);

  const contractAddress = ""; // to be added for the new contract that I make
  const contractABI = abi.abi;

  const isMetaMaskInstalled = async () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  }

  const checkIfWalletIsConnected = async () => {
    if (isMetaMaskInstalled() === false) {
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
      } else {
        console.log("No authorized account found");
        // Will have to flash this on screen, not sure how this is possible
      }

    } catch {
      console.error();
    }
  }

  const verifyId = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const identifierContract = new ethers.Contract(contractAddress, contractABI, signer);

        let authorizedContractCreator = identifierContract.hasRole(syfwalletAddressFormatted, MINTER_ROLE);

        // if the contract address that is put into this code is correct, then this check is redundant, but it is an extra layer of security
        if (!authorizedContractCreator) {
          setHasId(false);
          console.log("The ERC721 contract that you are attempting to reference for authentication was not created by an authorized party, in this case Synchrony");
          alert("The ERC721 contract that you are attempting to reference for authentication was not created by an authorized party, in this case, Synchrony");
          return;
        }

        // continuing now assuming that we are referencing the correct contract . . .
        // next step is to check their balance to see if they have an ID issued by this contract

        const IdCount = identifierContract.balanceOf(currentAccount);

        if (IdCount === 1) {
          // get the token ID and URI, not change the view of screen
          // for the screen I want it to be black until verified or not, in which chase it will turn green.  Text will be white the entire time.
        } else if (IdCount === 0) {
          // behavior for sending them to the right place to mint an NFT
        } else {
          // Red flag, how do they have two IDs . . . should never get here
        }
        


      } 
    } catch {
      console.error();
    }
  }


  return (
    <div className="App">


    </div>
  );
}

export default App;
