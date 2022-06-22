import ReactMarkdown from 'react-markdown'
import readme from 'tools/README.md'
import { usePromise, useRefComplexEffects } from './some-utils/npm/react'
import { handleFrame, handlePointer } from './some-utils/dom'
import { Draggable2D } from './Draggable2D'
import './App.css'

const DragableDiv = () => {
  
  const ref = useRefComplexEffects<HTMLDivElement>(function* (div) {
    
    const draggable = new Draggable2D()

    const r1 = document.querySelector('.App > div')!.getBoundingClientRect()
    const r2 = div.getBoundingClientRect()
    const minX = r1.x - r2.x
    const minY = r1.y - r2.y
    const maxX = minX + (r1.width - r2.width)
    const maxY = minY + (r1.height - r2.height)
    
    draggable.setMinMax(minX, minY, maxX, maxY)

    yield handlePointer(div, {
      onOver: () => {
        div.classList.add('hovered')
      },
      onOut: () => {
        div.classList.remove('hovered')
      },
      onDown: () => {
        div.classList.add('dragged')
        draggable.startDrag()
      },
      onUp: () => {
        div.classList.remove('dragged')
        draggable.stopDrag()
      },
      onDrag: info => {
        draggable.drag(info.delta.x, info.delta.y)
      },
    })
    
    yield handleFrame(() => {
      if (isNaN(draggable.y) === false)
      draggable.update()
      div.style.transform = `
        translate(${draggable.x}px, ${draggable.y}px)
        scale(${draggable.dragged ? 1.05 : 1})
      `
    })

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

  const readmeStr = usePromise(fetch(readme).then(res => res.text()))

  if (readmeStr === null) {
    return null
  }

  return (
    <div className='App'>
      <div className='fill'>
        <ReactMarkdown className='Markdown'>
          {readmeStr}
        </ReactMarkdown>
        <DragableDiv />
      </div>
    </div>
  );
}

export default App
