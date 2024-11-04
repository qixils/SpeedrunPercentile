import { input, select, number } from '@inquirer/prompts'
import { CategoryScope, GetGameData, GetGameLeaderboard2, GetSearch, LevelScope, Run, Value, Variable, Verified } from './types'

const defaultPercentile = 95
const base = new URL("https://www.speedrun.com/api/v2/")

const dateOptions = {
  dateStyle: 'medium',
} satisfies Parameters<typeof Intl.DateTimeFormat>[1]

function b64(input: string) {
  // Base64 encode
  const base64String = Buffer.from(input).toString('base64')

  // Make URL-safe
  return base64String
    .replace(/\+/g, '-') // Replace '+' with '-'
    .replace(/\//g, '_') // Replace '/' with '_'
    .replace(/=+$/g, '') // Remove padding '=' characters
}

async function get<T>(endpoint: string, searchParams?: Record<string, any>): Promise<T> {
  const url = new URL(endpoint, base)
  if (searchParams)
    url.searchParams.set("_r", b64(JSON.stringify(searchParams)))
  const request = {
    headers: {
      'User-Agent': 'speedruncomjs/',
      'Accept': 'application/json',
      'Accept-Language': 'en',
    },
  } satisfies RequestInit
  const result = await fetch(url, request).then(body => body.json())
  return result as T
}

(async () => {
  // get game
  const query = await input({ message: 'Game name?' })

  const search: GetSearch = await get("GetSearch", { query, includeGames: true })
  const games = search.gameList

  if (!games?.length) {
    console.error(`Unknown game ${query}`)
    return
  }

  let gameIndex: number = 0
  if (games.length != 1) {
    gameIndex = await select({
      message: 'Please select the game',
      default: 0,
      choices: games.map((game, index) => ({
        name: `${game.name} (${new Date(game.releaseDate * 1000).toLocaleString(undefined, dateOptions)})`,
        value: index,
        short: game.name,
      }))
    })
  }

  const gameInfo = games[gameIndex]
  if (!gameInfo) {
    console.error(`Invalid index ${gameIndex}`)
    return
  }
  const gameId = gameInfo.id

  const gamePromise = get<GetGameData>("GetGameData", { gameId })

  // get category

  const category = await select({
    message: 'Please select the category',
    choices: await gamePromise.then(data => data.categories
      .filter(item => !item.archived && !item.isPerLevel) // ILs outlawed for now
      .sort((a, b) => (a.isMisc !== b.isMisc) ? (a.isMisc ? 1 : -1) : (a.pos - b.pos))
      .map(item => ({
        name: item.name,
        value: item,
      })))
  })
  if (!category) {
    console.error('Must select category')
    return
  }
  const game = await gamePromise
  const categoryId = category.id

  // get variable values
  const variables = game.variables
  .filter(item => {
    if (item.categoryScope === CategoryScope.Single && item.categoryId !== categoryId) return false
    if (!item.isSubcategory) return false // for now
    if (item.levelScope !== LevelScope.All && item.levelScope !== LevelScope.FullGame) return false
    return true
  })
  .sort((a, b) => a.pos - b.pos)
  
  const values: Record<Variable['id'], Value> = {}
  for (const variable of variables) {
    const options = game.values
    .filter(item => item.variableId === variable.id && !item.archived)
    .sort((a, b) => {
      if (variable.defaultValue === a.id) return -1
      if (variable.defaultValue === b.id) return 1
      return a.pos - b.pos
    })
    const defaultValue = options.find(item => variable.defaultValue === item.id)
    values[variable.id] = await select({
      message: `Please select value for variable ${variable.name}`,
      choices: options.map(item => ({
        name: item.name,
        value: item,
      })),
      default: defaultValue,
    })
  }
  const valueEntries = Object.entries(values)
  const valueList = valueEntries.length
    ? valueEntries.map(([variableId, value]) => ({
      variableId,
      valueIds: [value.id],
    }))
    : undefined

  // console.log(game, category)

  console.log('Loading runs...')
  const runList: Run[] = []
  let page = 1
  let pages = page
  while (page <= pages) {
    const params = { page, vary: 0, params: { gameId, categoryId, values: valueList } }
    const data: GetGameLeaderboard2 = await get("GetGameLeaderboard2", params)
    runList.push(...data.runList)
    pages = data.pagination.pages
    page++
  }

  const verifiedRuns = runList.filter(run => run.verified === Verified.Verified)
  if (!verifiedRuns.length) {
    console.error("No (verified) runs")
    return
  }

  while (true) {
    const percentile = (await number({
      message: 'Enter the top percentile to fetch data for',
      min: 0,
      max: 100,
      step: 'any',
      default: defaultPercentile,
    }) ?? defaultPercentile)/100

    const runIndex = Math.floor((verifiedRuns.length-1) * percentile)
    const run = verifiedRuns[runIndex]

    const time = run.time ?? run.timeWithLoads
    if (!time) {
      console.error("Could not find time for run", run)
      return
    }

    const s = Math.ceil(time % 60.0)
    const m = Math.floor(time / 60) % 60
    const h = Math.floor(time / (60 * 60))
    const timeStr = `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
    console.log(`The time to beat is ${timeStr} (https://speedrun.com/run/${run.id})`)
  }
})();