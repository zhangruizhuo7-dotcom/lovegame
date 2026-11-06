<template>
  <div class="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-rose-200/80 relative overflow-hidden mb-6 sm:mb-8">
    <!-- 装饰背景 -->
    <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-gradient-to-tr from-pink-200/30 to-emerald-200/30 rounded-full blur-2xl pointer-events-none"></div>

    <div class="flex flex-col lg:flex-row gap-5 sm:gap-6 items-center">
      <!-- 左侧：动态恋爱树形象与互动 -->
      <div class="w-full lg:w-5/12 flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white/80 border border-emerald-100 shadow-inner">
        <!-- 树的视觉形象 -->
        <div class="relative w-28 h-28 sm:w-44 sm:h-44 flex items-center justify-center my-1 sm:my-2">
          <!-- 光环 -->
          <div class="absolute inset-0 rounded-full bg-emerald-200/30 animate-pulse-subtle"></div>
          
          <!-- 树木主图标根据等级放大 -->
          <div class="text-6xl sm:text-8xl select-none transition-transform duration-500 hover:scale-110 drop-shadow-md">
            {{ currentStage.icon }}
          </div>

          <!-- 飘动的小心心 -->
          <div class="absolute top-1 right-2 sm:top-2 sm:right-4 text-rose-500 text-base sm:text-xl animate-float">💖</div>
          <div class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 text-emerald-500 text-xs sm:text-sm animate-bounce-slow">✨</div>
        </div>

        <!-- 当前阶段与称号 -->
        <div class="mt-0.5 sm:mt-1">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] sm:text-xs font-bold">
            <span>等级 {{ appState.loveTree.level }}</span>
            <span>·</span>
            <span>{{ currentStage.name }}</span>
          </div>
          <p class="text-[11px] sm:text-xs text-slate-500 mt-1">{{ currentStage.desc }}</p>
        </div>

        <!-- 经验值进度条 -->
        <div class="w-full mt-3 sm:mt-4">
          <div class="flex justify-between text-[10px] sm:text-[11px] text-slate-500 font-medium mb-1">
            <span>成长值</span>
            <span>{{ appState.loveTree.exp }} / {{ appState.loveTree.maxExp }}</span>
          </div>
          <div class="w-full h-2 sm:h-2.5 bg-emerald-100 rounded-full overflow-hidden p-0.5">
            <div 
              class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(100, (appState.loveTree.exp / appState.loveTree.maxExp) * 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- 浇水 & 晒太阳按钮 -->
        <div class="flex items-center gap-2.5 sm:gap-3 mt-3 sm:mt-4 w-full justify-center">
          <button 
            @click="handleWater"
            :disabled="appState.loveTree.waterDrops <= 0"
            class="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200"
          >
            <span>💧 浇水</span>
            <span class="text-[11px] opacity-90">({{ appState.loveTree.waterDrops }})</span>
          </button>

          <button 
            @click="handleSun"
            :disabled="appState.loveTree.sunlight <= 0"
            class="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
          >
            <span>☀️ 晒太阳</span>
            <span class="text-[11px] opacity-90">({{ appState.loveTree.sunlight }})</span>
          </button>
        </div>
      </div>

      <!-- 右侧：默契六维雷达图与记忆果实 -->
      <div class="w-full lg:w-7/12 flex flex-col justify-between h-full space-y-3.5 sm:space-y-4">
        <!-- 六维雷达图卡片 -->
        <div class="bg-white/70 rounded-2xl p-3 sm:p-4 border border-rose-100 shadow-sm">
          <div class="flex items-center justify-between mb-1 sm:mb-2">
            <h3 class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>📊 默契六维雷达</span>
              <span class="hidden sm:inline text-[11px] font-normal text-slate-400">各展区游戏实时加成</span>
            </h3>
            <span class="text-xs font-bold text-rose-500">综合默契: {{ averageScore }}分</span>
          </div>

          <!-- SVG 雷达图实现（自适应宽度与高度） -->
          <div class="flex items-center justify-center py-0.5 sm:py-1">
            <svg viewBox="0 0 240 200" class="w-full max-w-[260px] sm:max-w-[280px] h-40 sm:h-48 select-none">
              <!-- 背景网格（三层多边形） -->
              <polygon :points="gridPoints(1)" fill="none" stroke="#e2e8f0" stroke-width="1" />
              <polygon :points="gridPoints(0.66)" fill="none" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2 2" />
              <polygon :points="gridPoints(0.33)" fill="none" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2 2" />

              <!-- 轴线 -->
              <line v-for="(axis, i) in axisPoints" :key="i" :x1="120" :y1="100" :x2="axis.x" :y2="axis.y" stroke="#e2e8f0" stroke-width="1" />

              <!-- 数据多边形 -->
              <polygon :points="dataPoints" fill="rgba(244, 63, 94, 0.25)" stroke="#f43f5e" stroke-width="2" />
              
              <!-- 各维度数据小圆点 -->
              <circle v-for="(pt, i) in dataPointList" :key="'pt-'+i" :cx="pt.x" :cy="pt.y" r="3.5" fill="#f43f5e" class="transition-all duration-300" />

              <!-- 标签与分值 -->
              <text 
                v-for="(label, i) in labelPositions" 
                :key="'txt-'+i"
                :x="label.x" 
                :y="label.y" 
                text-anchor="middle" 
                class="text-[9px] fill-slate-600 font-medium"
              >
                {{ label.name }} {{ appState.loveTree.radarScores[label.name] }}
              </text>
            </svg>
          </div>
        </div>

        <!-- 恋爱树洞与解锁的记忆果实 -->
        <div class="bg-rose-50/50 rounded-2xl p-3 border border-rose-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-rose-200/70 flex items-center justify-center text-sm">
              🍎
            </div>
            <div>
              <p class="text-xs font-bold text-slate-800">已解锁 {{ appState.loveTree.unlockedMemories.length }} 颗记忆果实</p>
              <p class="text-[11px] text-slate-500">每完成游戏即可产出水滴与阳光，催熟记忆果实</p>
            </div>
          </div>
          <button 
            @click="showMemoriesModal = true"
            class="text-xs text-rose-600 hover:text-rose-700 bg-white px-2.5 py-1.5 rounded-lg border border-rose-200 shadow-2xs font-medium"
          >
            打开树洞 &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- 简易记忆果实弹窗 -->
    <div v-if="showMemoriesModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-rose-100">
        <div class="flex items-center justify-between pb-3 border-b border-rose-100">
          <h3 class="font-bold text-slate-800 flex items-center gap-1.5">
            <span>🍎 恋爱树洞 · 甜蜜记忆集</span>
          </h3>
          <button @click="showMemoriesModal = false" class="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
        </div>

        <div class="my-4 max-h-72 overflow-y-auto space-y-3 pr-1">
          <div 
            v-for="item in appState.loveTree.unlockedMemories" 
            :key="item.id"
            class="p-3 rounded-xl bg-rose-50/70 border border-rose-100"
          >
            <div class="flex justify-between items-center text-xs text-rose-700 font-bold mb-1">
              <span>{{ item.title }}</span>
              <span class="text-slate-400 font-normal">{{ item.date }}</span>
            </div>
            <p class="text-xs text-slate-600">{{ item.note }}</p>
          </div>
        </div>

        <button 
          @click="showMemoriesModal = false"
          class="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold shadow-sm"
        >
          收起树洞
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { appState, waterTree, sunbatheTree } from '../状态/恋爱树状态.js'

const showMemoriesModal = ref(false)

const currentStage = computed(() => {
  const stage = appState.loveTree.treeStages.find(s => s.level === appState.loveTree.level)
  return stage || appState.loveTree.treeStages[0]
})

const categories = ['日常习惯', '情绪共鸣', '敏锐感知', '共同记忆', '默契反应', '协作信任']

const averageScore = computed(() => {
  const scores = Object.values(appState.loveTree.radarScores)
  const total = scores.reduce((a, b) => a + b, 0)
  return Math.round(total / scores.length)
})

function handleWater() {
  waterTree()
}

function handleSun() {
  sunbatheTree()
}

// 雷达图多边形生成
const centerX = 120
const centerY = 100
const radius = 68

function getPoint(angle, r) {
  const rad = (Math.PI / 180) * (angle - 90)
  return {
    x: Math.round((centerX + r * Math.cos(rad)) * 10) / 10,
    y: Math.round((centerY + r * Math.sin(rad)) * 10) / 10
  }
}

function gridPoints(scale) {
  return categories.map((_, i) => {
    const angle = i * 60
    const pt = getPoint(angle, radius * scale)
    return `${pt.x},${pt.y}`
  }).join(' ')
}

const axisPoints = computed(() => {
  return categories.map((_, i) => getPoint(i * 60, radius))
})

const dataPointList = computed(() => {
  return categories.map((cat, i) => {
    const score = appState.loveTree.radarScores[cat] || 50
    const ratio = Math.max(0.1, score / 100)
    return getPoint(i * 60, radius * ratio)
  })
})

const dataPoints = computed(() => {
  return dataPointList.value.map(pt => `${pt.x},${pt.y}`).join(' ')
})

const labelPositions = computed(() => {
  return categories.map((name, i) => {
    const pt = getPoint(i * 60, radius + 18)
    return { name, x: pt.x, y: pt.y + 4 }
  })
})
</script>
