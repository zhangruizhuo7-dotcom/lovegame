<template>
  <div class="space-y-6">
    <!-- 顶部状态栏与模式切换 -->
    <div class="glass-card rounded-3xl p-5 border-2 border-emerald-100 shadow-sm bg-white/90">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- 标题与图标 -->
        <div class="flex items-center gap-3">
          <button 
            @click="$emit('back')"
            class="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 flex items-center justify-center text-slate-600 hover:text-emerald-600 shadow-xs transition-all hover:scale-105 active:scale-95"
            title="返回展区四"
          >
            ←
          </button>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-2xl">🎨</span>
              <h2 class="text-lg sm:text-xl font-extrabold text-slate-800">情侣画板 · 你画我猜</h2>
              <span class="text-xs bg-gradient-to-r from-emerald-100 to-rose-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                50+专属私密词库 · 壁纸生成
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              一人执笔勾勒私密默契与情侣表情戳，一人脑洞大开实时猜词，支持智能错字容错！
            </p>
          </div>
        </div>

        <!-- 角色切换 Tab -->
        <div class="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto shadow-2xs">
          <button
            @click="setRole('drawer')"
            :class="role === 'drawer' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            class="px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5"
          >
            <span>👨‍🎨</span>
            <span>我是画手</span>
          </button>
          <button
            @click="setRole('guesser')"
            :class="role === 'guesser' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            class="px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5"
          >
            <span>🕵️‍♂️</span>
            <span>我是猜词手</span>
          </button>
          <button
            @click="setRole('free')"
            :class="role === 'free' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            class="px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5"
          >
            <span>👫</span>
            <span>自由共绘</span>
          </button>
        </div>
      </div>

      <!-- 游戏专属词汇抽词区 (根据角色差异展示) -->
      <div class="mt-4 pt-4 border-t border-emerald-50">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-rose-50/60 rounded-2xl p-3.5 border border-emerald-100">
          <!-- 词条状态 -->
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center text-xl font-bold shadow-2xs border border-emerald-100">
              {{ currentCategory.icon }}
            </span>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-bold text-emerald-800 bg-white/90 px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                  {{ currentCategory.name }}
                </span>
                <span class="text-xs text-slate-500">
                  字数：{{ currentWord.length }} 个字
                </span>
                <span class="text-[11px] text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  词库总量: {{ totalWordCount }}+
                </span>
              </div>
              
              <!-- 画手看得到明文；猜词手看到星号或提示字 -->
              <div class="mt-1 flex items-center gap-2">
                <template v-if="role === 'drawer' || role === 'free'">
                  <span class="text-base sm:text-lg font-black text-emerald-950 tracking-wider">
                    {{ currentWord }}
                  </span>
                  <span class="text-[11px] text-emerald-700 bg-emerald-100/90 font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                    🤫 秘密词已锁定·请作画
                  </span>
                </template>
                <template v-else>
                  <div class="flex items-center gap-1.5">
                    <span 
                      v-for="(char, idx) in maskedWordList" 
                      :key="idx"
                      class="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-rose-200 font-bold text-rose-600 text-sm shadow-2xs"
                    >
                      {{ char }}
                    </span>
                  </div>
                  <span class="text-[11px] text-rose-500 font-medium ml-1">
                    猜猜TA画的是什么？
                  </span>
                </template>
              </div>
            </div>
          </div>

          <!-- 抽词与操作动作 -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="drawRandomWord"
              class="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1 transition-all"
            >
              <span>🎲</span>
              <span>换个私密词</span>
            </button>
            <button
              v-if="role === 'guesser' && hintsLeft > 0"
              @click="revealOneHint"
              class="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1 transition-all"
            >
              <span>💡</span>
              <span>提示1字 (剩{{ hintsLeft }}次)</span>
            </button>
            <button
              @click="showCustomWordModal = true"
              class="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-all"
            >
              ✏️ 自定义私密词
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主操作区：左侧画板，右侧工具与互动/猜词面板 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      <!-- 画板主体 (8列) -->
      <div class="lg:col-span-8 flex flex-col space-y-3">
        <!-- 画板容器卡片 -->
        <div class="glass-card rounded-3xl p-3 sm:p-4 border-2 border-emerald-100 shadow-md relative bg-white overflow-hidden">
          
          <!-- 画板顶端工具条 (笔刷、图章、粗细、预览、撤销、壁纸导出) -->
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-100">
            <!-- 笔触工具与图章戳切换 -->
            <div class="flex items-center gap-1.5">
              <button
                @click="tool = 'pen'"
                :class="tool === 'pen' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-medium transition-all"
                title="普通画笔"
              >
                ✏️
              </button>
              <button
                @click="tool = 'marker'"
                :class="tool === 'marker' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-medium transition-all"
                title="荧光画笔 (半透明)"
              >
                🖍️
              </button>
              <button
                @click="tool = 'stamp'"
                :class="tool === 'stamp' ? 'bg-pink-500 text-white shadow-xs' : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'"
                class="px-2.5 h-8 rounded-xl flex items-center gap-1 text-xs font-bold transition-all"
                title="情侣表情印章戳"
              >
                <span>💮</span>
                <span>表情戳</span>
              </button>
              <button
                @click="tool = 'eraser'"
                :class="tool === 'eraser' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-medium transition-all"
                title="橡皮擦"
              >
                🧹
              </button>
            </div>

            <!-- 线条粗细与“粗细动态预览气泡” -->
            <div class="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-xl relative">
              <span class="text-[11px] text-slate-500 font-medium">粗细</span>
              <div class="flex items-center gap-1.5">
                <button
                  v-for="w in [3, 6, 12, 22]"
                  :key="w"
                  @click="lineWidth = w; triggerSizeBubble()"
                  :class="lineWidth === w ? 'border-emerald-500 bg-white scale-110 shadow-xs' : 'border-transparent bg-slate-200 hover:scale-105'"
                  class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                >
                  <span 
                    class="rounded-full bg-slate-700" 
                    :style="{ width: Math.max(3, w / 2.2) + 'px', height: Math.max(3, w / 2.2) + 'px' }"
                  ></span>
                </button>
              </div>

              <!-- 粗细动态预览气泡 (悬浮指示) -->
              <div 
                v-if="showSizeBubble"
                class="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-2.5 py-1 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-none animate-scale border border-white/20 z-30"
              >
                <span 
                  class="rounded-full border border-white/60 shrink-0" 
                  :style="{ 
                    width: lineWidth + 'px', 
                    height: lineWidth + 'px',
                    backgroundColor: tool === 'eraser' ? '#ffffff' : currentColor 
                  }"
                ></span>
                <span class="text-[11px] font-mono font-bold">{{ lineWidth }}px</span>
              </div>
            </div>

            <!-- 撤销、清空与留存操作 -->
            <div class="flex items-center gap-1.5 ml-auto flex-wrap">
              <button
                @click="undo"
                :disabled="history.length <= 1"
                class="px-2.5 py-1 text-xs rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                title="撤销上一步"
              >
                ↩️ 撤销
              </button>
              <button
                @click="clearCanvas"
                class="px-2.5 py-1 text-xs rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-1"
                title="清空画板"
              >
                🗑️ 清空
              </button>
              <button
                @click="saveToGallery"
                class="px-2.5 py-1 text-xs rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center gap-1 font-semibold"
                title="保存到甜蜜画廊"
              >
                💾 留存
              </button>
              <button
                @click="exportPhoneWallpaper()"
                class="px-2.5 py-1 text-xs rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-xs transition-all flex items-center gap-1 font-bold"
                title="保存当前画作为手机壁纸"
              >
                📱 导出壁纸
              </button>
            </div>
          </div>

          <!-- 情侣表情印章戳挑选条 (当选中图章模式时展示) -->
          <div v-if="tool === 'stamp'" class="mb-2 p-2 bg-pink-50/80 rounded-2xl border border-pink-200 flex items-center gap-2 overflow-x-auto no-scrollbar animate-scale">
            <span class="text-xs font-bold text-pink-700 shrink-0">选择表情戳:</span>
            <button
              v-for="stamp in coupleStamps"
              :key="stamp.icon"
              @click="selectedStamp = stamp.icon"
              :class="selectedStamp === stamp.icon ? 'bg-white border-2 border-pink-500 shadow-xs scale-110' : 'bg-pink-100/60 border border-transparent hover:scale-105'"
              class="px-2.5 py-1 rounded-xl text-sm flex items-center gap-1 shrink-0 transition-transform cursor-pointer"
            >
              <span>{{ stamp.icon }}</span>
              <span class="text-[11px] text-pink-800 font-medium">{{ stamp.name }}</span>
            </button>
            <span class="text-[10px] text-pink-500 ml-auto shrink-0 font-medium">点击画板任意处盖戳</span>
          </div>

          <!-- 色板快捷挑选 -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
            <span class="text-[11px] text-slate-400 shrink-0">调色盘:</span>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                v-for="color in palette"
                :key="color"
                @click="currentColor = color; if (tool === 'eraser') tool = 'pen'"
                :style="{ backgroundColor: color }"
                :class="currentColor === color && tool !== 'eraser' ? 'ring-2 ring-emerald-500 ring-offset-2 scale-110 shadow-xs' : 'hover:scale-105'"
                class="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black/10 transition-transform cursor-pointer"
              ></button>
            </div>
          </div>

          <!-- HTML5 Canvas 绘图区 -->
          <div class="relative w-full aspect-[4/3] bg-[#fbfdfc] rounded-2xl border-2 border-dashed border-emerald-200/80 shadow-inner overflow-hidden cursor-crosshair select-none touch-none">
            <canvas
              ref="canvasRef"
              @pointerdown="startDrawing"
              @pointermove="draw"
              @pointerup="stopDrawing"
              @pointercancel="stopDrawing"
              @pointerleave="stopDrawing"
              class="w-full h-full block"
            ></canvas>

            <!-- 猜词弹幕浮动动效 (多条弹幕自然飘过画板) -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <div 
                v-for="b in activeBarrages" 
                :key="b.id"
                class="absolute right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm border transition-all animate-danmaku"
                :style="{
                  top: b.top + '%',
                  backgroundColor: b.bgColor,
                  borderColor: b.borderColor
                }"
              >
                <span>{{ b.icon }}</span>
                <span>{{ b.text }}</span>
              </div>
            </div>

            <!-- 画布右下角提示与水印 -->
            <div class="absolute bottom-2 right-3 pointer-events-none text-[10px] text-slate-300 font-mono">
              情侣默契小站 · Canvas co-draw
            </div>
          </div>

          <!-- 快捷提示发射台 (画手专用快捷指挥) -->
          <div v-if="role === 'drawer' || role === 'free'" class="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span class="text-xs text-emerald-700 font-semibold shrink-0">快捷发射弹幕:</span>
            <button
              v-for="phrase in quickPhrases"
              :key="phrase"
              @click="sendBarrage(phrase, 'drawer')"
              class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-full shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              {{ phrase }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：猜词输入、智能错字容错反馈与历史痕迹 (4列) -->
      <div class="lg:col-span-4 flex flex-col space-y-4">
        
        <!-- 猜词卡片 -->
        <div class="glass-card rounded-3xl p-5 border-2 border-rose-100 shadow-sm bg-white/90">
          <div class="flex items-center justify-between pb-3 border-b border-rose-100">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎯</span>
              <h3 class="font-extrabold text-slate-800 text-base">猜词答题区</h3>
            </div>
            <span class="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              已猜中 {{ correctCount }} 题
            </span>
          </div>

          <!-- 猜词输入框 -->
          <div class="mt-4 space-y-3">
            <div class="relative">
              <input
                v-model="guessInput"
                @keyup.enter="submitGuess"
                type="text"
                placeholder="输入你猜的词汇或拼音..."
                maxlength="25"
                class="w-full px-4 py-3 rounded-2xl bg-white border-2 border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-slate-800 font-bold text-sm transition-all shadow-2xs"
              />
              <button
                @click="submitGuess"
                :disabled="!guessInput.trim()"
                class="absolute right-2 top-2 bottom-2 px-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 active:scale-95"
              >
                <span>提交</span>
                <span>🚀</span>
              </button>
            </div>

            <!-- 智能错别字与相似度反馈提示 -->
            <div 
              v-if="lastFeedback"
              :class="lastFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : lastFeedback.type === 'close' ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-rose-50 text-rose-800 border-rose-300'"
              class="p-3 rounded-2xl border text-xs font-medium flex items-start gap-2 animate-scale shadow-2xs"
            >
              <span class="text-lg shrink-0">{{ lastFeedback.icon }}</span>
              <div class="leading-relaxed">
                <div class="font-bold">{{ lastFeedback.title }}</div>
                <div class="text-[11px] opacity-90 mt-0.5">{{ lastFeedback.text }}</div>
              </div>
            </div>
          </div>

          <!-- 猜词历史记录 -->
          <div class="mt-4">
            <div class="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>本轮猜词痕迹</span>
              <span class="text-[10px] text-slate-400">支持错别字/拼音容错</span>
            </div>
            <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1 no-scrollbar">
              <div 
                v-for="(item, i) in guessHistory" 
                :key="i"
                class="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
              >
                <span class="text-slate-800 font-medium">“{{ item.word }}”</span>
                <span 
                  :class="item.isCorrect ? 'text-emerald-600 font-bold' : item.isClose ? 'text-amber-600 font-bold' : 'text-slate-400'"
                  class="text-[11px]"
                >
                  {{ item.status }}
                </span>
              </div>
              <div v-if="guessHistory.length === 0" class="text-center py-4 text-xs text-slate-400">
                暂无猜测，脑洞大开输入提交吧~
              </div>
            </div>
          </div>
        </div>

        <!-- 默契奖励状态卡片 -->
        <div class="glass-card rounded-3xl p-5 border-2 border-emerald-100 shadow-sm bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">🌿</span>
              <h4 class="font-bold text-slate-800 text-sm">恋爱树协同养分</h4>
            </div>
            <span class="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
              默契反应 +2
            </span>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-white p-2.5 rounded-2xl border border-emerald-100 shadow-2xs">
              <div class="text-base font-bold text-emerald-700">💧 +3</div>
              <div class="text-[10px] text-slate-400 mt-0.5">爱心水滴</div>
            </div>
            <div class="bg-white p-2.5 rounded-2xl border border-emerald-100 shadow-2xs">
              <div class="text-base font-bold text-amber-600">☀️ +3</div>
              <div class="text-[10px] text-slate-400 mt-0.5">阳光能量</div>
            </div>
            <div class="bg-white p-2.5 rounded-2xl border border-emerald-100 shadow-2xs">
              <div class="text-base font-bold text-teal-600">📈 +25</div>
              <div class="text-[10px] text-slate-400 mt-0.5">树苗成长</div>
            </div>
          </div>
          <p class="text-[11px] text-slate-500 mt-3 text-center">
            每次心有灵犀猜中都将直接浇灌小树苗成长！
          </p>
        </div>

      </div>

    </div>

    <!-- 甜蜜画廊展示（保存的作品集） -->
    <div v-if="savedGallery.length > 0" class="glass-card rounded-3xl p-5 border-2 border-teal-100 shadow-sm bg-white/90">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🖼️</span>
          <h3 class="font-extrabold text-slate-800 text-base">我们的甜蜜画廊</h3>
          <span class="text-xs bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-bold">
            {{ savedGallery.length }} 幅珍藏
          </span>
        </div>
        <span class="text-xs text-slate-400">支持一键生成 9:16 高清情侣手机壁纸</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="(pic, idx) in savedGallery"
          :key="idx"
          class="group bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
        >
          <div class="aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
            <img :src="pic.dataUrl" alt="画作" class="w-full h-full object-contain group-hover:scale-105 transition-transform" />
          </div>
          <div class="mt-2.5">
            <div class="font-bold text-slate-800 text-xs truncate">“{{ pic.word }}”</div>
            <div class="text-[10px] text-slate-400">{{ pic.date }}</div>
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
              <a
                :href="pic.dataUrl"
                :download="`情侣画作_${pic.word}.png`"
                class="text-slate-500 hover:text-slate-800 font-medium"
              >
                普通图 ⬇️
              </a>
              <button
                @click="exportPhoneWallpaper(pic.dataUrl, pic.word)"
                class="text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-200 transition-colors"
              >
                手机壁纸 📱
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义私密词汇 Modal -->
    <div 
      v-if="showCustomWordModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-emerald-100 space-y-4 animate-scale">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <span>✏️</span>
            <span>输入你们的专属词汇</span>
          </h3>
          <button @click="showCustomWordModal = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>
        <p class="text-xs text-slate-500">
          例如：“第一次牵手看电影的影城”、“你偷吃蛋糕的丑照”、“偷偷给我的小绰号”等专属暗号！
        </p>
        <input
          v-model="customInput"
          type="text"
          placeholder="输入秘密词语（2-15个字）"
          maxlength="15"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-bold text-sm"
        />
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="showCustomWordModal = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            取消
          </button>
          <button
            @click="applyCustomWord"
            :disabled="!customInput.trim()"
            class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40"
          >
            确认使用
          </button>
        </div>
      </div>
    </div>

    <!-- 通关与猜中庆祝弹窗 Modal -->
    <div 
      v-if="showWinModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-emerald-200 space-y-4 animate-scale">
        <div class="text-5xl animate-bounce">🎉</div>
        <h3 class="text-xl font-black text-emerald-800">心有灵犀，猜中啦！</h3>
        <p class="text-sm text-slate-600">
          答案正是：<strong class="text-rose-600 text-base">“{{ currentWord }}”</strong>
        </p>

        <!-- 奖励明细卡 -->
        <div class="bg-emerald-50 rounded-2xl p-3 text-xs text-emerald-900 font-semibold space-y-1">
          <div>💧 爱心水滴 +3 &nbsp;|&nbsp; ☀️ 阳光养分 +3</div>
          <div>🌱 恋爱树成长经验 +25</div>
          <div class="text-emerald-700 font-bold">✨ 【默契反应】雷达属性已提升！</div>
        </div>

        <div class="pt-2 flex flex-col gap-2">
          <button
            @click="exportPhoneWallpaper()"
            class="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-sm text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>📱</span>
            <span>生成此画为手机壁纸</span>
          </button>
          <button
            @click="nextRound"
            class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
          >
            下一题，继续默契挑战 🚀
          </button>
          <button
            @click="showWinModal = false"
            class="w-full py-2 text-xs text-slate-500 hover:text-slate-800"
          >
            留在本题回顾画作
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import confetti from 'canvas-confetti'
import { recordGameReward, appState } from '@/状态/恋爱树状态.js'

defineEmits(['back'])

// 扩充至 50+ 个专属情侣私密词库（7大特色分类）
const wordLibrary = [
  {
    name: '专属情话',
    icon: '💖',
    words: [
      '眼里全是你',
      '你是我的私藏浪漫',
      '全世界只偏心你',
      '余生请多指教',
      '想把月亮摘给你',
      '见你第一面就心动',
      '想和你从心动到古稀',
      '做我的心尖宝贝'
    ]
  },
  {
    name: '黑历史名场面',
    icon: '🤣',
    words: [
      '喝醉酒抱着电线杆唱歌',
      '把盐当成糖放进可乐',
      '穿反睡衣下楼拿快递',
      '被狗追着绕小区跑',
      '看鬼片吓得钻进被窝',
      '偷吃雪糕被抓现行',
      '第一次接吻撞到牙齿',
      '拍合照笑到面部抽筋'
    ]
  },
  {
    name: '私密心愿',
    icon: '🌟',
    words: [
      '一起去冰岛看极光',
      '养一只黏人的小金毛',
      '住在看得见海的房子',
      '拍一套复古婚纱照',
      '穿情侣睡衣通宵看电影',
      '一起看一场五月天演唱会',
      '自驾游川藏公路',
      '在富士山脚下泡温泉'
    ]
  },
  {
    name: '浪漫回忆',
    icon: '🌸',
    words: [
      '初吻的大树下',
      '第一次牵手手心冒汗',
      '被雨淋湿的流浪猫',
      '凌晨三点压马路',
      '在海滩捡贝壳吹海风',
      '摩天轮升到最高处接吻',
      '下雨天共撑一把伞',
      '冬夜在路边分吃烤红薯'
    ]
  },
  {
    name: '日常趣味',
    icon: '☕',
    words: [
      '吃火锅疯狂抢毛肚',
      '半夜偷偷点麻辣烫夜宵',
      '偷拍对方睡颜丑照',
      '冬天把冰手伸进你脖子',
      '吃冰淇淋沾到鼻尖上',
      '赖床装睡抱紧不放',
      '生气时假装咬你手臂',
      '抢走全部被子卷成卷'
    ]
  },
  {
    name: '吃货共鸣',
    icon: '🍰',
    words: [
      '草莓双层芝士千层',
      '冰镇西瓜正中间那一勺',
      '手剥麻辣小龙虾',
      '半夜滋滋冒油的烧烤摊',
      '热可可漂浮烤棉花糖',
      '爱心形状的溏心煎蛋',
      '焦糖珍珠波霸奶茶',
      '刚出炉热气腾腾的蛋挞'
    ]
  },
  {
    name: '甜蜜暗号',
    icon: '💌',
    words: [
      '背后突然突袭拥抱',
      '温柔吹头发的暖风',
      '穿情侣装去游乐园',
      '捏对方软乎乎的脸颊',
      '做噩梦惊醒找你抱抱',
      '走路时故意撞你肩膀',
      '一人一只无线耳机',
      '蹲下身给你系鞋带'
    ]
  }
]

// 词库总词数统计
const totalWordCount = computed(() => {
  return wordLibrary.reduce((acc, cat) => acc + cat.words.length, 0)
})

// 情侣表情图章戳列表
const coupleStamps = [
  { icon: '❤️', name: '心心相印' },
  { icon: '🐻', name: '抱抱小熊' },
  { icon: '🐾', name: '萌萌猫爪' },
  { icon: '💋', name: '甜蜜红唇' },
  { icon: '⭐', name: '默契之星' },
  { icon: '🌸', name: '浪漫樱花' },
  { icon: '💍', name: '永恒对戒' },
  { icon: '🎉', name: '狂欢彩带' }
]

// 调色盘
const palette = [
  '#1e293b', // 炭黑
  '#ef4444', // 鲜红
  '#f43f5e', // 玫瑰粉
  '#fb7185', // 珊瑚粉
  '#f97316', // 活力橙
  '#f59e0b', // 暖阳金
  '#10b981', // 翡翠绿
  '#34d399', // 薄荷绿
  '#0ea5e9', // 晴空蓝
  '#8b5cf6', // 梦幻紫
  '#78350f', // 暖咖棕
  '#ffffff'  // 纯白
]

// 快捷弹幕短语
const quickPhrases = [
  '👀 仔细看右边！',
  '🍲 提示：跟吃有关！',
  '💖 是我们一起做过的！',
  '🎨 意会！看我的灵魂笔法！',
  '⏰ 快猜快猜，马上答对了！',
  '😂 哎呀画劈叉了别笑！'
]

// 响应式状态
const role = ref('drawer') // 'drawer' | 'guesser' | 'free'
const currentCategory = ref(wordLibrary[0])
const currentWord = ref('眼里全是你')
const revealedIndices = ref([])
const hintsLeft = ref(2)

// 画板相关状态
const canvasRef = ref(null)
let ctx = null
const isDrawing = ref(false)
const tool = ref('pen') // 'pen' | 'marker' | 'eraser' | 'stamp'
const selectedStamp = ref('❤️')
const currentColor = ref('#1e293b')
const lineWidth = ref(6)
const showSizeBubble = ref(false)
let sizeBubbleTimer = null
const history = ref([])
const maxHistory = 20

// 猜词与弹幕互动相关状态
const guessInput = ref('')
const guessHistory = ref([])
const correctCount = ref(0)
const lastFeedback = ref(null)
const activeBarrages = ref([]) // 弹幕列表 [{ id, text, icon, bgColor, borderColor, top }]

// 甜蜜画廊与导出
const savedGallery = ref([])

// 弹窗状态
const showWinModal = ref(false)
const showCustomWordModal = ref(false)
const customInput = ref('')

// 计算遮蔽的词汇
const maskedWordList = computed(() => {
  return currentWord.value.split('').map((char, index) => {
    if (revealedIndices.value.includes(index)) {
      return char
    }
    return '?'
  })
})

function setRole(r) {
  role.value = r
}

function triggerSizeBubble() {
  showSizeBubble.value = true
  clearTimeout(sizeBubbleTimer)
  sizeBubbleTimer = setTimeout(() => {
    showSizeBubble.value = false
  }, 1200)
}

// 抽取新词
function drawRandomWord() {
  const cat = wordLibrary[Math.floor(Math.random() * wordLibrary.length)]
  currentCategory.value = cat
  const availableWords = cat.words.filter(w => w !== currentWord.value)
  currentWord.value = availableWords[Math.floor(Math.random() * availableWords.length)] || cat.words[0]
  revealedIndices.value = []
  hintsLeft.value = 2
  guessHistory.value = []
  lastFeedback.value = null
  clearCanvas()
}

// 提示一个字
function revealOneHint() {
  if (hintsLeft.value <= 0) return
  const unrevealed = []
  for (let i = 0; i < currentWord.value.length; i++) {
    if (!revealedIndices.value.includes(i)) {
      unrevealed.push(i)
    }
  }
  if (unrevealed.length > 0) {
    const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)]
    revealedIndices.value.push(pick)
    hintsLeft.value -= 1
  }
}

