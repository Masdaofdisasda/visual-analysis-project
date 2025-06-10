import {RefObject, useEffect, useRef} from 'react'

/**
 * A hook to access the microphone level in real-time.
 * Returns a ref object with the current microphone level (0 - 1).
 */
export function useMicrophoneLevel(): RefObject<number> {
    const level = useRef(0)
    useEffect(() => {
        let audioCtx: AudioContext
        let analyser: AnalyserNode
        let rafId: number
        let dataArray: Float32Array

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                audioCtx = new AudioContext({ latencyHint: 'interactive' })
                analyser = audioCtx.createAnalyser()
                analyser.fftSize = 256
                analyser.smoothingTimeConstant = 0  // no extra smoothing

                const src = audioCtx.createMediaStreamSource(stream)
                src.connect(analyser)

                dataArray = new Float32Array(analyser.fftSize)

                const update = () => {
                    analyser.getFloatTimeDomainData(dataArray)
                    let sum = 0
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i] * dataArray[i]
                    }
                    const rms = Math.min(Math.max(Math.sqrt(sum / dataArray.length) * 100, 0), 1.0)

                    level.current = level.current * 0.8 + rms * 0.2
                    rafId = requestAnimationFrame(update)
                }
                update()
            })
            .catch(err => console.error('mic error', err))

        return () => {
            cancelAnimationFrame(rafId)
            if (audioCtx) audioCtx.close()
        }
    }, [])

    return level
}
