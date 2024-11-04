type int = number
type float = number

export enum ItemType {
  Unknown,
  Comment,
  Run,
  Game,
  Guide,
  Resource,
  User,
  Thread,
  GameMod,
  Category,
  Level,
  GameRequest,
  Ticket = 22,
  TicketNote,
  News = 27,
  GameBoostToken,
  GameBoost,
  Article,
  UserFollower,
  Challenge,
  ChallengeRun,
}

export enum Verified {
  Pending,
  Verified,
  Rejected,
}

export enum ObsoleteFilter {
  Hidden,
  Shown,
  Exclusive,
}

export enum VideoFilter {
  Optional,
  Required,
  Missing,
}

export enum GameType {
  RomHack = 1,
  Modification,
  FanGame,
  WebGame,
  PreReleaseGame,
  MobileGame,
  ExpansionDLC,
  CategoryExtensions,
  MultipleGames,
  MiniGame,
  ServerMap,
  HomebrewGame,
}

export enum Timer {
  RTA,
  LRT,
  IGT,
}

export enum CategoryScope {
  All = -1,
  Single = 1,
}

export enum LevelScope {
  All = -2,    // "Full game and levels"
  Levels,      // "Levels"
  FullGame,    // "Full Game"
  SingleLevel, // "Single level..."
}

export enum DisplayMode {
  Auto,
  Dropdown,
  Buttons,
}

export interface GameInfo {
  id: string
  name: string
  url: string
  type: 'game'
  loadtimes: boolean
  milliseconds: boolean
  igt: boolean
  verification: boolean
  autoVerify: boolean
  requireVideo: boolean
  emulator: int // TODO: enum
  defaultTimer: int // TODO: enum
  // TODO validTimers[int (enum)]
  releaseDate: int
  addedDate: int
  touchDate: int
  coverPath: string
  trophy1stPath?: string
  trophy2ndPath?: string
  trophy3rdPath?: string
  // TODO runCommentsMode: int (enum?)
  runCount: int
  activePlayerCount: int
  totalPlayerCount: int
  boostReceivedCount: int
  boostDistinctDonorsCount: int
  rules: string
  // TODO viewPowerLevel: int (enum)
  platformIds: string[]
  regionIds: string[]
  gameTypeIds: int[]
  websiteUrl: string
  discordUrl: string
  defaultView: int // TODO enum
  guidePermissionType: int // TODO enum
  resourcePermissionType: int // TODO enum
  // staticAssets[]
  //     #Asset#
}

export interface Category {
  id: string
  name: string
  url: string
  pos: int
  gameId: string
  isMisc: boolean
  isPerLevel: boolean
  numPlayers: int
  exactPlayers: boolean
  playerMatchMode: int // TODO enum
  timeDirection: int // TODO enum (0 = fastest)
  enforceMs: boolean
  archived: boolean
  rules: string
}

export interface Run {
  id: string
  gameId: string
  levelId?: string
  categoryId?: string
  challengeId?: string
  time?: number
  timeWithLoads?: number
  // TODO ?(another for IGT?) : int|float
  enforceMs?: boolean
  platformId: string
  emulator: boolean
  regionId: string
  video: string
  comment: string
  submittedById: string
  verified: Verified
  verifiedById?: string
  reason?: string
  date: int
  dateSubmitted: int
  dateVerified: int
  hasSplits: boolean
  obsolete: boolean
  place: int
  // TODO issues: ?
  playerIds: string[]
  valueIds: string[]
}

/**
 * Value of a variable. `VariableValue` is a selector on this type (and the underlying variable)
 */
export interface Value {
  id: string
  name: string
  url: string
  pos: int
  variableId: string
  isMisc?: boolean
  rules?: string
  archived: boolean
}

export interface Variable {
  id: string
  name: string
  url: string
  pos: int
  gameId: string
  description?: string
  categoryScope: CategoryScope
  categoryId?: string
  levelScope: LevelScope
  levelId?: string
  isMandatory: boolean
  isSubcategory: boolean
  isUserDefined: boolean
  isObsoleting: boolean
  defaultValue?: string
  archived: boolean
  displayMode?: DisplayMode
}

export interface Pagination {
  count: int
  page: int
  pages: int
  per: int
}

export interface GetSearch {
  gameList: GameInfo[]
}

export interface GetGameData {
  game: GameInfo
  categories: Category[]
  values: Value[]
  variables: Variable[]
}

export interface GetGameLeaderboard2 {
  runList: Run[]
  // playerList: Player[]
  pagination: Pagination
}
