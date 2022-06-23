import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import readme from 'tools/README.md'
import { usePromise, useRefComplexEffects } from 'some-utils/npm/react'
import { handleFrame, handlePointer } from 'some-utils/dom'
import { Scroller2D } from 'tools/Scroller2D'
import { useBounds, useWindow } from 'some-utils/npm/react/hooks'
import './App.css'

const DragableDiv = () => {

  const position = useMemo(() => ({ x: 0, y: 0, startX: NaN, startY: NaN }), [])
  const { width, height } = useWindow()
  
  const ref = useRefComplexEffects<HTMLDivElement>(function* (div) {
    
    const scroller = new Scroller2D()

    const frame = document.querySelector('.Frame')!
    const r1 = frame.getBoundingClientRect()
    const r2 = div.getBoundingClientRect()
    const startX = isNaN(position.startX) ? r2.x : position.startX
    const startY = isNaN(position.startY) ? r2.y : position.startY

    // save start position
    position.startX = startX
    position.startY = startY

    const minX = r1.x - startX
    const minY = r1.y - startY
    const maxX = minX + (r1.width - r2.width)
    const maxY = minY + (r1.height - r2.height)
    
    scroller.set({ ...position, minX, minY, maxX, maxY })

    yield handlePointer(div, {
      onOver: () => {
        div.classList.add('hovered')
      },
      onOut: () => {
        div.classList.remove('hovered')
      },
      onDown: () => {
        div.classList.add('dragged')
        frame.classList.add('dragged')
        scroller.startDrag()
      },
      onUp: () => {
        div.classList.remove('dragged')
        frame.classList.remove('dragged')
        scroller.stopDrag()
      },
      onDrag: info => {
        scroller.drag(info.delta.x, info.delta.y)
      },
    })
    
    yield handleFrame(() => {
      if (isNaN(scroller.y) === false)
      scroller.update()
      position.x = scroller.x
      position.y = scroller.y
      div.style.transform = `
        translate(${scroller.x}px, ${scroller.y}px)
        scale(${scroller.dragged ? 1.05 : 1})
      `
      div.querySelector('span')!.innerHTML = 
        `(${scroller.x.toFixed(1)}, ${scroller.y.toFixed(1)})`
    })

  }, [width, height])

  return (
    <div
      ref={ref}
      className='DragableDiv button flex column center'>
      Drag Me.
      <br />
      <span>(0, 0)</span>
    </div>
  )
}

const WidthInfo = () => {
  const ref = useBounds<HTMLDivElement>('createRef', (bounds, div) => {
    div.querySelector('span')!.innerHTML = `${bounds.width}px`
  })

  return (
    <div 
      ref={ref}
      className='WidthInfo padding-8'
      style={{ backgroundColor: '#eee' }}>
      width: <span></span>
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
      <div className='Frame fill flex column gutter-8'>
        <ReactMarkdown className='Markdown'>
          {readmeStr}
        </ReactMarkdown>
        <WidthInfo />
        <DragableDiv />
      </div>
    </div>
  );
}

export default App
