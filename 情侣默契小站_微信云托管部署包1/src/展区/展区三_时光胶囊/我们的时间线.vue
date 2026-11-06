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
            <span>🎞️ 我们的时间线</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-amber-800/60 text-amber-300 font-normal">时序排列</span>
          </h2>
          <p class="text-[11px] text-amber-300/70 hidden sm:block">把打乱的恋爱里程碑碎片，重新梳理出最初的相爱轨迹</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[10px] text-amber-300/80">记忆通关奖励</div>
          <div class="text-xs font-bold text-amber-300 flex items-center gap-1.5 justify-end">
            <span>💧+3</span>
            <span>☀️+2</span>
            <span>🌱+20</span>
          </div>
        </div>
        <button 
          @click="resetGame" 
          class="p-2 rounded-xl bg-amber-900/50 hover:bg-amber-800/80 text-amber-200 border border-amber-700/40 transition-transform active:rotate-180 duration-300"
          title="重新打乱"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 恋爱纪念日倒计时 / 已恋爱天数展示看板 -->
    <div class="relative bg-gradient-to-r from-amber-900/90 via-stone-900/95 to-rose-950/90 p-4 sm:p-5 rounded-3xl shadow-xl border-2 border-amber-700/50 text-amber-100 overflow-hidden">
      <!-- 复古光晕装饰 -->
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- 左侧：相伴天数 -->
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-2xl shadow-md shrink-0">
            ⏳
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-amber-300/90 font-medium">相恋纪念日历程</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-800/70 text-amber-200 font-mono">
                {{ anniversaryDate }} 起
              </span>
            </div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-xs text-stone-300">我们已经执手相伴了</span>
              <span class="text-2xl sm:text-3xl font-black text-rose-300 font-mono tracking-tight px-1">{{ daysTogether }}</span>
              <span class="text-xs text-stone-300">天</span>
            </div>
          </div>
        </div>

        <!-- 中间分割与倒计时 -->
        <div class="flex items-center gap-4 bg-stone-950/60 px-4 py-2.5 rounded-2xl border border-amber-800/40">
          <div class="text-center">
            <div class="text-[10px] text-amber-400/80">距离下个周年纪念日</div>
            <div class="text-base sm:text-lg font-black text-amber-200 font-mono mt-0.5 flex items-center justify-center gap-1">
              <span>{{ daysUntilNextAnniversary }}</span>
              <span class="text-[11px] font-normal text-amber-300/80">天</span>
            </div>
          </div>
          <div class="w-px h-7 bg-amber-800/50"></div>
          <button 
            @click="showEditDateModal = true"
            class="text-[11px] px-2.5 py-1.5 rounded-xl bg-amber-800/50 hover:bg-amber-700 text-amber-200 transition-colors font-medium border border-amber-600/40 flex items-center gap-1"
          >
            <Calendar class="w-3.5 h-3.5" />
            <span>自定日期</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 关卡剧本选择与操作提示 -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-stone-100/90 p-3 sm:p-4 rounded-2xl border border-stone-200">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-bold text-stone-600">📜 故事篇章：</span>
        <div class="flex gap-1.5 flex-wrap">
          <button 
            v-for="(chap, idx) in chapters" 
            :key="chap.id"
            @click="switchChapter(idx)"
            class="px-3 py-1.5 text-xs rounded-xl transition-all font-medium"
            :class="currentChapIndex === idx ? 'bg-amber-700 text-white shadow-sm ring-2 ring-amber-300' : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'"
          >
            {{ chap.title }}
          </button>
        </div>
      </div>

      <div class="text-xs text-stone-500 flex items-center gap-2">
        <span>💡 排序捷径：</span>
        <span class="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[10px] font-bold">🔝 置顶</span>
        <span class="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[10px] font-bold">↑ 上移</span>
        <span class="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[10px] font-bold">↓ 下移</span>
        <span class="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[10px] font-bold">🔻 置底</span>
      </div>
    </div>

    <!-- 胶片复古画廊工作区 -->
    <div class="relative bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 p-4 sm:p-6 rounded-3xl shadow-2xl border-4 border-stone-800">
      <!-- 胶片打孔边缘条纹效果（顶部） -->
      <div class="flex justify-between items-center px-2 py-1 mb-4 border-b border-stone-700/60 overflow-hidden">
        <div class="flex gap-2.5">
          <span v-for="i in 18" :key="'hole-top-'+i" class="w-3.5 h-2.5 rounded-sm bg-stone-950 border border-stone-700"></span>
        </div>
        <div class="text-[10px] tracking-widest text-amber-500/80 font-mono font-bold">KODAK LOVE 400 - ROMANCE FILM</div>
      </div>

      <!-- 时间线引导中轴线 -->
      <div class="relative">
        <div class="absolute left-6 sm:left-8 top-3 bottom-3 w-0.5 bg-dashed-line pointer-events-none hidden sm:block"></div>

        <!-- 列表容器：支持拖拽与平滑移动 -->
        <transition-group 
          name="milestone-list" 
          tag="div" 
          class="space-y-3 sm:space-y-4"
        >
          <div 
            v-for="(item, index) in currentItems" 
            :key="item.id"
            draggable="true"
            @dragstart="onDragStart(index, $event)"
            @dragover.prevent="onDragOver(index)"
            @drop="onDrop(index)"
            @dragend="onDragEnd"
            class="relative group rounded-2xl transition-all duration-200 cursor-grab active:cursor-grabbing select-none"
            :class="[
              dragOverIndex === index ? 'ring-2 ring-amber-400 scale-[1.01]' : '',
              isSubmitted && isItemCorrect(index) ? 'bg-amber-950/40 border border-emerald-500/50 shadow-emerald-900/20' : '',
              isSubmitted && !isItemCorrect(index) ? 'bg-amber-950/40 border border-rose-500/50 shadow-rose-900/20' : '',
              !isSubmitted ? 'bg-stone-800/90 border border-stone-700/80 hover:border-amber-600/70' : ''
            ]"
          >
            <div class="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
              <!-- 左侧：序号与胶片时间戳 -->
              <div class="flex items-center gap-3 sm:gap-4 shrink-0">
                <!-- 序号徽章 -->
                <div 
                  class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-xs sm:text-sm shadow-md transition-colors"
                  :class="[
                    isSubmitted && isItemCorrect(index) 
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                      : (isSubmitted && !isItemCorrect(index) 
                          ? 'bg-rose-600 text-white shadow-rose-600/30' 
                          : 'bg-stone-700 text-amber-300 group-hover:bg-amber-700 group-hover:text-white')
                  ]"
                >
                  <span class="text-[8px] opacity-70">POS</span>
                  <span>0{{ index + 1 }}</span>
                </div>

                <!-- 拍立得照片风格封面图标 -->
                <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-100/10 border border-amber-500/20 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0">
                  {{ item.icon }}
                </div>
              </div>

              <!-- 中间：回忆内容详情 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-sm sm:text-base font-bold text-amber-100 tracking-wide">
                    {{ item.title }}
                  </h3>
                  <!-- 提交后展示真实日期戳 -->
                  <span 
                    v-if="isSubmitted" 
                    class="text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold transition-all duration-500"
                    :class="isItemCorrect(index) ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'"
                  >
                    真实时间：{{ item.realDate }}
                  </span>
                  <span 
                    v-else 
                    class="text-[10px] text-amber-400/60 font-mono tracking-wider"
                  >
                    #时光胶囊碎片
                  </span>
                </div>
                <p class="text-xs text-stone-300/80 mt-1 line-clamp-2 leading-relaxed">
                  {{ item.desc }}
                </p>
                <div class="mt-1.5 flex items-center gap-2 text-[11px] text-amber-300/60 italic">
                  <span>💭 心动细节：</span>
                  <span>{{ item.clue }}</span>
                </div>
              </div>

              <!-- 右侧：上移/下移/置顶/置底 快捷控制器（适配手机触控） -->
              <div class="grid grid-cols-2 sm:flex sm:flex-col items-center gap-1 shrink-0">
                <!-- 置顶快捷键 -->
                <button 
                  @click.stop="moveToTop(index)" 
                  :disabled="index === 0"
                  class="p-1.5 rounded-lg bg-stone-700/80 hover:bg-amber-600 text-amber-200 hover:text-white disabled:opacity-20 disabled:hover:bg-stone-700/80 transition-colors text-[10px] font-bold"
                  title="快速置顶"
                >
                  🔝
                </button>
                <!-- 上移一位 -->
                <button 
                  @click.stop="moveItem(index, -1)" 
                  :disabled="index === 0"
                  class="p-1.5 sm:p-2 rounded-lg bg-stone-700/80 hover:bg-amber-600 text-amber-200 hover:text-white disabled:opacity-20 disabled:hover:bg-stone-700/80 transition-colors"
                  title="上移一位"
                >
                  <ArrowUp class="w-3.5 h-3.5" />
                </button>
                <!-- 下移一位 -->
                <button 
                  @click.stop="moveItem(index, 1)" 
                  :disabled="index === currentItems.length - 1"
                  class="p-1.5 sm:p-2 rounded-lg bg-stone-700/80 hover:bg-amber-600 text-amber-200 hover:text-white disabled:opacity-20 disabled:hover:bg-stone-700/80 transition-colors"
                  title="下移一位"
                >
                  <ArrowDown class="w-3.5 h-3.5" />
                </button>
                <!-- 置底快捷键 -->
                <button 
                  @click.stop="moveToBottom(index)" 
                  :disabled="index === currentItems.length - 1"
                  class="p-1.5 rounded-lg bg-stone-700/80 hover:bg-amber-600 text-amber-200 hover:text-white disabled:opacity-20 disabled:hover:bg-stone-700/80 transition-colors text-[10px] font-bold"
                  title="快速置底"
                >
                  🔻
                </button>
              </div>
            </div>

            <!-- 校验反馈标签胶带 -->
            <div 
              v-if="isSubmitted"
              class="px-4 py-1.5 text-xs flex items-center justify-between rounded-b-2xl border-t font-medium"
              :class="isItemCorrect(index) ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700/30' : 'bg-rose-900/30 text-rose-300 border-rose-700/30'"
            >
              <span class="flex items-center gap-1.5">
                <Check v-if="isItemCorrect(index)" class="w-3.5 h-3.5 text-emerald-400" />
                <span v-else>⚠️</span>
                <span>{{ isItemCorrect(index) ? '记忆顺序完全吻合！' : '这个故事似乎发生得更早/更晚一些哦~' }}</span>
              </span>
              <span class="text-[11px] opacity-75">正确顺位：第 0{{ getCorrectRank(item.id) }} 位</span>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- 胶片打孔边缘条纹效果（底部） -->
      <div class="flex justify-between items-center px-2 py-1 mt-6 border-t border-stone-700/60 overflow-hidden">
        <div class="flex gap-2.5">
          <span v-for="i in 18" :key="'hole-bottom-'+i" class="w-3.5 h-2.5 rounded-sm bg-stone-950 border border-stone-700"></span>
        </div>
        <div class="text-[10px] tracking-widest text-amber-500/80 font-mono">FRAME 01 - 06 MEMORY</div>
      </div>

      <!-- 底部控制与校验操作栏 -->
      <div class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-800">
        <div class="flex items-center gap-3 text-xs text-amber-300/80">
          <div class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>已排序项：{{ currentItems.length }} 处</span>
          </div>
          <span>•</span>
          <div>当前篇章：{{ chapters[currentChapIndex].title }}</div>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button 
            @click="shuffleItems"
            class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
          >
            随机打乱
          </button>
          <button 
            @click="checkTimeline"
            :disabled="isSubmitted && accuracy === 100"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles class="w-4 h-4 text-stone-950" />
            <span>{{ isSubmitted && accuracy === 100 ? '已完美封存回忆 ✨' : '校验时间线时序' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 通关与唯美【恋爱年鉴复古手账卡片】弹窗 -->
    <div 
      v-if="showResultModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 animate-fade-in overflow-y-auto"
    >
      <div class="w-full max-w-xl bg-stone-900 border-2 border-amber-600/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-amber-100 my-8">
        <!-- 装饰光圈 -->
        <div class="absolute -top-16 -left-16 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-16 -right-16 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 text-center">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 mb-3 animate-bounce">
            {{ accuracy === 100 ? '📖' : '💌' }}
          </div>

          <h3 class="text-xl sm:text-2xl font-black text-amber-100">
            {{ accuracy === 100 ? '心有灵犀 · 时光年鉴完美封存！' : '时光卷轴 · 记忆拼图还差一点点' }}
          </h3>
          <p class="text-xs text-amber-300/80 mt-1">
            {{ accuracy === 100 ? '无论岁月如何流转，每一个微小而炽热的心动瞬间，都分毫不差地镌刻在心底。' : '有些回忆发生得太美妙，时间仿佛悄悄倒流了～' }}
          </p>

          <!-- 准确度指示条 -->
          <div class="my-4 p-3.5 rounded-2xl bg-stone-950/70 border border-amber-700/40">
            <div class="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>时序精准度</span>
              <span class="font-bold text-amber-300 font-mono text-base">{{ accuracy }}%</span>
            </div>
            <div class="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden p-0.5">
              <div 
                class="h-full rounded-full transition-all duration-700"
                :class="accuracy === 100 ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'"
                :style="{ width: `${accuracy}%` }"
              ></div>
            </div>
            <div class="mt-2.5 flex items-center justify-center gap-4 text-xs">
              <span class="text-emerald-400 font-medium">✓ 正确位置: {{ correctCount }} 处</span>
              <span class="text-rose-400 font-medium">✕ 偏差位置: {{ currentItems.length - correctCount }} 处</span>
            </div>
          </div>

          <!-- 全部正确时展示：唯美《恋爱年鉴复古手账卡片》 -->
          <div 
            v-if="accuracy === 100" 
            class="my-4 p-5 rounded-2xl bg-amber-50 text-stone-800 border-2 border-amber-300 shadow-xl relative text-left"
          >
            <!-- 和纸胶带装饰角 -->
            <div class="absolute -top-3 left-6 w-20 h-5 bg-rose-200/90 border border-rose-300 rotate-2 text-[9px] text-rose-800 font-mono text-center shadow-xs">
              SCRAPBOOK
            </div>
            <div class="absolute -bottom-2 right-6 w-24 h-5 bg-amber-200/90 border border-amber-300 -rotate-1 text-[9px] text-amber-800 font-mono text-center shadow-xs">
              ROMANCE ARCHIVE
            </div>

            <!-- 复古邮戳火漆印章 -->
            <div class="absolute top-3 right-4 w-14 h-14 rounded-full border-2 border-dashed border-rose-400 text-rose-600 flex flex-col items-center justify-center font-mono text-[8px] rotate-12 pointer-events-none opacity-80">
              <span class="font-bold">CERTIFIED</span>
              <span>TIMELESS</span>
              <span>2026</span>
            </div>

            <div class="border-b border-amber-200/80 pb-2 mb-3">
              <div class="text-[10px] text-amber-800 font-mono uppercase tracking-widest">Couples Love Chronicle</div>
              <h4 class="text-base font-bold text-amber-950 font-serif">
                《恋爱年鉴 · {{ chapters[currentChapIndex].title }}》
              </h4>
              <p class="text-[11px] text-stone-500 mt-0.5">
                记录于执手相伴第 {{ daysTogether }} 天 · 纪念日全时序认证
              </p>
            </div>

            <!-- 正确时间轴流水清单 -->
            <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
              <div 
                v-for="(itm, i) in currentItems" 
                :key="'card-'+itm.id"
                class="flex items-start gap-2.5 text-xs bg-white/80 p-2 rounded-xl border border-amber-100"
              >
                <span class="font-mono font-bold text-amber-700 shrink-0 text-[11px] mt-0.5">0{{ i + 1 }}.</span>
                <span class="text-base shrink-0">{{ itm.icon }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-bold text-stone-800 truncate">{{ itm.title }}</span>
                    <span class="text-[10px] text-stone-500 font-mono shrink-0">{{ itm.realDate }}</span>
                  </div>
                  <p class="text-[11px] text-stone-600 line-clamp-1 mt-0.5">{{ itm.desc }}</p>
                </div>
              </div>
            </div>

            <!-- 同步至恋爱树档案按钮 -->
            <div class="mt-4 pt-3 border-t border-amber-200/70 flex items-center justify-between gap-2">
              <span class="text-[11px] text-stone-500">
                {{ hasSyncedMemory ? '✨ 已收录至恋爱树档案' : '💌 可将这卷年鉴手账收录至恋爱树' }}
              </span>
              <button 
                @click="syncToLoveTreeArchive"
                :disabled="hasSyncedMemory"
                class="px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                :class="hasSyncedMemory ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white'"
              >
                <Bookmark class="w-3.5 h-3.5" />
                <span>{{ hasSyncedMemory ? '✓ 已同步至档案' : '保存并同步至恋爱树' }}</span>
              </button>
            </div>
          </div>

          <!-- 弹窗按钮组 -->
          <div class="flex gap-3 mt-4">
            <button 
              @click="showResultModal = false" 
              class="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
            >
              返回检查排布
            </button>
            <button 
              v-if="accuracy === 100"
              @click="onFinishAll"
              class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 font-bold text-xs shadow-md transition-transform active:scale-95"
            >
              完成并返回展厅
            </button>
            <button 
              v-else
              @click="reAttempt"
              class="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
            >
              继续调整顺序
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义恋爱纪念日弹窗 -->
    <div 
      v-if="showEditDateModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="w-full max-w-sm bg-stone-900 border border-amber-600/80 rounded-3xl p-5 shadow-2xl text-amber-100">
        <h3 class="text-base font-bold text-amber-100 mb-1 flex items-center gap-1.5">
          <Calendar class="w-4 h-4 text-amber-400" />
          <span>设定你们的相爱起始日</span>
        </h3>
        <p class="text-xs text-amber-300/70 mb-4">设定后将精准换算你们相恋已过的每一天与下个周年倒计时。</p>

        <div>
          <label class="block text-xs font-medium text-amber-300 mb-1">起始纪念日：</label>
          <input 
            type="date" 
            v-model="tempAnniversaryDate" 
            class="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-amber-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500" 
          />
        </div>

        <div class="flex gap-2.5 mt-5">
          <button 
            @click="showEditDateModal = false" 
            class="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium"
          >
            取消
          </button>
          <button 
            @click="saveAnniversaryDate" 
            class="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
          >
            保存生效
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, ArrowUp, ArrowDown, RotateCcw, Sparkles, Check, Calendar, Bookmark } from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import { recordGameReward, appState } from '@/状态/恋爱树状态.js'

const emit = defineEmits(['back'])

// 恋爱纪念日看板状态
const anniversaryDate = ref(localStorage.getItem('couples_anniversary_date') || '2024-03-14')
const showEditDateModal = ref(false)
const tempAnniversaryDate = ref(anniversaryDate.value)
const hasSyncedMemory = ref(false)

const daysTogether = computed(() => {
  try {
    const start = new Date(anniversaryDate.value)
    const now = new Date()
    const diff = now - start
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)))
  } catch (e) {
    return 365
  }
})

