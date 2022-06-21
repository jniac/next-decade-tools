import { DependencyList, useRef, useEffect } from 'react'

export const useFrameLoop = (getCallback: () => (time: number) => void, deps: DependencyList) => {
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    const callback = getCallback()
    let frameId = -1
    const loop = (ms: number) => {
      if (mounted.current) {
        frameId = requestAnimationFrame(loop)
      }
      callback(ms)
    }
    frameId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frameId)
      mounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
