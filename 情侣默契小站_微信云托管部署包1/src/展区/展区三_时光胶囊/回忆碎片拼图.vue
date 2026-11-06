<template>
  <div class="space-y-6">
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
            <span>🧩 回忆碎片拼图</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300 font-normal">
              {{ gridSize === 3 ? '3×3 经典' : '4×4 高阶' }}
            </span>
          </h2>
          <p class="text-[11px] text-amber-300/70 hidden sm:block">把打乱的浪漫光影重新拼接，让完整的美好重新绽放</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[10px] text-amber-300/80">拼图通关奖励</div>
          <div class="text-xs font-bold text-rose-300 flex items-center gap-1.5 justify-end">
            <span>💧+4</span>
            <span>☀️+2</span>
            <span>🌱+25</span>
          </div>
        </div>
        <button 
          @click="shufflePuzzle" 
          class="p-2 rounded-xl bg-amber-900/50 hover:bg-amber-800/80 text-amber-200 border border-amber-700/40 transition-transform active:rotate-180 duration-300"
          title="重新打乱"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 顶部控制条：画卷选择、难度模式与对照工具 -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-stone-100/90 p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-sm">
      <!-- 插画选项 -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-bold text-stone-600">🖼️ 浪漫画卷：</span>
        <div class="flex gap-1.5 flex-wrap">
          <button 
            v-for="(preset, idx) in presets" 
            :key="preset.id"
            @click="selectPreset(idx)"
            class="px-3 py-1.5 text-xs rounded-xl transition-all font-medium flex items-center gap-1"
            :class="selectedPresetIdx === idx && !customImage ? 'bg-amber-700 text-white shadow-sm ring-2 ring-amber-300' : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'"
          >
            <span>{{ preset.emoji }}</span>
            <span>{{ preset.name }}</span>
          </button>

          <!-- 上传自定义情侣照片 -->
          <label class="px-3 py-1.5 text-xs rounded-xl cursor-pointer transition-all font-medium flex items-center gap-1"
            :class="customImage ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-300' : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200'"
          >
            <span>📷 自定义合影</span>
            <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
          </label>
        </div>
      </div>

      <!-- 难度选择与辅助工具 -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 难度切换：3x3 与 4x4 -->
        <div class="flex items-center bg-stone-200/80 p-0.5 rounded-xl border border-stone-300">
          <button 
            @click="changeGridSize(3)"
            class="px-2.5 py-1 text-xs rounded-lg font-bold transition-all"
            :class="gridSize === 3 ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'"
          >
            3×3 经典
          </button>
          <button 
            @click="changeGridSize(4)"
            class="px-2.5 py-1 text-xs rounded-lg font-bold transition-all"
            :class="gridSize === 4 ? 'bg-white text-rose-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'"
          >
            4×4 高阶
          </button>
        </div>

        <!-- 悬浮半透明原图对照浮层开关 -->
        <button 
          @click="toggleGhostOverlay"
          class="text-xs px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 shadow-xs"
          :class="showGhostOverlay ? 'bg-rose-600 text-white border-rose-500 font-bold' : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'"
          title="在拼图上方半透明显示原图轮廓，辅助精准对比"
        >
          <Eye class="w-3.5 h-3.5" />
          <span>{{ showGhostOverlay ? '对照浮层: 开启' : '原图对照浮层' }}</span>
        </button>

        <!-- 辅助标号开关 -->
        <button 
          @click="showNumbers = !showNumbers"
          class="text-xs px-2.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1"
          :class="showNumbers ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'"
        >
          <span>{{ showNumbers ? '✓ 标号开启' : '🔢 标号' }}</span>
        </button>

        <!-- 侧栏缩略原图预览 -->
        <button 
          @click="showPreview = !showPreview"
          class="text-xs px-2.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1"
          :class="showPreview ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'"
        >
          <span>{{ showPreview ? '隐藏全景' : '🖼️ 全景' }}</span>
        </button>
      </div>
    </div>

    <!-- 主拼图游戏区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- 左侧：拼图主面板（复古相框装裱） -->
      <div class="lg:col-span-8 flex flex-col items-center">
        <!-- 拍立得复古相框外壳 -->
        <div 
          class="w-full max-w-[440px] sm:max-w-[480px] bg-stone-100 p-4 sm:p-5 rounded-3xl shadow-2xl border-4 border-stone-300 relative transition-all duration-500"
          :class="isSolved ? 'ring-4 ring-amber-400 shadow-amber-400/40 scale-[1.01]' : ''"
        >
          <!-- 胶带纸固定装饰 -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-7 bg-amber-100/90 backdrop-blur border border-amber-200/90 shadow-sm rotate-1 text-center text-[10px] text-amber-800 font-mono flex items-center justify-center font-bold">
            ROMANTIC ARCHIVE · {{ gridSize }}×{{ gridSize }}
          </div>

          <!-- 拼图画布容器 -->
          <div 
            class="relative w-full aspect-square bg-stone-900 rounded-2xl overflow-hidden shadow-inner border-2 transition-all duration-300"
            :class="isSolved ? 'border-amber-400 shadow-amber-400/30' : 'border-stone-800'"
          >
            <!-- 拼图完成时的整图无缝合并发光展示 -->
            <div 
              v-if="isSolved" 
              class="absolute inset-0 z-20 animate-fade-in flex items-center justify-center"
            >
              <div class="w-full h-full relative">
                <component 
                  v-if="!customImage" 
                  :is="currentPresetComponent" 
                  class="w-full h-full object-cover" 
                />
                <img 
                  v-else 
                  :src="customImage" 
                  class="w-full h-full object-cover" 
                  alt="情侣专属合照" 
                />
                <!-- 浪漫金光漫溢与爱心粒子浮动 -->
                <div class="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-transparent to-amber-500/20 pointer-events-none"></div>
                <div class="absolute inset-0 border-4 border-amber-300/80 rounded-2xl pointer-events-none animate-pulse"></div>
              </div>
            </div>

            <!-- 切块网格容器 -->
            <div 
              v-else 
              class="w-full h-full grid p-1 transition-all duration-200"
              :class="[
                gridSize === 3 ? 'grid-cols-3 grid-rows-3 gap-1' : 'grid-cols-4 grid-rows-4 gap-0.5',
                'bg-stone-900/90'
              ]"
            >
              <div 
                v-for="(tile, posIndex) in tiles" 
                :key="tile.id"
                @click="handleTileClick(posIndex)"
                class="relative rounded-lg sm:rounded-xl overflow-hidden cursor-pointer select-none transition-all duration-200 group active:scale-95"
                :class="[
                  selectedPosIndex === posIndex 
                    ? 'ring-4 ring-rose-500 ring-offset-1 scale-95 shadow-lg z-10' 
                    : 'hover:opacity-95 hover:shadow-md',
                  tile.originalPos === posIndex ? 'border border-emerald-400/40' : 'border border-stone-700/60'
                ]"
              >
                <!-- 碎片裁剪视图：通过绝对定位反向偏移精准截取 -->
                <div 
                  class="absolute pointer-events-none"
                  :style="getTileInnerStyle(tile)"
                >
                  <component 
                    v-if="!customImage" 
                    :is="currentPresetComponent" 
                    class="w-full h-full object-cover" 
                  />
                  <img 
                    v-else 
                    :src="customImage" 
                    class="w-full h-full object-cover" 
                    alt="切片" 
                  />
                </div>

                <!-- 选中的呼吸遮罩提示 -->
                <div 
                  v-if="selectedPosIndex === posIndex" 
                  class="absolute inset-0 bg-rose-600/35 flex items-center justify-center font-bold text-white text-[11px] backdrop-blur-[1px]"
                >
                  <span class="bg-rose-600 px-2 py-0.5 rounded-full shadow">已选中</span>
                </div>

                <!-- 辅助数字编号提示角标 -->
                <div 
                  v-if="showNumbers" 
                  class="absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-bold shadow-md"
                  :class="tile.originalPos === posIndex ? 'bg-emerald-500 text-white' : 'bg-stone-900/85 text-amber-200 border border-stone-600'"
                >
                  {{ tile.originalPos + 1 }}
                </div>

                <!-- 位置已归位时的小绿点 -->
                <div 
                  v-if="tile.originalPos === posIndex" 
                  class="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-sm"
                  title="该碎片已在正确位置"
                ></div>
              </div>
            </div>

            <!-- 悬浮半透明原图对照浮层（Ghost Overlay） -->
            <div 
              v-if="showGhostOverlay && !isSolved"
              class="absolute inset-0 z-15 pointer-events-none transition-opacity duration-300 overflow-hidden rounded-2xl"
              :style="{ opacity: ghostOpacity }"
            >
              <component 
                v-if="!customImage" 
                :is="currentPresetComponent" 
                class="w-full h-full object-cover" 
              />
              <img 
                v-else 
                :src="customImage" 
                class="w-full h-full object-cover" 
                alt="半透明原图对比" 
              />
              <div class="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-mono">
                对照透视中
              </div>
            </div>
          </div>

          <!-- 半透明浮层透明度快速微调滑杆（仅在浮层开启时展示） -->
          <div v-if="showGhostOverlay && !isSolved" class="mt-2 flex items-center justify-between text-[11px] text-stone-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
            <span class="flex items-center gap-1 font-medium text-rose-800">
              <Eye class="w-3 h-3 text-rose-600" />
              <span>浮层透明度：{{ Math.round(ghostOpacity * 100) }}%</span>
            </span>
            <div class="flex gap-1.5">
              <button 
                v-for="op in [0.2, 0.4, 0.65]" 
                :key="op"
                @click="ghostOpacity = op"
                class="px-2 py-0.5 text-[10px] rounded border"
                :class="ghostOpacity === op ? 'bg-rose-600 text-white border-rose-600 font-bold' : 'bg-white text-stone-600 border-stone-300'"
              >
                {{ Math.round(op * 100) }}%
              </button>
            </div>
          </div>

          <!-- 拍立得相框下底沿（手写体文字区域） -->
          <div class="mt-3 pt-2 text-center border-t border-stone-200">
            <h4 class="font-serif text-sm sm:text-base font-bold text-stone-800 tracking-wide">
              {{ customImage ? '📷 我们的独家心动记忆合影' : presets[selectedPresetIdx].title }}
            </h4>
            <p class="text-[11px] text-stone-500 mt-0.5">
              {{ isSolved ? '✨ 碎片重聚，记忆永恒！已完美复原整幅画卷' : (customImage ? '上传自定义照片，逐块还原甜蜜瞬间' : presets[selectedPresetIdx].desc) }}
            </p>
          </div>
        </div>

        <!-- 交互提示小贴士 -->
        <div class="mt-4 text-xs text-stone-500 flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-xl border border-stone-200">
          <span>👆 操作小提示：</span>
          <span>先点击一块想移动的碎片，再点击目标位置碎片即可互换！</span>
        </div>
      </div>

      <!-- 右侧：挑战计时、步数统计、归位进度与操作 -->
      <div class="lg:col-span-4 space-y-4">
        <!-- 统计面板 -->
        <div class="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-stone-500 tracking-wider uppercase">拼图实时挑战状态</h3>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              {{ gridSize }}×{{ gridSize }} · 共 {{ totalTiles }} 块
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2.5 text-center">
            <!-- 计时器 -->
            <div class="p-2.5 bg-sky-50 rounded-2xl border border-sky-100">
              <div class="text-[10px] text-sky-700 font-medium">所用时间</div>
              <div class="text-lg font-black text-sky-900 font-mono mt-1 flex items-center justify-center gap-1">
                <Clock class="w-3.5 h-3.5 text-sky-600" />
                <span>{{ formattedTime }}</span>
              </div>
            </div>

            <!-- 步数 -->
            <div class="p-2.5 bg-amber-50 rounded-2xl border border-amber-100">
              <div class="text-[10px] text-amber-700 font-medium">累计步数</div>
              <div class="text-lg font-black text-amber-900 font-mono mt-1">{{ moveSteps }} <span class="text-[10px] font-normal">步</span></div>
            </div>

            <!-- 归位块数 -->
            <div class="p-2.5 bg-rose-50 rounded-2xl border border-rose-100">
              <div class="text-[10px] text-rose-700 font-medium">归位进度</div>
              <div class="text-lg font-black text-rose-900 font-mono mt-1">{{ correctTilesCount }}/{{ totalTiles }}</div>
            </div>
          </div>

          <!-- 归位进度条 -->
          <div class="mt-4">
            <div class="flex justify-between text-[11px] text-stone-500 mb-1">
              <span>画面完整度</span>
              <span class="font-mono font-bold">{{ Math.round((correctTilesCount / totalTiles) * 100) }}%</span>
            </div>
            <div class="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5">
              <div 
                class="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-300"
                :style="{ width: `${(correctTilesCount / totalTiles) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- 按钮控制 -->
          <div class="mt-5 flex gap-2">
            <button 
              @click="shufflePuzzle"
              class="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>重新洗牌</span>
            </button>
            <button 
              v-if="!isSolved"
              @click="autoSolveOne"
              class="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold transition-colors"
              title="智能帮你归位一块碎片"
            >
              💡 归位提示
            </button>
          </div>
        </div>

        <!-- 原图参考缩略卡片 -->
        <div v-show="showPreview" class="bg-stone-900 rounded-3xl p-4 border border-stone-800 shadow-md animate-fade-in text-amber-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>🖼️ 参考原图全貌</span>
            </span>
            <span class="text-[10px] text-stone-400 font-mono">100% SCALE</span>
          </div>
          <div class="w-full aspect-square rounded-2xl overflow-hidden border border-stone-700 bg-stone-950">
            <component 
              v-if="!customImage" 
              :is="currentPresetComponent" 
              class="w-full h-full object-cover" 
            />
            <img 
              v-else 
              :src="customImage" 
              class="w-full h-full object-cover" 
              alt="原图" 
            />
          </div>
          <p class="text-[10px] text-stone-400 text-center mt-2">对照原图，更快找准每块碎片的归属位置</p>
        </div>

        <!-- 浪漫解密寄语 -->
        <div class="p-4 rounded-3xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200/80 text-stone-700 text-xs leading-relaxed">
          <div class="font-bold text-rose-800 mb-1 flex items-center gap-1">
            <span>💌 拼图背后的心动密语</span>
          </div>
          <p class="text-stone-600 text-[11px]">
            “就像世上有成千上万个日常琐碎，因为是你，每一块才有了独特的颜色与意义。拼接起来，就是我们一生一世的浪漫故事。”
          </p>
        </div>
      </div>
    </div>

    <!-- 通关荣耀弹窗 -->
    <div 
      v-if="showSuccessModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="w-full max-w-md bg-stone-900 border-2 border-rose-500 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center text-amber-100">
        <!-- 氛围装饰光斑 -->
        <div class="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/30 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/30 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-rose-500/30 mb-4 animate-bounce">
            💖
          </div>

          <h3 class="text-xl font-black text-rose-100">
            爱意重圆 · 回忆碎片完美拼合！
          </h3>
          <p class="text-xs text-amber-200/80 mt-1">
            每一个散落的微光瞬间，都被你们用默契拼成最美的画卷。
          </p>

          <!-- 战绩印章 -->
          <div class="my-5 p-4 rounded-2xl bg-stone-950/80 border border-rose-800/40 grid grid-cols-3 gap-2 text-center">
            <div>
              <div class="text-[10px] text-stone-400">通关用时</div>
              <div class="text-base font-bold text-sky-300 font-mono">{{ formattedTime }}</div>
            </div>
            <div>
              <div class="text-[10px] text-stone-400">总移动步数</div>
              <div class="text-base font-bold text-rose-300 font-mono">{{ moveSteps }} 步</div>
            </div>
            <div>
              <div class="text-[10px] text-stone-400">默契称号</div>
              <div class="text-base font-bold text-amber-300 font-mono">天作之合 🌟</div>
            </div>
          </div>

          <!-- 恋爱树养分获得 -->
          <div class="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs">
            <div class="font-bold mb-1">🌱 恋爱树获得丰盛滋养！</div>
            <div class="flex items-center justify-center gap-3 text-[11px]">
              <span>💧 水滴 +4</span>
              <span>☀️ 阳光 +2</span>
              <span>🌱 经验 +25</span>
              <span>🧠 共同记忆 +2</span>
            </div>
          </div>

          <!-- 按钮控制 -->
          <div class="flex gap-3">
            <button 
              @click="showSuccessModal = false" 
              class="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
            >
              留在画面欣赏
            </button>
            <button 
              @click="onFinish"
              class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-md transition-transform active:scale-95"
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
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from 'vue'
import { ArrowLeft, RotateCcw, Eye, Clock } from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import { recordGameReward } from '@/状态/恋爱树状态.js'

