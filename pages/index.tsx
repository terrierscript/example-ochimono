import Head from 'next/head'
import { useReducer, useEffect, useState, useMemo } from 'react'

const generateArray = (w = 6, h = 16) => {
  return Array.from({ length: h }).fill(
     Array.from({ length: w }).fill(
      0
    )
  )
}
const initField = generateArray()

const isValidCurrent = (state, maybe) => {
  return maybe.some(m => {
    if (state.field[m.x] === undefined) {
      return true
    }
    return state.field[m.x][m.y] !== 0
  })
  
}
const calcNextCurrent = (state, moveX, moveY) => {
  const maybeNext = state.current.map(c => ({
    ...c,
    x: c.x + moveX,
    y: c.y + moveY
  }))
  const b = isValidCurrent(state,maybeNext)
  if (b) {
    return null
  }
  return maybeNext
}

const gameReducer = (state, action) => {
  switch (action) {
    case "UPDATE_CURRENT": {
      if (!state.current) {
        return {
          ...state,
          current: [{ x: 0, y: 3,c:1 }, { x: 1, y: 3, c: 1 }]
        }
      } 
      const nextCurrent = calcNextCurrent(state, 1, 0)
      if (!nextCurrent) {
        const newField = mergeField(state.field, state.current)
        return { 
          ...state,
          field:newField,
          current: [{ x: 0, y: 3,c:1 }, { x: 1, y: 3, c: 1 }]
        }
      }
      return {
        ...state,
        current: state.current.map(c => ({...c, x:c.x + 1}))
      }
    }
    case "KEY_RIGHT": {
      const nextCurrent = calcNextCurrent(state, 0, 1)
      if (!nextCurrent) {
          return state
      }
      return {
        ...state,
        current: nextCurrent
      }
    }
    case "KEY_LEFT": {
      const nextCurrent = calcNextCurrent(state, 0, -1)
      if (!nextCurrent) {
          return state
      }
      return {
        ...state,
        current: nextCurrent
      }
    }
    case "ROTATE": {
    }  
  }
  return state
}
const mergeField = (baseField, item) => {
    const field = copyField(baseField)
    item?.map(c => {
      field[c.x][c.y] = c.c
    })
  return field
}
const copyField = (field) => field.map(c => [...c])
const useMemoCurrentField = (state) => {
  return useMemo(() => {
    return mergeField(state.field, state.current)
    // const field = copyField(state.field)
    // state.current?.map(c => {
    //   field[c.x][c.y] = c.c
    // })
    // return field
  },[state])
}
const useFrame = () => {
  const [timer, setTimer] = useState(new Date().getTime())
  const [lastFramedTime,setLastFramedTime] = useState(timer)
  const [frame, setFrame] = useState(0)
  useEffect(() => { // timer
    const timer = () => {
      requestAnimationFrame(timer)
      setTimer(() => new Date().getTime())
    }
    timer()
    // return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    if (timer - lastFramedTime > 16) {
      setFrame(frame => frame + 1)
      setLastFramedTime(timer)
    }
  }, [timer])
  return frame

}
const useKeyPress = (dispatch) => {
  const handleUserKeyPress = (e) => {
    console.log(e.code)
    switch (e.code) {
      case "ArrowLeft":
        return dispatch("KEY_LEFT")
      case "ArrowRight":
        return dispatch("KEY_RIGHT")
      case "ArrowUp":
        return dispatch("ROTATE")
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);

    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, []);
  
}
const useGame = () => {
  const [state, dispatch] = useReducer(gameReducer, { field: initField, current: null })
  const frame = useFrame()
  const field = useMemoCurrentField(state)
  useKeyPress(dispatch)
  useEffect(() => {
    if(frame % 30 !== 0){
      return
    }
    dispatch("UPDATE_CURRENT")
  },[frame])
  // useEffect(() => {
  //   // console.clear()
  //   const r = field.map( f => f.join(" ")).join("\n")
  //   console.log(r)
  // }, [field])

  return { dispatch,field }
}
export default function Home() {
  const { field } = useGame()
  const r = field.map( f => f.join(" ")).join("\n")
    
  return (
    <div>
      <pre>
        {r}
      </pre>
    </div>
  )
}