// 应用自定义词
function applyCustomWord() {
  const val = customInput.value.trim()
  if (!val) return
  currentCategory.value = { name: '私密密令', icon: '🔒', words: [val] }
  currentWord.value = val
  revealedIndices.value = []
  hintsLeft.value = 2
  guessHistory.value = []
  lastFeedback.value = null
  customInput.value = ''
  showCustomWordModal.value = false
  clearCanvas()
}

// 发射浮动弹幕动效
function sendBarrage(text, sender = 'guesser') {
  const id = Date.now() + Math.random()
  const top = 15 + Math.floor(Math.random() * 65) // 15% - 80% 高度
  
  const isDrawer = sender === 'drawer'
  const newBarrage = {
    id,
    text,
    icon: isDrawer ? '👨‍🎨' : '💬',
    bgColor: isDrawer ? 'rgba(16, 185, 129, 0.88)' : 'rgba(244, 63, 94, 0.88)',
    borderColor: isDrawer ? 'rgba(52, 211, 153, 0.5)' : 'rgba(251, 113, 133, 0.5)',
    top
  }

  activeBarrages.value.push(newBarrage)

  // 4.5秒后动画结束自动清理
  setTimeout(() => {
    activeBarrages.value = activeBarrages.value.filter(b => b.id !== id)
  }, 4500)
}