const emit = defineEmits(['back'])

// 4 套高清纯 SVG 浪漫情侣矢量画作
// 1. 日落海滩 · 晚风踏浪双人行
const SunsetBeachIllustration = defineComponent({
  name: 'SunsetBeachIllustration',
  render() {
    return h('svg', {
      viewBox: '0 0 600 600',
      class: 'w-full h-full select-none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('defs', null, [
        h('linearGradient', { id: 'beachSky', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, [
          h('stop', { offset: '0%', 'stop-color': '#be185d' }),
          h('stop', { offset: '40%', 'stop-color': '#f97316' }),
          h('stop', { offset: '75%', 'stop-color': '#fbbf24' }),
          h('stop', { offset: '100%', 'stop-color': '#fed7aa' })
        ]),
        h('linearGradient', { id: 'seaGrad', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, [
          h('stop', { offset: '0%', 'stop-color': '#ea580c' }),
          h('stop', { offset: '40%', 'stop-color': '#9a3412' }),
          h('stop', { offset: '100%', 'stop-color': '#7c2d12' })
        ]),
        h('radialGradient', { id: 'sunGlowBeach', cx: '50%', cy: '50%', r: '50%' }, [
          h('stop', { offset: '0%', 'stop-color': '#fffbeb', 'stop-opacity': '1' }),
          h('stop', { offset: '60%', 'stop-color': '#fef08a', 'stop-opacity': '0.7' }),
          h('stop', { offset: '100%', 'stop-color': '#f97316', 'stop-opacity': '0' })
        ])
      ]),
      // 晚霞天空
      h('rect', { width: '600', height: '600', fill: 'url(#beachSky)' }),
      // 巨大的落日
      h('circle', { cx: '300', cy: '320', r: '90', fill: 'url(#sunGlowBeach)' }),
      h('circle', { cx: '300', cy: '320', r: '50', fill: '#fef08a' }),
      // 海水与波光
      h('rect', { x: '0', y: '330', width: '600', height: '170', fill: 'url(#seaGrad)' }),
      // 海浪反光
      h('ellipse', { cx: '300', cy: '370', rx: '140', ry: '8', fill: '#fed7aa', opacity: '0.7' }),
      h('ellipse', { cx: '300', cy: '410', rx: '200', ry: '10', fill: '#fde047', opacity: '0.6' }),
      h('ellipse', { cx: '300', cy: '450', rx: '250', ry: '12', fill: '#fb923c', opacity: '0.8' }),
      // 金色沙滩
      h('path', { d: 'M0,470 Q250,450 600,480 L600,600 L0,600 Z', fill: '#78350f' }),
      // 海鸥飞翔
      h('path', { d: 'M120,180 Q130,170 140,180 Q150,170 160,180', stroke: '#451a03', 'stroke-width': '3', fill: 'none' }),
      h('path', { d: 'M180,140 Q188,132 196,140 Q204,132 212,140', stroke: '#451a03', 'stroke-width': '2.5', fill: 'none' }),
      h('path', { d: 'M440,160 Q450,150 460,160 Q470,150 480,160', stroke: '#451a03', 'stroke-width': '3', fill: 'none' }),
      // 椰子树剪影
      h('path', { d: 'M60,540 Q100,400 90,260', stroke: '#1c1917', 'stroke-width': '16', fill: 'none', 'stroke-linecap': 'round' }),
      h('path', { d: 'M90,260 Q150,220 180,240', stroke: '#1c1917', 'stroke-width': '8', fill: 'none' }),
      h('path', { d: 'M90,260 Q40,210 10,240', stroke: '#1c1917', 'stroke-width': '8', fill: 'none' }),
      h('path', { d: 'M90,260 Q120,290 140,320', stroke: '#1c1917', 'stroke-width': '8', fill: 'none' }),
      // 沙滩上牵手漫步的情侣剪影
      h('circle', { cx: '280', cy: '445', r: '14', fill: '#1c1917' }),
      h('path', { d: 'M265,510 L272,460 L288,460 L295,510 Z', fill: '#1c1917' }),
      h('line', { x1: '273', y1: '510', x2: '270', y2: '545', stroke: '#1c1917', 'stroke-width': '7' }),
      h('line', { x1: '287', y1: '510', x2: '289', y2: '545', stroke: '#1c1917', 'stroke-width': '7' }),
      h('circle', { cx: '325', cy: '450', r: '12', fill: '#1c1917' }),
      h('path', { d: 'M315,465 Q305,510 300,535 L345,535 Q340,510 335,465 Z', fill: '#1c1917' }),
      h('line', { x1: '315', y1: '535', x2: '312', y2: '550', stroke: '#1c1917', 'stroke-width': '5' }),
      h('line', { x1: '330', y1: '535', x2: '332', y2: '550', stroke: '#1c1917', 'stroke-width': '5' }),
      h('path', { d: 'M285,475 Q300,485 315,475', stroke: '#1c1917', 'stroke-width': '5', fill: 'none' })
    ])
  }
})

