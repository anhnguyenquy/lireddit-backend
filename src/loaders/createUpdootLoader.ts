import DataLoader from 'dataloader'
import { Updoot } from '../entities'
import orm from '../type-orm.source'

// [{ postId: 5, userId: 10 }, ...] -> input
// array of updoots in exact order as input -> output
export const createUpdootLoader = () =>

  new DataLoader<{ postId: number, userId: number }, Updoot | null>(async (keys) => {
    const updoots: Updoot[] = await orm.createQueryBuilder()
      .select('*')
      .from(Updoot, 'u')
      .orWhereInIds(keys) // filter for the batched postId-userId pairs
      .execute()
    const map: Record<string, Updoot> = {}
    updoots.forEach(u => {
      map[`${u.userId}-${u.postId}`] = u
    })
    return keys.map(key => map[`${key.userId}-${key.postId}`] )
  })