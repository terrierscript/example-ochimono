import Head from 'next/head'
import { useReducer, useEffect, useState, useMemo } from 'react'

type Field = number[][]

type Item = {
  v: number,
  h:number,
  c: number, //1 | 2 | 3 | 4 | 5 | 6 | 7
  id: number
}

const generateArray = (w = 6, h = 12) => {
  return Array.from({ length: h }).fill(
     Array.from({ length: w }).fill(
      0
    )
  )
}
const initField = generateArray()

const isValidCurrent = (state:State, maybe:Item[]) => {
  return maybe.some(m => {
    if (state.field[m.v] === undefined) {
      return true
    }
    return state.field[m.v][m.h] !== 0
  })  
}
const calcMove = (state:State, moveV:number, moveH:number) => {
  const maybeNext = state.current.map(c => ({
    ...c,
    v: c.v + moveV,
    h: c.h + moveH,
  }))
  const b = isValidCurrent(state,maybeNext)
  if (b) {
    return null
  }
  return maybeNext
}

const generateNewItem = () : Item[] => {
  const s = 3
  const id = new Date().getTime()
  return [
    { v: 0, h: 3, c: Math.ceil(Math.random() * s), id },
    { v: 1, h: 3, c: Math.ceil(Math.random() * s), id }
  ]
}

const getDismisses = (field:Field, v:number,h:number,c:number, arr={}) => {
  if(field[v] === undefined || field[v][h] !== c){
    return arr
  }
  const n = {...arr, [`${v}_${h}`]: true}
  
  const z = [[v+1, h], [v-1,h],[v, h+1],[v,h-1]].reduce((a, [sibv,sibh]) => {
    if(a[`${sibv}_${sibh}`]){
      return a
    }
    const nn = getDismisses(field,sibv, sibh, c, n)
    return {...a,...nn}
  }, n)
  return z
}

const calcConcat = (field:Field, c:Item) => {
  const rr = getDismisses(field, c.v,c.h,c.c,{})
  return Object.keys(rr).map(rr => rr.split("_"))
}

// console.log(
//   calcDismiss({field:[
//     [0,1,0,2],
//     [0,1,1,2]
//   ], current: [{x:0, y:1,c:1 }] })
// )

const gravityUpdate = (field, dismissTarget ) => {
  console.log(field)
  const dy = dismissTarget
    .map(d => d[0])
    .map( y => {
    })
  return field
}
// console.log(
//   gravityUpdate({field:[
//     [1,1,0,0],
//     [0,0,1,0],
//     [1,0,0,1]
//   ], current: [1,0],[1,1],[2,1],[2,2] })
// )

const dismssUpdate = (field: Field, searchTarget: Item[]) => {
  const dismisses = []
  searchTarget?.map(c => {
    const dismissTarget = calcConcat(field, c)
    // console.log(JSON.stringify(dismissTarget))
    if(dismissTarget.length < 4){
      return
    }
    dismissTarget.map(d => {
      field[d[0]][d[1]] = 0
    })
    dismisses.push(dismissTarget)
  })
  // return field
  const ff = gravityUpdate(field, dismisses)
  return ff
}

type State = {
  field:Field,
  current: [Item,Item] | null
}
const gameReducer = (state:State, action) => {
  switch (action) {
    case "KEY_DOWN":
    case "UPDATE_CURRENT": {
      if (!state.current) {
        return {
          ...state,
          current: generateNewItem()
        }
      } 
      const nextCurrent = calcMove(state, 1, 0)
      if (!nextCurrent) {
        const newField = mergeField(state.field, state.current)
        const d = dismssUpdate(newField,state.current)
        return { 
          ...state,
          field:d,
          current:generateNewItem()
        }
      }
      return {
        ...state,
        current: state.current.map(c => ({...c, v:c.v + 1}))
      }
    }
    case "KEY_RIGHT": {
      const nextCurrent = calcMove(state, 0, 1)
      if (!nextCurrent) {
          return state
      }
      return {
        ...state,
        current: nextCurrent
      }
    }
    case "KEY_LEFT": {
      const nextCurrent = calcMove(state, 0, -1)
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
    field[c.v][c.h] = c.c
  })
  return field
}

const copyField = (field) => field.map(c => [...c])

const useMemoCurrentField = (state) => {
  return useMemo(() => {
    return mergeField(state.field, state.current)
  },[state])
}

// const useDispachCleanDetect = (dispatch,state) => {
//   const [beforeId, setBeforeId] = useState(state.currentId)
//   useEffect(() => {

//   },[])
// }

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
      case "ArrowDown":
        return dispatch("KEY_DOWN")
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
  const r = field.map( f => {
    return f.map(ff => {
      switch(ff){
        case 0: return "➕"
        case 1: return "🚒"
        case 2: return "🚙"
        case 3: return "🚚"
      }
    }).join(" ")
  }).join("\n")
    
  return (
    <div>
      <pre>
        {r}
      </pre>
    </div>
  )
}

// [1, 0, 1, 0, 1, 0, 1]
// [0, 0, 0, 0, 0, 0, 0]
// [0, 1, 0, 1, 0, 1, 0]
// [0, 0, 0, 0, 0, 0, 0]
// [1, 0, 1, 0, 1, 0, 1]
