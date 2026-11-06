<template>
  <div class="space-y-8 animate-fade-in">
    <!-- 如果当前正在进行某款游戏，渲染该游戏组件 -->
    <div v-if="activeGame">
      <component 
        :is="currentGameComponent" 
        @back="activeGame = null" 
      />
    </div>

    <!-- 展区三主入口总览视图 -->
    <div v-else class="space-y-8">
      <!-- 展区胶卷横幅 Header（暗房红调与胶卷卷轴质感） -->
      <div class="relative bg-gradient-to-r from-stone-950 via-rose-950/80 to-stone-950 text-amber-100 p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-rose-900/60 overflow-hidden">
        <!-- 暗房红调背景光晕与胶片打孔边缘 -->
        <div class="absolute -top-24 -left-24 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- 胶片孔打孔装饰（顶与底） -->
        <div class="flex justify-between items-center px-1 pb-3 mb-4 border-b border-rose-900/40">
          <div class="flex gap-2.5">
            <span v-for="i in 16" :key="'hole-head-'+i" class="w-3.5 h-2.5 rounded-sm bg-black/90 border border-stone-800 shadow-inner"></span>
          </div>
          <span class="text-[10px] text-rose-300/80 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>DARKROOM ARCHIVE · ZONE 03</span>
          </span>
        </div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs font-semibold shadow-sm">
              <span>🎞️ 胶卷与暗房档案馆</span>
              <span>•</span>
              <span>第 3 展区</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-amber-50 tracking-tight flex items-center gap-2">
              <span>展区三：时光胶囊</span>
            </h1>
            <p class="text-xs sm:text-sm text-amber-200/85 max-w-xl leading-relaxed">
              穿梭在泛黄的光影胶卷与拍立得相纸之间，那些初见的怦然心动、相视一笑与携手走过的岁月痕迹，都在这片暗房暖光里静候唤醒。
            </p>
          </div>

          <!-- 右侧：共同记忆默契雷达卡片 -->
          <div class="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-rose-800/50 flex items-center gap-4 shrink-0 shadow-xl">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-3xl shadow-md ring-2 ring-rose-400/30">
              🎞️
            </div>
            <div>
              <div class="text-[11px] text-amber-300 font-medium">共同记忆默契度</div>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-2xl font-black text-rose-100 font-mono">
                  {{ appState.loveTree.radarScores['共同记忆'] || 82 }}
                </span>
                <span class="text-xs text-amber-300/80">/ 100 分</span>
              </div>
              <div class="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <span>🌱 展区通关可为恋爱树注入丰厚时光养分</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 展区成就概览 -->
        <div class="mt-6 pt-4 border-t border-rose-900/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="bg-black/40 p-2.5 rounded-xl border border-rose-900/30">
            <div class="text-[10px] text-amber-300/70">胶囊总数</div>
            <div class="text-base font-bold text-amber-100 font-mono">3 款经典游戏</div>
          </div>
          <div class="bg-black/40 p-2.5 rounded-xl border border-rose-900/30">
            <div class="text-[10px] text-amber-300/70">已通关记录</div>
            <div class="text-base font-bold text-rose-200 font-mono">{{ completedGamesCount }} / 3 场</div>
          </div>
          <div class="bg-black/40 p-2.5 rounded-xl border border-rose-900/30">
            <div class="text-[10px] text-amber-300/70">可获水滴储备</div>
            <div class="text-base font-bold text-cyan-300 font-mono">💧 +9 滴</div>
          </div>
          <div class="bg-black/40 p-2.5 rounded-xl border border-rose-900/30">
            <div class="text-[10px] text-amber-300/70">可获阳光储备</div>
            <div class="text-base font-bold text-amber-300 font-mono">☀️ +7 束</div>
          </div>
        </div>
      </div>

      <!-- 3款游戏入口展示卡片网格（复古拍立得相纸与温馨暗房质感） -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 游戏 8：我们的时间线 -->
        <div 
          @click="activeGame = 'timeline'"
          class="bg-stone-50 rounded-3xl p-6 border-4 border-stone-200/90 hover:border-amber-400 shadow-xl hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <!-- 拍立得胶带装饰 -->
          <div class="absolute -top-3 right-6 w-20 h-6 bg-amber-100/90 border border-amber-200 rotate-2 text-[9px] text-amber-800 font-mono flex items-center justify-center shadow-xs font-bold">
            GAME 08
          </div>

          <div>
            <!-- 图标与通关徽章 -->
            <div class="flex items-start justify-between">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                🕰️
              </div>
              <span 
                v-if="isGamePlayed('timeline')" 
                class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center gap-1 shadow-xs"
              >
                <span>✓ 已封存</span>
                <span class="text-[10px]">({{ appState.gameRecords['timeline'] }}次)</span>
              </span>
              <span 
                v-else 
                class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200"
              >
                未挑战
              </span>
            </div>

            <div class="mt-4">
              <h3 class="text-lg font-bold text-stone-800 group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                <span>我们的时间线</span>
              </h3>
              <p class="text-xs text-stone-500 mt-1.5 leading-relaxed">
                恋爱里程碑时序排布：把错位的记忆卡片还原为真实时间线，支持快捷置顶与生成恋爱年鉴手账。
              </p>
            </div>

            <!-- 特色标签 -->
            <div class="mt-4 flex flex-wrap gap-1.5">
              <span class="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">相爱天数看板</span>
              <span class="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">上下微调置顶</span>
              <span class="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">恋爱年鉴手账</span>
            </div>
          </div>

          <div class="mt-6 pt-3 border-t border-stone-200/70">
            <div class="flex items-center justify-between text-xs text-amber-800 font-bold">
              <span>💧+3 ☀️+2 🌱+20</span>
              <span class="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>开启胶囊</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 游戏 9：回忆碎片拼图 -->
        <div 
          @click="activeGame = 'puzzle'"
          class="bg-stone-50 rounded-3xl p-6 border-4 border-stone-200/90 hover:border-rose-400 shadow-xl hover:shadow-2xl hover:shadow-rose-900/20 transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <!-- 拍立得胶带装饰 -->
          <div class="absolute -top-3 right-6 w-20 h-6 bg-rose-100/90 border border-rose-200 -rotate-2 text-[9px] text-rose-800 font-mono flex items-center justify-center shadow-xs font-bold">
            GAME 09
          </div>

          <div>
            <!-- 图标与通关徽章 -->
            <div class="flex items-start justify-between">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                🧩
              </div>
              <span 
                v-if="isGamePlayed('memory-puzzle')" 
                class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center gap-1 shadow-xs"
              >
                <span>✓ 已拼合</span>
                <span class="text-[10px]">({{ appState.gameRecords['memory-puzzle'] }}次)</span>
              </span>
              <span 
                v-else 
                class="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-[11px] font-semibold border border-rose-200"
              >
                未挑战
              </span>
            </div>

            <div class="mt-4">
              <h3 class="text-lg font-bold text-stone-800 group-hover:text-rose-700 transition-colors flex items-center gap-1.5">
                <span>回忆碎片拼图</span>
              </h3>
              <p class="text-xs text-stone-500 mt-1.5 leading-relaxed">
                打乱重组拼图：支持 3x3 经典与 4x4 高阶难度，配备原图半透明对照浮层，拼成时全屏绽放爱心烟花。
              </p>
            </div>

            <!-- 特色标签 -->
            <div class="mt-4 flex flex-wrap gap-1.5">
              <span class="text-[10px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">3×3 / 4×4 双难度</span>
              <span class="text-[10px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">原图对照浮层</span>
              <span class="text-[10px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">4套高清插画+传图</span>
            </div>
          </div>

          <div class="mt-6 pt-3 border-t border-stone-200/70">
            <div class="flex items-center justify-between text-xs text-rose-700 font-bold">
              <span>💧+4 ☀️+2 🌱+25</span>
              <span class="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>重组回忆</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 游戏 10：时光显微镜 -->
        <div 
          @click="activeGame = 'microscope'"
          class="bg-stone-50 rounded-3xl p-6 border-4 border-stone-200/90 hover:border-violet-400 shadow-xl hover:shadow-2xl hover:shadow-violet-900/20 transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <!-- 拍立得胶带装饰 -->
          <div class="absolute -top-3 right-6 w-20 h-6 bg-violet-100/90 border border-violet-200 rotate-1 text-[9px] text-violet-800 font-mono flex items-center justify-center shadow-xs font-bold">
            GAME 10
          </div>

          <div>
            <!-- 图标与通关徽章 -->
            <div class="flex items-start justify-between">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                🔬
              </div>
              <span 
                v-if="isGamePlayed('photo-scope')" 
                class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center gap-1 shadow-xs"
              >
                <span>✓ 已破案</span>
                <span class="text-[10px]">({{ appState.gameRecords['photo-scope'] }}次)</span>
              </span>
              <span 
                v-else 
                class="px-2.5 py-1 rounded-full bg-violet-50 text-violet-800 text-[11px] font-semibold border border-violet-200"
              >
                未挑战
              </span>
            </div>

            <div class="mt-4">
              <h3 class="text-lg font-bold text-stone-800 group-hover:text-violet-700 transition-colors flex items-center gap-1.5">
                <span>时光显微镜</span>
              </h3>
              <p class="text-xs text-stone-500 mt-1.5 leading-relaxed">
                老照片局部微观竞猜：黄铜显微镜视窗配镜头光晕与胶片质感，三档倍率拖拽探索，逐步解锁线索探破名场面。
              </p>
            </div>

            <!-- 特色标签 -->
            <div class="mt-4 flex flex-wrap gap-1.5">
              <span class="text-[10px] bg-violet-50 text-violet-800 px-2 py-0.5 rounded-md border border-violet-200">镜头光晕颗粒质感</span>
              <span class="text-[10px] bg-violet-50 text-violet-800 px-2 py-0.5 rounded-md border border-violet-200">4x/2x/1x 三档倍率</span>
              <span class="text-[10px] bg-violet-50 text-violet-800 px-2 py-0.5 rounded-md border border-violet-200">线索积分进阶机制</span>
            </div>
          </div>

          <div class="mt-6 pt-3 border-t border-stone-200/70">
            <div class="flex items-center justify-between text-xs text-violet-700 font-bold">
              <span>💧+2 ☀️+3 🌱+20</span>
              <span class="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>微观探秘</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部温馨互动板块：慢递时光胶囊便签 -->
      <div class="bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 p-6 rounded-3xl border-2 border-amber-200/90 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-200/70 border border-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-sm">
            📮
          </div>
          <div>
            <h4 class="text-sm font-bold text-amber-950">
              时光胶囊寄语 · 写给未来的我们
            </h4>
            <p class="text-xs text-amber-800/80 mt-0.5">
              把今天在默契小站的心情与想对对方说的一句话，封装进时光胶囊吧。
            </p>
          </div>
        </div>

        <button 
          @click="showTimeCapsuleModal = true"
          class="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-800 to-rose-800 hover:from-amber-900 hover:to-rose-900 text-amber-100 font-bold text-xs shadow-md transition-all active:scale-95"
        >
          ✍️ 封存一封慢递明信片
        </button>
      </div>
    </div>

    <!-- 慢递时光胶囊弹窗 -->
    <div 
      v-if="showTimeCapsuleModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="w-full max-w-md bg-stone-100 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 relative text-stone-800">
        <!-- 邮戳装饰 -->
        <div class="absolute top-4 right-4 w-14 h-14 rounded-full border-2 border-dashed border-rose-400 text-rose-500 flex flex-col items-center justify-center font-mono text-[9px] rotate-12 pointer-events-none">
          <span>AIR MAIL</span>
          <span>LOVE 2026</span>
        </div>

        <h3 class="text-base font-bold text-stone-900 flex items-center gap-2">
          <span>💌 慢递时光便签</span>
        </h3>
        <p class="text-xs text-stone-500 mt-1">这封便签将被保存在本机的专属时光档案库中。</p>

        <div class="mt-4 space-y-3">
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">来自谁的留言：</label>
            <input 
              v-model="capsuleForm.author" 
              class="w-full text-xs px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium" 
              placeholder="例如：男孩 / 女孩"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">想封存的誓言或悄悄话：</label>
            <textarea 
              v-model="capsuleForm.message" 
              rows="4" 
              class="w-full text-xs p-3 rounded-xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium resize-none"
              placeholder="写下你此刻最真切的感受，或者约定一年后一起做的一件事..."
            ></textarea>
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <button 
            @click="showTimeCapsuleModal = false"
            class="flex-1 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-colors"
          >
            取消
          </button>
          <button 
            @click="saveCapsule"
            class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold shadow-md transition-transform active:scale-95"
          >
            放入胶囊封存 🔒
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { appState } from '@/状态/恋爱树状态.js'
import confetti from 'canvas-confetti'