// 智能错别字与拼音容错算法
function calculateFuzzyMatch(guess, target) {
  const g = guess.trim().toLowerCase().replace(/[\s，。！？、]/g, '')
  const t = target.trim().toLowerCase().replace(/[\s，。！？、]/g, '')

  if (g === t) {
    return { isExact: true, isClose: true, reason: 'exact' }
  }

  // 1. 包含子串情况
  if (t.includes(g) && g.length >= 2) {
    return { isExact: false, isClose: true, reason: 'substring', text: `抓住了核心短语「${g}」！请补全整句~` }
  }
  if (g.includes(t)) {
    return { isExact: false, isClose: true, reason: 'superstring', text: `已经包含正确答案了！精简一下多余字~` }
  }

  // 2. 汉字编辑距离 (Levenshtein Distance)
  const d = getLevenshteinDistance(g, t)
  if (d === 1 && t.length >= 3) {
    return { isExact: false, isClose: true, reason: 'typo', text: `太可惜了！仅相差 1 个字，快检查是不是输入法打错字了！` }
  } else if (d === 2 && t.length >= 5) {
    return { isExact: false, isClose: true, reason: 'typo', text: `非常接近了！有 2 个字对不上，再仔细想想~` }
  }

  // 3. 统计相同字数
  let matchedChars = 0
  for (const c of g) {
    if (t.includes(c)) matchedChars++
  }

  if (matchedChars >= 3 || (t.length <= 4 && matchedChars >= 2)) {
    return { isExact: false, isClose: true, reason: 'chars', text: `命中其中 ${matchedChars} 个字！方向非常对！` }
  }

  return { isExact: false, isClose: false }
}

