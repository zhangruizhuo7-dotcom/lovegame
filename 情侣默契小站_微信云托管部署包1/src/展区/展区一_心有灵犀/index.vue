<template>
  <div class="min-h-[80vh] flex flex-col justify-between">
    <!-- 如果当前处于某个游戏中，渲染对应游戏组件 -->
    <template v-if="activeGameId">
      <component 
        :is="currentGameComponent" 
        @back="handleBackToExhibition" 
      />
    </template>

    <!-- 否则展示展区一主入口界面 -->
    <div v-else class="w-full max-w-5xl mx-auto py-3 sm:py-5 px-3 sm:px-6 space-y-6 sm:space-y-8 animate-fadeIn">
      <!-- 展区顶部横幅 -->
      <div class="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-200/90 relative overflow-hidden backdrop-blur-md">
        <!-- 装饰渐变光晕背景 -->
        <div class="absolute -right-12 -top-12 w-72 h-72 bg-gradient-to-br from-rose-200/50 via-pink-200/40 to-amber-100/30 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-12 -bottom-12 w-64 h-64 bg-gradient-to-tr from-purple-200/30 via-rose-100/40 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2.5">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs">
              <span>💖 展区一</span>
              <span>·</span>
              <span>默契基石 · 深度升级</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <span>心有灵犀</span>
              <span class="text-rose-500 text-lg sm:text-xl font-semibold">Soul Sync</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              探索两颗心之间的引力波与同频节拍。从极速二选一的本能反应，到换位思考的读心盲盒，在这里量化你们每一次温柔的心灵共振。
            </p>
          </div>

          <!-- 展区数据统计胶囊 -->
          <div class="flex flex-row md:flex-col gap-2 shrink-0 bg-white/90 p-3.5 rounded-2xl border border-rose-200/80 shadow-xs text-xs">
            <div class="flex items-center gap-2 text-slate-600">
              <span class="text-rose-500 font-black">🎮 包含游戏:</span>
              <span class="font-bold text-slate-800">4 款情侣互动深度体验</span>
            </div>
            <div class="flex items-center gap-2 text-slate-600">
              <span class="text-emerald-600 font-black">🌱 滋养维度:</span>
              <span class="font-bold text-slate-800">日常习惯 / 敏锐感知 / 默契反应</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4款游戏精选矩阵 -->
      <div>
        <div class="flex items-center justify-between mb-4 px-1">
          <h2 class="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
            <span>✨ 专属默契互动游戏</span>
            <span class="text-xs font-normal text-slate-400">点击卡片即可开启双人对战/合作体验</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div 
            v-for="game in games" 
            :key="game.id"
            @click="selectGame(game.id)"
            class="glass-card group rounded-3xl p-5 sm:p-6 border border-rose-200/80 hover:border-rose-400 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 backdrop-blur-md"
          >
            <!-- 顶角高光微光条 -->
            <div 
              class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r opacity-90 transition-opacity"
              :class="game.barGradient"
            ></div>

            <div>
              <!-- 头部：图标、标题、标签 -->
              <div class="flex items-start justify-between gap-3 mb-3.5">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  :class="game.iconBg"
                >
                  {{ game.icon }}
                </div>

                <div class="flex flex-col items-end gap-1">
                  <span class="text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs"
                    :class="game.badgeClass"
                  >
                    {{ game.badge }}
                  </span>
                  <span v-if="getGamePlays(game.id) > 0" class="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    已畅玩 {{ getGamePlays(game.id) }} 次
                  </span>
                </div>
              </div>

              <!-- 标题与玩法简介 -->
              <h3 class="text-lg font-black text-slate-800 group-hover:text-rose-600 transition-colors">
                {{ game.name }}
              </h3>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                {{ game.description }}
              </p>
            </div>

            <!-- 底部奖励与行动条 -->
            <div class="mt-5 pt-4 border-t border-rose-100 flex items-center justify-between">
              <!-- 奖励预告 -->
              <div class="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                <span class="text-sky-600">💧+{{ game.rewards.water }}</span>
                <span class="text-amber-600">☀️+{{ game.rewards.sun }}</span>
                <span class="text-emerald-600">🌱+{{ game.rewards.exp }}</span>
                <span class="text-rose-600 font-extrabold">📊 {{ game.rewards.radarCategory }}</span>
              </div>

              <!-- 启动按钮 -->
              <button 
                class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs group-hover:shadow flex items-center gap-1 cursor-pointer"
                :class="game.btnClass"
              >
                <span>进入测试</span>
                <span class="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 展区底部浪漫寄语 -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-rose-50/90 via-pink-50/60 to-purple-50/90 border border-rose-200/70 text-center text-xs text-slate-600 flex items-center justify-center gap-2 shadow-2xs">
        <span class="text-rose-400">♥</span>
        <span>默契并不是天生完全相同，而是在一次次温柔的了解中，让心跳逐渐对齐。</span>
        <span class="text-rose-400">♥</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { appState, openGame, closeGame } from '@/状态/恋爱树状态.js'