const daysUntilNextAnniversary = computed(() => {
  try {
    const now = new Date()
    const parts = anniversaryDate.value.split('-').map(Number)
    if (parts.length !== 3) return 30
    const [_, month, day] = parts
    let next = new Date(now.getFullYear(), month - 1, day)
    if (next < now) {
      next = new Date(now.getFullYear() + 1, month - 1, day)
    }
    const diff = next - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  } catch (e) {
    return 30
  }
})

function saveAnniversaryDate() {
  if (tempAnniversaryDate.value) {
    anniversaryDate.value = tempAnniversaryDate.value
    localStorage.setItem('couples_anniversary_date', tempAnniversaryDate.value)
  }
  showEditDateModal.value = false
}

// 关卡数据库：预设两套动人的恋爱真实故事章节
const chapters = [
  {
    id: 'chap-1',
    title: '第一卷：从心动到相知',
    items: [
      {
        id: 1,
        realRank: 1,
        realDate: '2024.03.14 15:30',
        title: '转角咖啡馆初相遇',
        icon: '☕',
        desc: '窗外微风不燥，你点了一杯燕麦拿铁，抬头对视时空气忽然很安静。',
        clue: '草莓芝士蛋糕上的小樱桃'
      },
      {
        id: 2,
        realRank: 2,
        realDate: '2024.04.05 23:40',
        title: '畅聊一整夜舍不得说晚安',
        icon: '🌙',
        desc: '从喜欢的黑胶唱片聊到小时候摔进泥巴坑的糗事，不知不觉天光微亮。',
        clue: '手机电量充了两次都不够'
      },
      {
        id: 3,
        realRank: 3,
        realDate: '2024.05.20 19:20',
        title: '落日晚风里的深情告白',
        icon: '🌅',
        desc: '海堤边的黄昏被染成了橘粉色，那句“让我照顾你好不好”融化在潮汐声里。',
        clue: '手心里都是紧张的微汗'
      },
      {
        id: 4,
        realRank: 4,
        realDate: '2024.08.15 14:00',
        title: '第一次双人背包短途旅行',
        icon: '🎒',
        desc: '在老城的石板巷子迷路，却偶遇了全城最好吃的柠檬手工意式冰淇淋。',
        clue: '互相给对方的鼻子抹了一口奶油'
      },
      {
        id: 5,
        realRank: 5,
        realDate: '2024.11.11 20:30',
        title: '第一次笨拙却甜蜜地下厨',
        icon: '🍳',
        desc: '煎糊了一半的溏心蛋和煲得浓浓的番茄牛腩，你在旁边大笑着拍照发朋友圈。',
        clue: '围裙系带系成了死结'
      },
      {
        id: 6,
        realRank: 6,
        realDate: '2025.01.01 00:00',
        title: '零点钟声里的跨年拥抱',
        icon: '🎆',
        desc: '漫天烟花在头顶绽开，你在我耳边许愿：“明年、后年，以后的每一年都要在一起”。',
        clue: '围在同一条毛茸茸的红色围巾里'
      }
    ]
  },
  {
    id: 'chap-2',
    title: '第二卷：日常里的满分甜意',
    items: [
      {
        id: 101,
        realRank: 1,
        realDate: '2024.06.01 10:00',
        title: '儿童节为你准备的幼稚惊喜',
        icon: '🎈',
        desc: '藏在后备箱里的巨型草莓熊玩偶，把你宠回三岁小孩的灿烂模样。',
        clue: '彩色氢气球飘满了车顶'
      },
      {
        id: 102,
        realRank: 2,
        realDate: '2024.07.20 17:15',
        title: '暴雨天共撑一把小红伞',
        icon: '🌧️',
        desc: '外面的雨倾盆而下，一把伞两人撑，你的肩膀干爽，我的右肩湿透了一大半。',
        clue: '伞面总是悄悄向你那边倾斜'
      },
      {
        id: 103,
        realRank: 3,
        realDate: '2024.09.10 21:00',
        title: '生病时的深夜暖胃小米粥',
        icon: '🥣',
        desc: '发烧无精打采，你匆匆赶来煮了一锅温热的粥，守在床边摸着我的额头量体温。',
        clue: '冰凉退热贴上的薄荷味'
      },
      {
        id: 104,
        realRank: 4,
        realDate: '2024.10.03 16:45',
        title: '一起去森林公园露营看日落',
        icon: '⛺',
        desc: '搭好折叠椅，冲一杯手冲咖啡，耳机一人一只，听着同一首老歌看夕阳西下。',
        clue: '卡式炉上滋滋作响的热烤棉花糖'
      },
      {
        id: 105,
        realRank: 5,
        realDate: '2024.12.24 19:30',
        title: '平安夜悄悄准备的互换礼物',
        icon: '🎁',
        desc: '没有提前商量，却奇迹般地给对方买了同款不同色的保暖手套，默契拉满。',
        clue: '包装纸上系着同样的金色缎带'
      }
    ]
  }
]

