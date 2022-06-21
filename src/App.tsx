import { useRef } from 'react'
import { Readme } from './Readme'
import { useFrameLoop } from './useFrameLoop'
import './App.css'

class Draggable {
  update() {
    
  }
}

const DragableDiv = () => {
  const ref = useRef<HTMLDivElement>(null) 
  
  useFrameLoop(() => {
    const draggable = new Draggable()
    return () => {
      draggable.update()
    }
  }, [])

  return (
    <div
      ref={ref}
      className='DragableDiv button flex column center'>
      Drag Me.
    </div>
  )
}

const App = () => {
  return (
    <div className='App padding-64'>
      <Readme />
      <DragableDiv />
    </div>
  );
}

export default App
