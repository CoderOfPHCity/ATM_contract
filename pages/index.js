import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [newName, setNewName] = useState("");
  const [totalDepositors, setTotalDepositors] = useState(0);
  

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
      getTotalDepositors();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const setName = async () => {
    if (atm && newName) {
      let tx = await atm.NameOfdepositor(newName);
      await tx.wait();
      setNewName(""); 
      setTotalDepositors( totalDepositors +1 );
      
    }
  };

  const getTotalDepositors = async () => {
    if (atm) {
      const [name, total] = await atm.getTotalDepositors();
      setTotalDepositors(total.toNumber());
    }
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    if (totalDepositors === 0) {
      getTotalDepositors();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <br />
        <h3>Please enter your name</h3>
        <input
          type="text"
          value={newName}
          onChange={handleNameChange}
          placeholder="Enter your name"
        />
        <button onClick={setName}>Set Name</button>
        <br />
        <p>Total Depositors: {totalDepositors}</p>
        <p>Depositor Name: {newName}</p>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Daniel Agantem ATM!</h1>
      </header>
      {initUser()}
      <style jsx global>{`
        body {
          padding: 0;
          margin: 0;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          background-color: #f0f0f0;
        }
        .container {
          text-align: center;
          padding: 20px;
        }
        header h1 {
          color: #333;
        }
        button {
          background-color: #000;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin: 10px;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #333;
        }
        input[type="text"] {
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
          margin: 5px;
          width: 200px;
          font-size: 16px;
        }
        p {
          margin: 10px 0;
          color: #666;
        }
      `}</style>
    </main>
  );
  
}