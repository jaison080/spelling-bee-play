import { useState, useEffect } from "react";
import Head from "next/head";
import Buttons from "../components/Game/buttons";
import Letters from "../components/Game/letters";
import WordList from "../components/Game/wordList";
import AnswerDialog from "../components/AnswersDialog/AnswerDialog";
import useSwr from "swr";
import { Footer, Loader, Navbar } from "../components";
import MainLayout from "../components/MainLayout/MainLayout";
import Header from "../components/Game/header";
import Rankings from "../components/Game/rankings";
import { rankingLevels } from "../components/Game/rankings";
import UserRanking from "../components/Game/userRanking";
import HowTo from "../components/Game/howTo";
import Loading from "../components/Game/loading";
import Hints from "../components/Game/hints";
import AnswerList from "../components/Game/answerList";
import Realistic from "../components/Game/realistic";

const fetcher = (url) => fetch(url).then((res) => res.json());

export const answerSum = (wordList, pangramCount) => {
  let sum = 0;

  if (wordList?.length === undefined || wordList === null) {
    return sum;
  }

  if (pangramCount?.length > 0) {
    for (let i = 0; i < pangramCount.length; i++) {
      if (pangramCount[i].length > 0) {
        sum += 7;
      }
    }
  }

  for (let i = 0; i < wordList?.length; i++) {
    if (wordList[i].length === 4) {
      sum += 1;
    } else if (wordList[i].length > 4) {
      sum += wordList[i].length - 3;
    }
  }

  return sum;
};

