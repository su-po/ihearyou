
import { ChangeEvent, MutableRefObject, SyntheticEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from "framer-motion"
import { FiHeadphones, FiHelpCircle, FiPlay, FiSearch } from 'react-icons/fi'
import { BsFillSkipForwardFill } from 'react-icons/bs'
import { MdLeaderboard } from 'react-icons/md'
import { FiInfo } from 'react-icons/fi'
import { Howl } from 'howler'
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

type Guess = { type: "SKIP" | "INCORRECT", submission?: string }

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

	let soundID: number | undefined = undefined

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
		console.log("\n\n", misses, missLimit, "\n\n")
		if (misses.length === missLimit && gameState === GameState.playing) {
			setGameState(GameState.gameLose)

			return
		}
	}, [gameState, incorrectGuessCount, skipIndex])

	let seekInterval: NodeJS.Timer | undefined
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
				var seek = sound.seek()
				console.log('Current position: ' + seek)
				setDuration(Math.round(seek))
			}, 150)
		},
		onend: function() {
			clearInterval(seekInterval)
			console.log('Finished!')
			setIsSoundPlaying(false)
			setCanClickPlay(true)
		},
		onseek: function() {
			// Typescript is giving an error, but it's not real. Ignore it.
			//
			let position: number = sound.seek(soundID)
			console.log(Math.round(position - 0.2))
			setDuration(position)
		}
	})

	const handlePlay = (event: SyntheticEvent) => {
		event.preventDefault()
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
		event.preventDefault()
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
			type: GuessType.skip,
		}])
	}

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		console.log(event.target.value)
		setGuess(event.target.value)
	}

	function handleSubmit(event: SyntheticEvent): void {
		event.preventDefault()
		console.log(`You have ${misses.length} misses. Envoked in Handle Skip`)
		if (guess.trim().length < 1) return
		console.log(guess, "and", answer)
		const submission = guess.trim().toLowerCase()
		if (submission === answer) {
			setGameState(GameState.gameWin)
			throw new Error("Please remember to implement popup modal for win")
		}
		if (progressRef !== null) {
			if (misses.length > 5)
				setGameState(GameState.gameLose)
		}
		setSkipIndex(1 + skipIndex)
		//		setIncorrectGuessCount(1 + incorrectGuessCount)
		const { fill } = progressRef.current?.dataset as modifiedDataset
		console.log(fill)
		const fillPercentage = percentageToDecimal(skipValues[skipIndex])
		console.log(fillPercentage)
		progressRef.current?.setAttribute('data-fill', fillPercentage.toString())
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


	// DIALOG
	const dialogRef = useRef<HTMLDialogElement>()
	const handleClose = () => {
		setGameState(GameState.playing)
		dialogRef.current?.close()

	}

	// Alert should be triggered once someone visits the page. After dismissal
	// it shouldn't trigger again until page refresh
	useEffect(() => {
		if (gameState !== GameState.idle || dialogRef.current?.open) return
		dialogRef.current?.showModal()
	}, [gameState])

	const loseRef = useRef<HTMLDialogElement>()
	useEffect(() => {
		if (gameState !== GameState.gameLose && loseRef.current?.open === false) return
		loseRef.current?.showModal()
	}, [gameState])



	return (
		<AnimatePresence>
			<div className='flex z-50 flex-col h-full w-screen  max-w-2xl mx-auto '>
				<motion.dialog
					initial={{ opacity: 0, y: 40 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 90,
						damping: 20
					}}
					exit={{ scale: 0 }}
					ref={dialogRef as MutableRefObject<HTMLDialogElement>}
					id="modal"
					className=" w-[320px] h-[400px] absolute mt-6  rounded-lg border border-black bg-white">
					<div>
						<button onClick={handleClose}>Close</button>
					</div>
				</motion.dialog>
				{gameState === GameState.gameLose && (
					<motion.dialog
						initial={{ opacity: 0, y: 40 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{
							type: "spring",
							stiffness: 90,
							damping: 20
						}}
						exit={{ scale: 0 }}
						ref={loseRef as MutableRefObject<HTMLDialogElement>}
						id="modal"
						className=" w-[320px] h-[400px] absolute mt-6  rounded-lg border border-black bg-white">
						<div>
							<button onClick={handleClose}>Close</button>
						</div>
					</motion.dialog>
				)}
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
									<button disabled={skipIndex === skipValues.length || isSoundPlaying === true
										? true : false}
										className="disabled:text-gray-600 disabled:border-gray-600  text-sm font-bold text-center align-middle px-8 py-4 border border-red-200 rounded-md "
										onClick={handleSkip}>Add More Time
									</button>
									<button
										className="hover:text-white hover:bg-black text-sm font-bold text-center align-middle px-8 py-4 border border-white bg-white text-black rounded-md "
										onClick={handleSubmit}>
										{misses.length === 5 ? "Last Chance!" : "Submit"}

									</button>
								</div>
								<div className='flex flex-col justify-center items-center w-full'>
									<div className='h-[24px] px-3 justify-center flex w-screen border-white border-y-2'>
										<div className='relative w-full h-full max-w-2xl overflow-hidden'>
											<div
												ref={progressRef} data-fill="0.0625" id="progress-bar" className='w-full h-full origin-top-left absolute top-0 left-0  '>
											</div>
											<motion.div
												animate={canClickPlay === false ? {
													scaleX: percentageToDecimal(skipValues[misses.length]) / 100 ?? 0,
													transition: {
														duration: clipDurations[misses.length]
													}
												} : { scaleX: 0 }}
												ref={successRef} data-success="0" id="success-marker" className='absolute w-full h-full origin-top-left scale-x-0  bg-green-400'>
											</motion.div>
											<div id="first-guess" className="guess-block"></div>
											<div id="second-guess" className="guess-block"> </div>
											<div id="third-guess" className="guess-block"> </div>
											<div id="fourth-guess" className="guess-block"> </div>
											<div id="fifth-guess" className="guess-block"> </div>
											<div id="sixth-guess" className="guess-block"> </div>
										</div>
									</div>
									<span className="flex w-full justify-between items-center py-6 px-4 max-w-2xl">
										<span>0:{duration > 9 ? duration : `0${duration}`}</span>
										<button ref={playRef} aria-label="Play" disabled={!canClickPlay ? true : false} onClick={handlePlay}  >
											<div aria-hidden="true" >
												{isSoundPlaying ? <FiHeadphones size={32} /> : <FiPlay size={32} />}
											</div>
										</button>
										<span className="sc-116c307e-3 jDIXMp">0:16</span>
									</span>
								</div>
								<div className="max-w-2xl w-full py-2 px-1 pt-2">
									<span className="underline  mx-0 ">See answer!</span>
								</div>
							</>
						)
					}
				</div>
			</div >
		</AnimatePresence >
	)
}


function percentageToDecimal(percentageString: string): number {
	if (percentageString === null || percentageString === undefined) return 0
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