function getLevenshteinDistance(a, b) {
  const matrix = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 替换
          matrix[i][j - 1] + 1,     // 插入
          matrix[i - 1][j] + 1      // 删除
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

// 提交猜词验证
function submitGuess() {
  const val = guessInput.value.trim()
  if (!val) return

  const target = currentWord.value.trim()
  const match = calculateFuzzyMatch(val, target)

  // 触发猜词弹幕飞跃
  sendBarrage(`猜测：“${val}”`, 'guesser')

  if (match.isExact) {
    guessHistory.value.unshift({ word: val, isCorrect: true, isClose: false, status: '🎯 猜对啦！' })
    lastFeedback.value = { 
      type: 'success', 
      icon: '🎉', 
      title: '心有灵犀！完全正确！',
      text: `神仙配合！答案正是「${target}」！` 
    }
    correctCount.value += 1
    guessInput.value = ''

    // 庆祝彩屑
    try {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 }
      })
    } catch (e) {}

    // 发放恋爱树奖励
    recordGameReward('co-draw', { 
      water: 3, 
      sun: 3, 
      exp: 25, 
      radarCategory: '默契反应',
      radarDelta: 2 
    })

    // 自动保存至画廊
    saveToGallery()
    showWinModal.value = true
    return
  }

  if (match.isClose) {
    guessHistory.value.unshift({ word: val, isCorrect: false, isClose: true, status: '接近了！' })
    lastFeedback.value = { 
      type: 'close', 
      icon: '🔥', 
      title: '极度接近！快触达真相！',
      text: match.text || '包含了正确答案的字，快检查错字或精简~' 
    }
  } else {
    guessHistory.value.unshift({ word: val, isCorrect: false, isClose: false, status: '不对哦' })
    lastFeedback.value = { 
      type: 'wrong', 
      icon: '🤔', 
      title: '不对哦，再仔细端详',
      text: `“${val}” 与目标词差距较大，再观察对方画了哪些细节？` 
    }
  }

  guessInput.value = ''
}