export default function spellbee() {
  const { data, error } = useSwr("/api/bee", fetcher);
  const [userWord, setUserWord] = useState("");
  const [foundWords, setFoundWords] = useState([]);
  const [foundPangrams, setFoundPangrams] = useState([]);
  const [shuffledLetters, setShuffledLetters] = useState(null);
  const [message, setMessage] = useState(null);
  const [pointsAdded, setPointsAdded] = useState(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [rankIndex, setRankIndex] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [revealAnswers, setRevealAnswers] = useState(false);

  const logKey = (e) => {
    if (e.keyCode === 8) {
      clearWord();
    } else if (e.keyCode > 64 && e.keyCode < 91) {
      setUserWord(userWord.concat(e.key.toUpperCase()));
    } else if (e.keyCode === 13) {
      !revealAnswers && searchWord();
    } else if (e.keyCode === 32) {
      shuffle();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", logKey);
    return () => {
      window.removeEventListener("keydown", logKey);
    };
  }, [logKey]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (localStorage.getItem("expiration") == null) {
      localStorage.setItem(
        "expiration",
        data.gameData.today.expiration.toString().slice(0, 8)
      );
      localStorage.setItem("foundWords", "");
      localStorage.setItem("pangrams", "");
      localStorage.setItem("revealed", "false");
    } else if (
      data &&
      localStorage.getItem("expiration") <= Date.now().toString().slice(0, 8)
    ) {
      localStorage.setItem(
        "expiration",
        data.gameData.today.expiration.toString().slice(0, 8)
      );
      localStorage.setItem("foundWords", "");
      localStorage.setItem("pangrams", "");
      localStorage.setItem("revealed", "false");
      userRanking();
      setFoundWords([]);
    } else if (
      localStorage.getItem("expiration") > Date.now().toString().slice(0, 8) &&
      localStorage.getItem("revealed") === "true"
    ) {
      setRevealAnswers(true);
      setFoundWords(localStorage.getItem("foundWords").split(","));
      localStorage.getItem("pangrams") !== null &&
        setFoundPangrams(localStorage.getItem("pangrams").split(","));
      userRanking();
    } else if (
      localStorage.getItem("expiration") > Date.now().toString().slice(0, 8) &&
      localStorage.getItem("foundWords") !== null
    ) {
      setFoundWords(localStorage.getItem("foundWords").split(","));
      localStorage.getItem("pangrams") !== null &&
        setFoundPangrams(localStorage.getItem("pangrams").split(","));
      userRanking();
    } else {
      localStorage.setItem(
        "expiration",
        data.gameData.today.expiration.toString().slice(0, 8)
      );
      localStorage.setItem("foundWords", "");
      localStorage.setItem("pangrams", "");
      localStorage.setItem("revealed", "false");
      userRanking();
      setFoundWords([]);
    }
  }, [data]);

  useEffect(() => {
    userRanking();
  }, [foundWords]);

  if (!data) {
    return <Loader />;
  }
  if (error) console.log(error);

  const clearWord = () => {
    setUserWord(userWord.substring(0, userWord.length - 1));
  };

  const searchWord = async () => {
    if (userWord.length === 0) {
      return;
    } else if (userWord.length < 4) {
      setMessage("Too short");
      await new Promise((res) => setTimeout(res, 1000));
      setMessage(null);
    } else if (
      !userWord.toLowerCase().includes(data.gameData.yesterday.centerLetter)
    ) {
      setMessage("Missing centre letter");
      await new Promise((res) => setTimeout(res, 900));
      setMessage(null);
    } else if (foundWords.includes(userWord)) {
      setMessage("Already found");
      await new Promise((res) => setTimeout(res, 900));
      setMessage(null);
    } else if (
      data.gameData.yesterday.pangrams.includes(userWord.toLowerCase())
    ) {
      setMessage("Pangram!");
      setPointsAdded(`+ ${userWord.length + 4}`);
      setFoundWords([userWord, ...foundWords]);
      setFoundPangrams([userWord, ...foundPangrams]);
      localStorage.setItem("foundWords", [userWord, ...foundWords].toString());
      localStorage.setItem("pangrams", [userWord, ...foundPangrams].toString());
      setUserWord("");
      userRanking();
      await new Promise((res) => setTimeout(res, 900));
      setMessage(null);
      setPointsAdded(null);
    } else if (
      data.gameData.yesterday.answers.includes(userWord.toLowerCase())
    ) {
      userWord.length === 4
        ? setMessage("Good!")
        : userWord.length === 5
        ? setMessage("Nice!")
        : userWord.length === 6
        ? setMessage("Great!")
        : setMessage("Fantastic!");
      setPointsAdded(`+ ${userWord.length - 3}`);
      setFoundWords([userWord, ...foundWords]);
      localStorage.setItem("foundWords", [userWord, ...foundWords].toString());
      setUserWord("");
      () => userRanking();
      await new Promise((res) => setTimeout(res, 900));
      setMessage(null);
      setPointsAdded(null);
    } else if (
      !data.gameData.yesterday.answers.includes(userWord.toLowerCase())
    ) {
      setMessage("Not in word list");
      await new Promise((res) => setTimeout(res, 900));
      setMessage(null);
    }
  };

  const shuffle = async () => {
    let newArr = [...data.gameData.yesterday.outerLetters].sort(
      () => Math.random() - 0.5
    );
    setShuffledLetters([]);
    await new Promise((res) => setTimeout(res, 200));
    setShuffledLetters(newArr);
  };

  async function userRanking() {
    if (localStorage.getItem("foundWords") === null) {
      localStorage.setItem("foundWords", "");
    }
    if (localStorage.getItem("pangrams") === null) {
      localStorage.setItem("pangrams", "");
    }
    let userPoints = answerSum(
      localStorage.getItem("foundWords").split(","),
      localStorage.getItem("pangrams").split(",")
    );
    let highestPoints = answerSum(
      data?.gameData.yesterday.answers,
      data?.gameData.yesterday.pangrams
    );

    if (userPoints === 0) {
      setRankIndex(0);
      return;
    }
    for (let i = 0; i < rankingLevels.length; i++) {
      if (
        rankingLevels &&
        Math.floor(rankingLevels[i].minScoreMultiplier * highestPoints) >
          userPoints
      ) {
        setRankIndex(i - 1);
        setCurrentPoints(userPoints);
        return;
      }
    }
  }

  return (
    <MainLayout>
      <AnswerDialog/>
      <div
        className="game"
        style={{
          minHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* {showHowTo && <HowTo showHowTo={() => setShowHowTo(!showHowTo)} />} */}
        {/* {showRanking && (
        <Rankings
          data={data}
          showRankingsToggle={() => setShowRanking(!showRanking)}
        />
      )}
      {showHints && (
        <Hints
          revealWords={() => setRevealAnswers(true)}
          showHints={() => setShowHints(!showHints)}
          pangrams={data && data.gameData.yesterday.pangrams}
          answers={data && data.gameData.yesterday.answers}
          foundWords={foundWords}
        />
      )} */}

        {/* <Header
        data={data}
        showRankings={() => setShowRanking(!showRanking)}
        showHowTo={() => setShowHowTo(!showHowTo)}
        showHints={() => setShowHints(!showHints)}
      /> */}
        {/* <Realistic message={message} /> */}
        {/* <div className="ranking-game-div"> */}
          {/* <div className="ranking-wordlist">
          <UserRanking currentPoints={currentPoints} rankIndex={rankIndex} />
          {revealAnswers ? (
            <AnswerList
              words={foundWords}
              answers={data && data.gameData.yesterday.answers}
            />
          ) : (
            <WordList words={foundWords} />
          )}
        </div> */}
            <div className="w-full fixed flex flex-row items-center justify-center">
              {message && <p className="message">{message}</p>}
              {pointsAdded && (
                <p className="points-added rounded-full animate-ping bg-white">
                  {pointsAdded}
                </p>
              )}
            </div>
            {userWord.length < 1 ? (
              <h2 className="input self-center text-gray-300">
                <span className="cursor">|</span>Type or Click
              </h2>
            ) : (
              <h2 className="input self-center">
                {userWord.split("").map((i) => (
                  <span
                    key={i}
                    className={
                      i === data.gameData.yesterday.centerLetter.toUpperCase()
                        ? "text-yellow-500"
                        : data.gameData.yesterday.outerLetters.includes(
                            i.toLowerCase()
                          )
                        ? "text-gray-100"
                        : "text-gray-300"
                    }
                  >
                    {i}
                  </span>
                ))}
                <span className="cursor">|</span>
              </h2>
            )}
            <Letters
              data={data && data.gameData.yesterday}
              shuffledLetters={
                shuffledLetters === null
                  ? data.gameData.yesterday.outerLetters.map((i) =>
                      i.toUpperCase()
                    )
                  : shuffledLetters.map((i) => i.toUpperCase())
              }
              setLetter={(e) => setUserWord(userWord.concat(e))}
            />
            <Buttons
              revealedAnswers={revealAnswers}
              shuffle={() => shuffle()}
              clearWord={() => clearWord()}
              searchWord={() => searchWord()}
            />
        </div>
      {/* </div> */}
    </MainLayout>
  );
}
