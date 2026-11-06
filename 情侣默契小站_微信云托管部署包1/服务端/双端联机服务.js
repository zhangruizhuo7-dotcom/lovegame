import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.resolve(__dirname, './数据')
const DB_PATH = path.resolve(DB_DIR, './情侣存档.json')

// 初始化默认数据
const defaultDB = {
  users: {}, // { username: { username, password, nickname, gender, createdAt } }
  loveTree: {
    waterDrops: 15,
    sunlight: 10,
    level: 1,
    exp: 30,
    maxExp: 100,
    radarScores: {
      '日常习惯': 85,
      '情绪共鸣': 80,
      '敏锐感知': 88,
      '共同记忆': 82,
      '默契反应': 86,
      '协作信任': 90
    },
    unlockedMemories: [
      { id: 1, title: '初次相遇的瞬间', date: '2025-05-20', note: '无论隔着多远，我们的心跳在此刻连接。' }
    ]
  },
  gameHistory: []
}

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('读取数据库失败，使用默认值', e)
  }
  saveDB(defaultDB)
  return defaultDB
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('保存数据库失败', e)
  }
}

function updateAccountLog() {
  try {
    const usersList = Object.values(db.users)
    let md = `# 情侣角色与账号密码备忘档案\n\n`
    md += `> 📅 最后更新时间: ${new Date().toLocaleString()}\n`
    md += `> 🔒 此文件由系统自动记录，供情侣随时查看双方账号与密码。\n\n`
    md += `| 角色身份 | 昵称 | 登录账号 (Username) | 登录密码 (Password) | 创建时间 |\n`
    md += `| :--- | :--- | :--- | :--- | :--- |\n`
    for (const u of usersList) {
      const role = u.gender === 'male' ? '👦 男生 (男友)' : '👧 女生 (女友)'
      md += `| ${role} | ${u.nickname} | \`${u.username}\` | \`${u.password}\` | ${u.createdAt} |\n`
    }
    fs.writeFileSync(path.resolve(DB_DIR, './情侣账号密码备忘档案.md'), md, 'utf-8')
  } catch (e) {
    console.error('写入账号档案失败', e)
  }
}

let db = loadDB()

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// 在线状态记录
// { socketId: { username, nickname, gender } }
const onlineSockets = new Map()

function getOnlineStatus() {
  let maleUser = null
  let femaleUser = null

  for (const user of onlineSockets.values()) {
    if (user.gender === 'male') {
      maleUser = user
    } else if (user.gender === 'female') {
      femaleUser = user
    }
  }

  return {
    male: maleUser ? { username: maleUser.username, nickname: maleUser.nickname, online: true } : { online: false },
    female: femaleUser ? { username: femaleUser.username, nickname: femaleUser.nickname, online: true } : { online: false },
    bothOnline: !!(maleUser && femaleUser)
  }
}

// ---------------- REST API ----------------

// 注册/创建角色
app.post('/api/register', (req, res) => {
  const { username, password, nickname, gender } = req.body
  if (!username || !password || !nickname || !gender) {
    return res.status(400).json({ error: '请完整填写账号、密码、昵称与性别' })
  }

  if (db.users[username]) {
    return res.status(400).json({ error: '该账号已存在，请直接登录' })
  }

  // 记录角色
  db.users[username] = {
    username,
    password,
    nickname,
    gender, // 'male' | 'female'
    createdAt: new Date().toISOString()
  }

  saveDB(db)
  updateAccountLog()
  console.log(`[注册成功] 用户: ${username}, 昵称: ${nickname}, 性别: ${gender}`)
  res.json({
    success: true,
    user: { username, nickname, gender },
    loveTree: db.loveTree
  })
})

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const user = db.users[username]

  if (!user || user.password !== password) {
    return res.status(401).json({ error: '账号或密码不正确' })
  }

  console.log(`[登录成功] 用户: ${username}, 昵称: ${user.nickname}`)
  res.json({
    success: true,
    user: { username: user.username, nickname: user.nickname, gender: user.gender },
    loveTree: db.loveTree
  })
})

// 获取全局情侣档案与恋爱树
app.get('/api/state', (req, res) => {
  res.json({
    loveTree: db.loveTree,
    users: Object.values(db.users).map(u => ({ username: u.username, nickname: u.nickname, gender: u.gender })),
    presence: getOnlineStatus()
  })
})

// 恋爱树浇水
app.post('/api/tree/water', (req, res) => {
  if (db.loveTree.waterDrops > 0) {
    db.loveTree.waterDrops--
    db.loveTree.exp += 10
    checkTreeLevel()
    saveDB(db)
    io.emit('tree_updated', db.loveTree)
    return res.json({ success: true, loveTree: db.loveTree })
  }
  res.status(400).json({ error: '水滴不足' })
})