const currentChapIndex = ref(0)
const currentItems = ref([])
const isSubmitted = ref(false)
const showResultModal = ref(false)
const accuracy = ref(0)
const correctCount = ref(0)
const isFirstClear = ref(false)

// 拖拽控制
const dragStartIndex = ref(null)
const dragOverIndex = ref(null)

function initChapter(chapIndex) {
  currentChapIndex.value = chapIndex
  const orig = chapters[chapIndex].items
  hasSyncedMemory.value = false
  shuffleArray(orig)
  isSubmitted.value = false
  showResultModal.value = false
  accuracy.value = 0
}

function shuffleArray(list) {
  const arr = JSON.parse(JSON.stringify(list))
  let shuffled = arr
  let attempts = 0
  do {
    shuffled = arr.map(value => ({ value, sort: Math.random() }))
                  .sort((a, b) => a.sort - b.sort)
                  .map(({ value }) => value)
    attempts++
  } while (attempts < 5 && isArrayInOrder(shuffled))
  currentItems.value = shuffled
}

function isArrayInOrder(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i].realRank > arr[i + 1].realRank) return false
  }
  return true
}

function switchChapter(idx) {
  initChapter(idx)
}

function shuffleItems() {
  shuffleArray(chapters[currentChapIndex.value].items)
  isSubmitted.value = false
}

