import contractAbi from "./utils/contractABI.json";
import { questions } from "./constants.js";
import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import polygonLogo from "./assets/polygonlogo.png";
import { ethers } from "ethers";
const CONTRACT_ADDRESS = "0x46bAe63e59227f63Cc6Ab2b26cf55c2c6Be77A9a";

export default function App() {
  // stateful variables
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [currentAccount, setCurrentAccount] = useState("");

  // set twitter constants
  const TWITTER_HANDLE = "matt_brc";
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

  // Implement connectWallet method
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const mintNFT = async () => {
    // set price
    const price = "0.1";
    console.log("You scored:", score, "out of 20", "with price", price);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi.abi,
          signer
        );

        console.log("Popping wallet to pay gas");
        let tx = await contract.register(score, {
          value: ethers.utils.parseEther(price),
        });
        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log(
            "Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash
          );
        } else {
          alert("Transaction failed! Please try again");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <div>
      <div className="connect-wallet-container">
        <img
          className="header-image"
          src="https://i.imgur.com/iKlQSzg.jpeg"
          alt="midwit meme"
        />
        <p className="mumbai-text">(Polygon Mumbai)</p>
        {/* Call the connectWallet function we just wrote when the button is clicked */}
        <div className="button-container">
          <button
            className="cta-button mint-button connect-wallet"
            onClick={connectWallet}
          >
            <img className="polygon-logo" alt="polygon" src={polygonLogo} />
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuizForm = () => {
    return (
      <div className="quiz-app">
        {showScore ? (
          <div className="score-section score-text">
            You scored {(score / questions.length) * 100}%
          </div>
        ) : (
          <>
            <div className="question-section">
              <div className="question-count">
                <span>Question {currentQuestion + 1}</span>/{questions.length}
              </div>
              <div className="question-text">
                {questions[currentQuestion].questionText}
              </div>
            </div>
            <div className="answer-section">
              {questions[currentQuestion].answerOptions.map(
                (answerOption, index) => (
                  <button
                    onClick={() =>
                      handleAnswerButtonClick(answerOption.isCorrect)
                    }
                  >
                    {answerOption.answerText}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderMintButton = () => {
    return (
      <div>
        <div className="button-container">
          <button className="cta-button mint-button" onClick={mintNFT}>
            Mint
          </button>
        </div>
        <div>
          <button className="cta-button opensea-button">
            <a
              href="https://testnets.opensea.io/account"
              target="_blank"
              rel="noopener noreferrer"
            >
              See On Opensea
            </a>
          </button>
        </div>
      </div>
    );
  };

  // This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const handleAnswerButtonClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  return (
    <div>
      <header>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap"
          rel="stylesheet"
        ></link>
        <h1>midwit IQ Test</h1>
      </header>

      {/* Hide the connect button if currentAccount isn't empty*/}
      {!currentAccount && renderNotConnectedContainer()}
      {/* Render the input form if an account is connected */}
      {currentAccount && renderQuizForm()}
      {/* Render the mint button if an account is connected */}
      {showScore && renderMintButton()}

      <div>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        ></link>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
}