// 进入下一题
function nextRound() {
  showWinModal.value = false
  drawRandomWord()
}

// Canvas 核心绘制逻辑
function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // 默认画板背景底色
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, rect.width, rect.height)

  saveState()
}

function getPos(e) {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

function startDrawing(e) {
  if (!ctx) return
  const pos = getPos(e)

  // 如果是情侣印章戳模式
  if (tool.value === 'stamp') {
    stampOnCanvas(pos.x, pos.y)
    saveState()
    return
  }

  isDrawing.value = true
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
  applyBrushStyle()
}

// 盖表情图章戳
function stampOnCanvas(x, y) {
  if (!ctx) return
  ctx.save()
  ctx.font = '36px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.15)'
  ctx.shadowBlur = 6
  ctx.fillText(selectedStamp.value, x, y)
  ctx.restore()

  // 弹幕提示
  sendBarrage(`盖下了【${selectedStamp.value}】图章`, 'drawer')
}

function applyBrushStyle() {
  if (tool.value === 'eraser') {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = lineWidth.value * 2
    ctx.globalAlpha = 1.0
  } else if (tool.value === 'marker') {
    ctx.strokeStyle = currentColor.value
    ctx.lineWidth = lineWidth.value * 1.8
    ctx.globalAlpha = 0.35
  } else {
    ctx.strokeStyle = currentColor.value
    ctx.lineWidth = lineWidth.value
    ctx.globalAlpha = 1.0
  }
}

function draw(e) {
  if (!isDrawing.value || !ctx || tool.value === 'stamp') return
  const pos = getPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

function stopDrawing() {
  if (!isDrawing.value) return
  isDrawing.value = false
  if (ctx) {
    ctx.closePath()
    ctx.globalAlpha = 1.0
  }
  saveState()
}

function saveState() {
  const canvas = canvasRef.value
  if (!canvas) return
  const data = canvas.toDataURL()
  history.value.push(data)
  if (history.value.length > maxHistory) {
    history.value.shift()
  }
}

function undo() {
  if (history.value.length <= 1) return
  history.value.pop()
  const prevData = history.value[history.value.length - 1]
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()

  const img = new Image()
  img.src = prevData
  img.onload = () => {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    ctx.restore()
  }
}

function clearCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  const rect = canvas.getBoundingClientRect()
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
  saveState()
}

function saveToGallery() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dataUrl = canvas.toDataURL('image/png')
  savedGallery.value.unshift({
    word: currentWord.value,
    dataUrl,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
}

// 保存高清大图为手机壁纸 (9:16 高分辨率 1080x1920)
function exportPhoneWallpaper(customDataUrl = null, customWord = null) {
  const targetDataUrl = customDataUrl || (canvasRef.value ? canvasRef.value.toDataURL('image/png') : null)
  if (!targetDataUrl) return
  const word = customWord || currentWord.value

  const offCanvas = document.createElement('canvas')
  offCanvas.width = 1080
  offCanvas.height = 1920
  const offCtx = offCanvas.getContext('2d')

  // 1. 浪漫渐变背景 (薄荷绿到珊瑚粉双色梦幻渐变)
  const grad = offCtx.createLinearGradient(0, 0, 1080, 1920)
  grad.addColorStop(0, '#fff5f5')
  grad.addColorStop(0.3, '#fdf2f8')
  grad.addColorStop(0.7, '#f0fdf4')
  grad.addColorStop(1, '#ecfdf5')
  offCtx.fillStyle = grad
  offCtx.fillRect(0, 0, 1080, 1920)

  // 2. 绘制星光柔和光晕
  offCtx.fillStyle = 'rgba(251, 113, 133, 0.08)'
  offCtx.beginPath()
  offCtx.arc(200, 300, 260, 0, Math.PI * 2)
  offCtx.fill()

  offCtx.fillStyle = 'rgba(52, 211, 153, 0.08)'
  offCtx.beginPath()
  offCtx.arc(880, 1500, 320, 0, Math.PI * 2)
  offCtx.fill()

  // 3. 顶部浪漫情侣文字徽章
  offCtx.textAlign = 'center'
  offCtx.fillStyle = '#f43f5e'
  offCtx.font = 'bold 36px sans-serif'
  offCtx.fillText('💖 今日份心动涂鸦 · 默契瞬间 💖', 540, 240)

  const meName = appState.names?.me || '👦 男友'
  const partnerName = appState.names?.partner || '👧 女友'
  offCtx.fillStyle = '#64748b'
  offCtx.font = '28px sans-serif'
  offCtx.fillText(`${meName} & ${partnerName} 专属留念`, 540, 300)

  // 题目胶囊卡片
  offCtx.fillStyle = '#ffffff'
  offCtx.shadowColor = 'rgba(0, 0, 0, 0.06)'
  offCtx.shadowBlur = 20
  roundRect(offCtx, 240, 360, 600, 90, 45)
  offCtx.fill()
  offCtx.shadowBlur = 0

  offCtx.fillStyle = '#0f172a'
  offCtx.font = 'bold 36px sans-serif'
  offCtx.fillText(`题目：「${word}」`, 540, 418)

  // 4. 中部画作外框与画作内容
  const img = new Image()
  img.src = targetDataUrl
  img.onload = () => {
    const frameX = 90
    const frameY = 510
    const frameW = 900
    const frameH = 900
    const radius = 40

    // 白色画框阴影
    offCtx.save()
    offCtx.shadowColor = 'rgba(15, 23, 42, 0.12)'
    offCtx.shadowBlur = 35
    offCtx.shadowOffsetY = 15
    offCtx.fillStyle = '#ffffff'
    roundRect(offCtx, frameX, frameY, frameW, frameH, radius)
    offCtx.fill()
    offCtx.restore()

    // 裁剪画框区域绘制图片
    offCtx.save()
    roundRect(offCtx, frameX + 20, frameY + 20, frameW - 40, frameH - 40, radius - 10)
    offCtx.clip()
    offCtx.drawImage(img, frameX + 20, frameY + 20, frameW - 40, frameH - 40)
    offCtx.restore()

    // 5. 底部签名与日期
    const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    offCtx.fillStyle = '#059669'
    offCtx.font = 'bold 32px sans-serif'
    offCtx.fillText('🌿 心有灵犀，唯爱永恒 🌿', 540, 1530)

    offCtx.fillStyle = '#94a3b8'
    offCtx.font = '26px sans-serif'
    offCtx.fillText(`情侣默契小站 · 见证于 ${dateStr}`, 540, 1590)

    // 底部小装饰
    offCtx.fillStyle = '#f43f5e'
    offCtx.font = '36px sans-serif'
    offCtx.fillText('· ˙ 💌 ˙ ·', 540, 1660)

    // 触发下载
    const wallpaperUrl = offCanvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = wallpaperUrl
    link.download = `情侣手机壁纸_${word}.png`
    link.click()
  }
}

// 辅助函数：绘制圆角矩形
function roundRect(c, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

onMounted(() => {
  nextTick(() => {
    initCanvas()
    window.addEventListener('resize', initCanvas)
  })
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes scaleIn {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale {
  animation: scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes danmakuFlow {
  0% {
    transform: translateX(110%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(-500px);
    opacity: 0;
  }
}

.animate-danmaku {
  animation: danmakuFlow 4.5s linear forwards;
}
</style>
