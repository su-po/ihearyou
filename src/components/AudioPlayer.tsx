

export default function AudioPlayer() {

  <div className='flex flex-col justify-center items-center w-full'>
    <div className='h-[24px] px-3 justify-center flex w-screen border-white border-y-2'>
      <div className='relative w-full h-full max-w-2xl overflow-hidden'>
        <div
          ref={progressRef} data-fill="0.0625" id="progress-bar" className='w-full h-full origin-top-left absolute top-0 left-0  '>

        </div>
        <motion.div
          animate={canClickPlay === false ? {
            scaleX: percentageToDecimal(skipValues[misses.length]) / 100,
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


}
