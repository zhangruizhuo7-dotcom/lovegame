import { io } from 'socket.io-client'
import { reactive, watch } from 'vue'

const AUTH_KEY = 'couples_game_auth_token_v2'

// 自动适配公网域名/HTTPS（无论异地还是同网，只要通过浏览器打开该网站，自动使用相同域名和协议连接）
export const authState = reactive({
  isLoggedIn: false,
  user: null, // { username, nickname, gender }
  presence: {
    male: { online: false },
    female: { online: false },
    bothOnline: false
  },
  partnerInvitedGame: null
})

// 读取本地已保存的登录凭据
const cachedUser = localStorage.getItem(AUTH_KEY)
if (cachedUser) {
  try {
    authState.user = JSON.parse(cachedUser)
    authState.isLoggedIn = true
  } catch (e) {}
}

export const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000
})

socket.on('connect', () => {
  console.log('✅ 已连接到情侣联机服务器:', SERVER_URL)
  if (authState.user) {
    socket.emit('auth', authState.user)
  }
})

socket.on('presence_update', (presence) => {
  authState.presence = presence
})

socket.on('partner_entered_game', ({ gameId, sender }) => {
  authState.partnerInvitedGame = { gameId, sender }
})

socket.on('partner_left_game', () => {
  authState.partnerInvitedGame = null
})

// 注册
export async function registerUser({ username, password, nickname, gender }) {
  const res = await fetch(`/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, nickname, gender })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '注册失败')

  authState.user = data.user
  authState.isLoggedIn = true
  localStorage.setItem(AUTH_KEY, JSON.stringify(data.user))
  socket.emit('auth', data.user)
  return data
}

// 登录
export async function loginUser({ username, password }) {
  const res = await fetch(`/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '登录失败')

  authState.user = data.user
  authState.isLoggedIn = true
  localStorage.setItem(AUTH_KEY, JSON.stringify(data.user))
  socket.emit('auth', data.user)
  return data
}

// 退出登录
export function logoutUser() {
  authState.user = null
  authState.isLoggedIn = false
  localStorage.removeItem(AUTH_KEY)
  window.location.reload()
}

// 恋爱树服务器同步
export async function serverWaterTree() {
  const res = await fetch(`/api/tree/water`, { method: 'POST' })
  return await res.json()
}

export async function serverSunTree() {
  const res = await fetch(`/api/tree/sun`, { method: 'POST' })
  return await res.json()
}

export async function serverRewardTree(rewardPayload) {
  const res = await fetch(`/api/tree/reward`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rewardPayload)
  })
  return await res.json()
}

export async function fetchServerState() {
  try {
    const res = await fetch(`/api/state`)
    return await res.json()
  } catch (e) {
    return null
  }
}
