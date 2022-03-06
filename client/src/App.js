import React, { useState, useEffect } from "react";
import CryptoCoder from "./contracts/CryptoCoder.json";
import Web3 from "web3";
import {shorten} from "./utils/shortenAddress";
import "./App.css";

const App = () => {
  
  const [value, setValue] = useState("");
  const [web3Api, setWeb3Api] = useState({
    web3: null,
    provider: null,
  });
  
    const [account, setAccount] = useState("");
  
    const [contract, setContract] = useState()

    const loadProvider = async () => {
      let provider = null;
      try {
        if (window.ethereum) {
          provider = window.ethereum;
          try {
            window.ethereum.request({ method: 'eth_requestAccounts' })
          } catch (error) {
            alert(error);
          }
        }
        else if (window.web3) {
          provider = window.web3.currentProvider;
        }
        else if (!process.env.production) {
          provider = new Web3.providers.HttpProvider("http://localhost/7545")
        }
        else {
          alert("Install metmask");
        }

        setWeb3Api({
          web3: new Web3(provider),
          provider,
        });

      } catch (error) {
        console.error();
        alert(error);
      }

    }
    
  useEffect(async () => {

    if (web3Api.web3 != null) {
      const networkId = await web3Api.web3.eth.net.getId();
      const deployedNetwork = CryptoCoder.networks[networkId];
      const instance = new web3Api.web3.eth.Contract(
        CryptoCoder.abi,
        deployedNetwork.address,
      );

      setContract(instance);
    }
  }, [web3Api]);

  useEffect(() => {
    const getAccount = async () => {
      if (web3Api.web3 != null) {
        const accounts = await web3Api.web3.eth.getAccounts();
        if(accounts){
          setAccount(accounts[0]);
        }
      }
    }
    getAccount();
  }, [web3Api]);


  const [coders, setCoders] = useState([]);

  const loadNft = async () => {
    if (contract) {
      const totalSupply = await contract.methods.totalSupply().call();
      let results = [];
      for (let i = 0; i < totalSupply; i++) {
        let coder = await contract.methods.coders(i).call();
        results.push(coder)
      }
      setCoders(results);
    }
  }

  const change = (e) => {
    setValue(e.target.value);
  }

  const search = (e) => {
    e.preventDefault();

    contract.methods.mint(value).send({ from: account }, (error) => {
      if (!error) {
        setCoders([...coders, value])
        setValue("");
        loadNft();
      }
    });

  }

  useEffect(()=>{
    loadNft();
    loadProvider();
  },[contract]);

  return (
    <div className="App">
      <div className="nav">
        <div className="crypto">
          Crypto Coders
        </div>
        <div className="address">
          {account ? `${shorten(account)}` : "Address"}
        </div>
      </div>
    
    <div className="welcome">
      <div className="main">
        <p className="nft">
          <img className="img" src="https://avatars.dicebear.com/api/pixel-art/raghav.svg" alt="NFT" />
        </p>
        <p className="para">This project is related to nft creation, Give it a try and add your name.

        </p>

        <div className="flex">
          <input type="text" placeholder="ex: Raghav" value={value} onChange={change} />
          <button className="btn" onClick={search}>
            Mint
          </button>
        </div>
      </div>

      <div className="grid-container">
        {
          coders.map((code, i) => (
            <div className="grid-item"  key={i}>
              <img className="img" src={`https://avatars.dicebear.com/api/pixel-art/${code}.svg`} alt="NFT" />
              <p className="op">{code}</p>
            </div>
          ))
        }
      </div>
</div>
    </div>
  );
}

export default App;