// 恋爱树晒太阳
app.post('/api/tree/sun', (req, res) => {
  if (db.loveTree.sunlight > 0) {
    db.loveTree.sunlight--
    db.loveTree.exp += 10
    checkTreeLevel()
    saveDB(db)
    io.emit('tree_updated', db.loveTree)
    return res.json({ success: true, loveTree: db.loveTree })
  }
  res.status(400).json({ error: '阳光不足' })
})

// 游戏通关奖励发放
app.post('/api/tree/reward', (req, res) => {
  const { gameId, water = 2, sun = 2, exp = 20, radarCategory, radarDelta = 3 } = req.body
  db.loveTree.waterDrops += water
  db.loveTree.sunlight += sun
  db.loveTree.exp += exp

  if (radarCategory && db.loveTree.radarScores[radarCategory] !== undefined) {
    db.loveTree.radarScores[radarCategory] = Math.min(100, db.loveTree.radarScores[radarCategory] + radarDelta)
  }

  checkTreeLevel()
  db.gameHistory.push({ gameId, time: new Date().toISOString() })
  saveDB(db)
  
  io.emit('tree_updated', db.loveTree)
  res.json({ success: true, loveTree: db.loveTree })
})

function checkTreeLevel() {
  while (db.loveTree.exp >= db.loveTree.maxExp && db.loveTree.level < 5) {
    db.loveTree.exp -= db.loveTree.maxExp
    db.loveTree.level += 1
    db.loveTree.maxExp = Math.round(db.loveTree.maxExp * 1.5)
  }
}

// ---------------- WebSocket 双端实时同步 ----------------

// 当前活跃的游戏房间状态
const activeGameRooms = {
  // gameId: { state, maleReady, femaleReady, ... }
}

io.on('connection', (socket) => {
  let currentUser = null

  // 玩家上线身份认证
  socket.on('auth', (userData) => {
    if (userData && userData.username && userData.gender) {
      currentUser = {
        socketId: socket.id,
        username: userData.username,
        nickname: userData.nickname || userData.username,
        gender: userData.gender
      }
      onlineSockets.set(socket.id, currentUser)
      console.log(`[双端在线] ${currentUser.gender === 'male' ? '👦 男友' : '👧 女友'} (${currentUser.nickname}) 已连线`)
      
      // 广播最新在线状态
      io.emit('presence_update', getOnlineStatus())
      socket.emit('tree_updated', db.loveTree)
    }
  })

  // 邀请/进入游戏：当一人进入某个游戏，同步通知伴侣
  socket.on('game_enter', ({ gameId }) => {
    console.log(`[游戏同步] 用户发起游戏: ${gameId}`)
    socket.broadcast.emit('partner_entered_game', {
      gameId,
      sender: currentUser
    })
  })

  // 退出游戏
  socket.on('game_leave', ({ gameId }) => {
    socket.broadcast.emit('partner_left_game', {
      gameId,
      sender: currentUser
    })
  })

  // 游戏实时操作事件双端转发 (通用通道，支持所有12款游戏)
  socket.on('game_action', (payload) => {
    // payload: { gameId, action, data }
    socket.broadcast.emit('partner_game_action', {
      ...payload,
      sender: currentUser
    })
  })

  // Canvas实时涂鸦数据流广播 (你画我猜)
  socket.on('canvas_stroke', (strokeData) => {
    socket.broadcast.emit('partner_canvas_stroke', strokeData)
  })

  // Canvas清除/撤销
  socket.on('canvas_clear', () => {
    socket.broadcast.emit('partner_canvas_clear')
  })

  // 迷宫移动数据 (盲人领航员)
  socket.on('maze_move', (moveData) => {
    socket.broadcast.emit('partner_maze_move', moveData)
  })

  // 断开连接处理
  socket.on('disconnect', () => {
    if (currentUser) {
      onlineSockets.delete(socket.id)
      console.log(`[离线] ${currentUser.nickname} 断开连接`)
      io.emit('presence_update', getOnlineStatus())
    }
  })
})

// 静态托管前端生产构建产物（支持单端口公网直接访问与WebSocket同源直连）
const DIST_DIR = path.resolve(__dirname, '../dist')
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      return res.sendFile(path.resolve(DIST_DIR, 'index.html'))
    }
    next()
  })
}

const PORT = process.env.PORT || 3000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`)
  console.log(`❤️ 情侣双端联机实时服务已启动！`)
  console.log(`🚀 本地监听: http://127.0.0.1:${PORT}`)
  console.log(`📡 局域网访问: http://0.0.0.0:${PORT}`)
  console.log(`========================================\n`)
})