function resetGame() {
  initChapter(currentChapIndex.value)
}

// 上下微调与置顶置底快捷操作
function moveItem(index, offset) {
  const newIndex = index + offset
  if (newIndex < 0 || newIndex >= currentItems.value.length) return
  const temp = currentItems.value[index]
  currentItems.value[index] = currentItems.value[newIndex]
  currentItems.value[newIndex] = temp
  isSubmitted.value = false
}

function moveToTop(index) {
  if (index === 0) return
  const item = currentItems.value.splice(index, 1)[0]
  currentItems.value.unshift(item)
  isSubmitted.value = false
}

function moveToBottom(index) {
  if (index === currentItems.value.length - 1) return
  const item = currentItems.value.splice(index, 1)[0]
  currentItems.value.push(item)
  isSubmitted.value = false
}

// HTML5 拖拽事件处理
function onDragStart(index, event) {
  dragStartIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index)
  }
}

function onDragOver(index) {
  dragOverIndex.value = index
}

function onDrop(index) {
  if (dragStartIndex.value === null || dragStartIndex.value === index) return
  const item = currentItems.value.splice(dragStartIndex.value, 1)[0]
  currentItems.value.splice(index, 0, item)
  isSubmitted.value = false
  dragStartIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  dragStartIndex.value = null
  dragOverIndex.value = null
}

