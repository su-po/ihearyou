
import { ChangeEvent, SyntheticEvent, useEffect, useRef, useState } from 'react'
import { motion } from "framer-motion"
import { FiHeadphones, FiHelpCircle, FiPlay, FiSearch } from 'react-icons/fi'
import { BsFillSkipForwardFill } from 'react-icons/bs'
import { MdLeaderboard } from 'react-icons/md'
import { FiInfo } from 'react-icons/fi'

import { Howler, Howl } from 'howler'

import Logo from 'public/lotus.svg'

const answer = "adele rolling in the deep"
enum GameState {
  idle = "IDLE",
  playing = "PLAYING",
  gameWin = "WIN",
  gameLose = "LOSE"
}

enum GuessType {
  skip = "SKIP",
  incorrect = "INCORRECT"
}

type Guess = {

  type: "SKIP" | "INCORRECT"
  submission?: string
}

interface modifiedDataset extends DOMStringMap {
  fill?: string
}

export default function Home() {

  const guessArray = ['guess1', 'guess2', 'guess3', 'guess4', 'guess5', 'guess6']

  const missLimit = 6 // This account for both skips and incorrect guesses

  const skipValues = ["6.25%", "12.5%", "25%", "43.75%", "68.75%", "99.9%"]
  const clipDurations = [1, 2, 4, 8, 12, 16] // durations are in seconds multiple by 1000 for milliseconds

  const [guess, setGuess] = useState("")
  const [gameState, setGameState] = useState<GameState>(GameState.idle)

  const [skipIndex, setSkipIndex] = useState(1)
  const [incorrectGuessCount, setIncorrectGuessCount] = useState(0)

  const [canClickPlay, setCanClickPlay] = useState(true)

  const [isSoundPlaying, setIsSoundPlaying] = useState(false)

  let soundID: number | undefined = undefined;

  const [misses, setMisses] = useState<Guess[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)

  const [duration, setDuration] = useState(0)


  useEffect(() => {
    console.log(canClickPlay)
    if (canClickPlay) return
  }
    , [isSoundPlaying, canClickPlay])

  useEffect(() => {
    console.log(incorrectGuessCount + skipIndex)
    if (incorrectGuessCount + skipIndex === missLimit && gameState === GameState.playing) {
      setGameState(GameState.gameLose)
      return
    }
  }, [gameState, incorrectGuessCount, skipIndex])

  let seekInterval: NodeJS.Timer | undefined;

  let sound = new Howl({
    src: ["/untitled.mp3"],
    sprite: {
      guess1: [0, 1000],
      guess2: [0, 2000],
      guess3: [0, 4000],
      guess4: [0, 8000],
      guess5: [0, 12000],
      guess6: [0, 16000],

    },
    onplay: function() {
      setIsSoundPlaying(true)
      seekInterval = setInterval(function() {
        var seek = sound.seek();
        console.log('Current position: ' + seek);
        setDuration(Math.round(seek))
      }, 150);
    },
    onend: function() {
      clearInterval(seekInterval)
      console.log('Finished!');
      setIsSoundPlaying(false)
      setCanClickPlay(true)
    },
    onseeking: function() {
      // Typescript is giving an error, but it's not real. Ignore it.
      //
      let position: number = sound.seek(soundID)
      console.log(Math.round(position - 0.2))
      setDuration(position)
    }
  })


  const handlePlay = (event: SyntheticEvent) => {

    console.log(percentageToDecimal(skipValues[misses.length]))
    console.log(clipDurations[misses.length])
    const idx = guessArray[skipIndex - 1]
    soundID = sound.play(idx)
    console.log('Current ID: ', soundID)
    console.log('Current IDX: ', idx)


    if (gameState === GameState.idle) setGameState(GameState.playing)

    setCanClickPlay(false)
  }

  const handleSkip = (event: SyntheticEvent) => {
    console.log(`You have ${misses.length} misses. Envoked in Handle Skip`)
    if (skipIndex === skipValues.length) {
      console.log('did you give up?')
      return
    }
    if (progressRef !== null) {
      setSkipIndex(1 + skipIndex)
      const { fill } = progressRef.current?.dataset as modifiedDataset
      console.log(fill)
      const fillPercentage = percentageToDecimal(skipValues[skipIndex])
      console.log(fillPercentage)
      // update the data fill attribute
      progressRef.current?.setAttribute('data-fill', fillPercentage.toString())
      // update the css scale value
      progressRef.current?.style.setProperty('transform',
        `scaleX(${(fillPercentage / 100).toString()})`)
    }
    setMisses([...misses, {
      type: "SKIP",
    }])

  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
    setGuess(event.target.value)

  }

  function handleSubmit(event: SyntheticEvent): void {
    console.log(`You have ${misses.length} misses. Envoked in Handle Skip`)

    if (guess.trim().length < 1) return;

    console.log(guess, "and", answer)
    const submission = guess.trim().toLowerCase()

    if (submission === answer) {

      console.log("YOU WIN")
      setGameState(GameState.gameWin)

      throw new Error("Please remember to implement popup modal for win")
    }
    if (progressRef !== null) {

      if (misses.length === 5)

        setGameState(GameState.gameLose)
    }
    setSkipIndex(1 + skipIndex)
    const { fill } = progressRef.current?.dataset as modifiedDataset
    console.log(fill)
    const fillPercentage = percentageToDecimal(skipValues[skipIndex])
    console.log(fillPercentage)
    // update the data fill attribute
    progressRef.current?.setAttribute('data-fill', fillPercentage.toString())
    // update the css scale value
    progressRef.current?.style.setProperty('transform',
      `scaleX(${(fillPercentage / 100).toString()})`)

    if (inputRef !== null && inputRef.current) {
      inputRef.current.value = ""
    }
    setMisses([...misses, {
      type: "INCORRECT",
      submission: submission
    }])
  }

  return (
    <div className='flex flex-col h-full w-screen  max-w-2xl mx-auto '>
      <header className='h-16 py-6 px-1 w-full mb-4 '>
        <nav className='flex py-2 justify-center items-center border-b-2 border-bottom-[#888888]'>
          <a className='logo' href="https://example.com/" target="_blank" rel="noopener noreferer" aria-label="Go To example.com">
            <Logo fill="white" width={22} height={22} />
          </a>
          <button className='logo' onClick={() => console.log('info button has been clicked')}>
            <FiInfo size="22px" />
          </button>
          <h2 className='font-black text-3xl text-center flex-1'>IHearYOU</h2>
          <button className='logo' onClick={() => console.log('Leaderboard button has been clicked.')}>
            <MdLeaderboard size="22px" />
          </button>
          <button className='logo' onClick={() => console.log('Help button has been clicked.')}>
            <FiHelpCircle size="22px" />
          </button>
        </nav>
      </header>

      <div className='flex-1 flex gap-2 p-3 mx-auto max-w-xl w-full flex-col'>
        <div>

          <div className='guess-item'></div>
          <div className='guess-item'></div>
          <div className='guess-item'></div>
          <div className='guess-item'></div>
          <div className='guess-item'></div>
          <div className='guess-item'></div>

        </div>
        <div className="mt-5 border border-white p-4">
          <p className="flex flex-shrink-0   flex-col  gap-2  uppercase " >History {
            misses.length > 0 && misses.map((miss) => (
              <span className="text-red-400 text-lg w-fit  border border-red-400 rounded-full inline-block px-2" key={Math.random() + Math.random()}>{miss.submission ? miss.submission : <BsFillSkipForwardFill />}</span>
            )
            )
          }
          </p>
        </div>
      </div>
      <div className="px-4 pb-4 flex flex-col w-full mx-auto max-w-2xl">

        {/* Searchbar Container -- Start    */}

        {
          gameState !== GameState.idle &&
          (
            <>
              <div className="flex items-center text-sm px-3  border-2 border-red h-11 relative">
                <div className="justify-between items-center w-full  flex">
                  <FiSearch size={24} className="pr-1" />

                  <div className="w-full">
                    <input ref={inputRef} onChange={handleChange} className="border-none bg-transparent outline-0 py-3 flex-grow text-sm w-full" placeholder="Know it? Search for the artist / title" type="text" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between w-full mt-3 py-4">


                <button disabled={skipIndex === skipValues.length
                  ? true : false}
                  className="disabled:text-gray-600 disabled:border-gray-600  text-sm font-bold text-center align-middle px-8 py-4 border border-red-200 rounded-md "
                  onClick={handleSkip}>Add More Time
                </button>
                <button className="hover:text-white hover:bg-black text-sm font-bold text-center align-middle px-8 py-4 border border-white bg-white text-black rounded-md " onClick={handleSubmit}>Submit</button>
              </div>
              <div className="max-w-2xl w-full py-2 px-1 pt-2">

                <span className="underline  mx-0 ">See today's answer!</span>
              </div>
            </>
          )
        }

      </div>

    </div >
  )
}


function percentageToDecimal(percentageString: string): number {

  const percentage = parseFloat(percentageString.replace('%', ''))
  if (isNaN(percentage)) {
    return 0
  }
  if (percentage > 100) {
    return 1
  }
  if (percentage <= 0) {
    return 0
  }
  return Math.round(percentage * 10000) / 10000
}

