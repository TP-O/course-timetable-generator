// const input = [
//   [1, 2, 3],
//   [1, 2, 3],
//   // [1, 2],
//   // [1, 2, 3, 4],
// ]

// function backtracking(input) {
//   if (input.length === 0) {
//     return [[]]
//   }

//   const arr = []
//   const tempInput = [...input]
//   tempInput.splice(0, 1)
//   const remaining = backtracking(tempInput)

//   for (let i = 0; i < input[0].length; i++) {
//     for (let j = 0; j < remaining.length; j++) {
//       let isDuplicate = false

//       for (const x of remaining[j]) {
//         if (x === input[0][i]) {
//           isDuplicate = true

//           break
//         }
//       }

//       if (!isDuplicate) {
//         arr.push([input[0][i], ...remaining[j]])
//       }
//     }
//   }

//   return arr
// }

// console.log('result: ', backtracking(input))

const sortedIndexBy = require('lodash/sortedIndexBy')

const a = [
  {
    name: 1,
  },
  {
    name: 2,
  },
  {
    name: 4,
  },
]
sortedIndexBy(
  a,
  {
    name: 3,
  },
  'name'
)

a.splice(
  sortedIndexBy(
    a,
    {
      name: 3,
    },
    'name'
  ),
  0,

  {
    name: 3,
  }
)
console.log(a)