// 引入三大游戏组件
import TimelineGame from './我们的时间线.vue'
import MemoryPuzzleGame from './回忆碎片拼图.vue'
import PhotoScopeGame from './时光显微镜.vue'

const emit = defineEmits(['back'])

// 当前选中的游戏
const activeGame = ref(null)

const currentGameComponent = computed(() => {
  switch (activeGame.value) {
    case 'timeline': return TimelineGame
    case 'puzzle': return MemoryPuzzleGame
    case 'microscope': return PhotoScopeGame
    default: return null
  }
})

// 检查游戏是否至少通关过一次
function isGamePlayed(gameId) {
  return !!(appState.gameRecords && appState.gameRecords[gameId])
}

// 统计已通关的游戏款数
const completedGamesCount = computed(() => {
  let count = 0
  if (isGamePlayed('timeline')) count++
  if (isGamePlayed('memory-puzzle')) count++
  if (isGamePlayed('photo-scope')) count++
  return count
})

// 时光胶囊便签功能
const showTimeCapsuleModal = ref(false)
const capsuleForm = ref({
  author: '我们俩',
  message: ''
})

function saveCapsule() {
  if (!capsuleForm.value.message.trim()) {
    showTimeCapsuleModal.value = false
    return
  }
  // 记录到恋爱树的解锁记忆档案库中
  appState.loveTree.unlockedMemories.push({
    id: Date.now(),
    title: `来自【${capsuleForm.value.author}】的慢递胶囊`,
    date: new Date().toISOString().split('T')[0],
    note: capsuleForm.value.message.trim()
  })

  showTimeCapsuleModal.value = false
  capsuleForm.value.message = ''
  
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 }
  })
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