// 2. 初雪相拥 · 围巾里共享的热咖啡
const WinterSnowIllustration = defineComponent({
  name: 'WinterSnowIllustration',
  render() {
    return h('svg', {
      viewBox: '0 0 600 600',
      class: 'w-full h-full select-none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('defs', null, [
        h('linearGradient', { id: 'snowSky', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, [
          h('stop', { offset: '0%', 'stop-color': '#1e3a8a' }),
          h('stop', { offset: '60%', 'stop-color': '#3b82f6' }),
          h('stop', { offset: '100%', 'stop-color': '#93c5fd' })
        ])
      ]),
      h('rect', { width: '600', height: '600', fill: 'url(#snowSky)' }),
      // 雪花
      h('circle', { cx: '80', cy: '100', r: '4', fill: '#ffffff', opacity: '0.85' }),
      h('circle', { cx: '150', cy: '70', r: '6', fill: '#ffffff', opacity: '0.9' }),
      h('circle', { cx: '230', cy: '130', r: '4', fill: '#ffffff', opacity: '0.8' }),
      h('circle', { cx: '320', cy: '90', r: '5', fill: '#ffffff', opacity: '0.85' }),
      h('circle', { cx: '420', cy: '120', r: '7', fill: '#ffffff', opacity: '0.9' }),
      h('circle', { cx: '510', cy: '70', r: '4.5', fill: '#ffffff', opacity: '0.8' }),
      h('circle', { cx: '110', cy: '250', r: '5', fill: '#ffffff', opacity: '0.9' }),
      h('circle', { cx: '480', cy: '220', r: '6', fill: '#ffffff', opacity: '0.85' }),
      // 松树
      h('polygon', { points: '120,440 60,490 180,490', fill: '#0f766e' }),
      h('polygon', { points: '120,400 80,445 160,445', fill: '#0d9488' }),
      h('polygon', { points: '120,360 90,405 150,405', fill: '#14b8a6' }),
      h('path', { d: 'M90,405 Q120,415 150,405 Q120,395 90,405 Z', fill: '#f8fafc' }),
      // 地面积雪
      h('path', { d: 'M0,450 Q200,420 400,460 T600,440 L600,600 L0,600 Z', fill: '#f8fafc' }),
      h('path', { d: 'M0,490 Q250,470 600,500 L600,600 L0,600 Z', fill: '#e2e8f0' }),
      // 雪人
      h('circle', { cx: '450', cy: '480', r: '35', fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': '2' }),
      h('circle', { cx: '450', cy: '430', r: '24', fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': '2' }),
      h('circle', { cx: '442', cy: '425', r: '3', fill: '#0f172a' }),
      h('circle', { cx: '458', cy: '425', r: '3', fill: '#0f172a' }),
      h('polygon', { points: '450,430 468,434 450,438', fill: '#ea580c' }),
      h('path', { d: 'M435,445 Q450,455 465,445', stroke: '#dc2626', 'stroke-width': '8', fill: 'none', 'stroke-linecap': 'round' }),
      // 相拥的情侣
      h('circle', { cx: '260', cy: '400', r: '18', fill: '#fbcfe8' }),
      h('path', { d: 'M245,395 Q260,375 275,395 Z', fill: '#1e293b' }),
      h('path', { d: 'M235,470 C235,415 285,415 285,470 Z', fill: '#1d4ed8' }),
      h('circle', { cx: '295', cy: '405', r: '16', fill: '#fbcfe8' }),
      h('path', { d: 'M282,400 Q295,380 308,400 Z', fill: '#be123c' }),
      h('path', { d: 'M275,470 C275,420 320,420 320,470 Z', fill: '#f43f5e' }),
      // 共享长围巾
      h('path', { d: 'M248,425 Q280,440 310,428', stroke: '#dc2626', 'stroke-width': '12', fill: 'none', 'stroke-linecap': 'round' }),
      // 咖啡杯
      h('rect', { x: '272', y: '455', width: '16', height: '22', rx: '3', fill: '#ffffff' }),
      h('path', { d: 'M280,450 Q283,442 280,438', stroke: '#ffffff', 'stroke-width': '2', fill: 'none', opacity: '0.8' })
    ])
  }
})

// 3. 星空露营 · 银河帐篷篝火夜话
const StarryCampIllustration = defineComponent({
  name: 'StarryCampIllustration',
  render() {
    return h('svg', {
      viewBox: '0 0 600 600',
      class: 'w-full h-full select-none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('defs', null, [
        h('linearGradient', { id: 'campNightSky', x1: '0%', y1: '0%', x2: '100%', y2: '100%' }, [
          h('stop', { offset: '0%', 'stop-color': '#09090b' }),
          h('stop', { offset: '35%', 'stop-color': '#18182f' }),
          h('stop', { offset: '70%', 'stop-color': '#311042' }),
          h('stop', { offset: '100%', 'stop-color': '#022c22' })
        ]),
        h('radialGradient', { id: 'campFireGlow', cx: '50%', cy: '50%', r: '50%' }, [
          h('stop', { offset: '0%', 'stop-color': '#f97316', 'stop-opacity': '0.9' }),
          h('stop', { offset: '50%', 'stop-color': '#eab308', 'stop-opacity': '0.4' }),
          h('stop', { offset: '100%', 'stop-color': '#ea580c', 'stop-opacity': '0' })
        ]),
        h('radialGradient', { id: 'tentGlow', cx: '50%', cy: '50%', r: '50%' }, [
          h('stop', { offset: '0%', 'stop-color': '#fef08a', 'stop-opacity': '0.95' }),
          h('stop', { offset: '100%', 'stop-color': '#f59e0b', 'stop-opacity': '0.3' })
        ])
      ]),
      // 宇宙深空背景
      h('rect', { width: '600', height: '600', fill: 'url(#campNightSky)' }),
      // 银河微光带
      h('path', { d: 'M0,0 Q300,200 600,100 L600,160 Q300,260 0,60 Z', fill: '#c084fc', opacity: '0.15' }),
      // 弯月
      h('circle', { cx: '480', cy: '110', r: '28', fill: '#fef08a' }),
      h('circle', { cx: '470', cy: '104', r: '24', fill: '#18182f' }),
      // 星星
      h('circle', { cx: '80', cy: '70', r: '2.5', fill: '#ffffff', opacity: '0.9' }),
      h('circle', { cx: '140', cy: '120', r: '3', fill: '#fef08a', opacity: '0.8' }),
      h('circle', { cx: '230', cy: '60', r: '2', fill: '#ffffff', opacity: '0.7' }),
      h('circle', { cx: '320', cy: '140', r: '2.5', fill: '#ffffff', opacity: '0.9' }),
      h('circle', { cx: '380', cy: '75', r: '3.5', fill: '#fed7aa', opacity: '0.9' }),
      h('circle', { cx: '530', cy: '180', r: '2', fill: '#ffffff', opacity: '0.8' }),
      // 流星划过
      h('line', { x1: '280', y1: '40', x2: '180', y2: '90', stroke: '#fed7aa', 'stroke-width': '2.5', 'stroke-linecap': 'round', opacity: '0.85' }),
      // 远景山峦与冷杉林剪影
      h('polygon', { points: '0,420 180,310 340,430', fill: '#0f172a', opacity: '0.9' }),
      h('polygon', { points: '240,430 420,290 600,430', fill: '#1e293b', opacity: '0.8' }),
      // 缓坡草地
      h('path', { d: 'M0,440 Q300,380 600,430 L600,600 L0,600 Z', fill: '#064e3b' }),
      h('path', { d: 'M0,480 Q250,450 600,470 L600,600 L0,600 Z', fill: '#022c22' }),
      // 暖色三角形帐篷
      h('polygon', { points: '140,360 70,500 230,500', fill: '#f59e0b' }),
      h('polygon', { points: '140,360 140,500 230,500', fill: '#d97706' }),
      h('polygon', { points: '140,410 110,500 170,500', fill: 'url(#tentGlow)' }),
      // 帐篷串灯小灯珠
      h('circle', { cx: '105', cy: '430', r: '4', fill: '#fef08a' }),
      h('circle', { cx: '125', cy: '390', r: '4', fill: '#fef08a' }),
      h('circle', { cx: '155', cy: '390', r: '4', fill: '#fef08a' }),
      h('circle', { cx: '185', cy: '430', r: '4', fill: '#fef08a' }),
      // 篝火光晕与跳跃火苗
      h('circle', { cx: '340', cy: '480', r: '65', fill: 'url(#campFireGlow)' }),
      // 柴火木头
      h('line', { x1: '315', y1: '495', x2: '365', y2: '475', stroke: '#78350f', 'stroke-width': '7', 'stroke-linecap': 'round' }),
      h('line', { x1: '320', y1: '475', x2: '360', y2: '495', stroke: '#78350f', 'stroke-width': '7', 'stroke-linecap': 'round' }),
      // 烈焰
      h('path', { d: 'M340,445 Q355,470 340,485 Q325,470 340,445 Z', fill: '#ef4444' }),
      h('path', { d: 'M340,455 Q350,475 340,485 Q330,475 340,455 Z', fill: '#fde047' }),
      // 飘散的火星
      h('circle', { cx: '335', cy: '435', r: '2.5', fill: '#fbbf24' }),
      h('circle', { cx: '348', cy: '425', r: '2', fill: '#f97316' }),
      h('circle', { cx: '338', cy: '410', r: '1.5', fill: '#fef08a' }),
      // 坐在木桩上的情侣剪影
      h('circle', { cx: '420', cy: '410', r: '15', fill: '#0f172a' }),
      h('circle', { cx: '445', cy: '418', r: '13', fill: '#0f172a' }),
      h('path', { d: 'M400,485 Q405,430 435,430 Q465,430 465,485 Z', fill: '#991b1b' }),
      h('rect', { x: '395', y: '485', width: '75', height: '14', rx: '4', fill: '#78350f' }),
      // 咖啡杯
      h('rect', { x: '426', y: '445', width: '12', height: '14', rx: '2', fill: '#f8fafc' })
    ])
  }
})

// 4. 猫咪与我们 · 暖阳午后温馨小窝
const CatAndUsIllustration = defineComponent({
  name: 'CatAndUsIllustration',
  render() {
    return h('svg', {
      viewBox: '0 0 600 600',
      class: 'w-full h-full select-none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('defs', null, [
        h('linearGradient', { id: 'roomWall', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, [
          h('stop', { offset: '0%', 'stop-color': '#fffbeb' }),
          h('stop', { offset: '100%', 'stop-color': '#fed7aa' })
        ]),
        h('linearGradient', { id: 'windowSky', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, [
          h('stop', { offset: '0%', 'stop-color': '#7dd3fc' }),
          h('stop', { offset: '100%', 'stop-color': '#e0f2fe' })
        ]),
        h('linearGradient', { id: 'sofaGrad', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, [
          h('stop', { offset: '0%', 'stop-color': '#f472b6' }),
          h('stop', { offset: '100%', 'stop-color': '#db2777' })
        ])
      ]),
      // 房间暖色墙面
      h('rect', { width: '600', height: '600', fill: 'url(#roomWall)' }),
      // 大落地窗户与窗外蓝天绿叶
      h('rect', { x: '80', y: '60', width: '440', height: '240', rx: '12', fill: 'url(#windowSky)', stroke: '#ffffff', 'stroke-width': '8' }),
      h('line', { x1: '300', y1: '60', x2: '300', y2: '300', stroke: '#ffffff', 'stroke-width': '6' }),
      // 窗外白云
      h('circle', { cx: '180', cy: '130', r: '24', fill: '#ffffff', opacity: '0.85' }),
      h('circle', { cx: '210', cy: '125', r: '32', fill: '#ffffff', opacity: '0.85' }),
      h('circle', { cx: '240', cy: '135', r: '22', fill: '#ffffff', opacity: '0.85' }),
      h('path', { d: 'M460,70 Q500,120 480,180', stroke: '#15803d', 'stroke-width': '12', fill: 'none', 'stroke-linecap': 'round', opacity: '0.7' }),
      // 阳光斜射光束
      h('polygon', { points: '80,60 260,60 520,520 200,520', fill: '#fef08a', opacity: '0.18' }),
      // 温暖木地板
      h('rect', { x: '0', y: '420', width: '600', height: '180', fill: '#d97706', opacity: '0.85' }),
      h('line', { x1: '0', y1: '480', x2: '600', y2: '480', stroke: '#b45309', 'stroke-width': '2' }),
      h('line', { x1: '0', y1: '540', x2: '600', y2: '540', stroke: '#b45309', 'stroke-width': '2' }),
      // 编织圆形地毯
      h('ellipse', { cx: '300', cy: '510', rx: '200', ry: '50', fill: '#fef3c7', stroke: '#fde68a', 'stroke-width': '4' }),
      h('ellipse', { cx: '300', cy: '510', rx: '160', ry: '38', fill: 'none', stroke: '#f59e0b', 'stroke-width': '3', 'stroke-dasharray': '6,6' }),
      // 温馨宽大软沙发
      h('rect', { x: '120', y: '290', width: '360', height: '160', rx: '28', fill: 'url(#sofaGrad)' }),
      h('rect', { x: '100', y: '340', width: '40', height: '100', rx: '16', fill: '#be185d' }),
      h('rect', { x: '460', y: '340', width: '40', height: '100', rx: '16', fill: '#be185d' }),
      // 情侣相依偎在沙发上
      h('circle', { cx: '240', cy: '255', r: '24', fill: '#fed7aa' }),
      h('path', { d: 'M215,245 Q240,225 265,245 Z', fill: '#1e293b' }),
      h('path', { d: 'M205,370 C205,290 270,290 270,370 Z', fill: '#0284c7' }),
      h('circle', { cx: '300', cy: '265', r: '22', fill: '#fed7aa' }),
      h('path', { d: 'M278,255 Q300,235 322,255 Q325,310 295,310 Z', fill: '#78350f' }),
      h('path', { d: 'M270,370 C270,300 340,300 340,370 Z', fill: '#fbcfe8' }),
      // 两人中间卧着熟睡的小橘猫
      h('ellipse', { cx: '275', cy: '365', rx: '26', ry: '18', fill: '#ea580c' }),
      h('circle', { cx: '295', cy: '360', r: '13', fill: '#ea580c' }),
      h('polygon', { points: '292,348 298,340 302,348', fill: '#c2410c' }),
      h('polygon', { points: '303,350 309,343 312,352', fill: '#c2410c' }),
      h('path', { d: 'M250,370 Q240,360 245,350', stroke: '#ea580c', 'stroke-width': '5', fill: 'none', 'stroke-linecap': 'round' }),
      h('text', { x: '305', y: '335', fill: '#f43f5e', 'font-size': '14', 'font-weight': 'bold' }, '♥'),
      // 茶几与两杯热茶
      h('ellipse', { cx: '300', cy: '480', rx: '75', ry: '20', fill: '#ffffff', stroke: '#e2e8f0', 'stroke-width': '3' }),
      h('rect', { x: '275', y: '462', width: '14', height: '18', rx: '3', fill: '#38bdf8' }),
      h('rect', { x: '308', y: '462', width: '14', height: '18', rx: '3', fill: '#fb7185' })
    ])
  }
})

// 4 套画作清单
const presets = [
  {
    id: 'preset-sunset',
    name: '日落海滩',
    emoji: '🌅',
    title: '《日落海滩 · 晚风踏浪双人行》',
    desc: '夕阳把天际染成蜜桃橘，海浪每一次拍打，都是心跳的回音。',
    component: SunsetBeachIllustration
  },
  {
    id: 'preset-snow',
    name: '初雪相拥',
    emoji: '❄️',
    title: '《初雪相拥 · 围巾里共享的热咖啡》',
    desc: '大雪纷飞的冬日街角，同一条红围巾里，藏着一整个季节的温暖。',
    component: WinterSnowIllustration
  },
  {
    id: 'preset-camp',
    name: '星空露营',
    emoji: '⛺',
    title: '《星空露营 · 银河帐篷篝火夜话》',
    desc: '远离城市霓虹，我们在篝火旁数流星，全世界只剩下我们的声音。',
    component: StarryCampIllustration
  },
  {
    id: 'preset-cat',
    name: '猫咪与我们',
    emoji: '🐱',
    title: '《猫咪与我们 · 暖阳午后温馨小窝》',
    desc: '微风、暖阳、赖在怀里打呼噜的猫咪，还有最爱的你。',
    component: CatAndUsIllustration
  }
]

// 响应式状态
const selectedPresetIdx = ref(0)
const customImage = ref(null)
const gridSize = ref(3)

const tiles = ref([])
const selectedPosIndex = ref(null)
const moveSteps = ref(0)
const isSolved = ref(false)
const showNumbers = ref(false)
const showPreview = ref(false)
const showSuccessModal = ref(false)

// 原图对照浮层
const showGhostOverlay = ref(false)
const ghostOpacity = ref(0.4)

// 计时器相关
const timerSeconds = ref(0)
let timerInterval = null

const formattedTime = computed(() => {
  const m = Math.floor(timerSeconds.value / 60).toString().padStart(2, '0')
  const s = (timerSeconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const totalTiles = computed(() => gridSize.value * gridSize.value)

const currentPresetComponent = computed(() => {
  return presets[selectedPresetIdx.value].component
})

const correctTilesCount = computed(() => {
  return tiles.value.filter((tile, pos) => tile.originalPos === pos).length
})

function getTileInnerStyle(tile) {
  const size = gridSize.value
  const col = tile.originalPos % size
  const row = Math.floor(tile.originalPos / size)
  return {
    width: `${size * 100}%`,
    height: `${size * 100}%`,
    left: `${-col * 100}%`,
    top: `${-row * 100}%`
  }
}

function startTimer() {
  stopTimer()
  timerSeconds.value = 0
  timerInterval = setInterval(() => {
    if (!isSolved.value) {
      timerSeconds.value++
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function changeGridSize(size) {
  if (gridSize.value === size) return
  gridSize.value = size
  initTiles()
}

function initTiles() {
  const list = []
  const count = totalTiles.value
  for (let i = 0; i < count; i++) {
    list.push({
      id: i,
      originalPos: i
    })
  }
  tiles.value = list
  shufflePuzzle()
}

// 打乱拼图（确保充分洗牌且不处于完全还原态）
function shufflePuzzle() {
  isSolved.value = false
  selectedPosIndex.value = null
  moveSteps.value = 0
  showSuccessModal.value = false
  startTimer()

  const list = [...tiles.value]
  const count = totalTiles.value
  for (let attempts = 0; attempts < 15; attempts++) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = list[i]
      list[i] = list[j]
      list[j] = temp
    }
    const matchCount = list.filter((t, idx) => t.originalPos === idx).length
    if (matchCount < Math.floor(count / 2)) break
  }
  tiles.value = list
}

function selectPreset(idx) {
  selectedPresetIdx.value = idx
  customImage.value = null
  shufflePuzzle()
}

function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    customImage.value = event.target.result
    shufflePuzzle()
  }
  reader.readAsDataURL(file)
}

function toggleGhostOverlay() {
  showGhostOverlay.value = !showGhostOverlay.value
}

// 点击碎片交互：点击第1块选中，点击第2块交换
function handleTileClick(posIndex) {
  if (isSolved.value) return

  if (selectedPosIndex.value === null) {
    selectedPosIndex.value = posIndex
  } else if (selectedPosIndex.value === posIndex) {
    selectedPosIndex.value = null
  } else {
    swapTiles(selectedPosIndex.value, posIndex)
    selectedPosIndex.value = null
    moveSteps.value += 1
    checkSolved()
  }
}

function swapTiles(i, j) {
  const temp = tiles.value[i]
  tiles.value[i] = tiles.value[j]
  tiles.value[j] = temp
}

// 辅助归位一块碎片
function autoSolveOne() {
  for (let i = 0; i < tiles.value.length; i++) {
    if (tiles.value[i].originalPos !== i) {
      const targetPos = tiles.value.findIndex(t => t.originalPos === i)
      if (targetPos !== -1) {
        swapTiles(i, targetPos)
        moveSteps.value += 1
        checkSolved()
        break
      }
    }
  }
}

function checkSolved() {
  const allCorrect = tiles.value.every((tile, pos) => tile.originalPos === pos)
  if (allCorrect) {
    isSolved.value = true
    stopTimer()
    showSuccessModal.value = true
    triggerFullHeartFireworks()

    // 发放恋爱树奖励
    recordGameReward('memory-puzzle', { 
      water: 4, 
      sun: 2, 
      exp: 25, 
      radarCategory: '共同记忆' 
    })
  }
}

// 绽放全屏爱心烟花特效
function triggerFullHeartFireworks() {
  // 中央爱心爆破
  confetti({
    particleCount: 75,
    spread: 360,
    origin: { x: 0.5, y: 0.5 },
    scalar: 1.4,
    shapes: ['heart'],
    colors: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#ec4899', '#f59e0b']
  })

  // 左右两侧爱心加农炮
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 65,
      origin: { x: 0.1, y: 0.65 },
      scalar: 1.3,
      shapes: ['heart'],
      colors: ['#e11d48', '#ff758f', '#fbbf24', '#f43f5e']
    })
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.65 },
      scalar: 1.3,
      shapes: ['heart'],
      colors: ['#e11d48', '#ff758f', '#fbbf24', '#f43f5e']
    })
  }, 250)
}

function onFinish() {
  showSuccessModal.value = false
  emit('back')
}

onMounted(() => {
  initTiles()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
