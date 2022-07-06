import DataLoader from 'dataloader'
import { In } from 'typeorm'
import { User } from '../entities'

// [1, 78, 8, 9] -> input
// [{ id: 1, username: 'admin', ... }, { id: 78 }, { id: 8 }, { id: 9 }] in exact order as input -> output
export const createUserLoader = () =>

  // DataLoader<K, V> -> K is the type of each element in the input array; 
  // V is the type of each element in the output array
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findBy({ id: In(userIds as number[]) })

    /*
      map: {
        '1': { id: 1, username: 'admin', ... },
        '78': { id: 78, ... },
        '8': { id: 8, ... },
        '9': { id: 9, ... }
      }
    */
    const map: Record<number, User> = {}
    users.forEach(u => {
      map[u.id] = u
    })
    return userIds.map(id => map[id])
  })