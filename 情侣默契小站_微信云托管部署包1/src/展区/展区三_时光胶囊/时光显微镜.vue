<template>
  <div class="space-y-6">
    <!-- SVG 胶片颗粒与暗角滤镜定义 -->
    <svg class="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <defs>
        <filter id="filmGrainFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0" />
        </filter>
      </defs>
    </svg>

    <!-- 顶部状态栏与返回 -->
    <div class="flex items-center justify-between bg-stone-900/90 text-amber-100 px-5 py-4 rounded-2xl shadow-lg border border-amber-800/40 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <button 
          @click="$emit('back')" 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 text-xs font-medium border border-amber-700/50 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回展区</span>
        </button>
        <div>
          <h2 class="text-base sm:text-lg font-bold text-amber-100 flex items-center gap-2">
            <span>🔬 时光显微镜</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-violet-900/60 text-violet-300 font-normal">老照片竞猜</span>
          </h2>
          <p class="text-[11px] text-amber-300/70 hidden sm:block">把记忆拉大 400 倍，从微观细节找寻那些年的心动名场面</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[10px] text-amber-300/80">侦探通关奖励</div>
          <div class="text-xs font-bold text-violet-300 flex items-center gap-1.5 justify-end">
            <span>💧+2</span>
            <span>☀️+3</span>
            <span>🌱+20</span>
          </div>
        </div>
        <button 
          @click="restartGame" 
          class="p-2 rounded-xl bg-amber-900/50 hover:bg-amber-800/80 text-amber-200 border border-amber-700/40 transition-transform active:rotate-180 duration-300"
          title="重新竞猜"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 关卡进度条与实时积分 -->
    <div class="flex items-center justify-between bg-stone-100/90 px-4 py-3 rounded-2xl border border-stone-200 text-xs shadow-sm">
      <div class="flex items-center gap-2">
        <span class="font-bold text-stone-700">🔍 案件调查进度：</span>
        <div class="flex gap-1.5">
          <span 
            v-for="(_, idx) in questions" 
            :key="'dot-'+idx"
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all"
            :class="[
              currentQIndex === idx ? 'bg-amber-600 text-white ring-2 ring-amber-300 shadow-sm' : (
                idx < currentQIndex ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
              )
            ]"
          >
            {{ idx + 1 }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3 font-medium">
        <span class="text-stone-500">侦探积分：</span>
        <span class="text-base font-black text-amber-700 font-mono">{{ totalScore }}</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
          本题满分 25 分
        </span>
      </div>
    </div>

    <!-- 游戏主区：显微镜观察与线索竞猜 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- 左侧：复古黄铜显微镜视窗 (占 7 列) -->
      <div class="lg:col-span-7 flex flex-col items-center">
        <!-- 黄铜显微镜主机外框 -->
        <div class="w-full max-w-[480px] bg-gradient-to-b from-stone-900 via-amber-950/40 to-stone-950 p-5 rounded-3xl border-4 border-amber-700/70 shadow-2xl relative overflow-hidden">
          <!-- 刻度铭牌与光圈刻度 -->
          <div class="flex items-center justify-between text-[11px] text-amber-400/90 font-mono mb-3 px-2 border-b border-amber-900/50 pb-2">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LENS SPEC: OPTICAL ×{{ currentZoom }}.0</span>
            </span>
            <div class="flex items-center gap-2 text-[10px] text-amber-300/70">
              <span>APERTURE: F/1.8</span>
              <span>•</span>
              <span>NO. 0{{ currentQIndex + 1 }} ARCHIVE</span>
            </div>
          </div>

          <!-- 圆形显微镜头视窗（集成黄铜光圈圈层、镜头光晕与颗粒胶片） -->
          <div 
            ref="lensViewportRef"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
            @touchstart="startTouch"
            @touchmove="onTouch"
            @touchend="stopDrag"
            class="relative w-full aspect-square rounded-full overflow-hidden border-8 border-amber-600/80 shadow-[0_0_30px_rgba(217,119,6,0.25)] bg-black cursor-crosshair select-none mx-auto group"
            :class="isDragging ? 'cursor-grabbing' : ''"
          >
            <!-- 镜头内部图像画布（根据缩放和偏移量位移） -->
            <div 
              class="w-full h-full relative transition-transform duration-100 ease-out"
              :style="{
                transform: `scale(${currentZoom}) translate(${lensOffset.x}px, ${lensOffset.y}px)`,
                transformOrigin: 'center center'
              }"
            >
              <component :is="currentQ.sceneComponent" class="w-full h-full object-cover" />
            </div>

            <!-- 复古显微镜准星与刻度十字线 -->
            <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
              <!-- 十字准星 -->
              <div class="w-full h-px bg-amber-400/25"></div>
              <div class="h-full w-px bg-amber-400/25 absolute"></div>
              <!-- 同心圆刻度 -->
              <div class="w-28 h-28 rounded-full border border-dashed border-amber-400/35 absolute"></div>
              <div class="w-56 h-56 rounded-full border border-amber-400/20 absolute"></div>
              
              <!-- 真实镜头光晕 (Lens Flare) 与光学反射弧光 -->
              <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-300/10 to-rose-400/15 pointer-events-none"></div>
              <div class="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-white/10 rounded-full blur-2xl transform rotate-45 pointer-events-none"></div>
              <div class="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-cyan-400/10 blur-xl pointer-events-none"></div>

              <!-- 边缘暗角与胶片颗粒层 -->
              <div class="absolute inset-0 rounded-full shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]"></div>
              <div class="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style="filter: url(#filmGrainFilter);"></div>
            </div>

            <!-- 拖拽观察提示条 -->
            <div 
              v-if="!revealedFull && currentZoom > 1" 
              class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-stone-900/85 text-amber-200 text-[10px] px-3.5 py-1 rounded-full border border-amber-600/50 pointer-events-none backdrop-blur-md shadow-lg"
            >
              ✋ 按住并在镜头内滑动拖拽探索细节
            </div>

            <!-- 答案揭晓时的全景标识 -->
            <div 
              v-if="revealedFull" 
              class="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600/95 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg pointer-events-none backdrop-blur-sm animate-bounce flex items-center gap-1.5"
            >
              <span>✨</span>
              <span>全景照片与时光手账已解封！</span>
            </div>
          </div>

          <!-- 镜头倍数与视野调焦控制器 -->
          <div class="mt-4 pt-3 border-t border-amber-900/50 flex flex-wrap items-center justify-between gap-2 px-1">
            <span class="text-xs text-amber-300 font-medium">镜头倍率调节：</span>
            <div class="flex items-center gap-1.5">
              <button 
                @click="setZoom(4)"
                class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-1"
                :class="currentZoom === 4 ? 'bg-amber-600 text-white shadow-amber-600/30 ring-2 ring-amber-400' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'"
              >
                <span>4.0×</span>
                <span class="text-[10px] opacity-80">超微</span>
              </button>
              <button 
                @click="setZoom(2)"
                class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-1"
                :class="currentZoom === 2 ? 'bg-amber-600 text-white shadow-amber-600/30 ring-2 ring-amber-400' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'"
              >
                <span>2.0×</span>
                <span class="text-[10px] opacity-80">局部</span>
              </button>
              <button 
                @click="setZoom(1)"
                class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-1"
                :class="currentZoom === 1 ? 'bg-amber-600 text-white shadow-amber-600/30 ring-2 ring-amber-400' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'"
              >
                <span>1.0×</span>
                <span class="text-[10px] opacity-80">全貌</span>
              </button>
            </div>
            <button 
              @click="resetLensPosition"
              class="text-xs px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 transition-colors border border-amber-800/40"
              title="重置镜头视窗居中"
            >
              🎯 居中
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：线索卡片与竞猜选择 (占 5 列) -->
      <div class="lg:col-span-5 space-y-4">
        <!-- 线索提示卡 -->
        <div class="bg-stone-900 rounded-3xl p-5 border border-amber-800/50 shadow-xl text-amber-100">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-base">📜</span>
              <h3 class="text-sm font-bold text-amber-200">侦探线索档案簿</h3>
            </div>
            <span class="text-[11px] text-stone-400 font-mono">线索解锁 {{ revealedCluesCount }}/3</span>
          </div>

          <div class="space-y-2.5">
            <div 
              v-for="(clue, cIdx) in currentQ.clues" 
              :key="'clue-'+cIdx"
              class="p-3 rounded-xl transition-all duration-300"
              :class="cIdx < revealedCluesCount ? 'bg-stone-800/90 border border-amber-600/40 shadow-sm' : 'bg-stone-950/40 border border-dashed border-stone-800 opacity-40'"
            >
              <div class="flex items-start gap-2">
                <span class="text-xs font-mono font-bold text-amber-400 shrink-0">#0{{ cIdx + 1 }}</span>
                <span v-if="cIdx < revealedCluesCount" class="text-xs text-amber-100/90 leading-relaxed">{{ clue }}</span>
                <span v-else class="text-xs text-stone-500 italic">点击下方解锁下一条线索...</span>
              </div>
            </div>
          </div>

          <!-- 解锁线索按钮（逐步解锁扣减积分） -->
          <div v-if="revealedCluesCount < 3 && !hasAnswered" class="mt-3 flex items-center justify-between pt-2 border-t border-stone-800">
            <span class="text-[11px] text-stone-400">
              线索越多得分越低，目前可得 {{ currentMaxEarnableScore }} 分
            </span>
            <button 
              @click="unlockNextClue"
              class="text-xs px-3 py-1.5 rounded-xl bg-amber-900/70 hover:bg-amber-800 text-amber-200 font-semibold border border-amber-700/50 transition-all flex items-center gap-1"
            >
              <span>🔍 解锁下一条线索 (-5分)</span>
            </button>
          </div>
        </div>

        <!-- 竞猜答题区 -->
        <div class="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs font-black px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">QUESTION</span>
            <h4 class="text-sm font-bold text-stone-800">{{ currentQ.question }}</h4>
          </div>

          <!-- 选项列表 -->
          <div class="space-y-2.5">
            <button 
              v-for="(option, optIdx) in currentQ.options" 
              :key="'opt-'+optIdx"
              @click="chooseOption(optIdx)"
              :disabled="hasAnswered"
              class="w-full p-3 rounded-2xl text-left text-xs font-medium border transition-all duration-200 flex items-center justify-between"
              :class="getOptionClass(optIdx)"
            >
              <div class="flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-xl flex items-center justify-center font-bold font-mono text-[11px] shrink-0"
                  :class="getOptionBadgeClass(optIdx)"
                >
                  {{ String.fromCharCode(65 + optIdx) }}
                </span>
                <span>{{ option }}</span>
              </div>

              <!-- 答题状态反馈图标 -->
              <span v-if="hasAnswered && optIdx === currentQ.correctAnswer" class="text-emerald-600 font-bold flex items-center gap-1">
                <Check class="w-3.5 h-3.5" />
                <span>正确 (+{{ lastEarnedPoints }}分)</span>
              </span>
              <span v-else-if="hasAnswered && selectedOptIdx === optIdx && optIdx !== currentQ.correctAnswer" class="text-rose-600 font-bold">
                ✕ 偏差 (+5分)
              </span>
            </button>
          </div>

          <!-- 回忆手账解锁（答题后展开） -->
          <div 
            v-if="hasAnswered" 
            class="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-fade-in text-xs leading-relaxed"
          >
            <div class="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <span>📖 封存的时光日记：</span>
            </div>
            <p class="text-amber-800/90 italic">
              “{{ currentQ.diaryNote }}”
            </p>

            <!-- 下一题/结算按钮 -->
            <button 
              @click="nextQuestion"
              class="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
            >
              {{ currentQIndex < questions.length - 1 ? '调查下一个心动现场 →' : '查看显微侦探结案报告 🏆' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 最终结案荣耀弹窗 -->
    <div 
      v-if="showFinalModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="w-full max-w-md bg-stone-900 border-2 border-violet-500 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center text-amber-100">
        <!-- 光晕装饰 -->
        <div class="absolute -top-12 -left-12 w-36 h-36 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -right-12 w-36 h-36 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-500 to-rose-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-violet-500/30 mb-4 animate-bounce">
            🕵️‍♂️
          </div>

          <h3 class="text-xl font-black text-amber-100">
            结案！细节里的深情无所遁形
          </h3>
          <p class="text-xs text-amber-300/80 mt-1">
            你用敏锐的洞察力唤醒了每一个沉睡的微观瞬间。
          </p>

          <!-- 战绩与评级 -->
          <div class="my-5 p-4 rounded-2xl bg-stone-950/80 border border-violet-800/40">
            <div class="flex justify-between items-center text-xs mb-2">
              <span class="text-stone-400">侦探考核最终总分</span>
              <span class="font-bold text-amber-300 text-lg font-mono">{{ totalScore }} / 100 分</span>
            </div>
            <div class="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden p-0.5 mb-3">
              <div 
                class="h-full bg-gradient-to-r from-violet-500 to-rose-400 rounded-full transition-all duration-700" 
                :style="{ width: `${Math.min(100, totalScore)}%` }"
              ></div>
            </div>
            <div class="inline-block px-3 py-1 rounded-full bg-violet-950 text-violet-300 text-xs font-bold border border-violet-700/60">
              荣获称号：{{ detectiveTitle }}
            </div>
          </div>

          <!-- 恋爱树养分获得 -->
          <div class="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs">
            <div class="font-bold mb-1">🌱 恋爱树获得丰盛滋养！</div>
            <div class="flex items-center justify-center gap-3 text-[11px]">
              <span>💧 水滴 +2</span>
              <span>☀️ 阳光 +3</span>
              <span>🌱 经验 +20</span>
              <span>🧠 共同记忆 +2</span>
            </div>
          </div>

          <!-- 按钮控制 -->
          <div class="flex gap-3">
            <button 
              @click="restartGame" 
              class="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
            >
              重新侦破一次
            </button>
            <button 
              @click="onFinish"
              class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-rose-500 hover:from-violet-400 hover:to-rose-400 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
            >
              完成并返回展厅
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h } from 'vue'
import { ArrowLeft, RotateCcw, Check } from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import { recordGameReward } from '@/状态/恋爱树状态.js'

const emit = defineEmits(['back'])

// 4套生动老照片场景矢量 SVG 组件
// 场景 1：元宵灯会糖葫芦场景
const SceneLanternFestival = defineComponent({
  name: 'SceneLanternFestival',
  render() {
    return h('svg', {
      viewBox: '0 0 600 600',
      class: 'w-full h-full select-none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('rect', { width: '600', height: '600', fill: '#1a0505' }),
      // 背景红灯笼串
      h('circle', { cx: '120', cy: '120', r: '40', fill: '#dc2626', opacity: '0.85' }),
      h('circle', { cx: '300', cy: '90', r: '48', fill: '#e11d48', opacity: '0.9' }),
      h('circle', { cx: '480', cy: '130', r: '40', fill: '#dc2626', opacity: '0.85' }),
      h('line', { x1: '0', y1: '80', x2: '600', y2: '90', stroke: '#78350f', 'stroke-width': '3' }),
      // 街道暖黄色人群虚焦光圈
      h('circle', { cx: '80', cy: '260', r: '35', fill: '#f59e0b', opacity: '0.3' }),
      h('circle', { cx: '520', cy: '300', r: '45', fill: '#fbbf24', opacity: '0.25' }),
      h('circle', { cx: '240', cy: '200', r: '28', fill: '#f43f5e', opacity: '0.35' }),
      // 手腕特写
      h('rect', { x: '210', y: '360', width: '180', height: '180', rx: '30', fill: '#fed7aa', transform: 'rotate(-10 300 450)' }),
      // 红色编织手绳
      h('line', { x1: '200', y1: '430', x2: '380', y2: '400', stroke: '#dc2626', 'stroke-width': '10', 'stroke-linecap': 'round' }),
      h('circle', { cx: '290', cy: '415', r: '7', fill: '#fbbf24' }),
      // 竹签草莓糖葫芦
      h('line', { x1: '240', y1: '520', x2: '360', y2: '160', stroke: '#d97706', 'stroke-width': '7', 'stroke-linecap': 'round' }),
      h('circle', { cx: '345', cy: '200', r: '28', fill: '#ef4444' }),
      h('ellipse', { cx: '340', cy: '190', rx: '10', ry: '6', fill: '#fef08a', opacity: '0.7', transform: 'rotate(-20 340 190)' }),
      h('circle', { cx: '320', cy: '260', r: '32', fill: '#dc2626' }),
      h('ellipse', { cx: '315', cy: '250', rx: '12', ry: '7', fill: '#fef08a', opacity: '0.7', transform: 'rotate(-20 315 250)' }),
      h('circle', { cx: '295', cy: '320', r: '30', fill: '#b91c1c' }),
      h('ellipse', { cx: '290', cy: '310', rx: '10', ry: '6', fill: '#fef08a', opacity: '0.7', transform: 'rotate(-20 290 310)' }),
      h('path', { d: 'M350,160 Q360,140 350,120', stroke: '#ffffff', 'stroke-width': '3', fill: 'none', opacity: '0.6' })
    ])
  }
})

// 场景 2：海边沙滩脚丫与粉色贝壳场景
const SceneBeachSeashell = defineComponent({
  name: 'SceneBeachSeashell',
  render() {
    return h('svg', {
      viewBox: '0 0 600 600',
      class: 'w-full h-full select-none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('rect', { width: '600', height: '600', fill: '#fef3c7' }),
      h('path', { d: 'M0,180 Q300,240 600,190 L600,0 L0,0 Z', fill: '#0284c7', opacity: '0.85' }),
      h('path', { d: 'M0,180 Q150,230 300,190 T600,200 L600,220 Q450,210 300,225 T0,200 Z', fill: '#ffffff', opacity: '0.9' }),
      h('circle', { cx: '180', cy: '210', r: '6', fill: '#ffffff', opacity: '0.7' }),
      h('circle', { cx: '380', cy: '215', r: '8', fill: '#ffffff', opacity: '0.8' }),
      // 两双并排浸在浅水沙滩里的脚丫
      h('ellipse', { cx: '220', cy: '330', rx: '35', ry: '60', fill: '#fde68a', transform: 'rotate(-5 220 330)' }),
      h('circle', { cx: '205', cy: '255', r: '10', fill: '#fde68a' }),
      h('circle', { cx: '222', cy: '258', r: '8', fill: '#fde68a' }),
      h('circle', { cx: '236', cy: '263', r: '7', fill: '#fde68a' }),
      h('ellipse', { cx: '310', cy: '345', rx: '28', ry: '50', fill: '#fed7aa', transform: 'rotate(8 310 345)' }),
      h('circle', { cx: '302', cy: '282', r: '8', fill: '#fed7aa' }),
      h('circle', { cx: '316', cy: '285', r: '6.5', fill: '#fed7aa' }),
      h('circle', { cx: '327', cy: '290', r: '6', fill: '#fed7aa' }),
      h('circle', { cx: '302', cy: '280', r: '3.5', fill: '#f43f5e' }),
      // 粉紫色扇形贝壳
      h('path', { d: 'M400,380 Q430,340 460,380 Q430,420 400,380 Z', fill: '#f472b6' }),
      h('path', { d: 'M405,380 L455,380', stroke: '#fbcfe8', 'stroke-width': '2' }),
      h('path', { d: 'M415,365 L445,395', stroke: '#fbcfe8', 'stroke-width': '1.5' }),
      // 防晒霜软管一角
      h('rect', { x: '130', y: '450', width: '50', height: '90', rx: '10', fill: '#38bdf8', transform: 'rotate(25 150 490)' }),
      h('rect', { x: '145', y: '435', width: '20', height: '15', rx: '3', fill: '#ffffff', transform: 'rotate(25 150 490)' })
    ])
  }
})

// 场景 3：厨房焦黄爱心蛋与黄色便签
const SceneBreakfastHeartEgg = defineComponent({
  name: 'SceneBreakfastHeartEgg',
  render() {
    return h('svg', {
      viewBox: '0 0 600 600',
      class: 'w-full h-full select-none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('rect', { width: '600', height: '600', fill: '#78350f' }),
      h('line', { x1: '0', y1: '200', x2: '600', y2: '200', stroke: '#92400e', 'stroke-width': '3' }),
      h('line', { x1: '0', y1: '400', x2: '600', y2: '400', stroke: '#92400e', 'stroke-width': '3' }),
      // 白色陶瓷餐盘
      h('circle', { cx: '300', cy: '320', r: '190', fill: '#f8fafc', stroke: '#e2e8f0', 'stroke-width': '6' }),
      h('circle', { cx: '300', cy: '320', r: '150', fill: '#ffffff', stroke: '#f1f5f9', 'stroke-width': '2' }),
      // 爱心煎蛋
      h('path', { d: 'M300,220 C270,170 190,190 200,270 C205,330 300,390 300,390 C300,390 395,330 400,270 C410,190 330,170 300,220 Z', fill: '#fef3c7', stroke: '#d97706', 'stroke-width': '4' }),
      h('path', { d: 'M200,280 Q210,320 230,340', stroke: '#b45309', 'stroke-width': '5', fill: 'none', 'stroke-linecap': 'round' }),
      h('path', { d: 'M370,320 Q390,290 395,260', stroke: '#b45309', 'stroke-width': '6', fill: 'none', 'stroke-linecap': 'round' }),
      h('circle', { cx: '300', cy: '290', r: '42', fill: '#f59e0b', stroke: '#d97706', 'stroke-width': '3' }),
      h('circle', { cx: '288', cy: '278', r: '8', fill: '#fef08a', opacity: '0.8' }),
      // 便签纸
      h('rect', { x: '420', y: '130', width: '130', height: '130', rx: '4', fill: '#fef08a', transform: 'rotate(12 480 190)', stroke: '#fde047' }),
      h('path', { d: 'M450,170 L510,175', stroke: '#475569', 'stroke-width': '3', 'stroke-linecap': 'round' }),
      h('path', { d: 'M445,190 L520,196', stroke: '#475569', 'stroke-width': '3', 'stroke-linecap': 'round' }),
      h('circle', { cx: '500', cy: '225', r: '6', fill: '#f43f5e' })
    ])
  }
})

// 场景 4：暴雨天合撑红伞与地面积水倒影
const SceneRainyRedUmbrella = defineComponent({
  name: 'SceneRainyRedUmbrella',
  render() {
    return h('svg', {
      viewBox: '0 0 600 600',
      class: 'w-full h-full select-none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('rect', { width: '600', height: '600', fill: '#1e293b' }),
      h('line', { x1: '50', y1: '20', x2: '30', y2: '90', stroke: '#94a3b8', 'stroke-width': '2', opacity: '0.7' }),
      h('line', { x1: '180', y1: '40', x2: '160', y2: '110', stroke: '#94a3b8', 'stroke-width': '2.5', opacity: '0.8' }),
      h('line', { x1: '420', y1: '10', x2: '400', y2: '80', stroke: '#94a3b8', 'stroke-width': '2', opacity: '0.7' }),
      h('line', { x1: '520', y1: '50', x2: '500', y2: '120', stroke: '#94a3b8', 'stroke-width': '2.5', opacity: '0.8' }),
      h('ellipse', { cx: '300', cy: '460', rx: '240', ry: '80', fill: '#334155', opacity: '0.9' }),
      h('ellipse', { cx: '230', cy: '450', rx: '40', ry: '12', fill: 'none', stroke: '#94a3b8', 'stroke-width': '2', opacity: '0.8' }),
      h('ellipse', { cx: '370', cy: '480', rx: '50', ry: '15', fill: 'none', stroke: '#94a3b8', 'stroke-width': '2', opacity: '0.7' }),
      // 大红伞特写
      h('path', { d: 'M160,280 Q300,120 460,260 Q390,300 300,305 Q220,300 160,280 Z', fill: '#ef4444' }),
      h('path', { d: 'M160,280 Q300,120 300,305', fill: '#dc2626', opacity: '0.6' }),
      h('circle', { cx: '300', cy: '135', r: '8', fill: '#b91c1c' }),
      h('circle', { cx: '162', cy: '285', r: '4', fill: '#bae6fd' }),
      h('circle', { cx: '458', cy: '265', r: '4', fill: '#bae6fd' }),
      h('circle', { cx: '300', cy: '309', r: '3.5', fill: '#bae6fd' }),
      // 两人衣服
      h('path', { d: 'M250,305 L230,420 L285,420 L290,305 Z', fill: '#1e3a8a' }),
      h('path', { d: 'M290,305 L295,420 L350,420 L340,305 Z', fill: '#fb7185' }),
      h('ellipse', { cx: '240', cy: '360', rx: '18', ry: '25', fill: '#0f172a', opacity: '0.7' })
    ])
  }
})

// 题库清单
const questions = [
  {
    id: 1,
    sceneComponent: SceneLanternFestival,
    question: '显微镜头定格在这串草莓糖葫芦上，猜猜这是哪里的名场面？',
    clues: [
      '气温在零度上下，呼出来的每一口气都是白茫茫的雾。',
      '耳边全是咚咚锵的锣鼓声，整条街挂满了暖烘烘的红灯笼。',
      '某人非要买最大的一串，第一口就差点被糖壳粘住嘴巴。'
    ],
    options: [
      '元宵节灯会庙会街头',
      '游乐园过山车出口小摊',
      '大学城后门的夜市小吃街',
      '电影院散场后的商业街'
    ],
    correctAnswer: 0,
    diaryNote: '那晚天很冷，但牵着你的手在庙会的人潮里逛了很久很久。草莓很甜，你笑起来的眼睛比头顶的灯笼还要亮。'
  },
  {
    id: 2,
    sceneComponent: SceneBeachSeashell,
    question: '海滩细沙上的两双脚丫与贝壳，当时我们在经历什么？',
    clues: [
      '微风吹拂，空气里全都是咸咸的海水味道与椰子清香。',
      '某人涂防晒霜时故意把对方的鼻子抹成‘小白鼻’。',
      '拍下这张照片几秒后，一个突如其来的大浪把两人的短裤全拍湿了。'
    ],
    options: [
      '夏日海岛旅行踏浪赶海捡贝壳',
      '室内恒温水上乐园冲浪池',
      '城郊水库露营钓鱼',
      '海洋馆海豚表演互动池'
    ],
    correctAnswer: 0,
    diaryNote: '海浪一次次漫过脚踝，你说希望时间就停在这个夏天。那枚粉色小贝壳，至今还放在我们书桌的玻璃瓶里。'
  },
  {
    id: 3,
    sceneComponent: SceneBreakfastHeartEgg,
    question: '盘子里这颗边缘微焦的爱心煎蛋，记录了那个清晨的什么趣事？',
    clues: [
      '早上七点半，厨房里传来锅铲惊慌失措的轻微碰撞声。',
      '某位‘米其林预备大厨’第一次挑战早起准备双人爱心早餐。',
      '虽然形状有点歪、盐也稍微放多了一撮，但整盘还是被开心地吃得干干净净。'
    ],
    options: [
      '第一次笨拙却认真的自制爱心早餐',
      '周年纪念日的豪华法式西餐',
      '生日当天烤糊了的戚风蛋糕',
      '深夜下班后煮的豪华泡面夜宵'
    ],
    correctAnswer: 0,
    diaryNote: '哪怕煎蛋的边缘有一点点焦，但在我心里，这世上再昂贵的米其林餐厅，也比不上你亲手做的那顿早餐。'
  },
  {
    id: 4,
    sceneComponent: SceneRainyRedUmbrella,
    question: '暴雨中合撑的大红伞，伞下两个人湿透的肩膀代表了什么？',
    clues: [
      '外面下着突如其来的暴雨，地面已经漫起了层层涟漪。',
      '伞明明足够大，但两个人都悄悄把伞柄往对方那边倾斜。',
      '走回地铁站时，两个人的半边外套都淋湿了，手却在伞下牵得格外紧。'
    ],
    options: [
      '暴雨天共撑一把伞的地铁站雨中漫步',
      '植物园玻璃温室外的雷阵雨避雨',
      '露天音乐节草地上的突发大雨',
      '图书馆门口等雨停的漫长时光'
    ],
    correctAnswer: 0,
    diaryNote: '爱是下雨天一把伞，伞总是偏向另一边。即使肩膀被雨水淋得冰凉，掌心传来的温度依然可以驱散整个阴雨天。'
  }
]

const currentQIndex = ref(0)
const currentZoom = ref(4) // 默认 4 倍超微
const lensOffset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const initialOffset = ref({ x: 0, y: 0 })

const revealedCluesCount = ref(1) // 默认只给 1 条线索
const selectedOptIdx = ref(null)
const hasAnswered = ref(false)
const revealedFull = ref(false)
const totalScore = ref(0)
const lastEarnedPoints = ref(0)
const showFinalModal = ref(false)

const currentQ = computed(() => questions[currentQIndex.value])

// 当前题目根据已解锁线索数计算最高可得积分
const currentMaxEarnableScore = computed(() => {
  if (revealedCluesCount.value === 1) return 25
  if (revealedCluesCount.value === 2) return 20
  return 15
})

const detectiveTitle = computed(() => {
  if (totalScore.value >= 90) return '神仙级 · 细节显微镜侦探 🕵️‍♀️'
  if (totalScore.value >= 70) return '心电感应 · 恋爱福尔摩斯 🔍'
  return '温情陪伴 · 记忆守护人 💌'
})

function setZoom(zoom) {
  currentZoom.value = zoom
  if (zoom === 1) {
    lensOffset.value = { x: 0, y: 0 }
  } else {
    // 限制在有效视窗范围内
    const maxBound = (zoom - 1) * 60
    lensOffset.value = {
      x: Math.max(-maxBound, Math.min(maxBound, lensOffset.value.x)),
      y: Math.max(-maxBound, Math.min(maxBound, lensOffset.value.y))
    }
  }
}

function resetLensPosition() {
  lensOffset.value = { x: 0, y: 0 }
}

// 鼠标与触控拖拽探索
function startDrag(e) {
  if (currentZoom.value <= 1) return
  isDragging.value = true
  dragStartPos.value = { x: e.clientX, y: e.clientY }
  initialOffset.value = { ...lensOffset.value }
}

function onDrag(e) {
  if (!isDragging.value) return
  const dx = (e.clientX - dragStartPos.value.x) / currentZoom.value
  const dy = (e.clientY - dragStartPos.value.y) / currentZoom.value
  const maxBound = (currentZoom.value - 1) * 80
  lensOffset.value = {
    x: Math.max(-maxBound, Math.min(maxBound, initialOffset.value.x + dx)),
    y: Math.max(-maxBound, Math.min(maxBound, initialOffset.value.y + dy))
  }
}

function startTouch(e) {
  if (currentZoom.value <= 1 || e.touches.length === 0) return
  isDragging.value = true
  dragStartPos.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  initialOffset.value = { ...lensOffset.value }
}

function onTouch(e) {
  if (!isDragging.value || e.touches.length === 0) return
  const dx = (e.touches[0].clientX - dragStartPos.value.x) / currentZoom.value
  const dy = (e.touches[0].clientY - dragStartPos.value.y) / currentZoom.value
  const maxBound = (currentZoom.value - 1) * 80
  lensOffset.value = {
    x: Math.max(-maxBound, Math.min(maxBound, initialOffset.value.x + dx)),
    y: Math.max(-maxBound, Math.min(maxBound, initialOffset.value.y + dy))
  }
}

function stopDrag() {
  isDragging.value = false
}

// 逐步解锁线索机制
function unlockNextClue() {
  if (revealedCluesCount.value < 3) {
    revealedCluesCount.value += 1
  }
}

// 选择竞猜选项
function chooseOption(idx) {
  if (hasAnswered.value) return
  selectedOptIdx.value = idx
  hasAnswered.value = true

  const isCorrect = idx === currentQ.value.correctAnswer
  if (isCorrect) {
    // 答对：依据已解锁线索数给予分值
    const points = currentMaxEarnableScore.value
    lastEarnedPoints.value = points
    totalScore.value += points

    // 展开全景视野
    currentZoom.value = 1
    lensOffset.value = { x: 0, y: 0 }
    revealedFull.value = true
    triggerConfetti()
  } else {
    // 答错获得鼓励分 5 分
    lastEarnedPoints.value = 5
    totalScore.value += 5
    currentZoom.value = 1
    lensOffset.value = { x: 0, y: 0 }
    revealedFull.value = true
  }
}

function getOptionClass(idx) {
  if (!hasAnswered.value) {
    return 'bg-stone-50 hover:bg-amber-50 hover:border-amber-300 text-stone-700 border-stone-200'
  }
  if (idx === currentQ.value.correctAnswer) {
    return 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
  }
  if (selectedOptIdx.value === idx) {
    return 'bg-rose-50 border-rose-400 text-rose-900'
  }
  return 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
}

function getOptionBadgeClass(idx) {
  if (!hasAnswered.value) {
    return 'bg-stone-200 text-stone-700'
  }
  if (idx === currentQ.value.correctAnswer) {
    return 'bg-emerald-500 text-white'
  }
  if (selectedOptIdx.value === idx) {
    return 'bg-rose-500 text-white'
  }
  return 'bg-stone-200 text-stone-400'
}

function nextQuestion() {
  if (currentQIndex.value < questions.length - 1) {
    currentQIndex.value += 1
    currentZoom.value = 4
    lensOffset.value = { x: 0, y: 0 }
    revealedCluesCount.value = 1
    selectedOptIdx.value = null
    hasAnswered.value = false
    revealedFull.value = false
    lastEarnedPoints.value = 0
  } else {
    // 通关结算
    showFinalModal.value = true
    triggerConfetti()

    recordGameReward('photo-scope', { 
      water: 2, 
      sun: 3, 
      exp: 20, 
      radarCategory: '共同记忆' 
    })
  }
}

function restartGame() {
  currentQIndex.value = 0
  currentZoom.value = 4
  lensOffset.value = { x: 0, y: 0 }
  revealedCluesCount.value = 1
  selectedOptIdx.value = null
  hasAnswered.value = false
  revealedFull.value = false
  totalScore.value = 0
  lastEarnedPoints.value = 0
  showFinalModal.value = false
}

function triggerConfetti() {
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.6 }
  })
}

function onFinish() {
  showFinalModal.value = false
  emit('back')
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