function getCorrectRank(itemId) {
  const found = chapters[currentChapIndex.value].items.find(x => x.id === itemId)
  return found ? found.realRank : 1
}

function isItemCorrect(index) {
  const item = currentItems.value[index]
  return item && item.realRank === index + 1
}

function checkTimeline() {
  isSubmitted.value = true
  let correct = 0
  const total = currentItems.value.length

  currentItems.value.forEach((item, idx) => {
    if (item.realRank === idx + 1) {
      correct++
    }
  })

  correctCount.value = correct
  accuracy.value = Math.round((correct / total) * 100)
  showResultModal.value = true

  if (accuracy.value === 100) {
    triggerConfetti()
    
    if (!appState.gameRecords['timeline']) {
      isFirstClear.value = true
    }
    recordGameReward('timeline', { 
      water: 3, 
      sun: 2, 
      exp: 20, 
      radarCategory: '共同记忆' 
    })
  }
}

// 同步至恋爱树档案
function syncToLoveTreeArchive() {
  if (hasSyncedMemory.value) return
  const chapTitle = chapters[currentChapIndex.value].title
  appState.loveTree.unlockedMemories.push({
    id: Date.now(),
    title: `《恋爱年鉴 · ${chapTitle}》`,
    date: new Date().toISOString().split('T')[0],
    note: `【时间线全部归位】通过了 ${currentItems.value.length} 个珍贵记忆时序校验，共同谱写浪漫恋爱年鉴！`
  })
  hasSyncedMemory.value = true
  confetti({
    particleCount: 40,
    spread: 50,
    origin: { y: 0.7 }
  })
}

function triggerConfetti() {
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.6 }
  })
}

function reAttempt() {
  showResultModal.value = false
}

function onFinishAll() {
  showResultModal.value = false
  emit('back')
}

onMounted(() => {
  initChapter(0)
})
</script>

<style scoped>
.bg-dashed-line {
  background-image: linear-gradient(to bottom, #d97706 40%, rgba(255, 255, 255, 0) 0%);
  background-position: left;
  background-size: 2px 10px;
  background-repeat: repeat-y;
}

.milestone-list-move,
.milestone-list-enter-active,
.milestone-list-leave-active {
  transition: all 0.3s ease;
}

.milestone-list-enter-from,
.milestone-list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
</style>