import { soundManager } from './音效合成器.js'

import 心跳同频 from './心跳同频.vue'
import 猜猜他会选什么 from './猜猜他会选什么.vue'
import 同频刻度尺 from './同频刻度尺.vue'
import 词汇同频 from './词汇同频.vue'

defineEmits(['backToHub'])

// 当前选中的游戏 ID
const activeGameId = ref(null)

// 4款小游戏元数据配置（更新为最新扩充后特性说明）
const games = [
  {
    id: 'heart-sync',
    name: '心跳同频 · 极速二选一',
    icon: '💓',
    badge: '18道生活大考 · 3D翻牌',
    iconBg: 'bg-rose-100/80',
    barGradient: 'from-rose-400 to-pink-500',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    btnClass: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200',
    description: '18道精选情侣偏好二选一！涵盖日常作息、消费观念、矛盾处理等。支持伴侣在线状态呼吸感、3D卡片翻转与Web Audio同频心跳音！',
    rewards: { water: 3, sun: 2, exp: 20, radarCategory: '日常习惯' }
  },
  {
    id: 'guess-choice',
    name: '猜猜TA会选什么 · 换位盲盒',
    icon: '🎁',
    badge: '10大深度盲盒 · 心理揭秘',
    iconBg: 'bg-purple-100/80',
    barGradient: 'from-purple-400 to-pink-500',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    btnClass: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-200',
    description: '一人锁定心声，另一人换位盲盒拆箱！深度心理剖析与甜蜜小惩罚锦囊，一键交接身份，测测你是不是TA肚子里的蛔虫！',
    rewards: { water: 3, sun: 2, exp: 20, radarCategory: '敏锐感知' }
  },
  {
    id: 'spectrum',
    name: '同频刻度尺 · 心理温差计',
    icon: '📏',
    badge: '8大主观场景 · 温差图谱',
    iconBg: 'bg-teal-100/80',
    barGradient: 'from-teal-400 to-rose-400',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    btnClass: 'bg-teal-500 hover:bg-teal-600 text-white shadow-teal-200',
    description: '1-10分打分刻度尺！测量社交电量、吃醋敏感度、安全感储备等8大场景，生成心理温差分析图谱与恒温相处温馨建议！',
    rewards: { water: 3, sun: 3, exp: 20, radarCategory: '敏锐感知' }
  },
  {
    id: 'word-wave',
    name: '词汇同频 · 恋爱电波',
    icon: '📡',
    badge: '同义模糊匹配 · 专属词云',
    iconBg: 'bg-pink-100/80',
    barGradient: 'from-pink-400 to-purple-500',
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
    btnClass: 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-200',
    description: '围绕“初吻瞬间”、“吃醋时刻”、“深夜长谈”等浪漫中心词，智能同义词与意向加权匹配，结算生成精美心有灵犀词云海报！',
    rewards: { water: 3, sun: 3, exp: 20, radarCategory: '默契反应' }
  }
]

// 动态映射游戏组件
const componentMap = {
  'heart-sync': 心跳同频,
  'guess-choice': 猜猜他会选什么,
  'spectrum': 同频刻度尺,
  'word-wave': 词汇同频
}

const currentGameComponent = computed(() => {
  return componentMap[activeGameId.value] || null
})

// 查询各游戏游玩次数
function getGamePlays(gameId) {
  return appState.gameRecords[gameId] || 0
}

// 选择并进入游戏
function selectGame(gameId) {
  soundManager.playBubble()
  activeGameId.value = gameId
  openGame(gameId)
}

// 从具体游戏返回展区列表
function handleBackToExhibition() {
  soundManager.playBubble()
  activeGameId.value = null
  closeGame()
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
