import React, { useEffect, useState } from "react";
import { ethers, utils } from "ethers";
import './App.css';


function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [hasId, setHasId] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [description, setDescription] = useState("");

  const contractAddress = ""; // to be added for the new contract that I make

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
  }

  const verifyId = async () => {
    
  }


  return (
    <div className="App">

    </div>
  );
}

export default App;
