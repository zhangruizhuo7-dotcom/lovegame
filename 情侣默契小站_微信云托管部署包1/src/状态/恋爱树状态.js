import { reactive, watch } from 'vue'
import { socket, serverWaterTree, serverSunTree, serverRewardTree, fetchServerState } from '../网络/联机服务.js'

const STORAGE_KEY = 'couples_game_love_tree_v2'

const defaultState = {
  names: {
    me: '👦 男友',
    partner: '👧 女友'
  },
  loveTree: {
    waterDrops: 15,
    sunlight: 10,
    level: 1,
    exp: 30,
    maxExp: 100,
    treeStages: [
      { level: 1, name: '萌芽幼苗', icon: '🌱', desc: '初识时的悸动与好奇心' },
      { level: 2, name: '迎风抽枝', icon: '🌿', desc: '逐渐了解彼此的小习惯' },
      { level: 3, name: '绿意盎然', icon: '🌳', desc: '形影不离的默契与信任' },
      { level: 4, name: '繁花似锦', icon: '🌸', desc: '浪漫绽放，心有灵犀' },
      { level: 5, name: '硕果累累', icon: '🍎', desc: '携手走过漫长时光，灵魂共振' }
    ],
    unlockedMemories: [
      { id: 1, title: '初次相遇的瞬间', date: '2025-05-20', note: '无论隔着多远，我们的心跳在此刻连接。' }
    ],
    radarScores: {
      '日常习惯': 85,
      '情绪共鸣': 80,
      '敏锐感知': 88,
      '共同记忆': 82,
      '默契反应': 86,
      '协作信任': 90
    }
  },
  gameRecords: {},
  activeGameId: null
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...defaultState, ...parsed, activeGameId: null }
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultState))
}

export const appState = reactive(loadState())

// 监听服务端广播的恋爱树更新（双机实时同步）
socket.on('tree_updated', (updatedTree) => {
  if (updatedTree) {
    Object.assign(appState.loveTree, updatedTree)
    console.log('🔄 恋爱树已同步最新云端存档！')
  }
})

// 初始从服务端拉取一次最新持久化状态
fetchServerState().then(res => {
  if (res && res.loveTree) {
    Object.assign(appState.loveTree, res.loveTree)
  }
})

watch(
  () => [appState.names, appState.loveTree, appState.gameRecords],
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        names: appState.names,
        loveTree: appState.loveTree,
        gameRecords: appState.gameRecords
      }))
    } catch (e) {}
  },
  { deep: true }
)

// 给恋爱树增加养分与水滴 (触发服务器持久化并双端同步)
export async function recordGameReward(gameId, { water = 2, sun = 2, exp = 20, radarCategory = null, radarDelta = 3 } = {}) {
  try {
    await serverRewardTree({ gameId, water, sun, exp, radarCategory, radarDelta })
  } catch (e) {
    // 降级本地处理
    appState.loveTree.waterDrops += water
    appState.loveTree.sunlight += sun
    appState.loveTree.exp += exp
  }
  appState.gameRecords[gameId] = (appState.gameRecords[gameId] || 0) + 1
}

// 浇水操作
export async function waterTree() {
  if (appState.loveTree.waterDrops <= 0) return false
  try {
    await serverWaterTree()
    return true
  } catch (e) {
    return false
  }
}

// 晒太阳操作
export async function sunbatheTree() {
  if (appState.loveTree.sunlight <= 0) return false
  try {
    await serverSunTree()
    return true
  } catch (e) {
    return false
  }
}

export function openGame(gameId) {
  appState.activeGameId = gameId
  socket.emit('game_enter', { gameId })
}

export function closeGame() {
  const prevId = appState.activeGameId
  appState.activeGameId = null
  if (prevId) {
    socket.emit('game_leave', { gameId: prevId })
  }
}
