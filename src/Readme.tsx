import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import readme from 'tools/README.md'

export const Readme = () => {
  
  const [text, setText] = useState('')
  
  useEffect(() => {
    fetch(readme)
      .then(res => res.text())
      .then(data => setText(data))
  }, [])

  return (
    <ReactMarkdown>
      {text}
    </ReactMarkdown>
  )
}
