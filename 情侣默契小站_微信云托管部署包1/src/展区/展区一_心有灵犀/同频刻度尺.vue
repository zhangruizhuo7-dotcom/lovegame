<template>
  <div class="w-full max-w-4xl mx-auto py-2 px-3 sm:px-6">
    <!-- 顶部状态栏与返回按钮 -->
    <div class="flex items-center justify-between mb-5">
      <button 
        @click="$emit('back')" 
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-teal-600 border border-teal-200/80 shadow-xs text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span>&larr;</span>
        <span>返回展区</span>
      </button>

      <div class="flex items-center gap-2">
        <!-- 音效开关 -->
        <button 
          @click="toggleAudio"
          class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 hover:bg-white border border-teal-200/80 shadow-2xs text-slate-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>{{ isMuted ? '🔇 静音' : '🎵 音效开' }}</span>
        </button>

        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1 shadow-2xs">
          <span>📏</span> 同频刻度尺 · 心理温差计
        </span>
      </div>
    </div>

    <!-- 未完成状态：打分过程 -->
    <div v-if="!isCompleted" class="space-y-6">
      <!-- 进度指示卡片 -->
      <div class="glass-card rounded-2xl p-4 sm:p-5 shadow-sm border border-teal-200/80 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-medium">测量场景：</span>
            <span class="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold shadow-2xs">
              第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题 · {{ currentQuestion.category }}
            </span>
          </div>

          <!-- 盲填防偷窥开关 -->
          <button 
            @click="toggleBlindMode"
            class="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer shadow-2xs"
            :class="blindMode ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            <span>{{ blindMode ? '🙈 盲填防窥模式 (已遮挡)' : '👀 公开打分模式' }}</span>
          </button>
        </div>

        <!-- 进度条 -->
        <div class="w-full h-2 bg-teal-100/60 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            class="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-rose-400 rounded-full transition-all duration-300"
            :style="{ width: `${((currentIndex + (hasRevealedCurrent ? 1 : 0.5)) / questions.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- 主打分卡片 -->
      <div class="glass-card rounded-3xl p-5 sm:p-8 shadow-md border border-teal-200 relative overflow-hidden backdrop-blur-md">
        <!-- 装饰背景 -->
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-100/40 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -left-10 -top-10 w-48 h-48 bg-rose-100/30 rounded-full blur-2xl pointer-events-none"></div>

        <!-- 题目描述 -->
        <div class="text-center mb-6 relative z-10">
          <span class="text-4xl mb-2 inline-block filter drop-shadow-sm animate-bounce-subtle">{{ currentQuestion.icon }}</span>
          <div class="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">场景 {{ currentIndex + 1 }} · {{ currentQuestion.category }}</div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {{ currentQuestion.title }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
            {{ currentQuestion.desc }}
          </p>

          <!-- 极值标签对照 -->
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs shadow-2xs">
              <span class="font-black text-slate-500 block mb-0.5">◀ 1分端点：</span>
              <span class="text-slate-700 font-medium">{{ currentQuestion.minDesc }}</span>
            </div>
            <div class="p-3 rounded-xl bg-rose-50/90 border border-rose-200/90 text-xs shadow-2xs">
              <span class="font-black text-rose-500 block mb-0.5">▶ 10分端点：</span>
              <span class="text-slate-700 font-medium">{{ currentQuestion.maxDesc }}</span>
            </div>
          </div>
        </div>

        <!-- 双方打分滑块区域 -->
        <div class="space-y-6 max-w-xl mx-auto my-6 p-5 sm:p-6 bg-white/80 rounded-2xl border border-teal-100 shadow-sm relative z-10">
          <!-- 男友打分 -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black text-blue-600 flex items-center gap-1.5">
                <span>👦 {{ appState.names.me }} 的心理刻度：</span>
              </label>

              <div class="flex items-center gap-2">
                <span 
                  v-if="!blindMode || hasRevealedCurrent"
                  class="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800"
                >
                  {{ getScoreLabel(scoreMe) }}
                </span>
                <span 
                  v-if="!blindMode || hasRevealedCurrent"
                  class="text-sm font-black text-blue-600 px-3 py-0.5 rounded-lg bg-blue-50 border border-blue-200 shadow-2xs"
                >
                  {{ scoreMe }} 分
                </span>
                <span v-else class="text-xs text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  🔒 已遮挡防窥
                </span>
              </div>
            </div>

            <!-- 滑动条与微调按钮 -->
            <div class="flex items-center gap-3">
              <button 
                @click="adjustScore('me', -1)" 
                :disabled="hasRevealedCurrent || scoreMe <= 1"
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 font-bold text-xs flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
              >
                -
              </button>

              <div class="relative flex-1 flex items-center">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  v-model.number="scoreMe"
                  @input="handleSliderChange(scoreMe)"
                  :disabled="hasRevealedCurrent"
                  class="custom-slider w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <button 
                @click="adjustScore('me', 1)" 
                :disabled="hasRevealedCurrent || scoreMe >= 10"
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 font-bold text-xs flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>

            <div class="flex justify-between text-[10px] text-slate-400 font-medium px-8">
              <span>1分 (极度克制)</span>
              <span>5分 (温和平衡)</span>
              <span>10分 (极度浓烈)</span>
            </div>
          </div>

          <div class="border-t border-teal-100/90 my-4"></div>

          <!-- 女友打分 -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black text-rose-600 flex items-center gap-1.5">
                <span>👧 {{ appState.names.partner }} 的心理刻度：</span>
              </label>

              <div class="flex items-center gap-2">
                <span 
                  v-if="!blindMode || hasRevealedCurrent"
                  class="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100/70 text-rose-800"
                >
                  {{ getScoreLabel(scorePartner) }}
                </span>
                <span 
                  v-if="!blindMode || hasRevealedCurrent"
                  class="text-sm font-black text-rose-600 px-3 py-0.5 rounded-lg bg-rose-50 border border-rose-200 shadow-2xs"
                >
                  {{ scorePartner }} 分
                </span>
                <span v-else class="text-xs text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  🔒 已遮挡防窥
                </span>
              </div>
            </div>

            <!-- 滑动条与微调按钮 -->
            <div class="flex items-center gap-3">
              <button 
                @click="adjustScore('partner', -1)" 
                :disabled="hasRevealedCurrent || scorePartner <= 1"
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 font-bold text-xs flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
              >
                -
              </button>

              <div class="relative flex-1 flex items-center">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  v-model.number="scorePartner"
                  @input="handleSliderChange(scorePartner)"
                  :disabled="hasRevealedCurrent"
                  class="custom-slider w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <button 
                @click="adjustScore('partner', 1)" 
                :disabled="hasRevealedCurrent || scorePartner >= 10"
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 font-bold text-xs flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>

            <div class="flex justify-between text-[10px] text-slate-400 font-medium px-8">
              <span>1分 (极度克制)</span>
              <span>5分 (温和平衡)</span>
              <span>10分 (极度浓烈)</span>
            </div>
          </div>
        </div>

        <!-- 温差揭晓动态展示（点击测定温差后展开） -->
        <div v-if="hasRevealedCurrent" class="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-teal-50/80 via-emerald-50/70 to-pink-50/80 border border-teal-200 shadow-sm animate-fadeIn relative z-10">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs"
                  :class="tempDiff <= 1 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : (tempDiff <= 3 ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-rose-100 text-rose-800 border border-rose-300')"
                >
                  {{ currentResultComment.badge }}
                </span>
                <span class="text-sm font-black text-slate-800">
                  心理温差: <strong class="text-rose-600 text-xl font-black">{{ tempDiff }}</strong> 分
                </span>
              </div>
              <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {{ currentResultComment.desc }}
              </p>
            </div>

            <div class="text-right shrink-0 bg-white/80 p-2.5 rounded-xl border border-teal-100 shadow-2xs">
              <span class="text-[11px] text-slate-400 block font-semibold">本题同频度</span>
              <span class="text-xl font-black text-teal-600">{{ currentMatchPercent }}%</span>
            </div>
          </div>

          <!-- 双指针综合刻度尺图形 -->
          <div class="relative w-full h-11 bg-white rounded-xl border border-teal-200 shadow-inner px-4 flex items-center my-3">
            <!-- 刻度线 -->
            <div class="absolute inset-x-4 flex justify-between pointer-events-none">
              <span v-for="n in 10" :key="n" class="w-0.5 h-2.5 bg-slate-200"></span>
            </div>

            <!-- 男友位置标记 -->
            <div 
              class="absolute -top-3.5 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-10"
              :style="{ left: `${getScalePercent(scoreMe)}%` }"
            >
              <span class="text-[10px] font-black text-blue-600 bg-white/95 px-1.5 py-0.5 rounded shadow-2xs border border-blue-200">
                {{ appState.names.me }}: {{ scoreMe }}分
              </span>
              <span class="text-blue-500 text-xs">▼</span>
            </div>

            <!-- 女友位置标记 -->
            <div 
              class="absolute -bottom-3.5 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-10"
              :style="{ left: `${getScalePercent(scorePartner)}%` }"
            >
              <span class="text-rose-500 text-xs">▲</span>
              <span class="text-[10px] font-black text-rose-600 bg-white/95 px-1.5 py-0.5 rounded shadow-2xs border border-rose-200">
                {{ appState.names.partner }}: {{ scorePartner }}分
              </span>
            </div>

            <!-- 两点之间的温差连线高亮条 -->
            <div 
              class="h-2.5 bg-gradient-to-r from-teal-400 to-rose-400 rounded-full transition-all duration-500 opacity-80"
              :style="{
                marginLeft: `${Math.min(getScalePercent(scoreMe), getScalePercent(scorePartner))}%`,
                width: `${Math.max(2, Math.abs(getScalePercent(scoreMe) - getScalePercent(scorePartner)))}%`
              }"
            ></div>
          </div>
        </div>

        <!-- 底部控制按钮 -->
        <div class="flex items-center justify-between pt-4 border-t border-teal-100 relative z-10">
          <span class="text-xs text-slate-400">
            {{ hasRevealedCurrent ? '温差已测定，看看彼此的心理刻度' : '拖动滑块确定你俩内心的分值' }}
          </span>

          <div>
            <button 
              v-if="!hasRevealedCurrent"
              @click="revealDifference"
              class="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📏 测定本题温差</span>
              <span>&rarr;</span>
            </button>

            <button 
              v-else
              @click="nextQuestion"
              class="px-6 py-2.5 bg-gradient-to-r from-teal-500 via-rose-500 to-pink-500 hover:opacity-90 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {{ isLastQuestion ? '生成心理温差图谱与相处建议 &rarr;' : '下一场景 &rarr;' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏结算状态：温差总谱与恋爱建议 -->
    <div v-else class="space-y-6 animate-fadeIn">
      <!-- 汇总荣誉大卡片 -->
      <div class="glass-card rounded-3xl p-6 sm:p-8 text-center shadow-xl border border-teal-200 relative overflow-hidden backdrop-blur-md">
        <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-teal-500 to-rose-500 flex items-center justify-center text-white text-5xl shadow-lg shadow-teal-300 animate-pulse mb-3">
          📏
        </div>

        <div class="relative">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 shadow-2xs">
            ✨ {{ totalEvaluation.badge }}
          </span>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-800 mt-2 tracking-tight">
            平均心理温差：<span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-rose-600 font-extrabold">{{ avgDifference }} 分</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            综合同频指数高达 <strong class="text-teal-600 font-bold">{{ overallMatchScore }}%</strong>！
            {{ totalEvaluation.desc }}
          </p>
        </div>

        <!-- 通关奖励卡片 -->
        <div class="mt-6 p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-pink-50 border border-teal-200/80 max-w-lg mx-auto flex items-center justify-around text-xs font-bold text-slate-700 shadow-inner">
          <div class="flex items-center gap-1 text-sky-600">
            <span>💧 水滴</span>
            <span class="text-rose-600 font-black">+3</span>
          </div>
          <div class="flex items-center gap-1 text-amber-600">
            <span>☀️ 阳光</span>
            <span class="text-rose-600 font-black">+3</span>
          </div>
          <div class="flex items-center gap-1 text-emerald-600">
            <span>🌱 经验</span>
            <span class="text-rose-600 font-black">+20</span>
          </div>
          <div class="flex items-center gap-1 text-teal-600">
            <span>📊 敏锐感知</span>
            <span class="text-rose-600 font-black">+3分</span>
          </div>
        </div>
      </div>

      <!-- 新增：心理温差深度分析图谱 -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 shadow-sm border border-teal-200 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-teal-100 mb-4 gap-2">
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>📊 8大主观场景心理温差图谱</span>
            <span class="text-xs font-normal text-slate-400">细致审视两人的心理倾向</span>
          </h3>
          <span class="text-xs text-teal-700 font-bold bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            全场景测定完毕
          </span>
        </div>

        <div class="space-y-3.5">
          <div 
            v-for="(item, idx) in recordedResults" 
            :key="idx"
            class="p-4 rounded-xl border bg-white/90 border-slate-200/80 hover:border-teal-300 transition-all shadow-2xs"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ questions[idx].icon }}</span>
                <span class="text-xs font-bold text-slate-800">场景{{ idx + 1 }} · {{ questions[idx].category }}</span>
              </div>
              <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full"
                :class="item.diff <= 1 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : (item.diff <= 3 ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'bg-rose-100 text-rose-800 border border-rose-200')"
              >
                温差 {{ item.diff }} 分 · 同频 {{ item.match }}%
              </span>
            </div>

            <!-- 可视化柱状对比轨道 -->
            <div class="space-y-1.5 my-2">
              <!-- 男方条 -->
              <div class="flex items-center gap-2 text-xs">
                <span class="w-16 truncate text-blue-600 font-bold shrink-0">{{ appState.names.me }}:</span>
                <div class="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div 
                    class="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-1 text-[9px] text-white font-bold"
                    :style="{ width: `${(item.me / 10) * 100}%` }"
                  >
                    {{ item.me }}分
                  </div>
                </div>
              </div>

              <!-- 女方条 -->
              <div class="flex items-center gap-2 text-xs">
                <span class="w-16 truncate text-rose-600 font-bold shrink-0">{{ appState.names.partner }}:</span>
                <div class="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div 
                    class="h-full bg-rose-500 rounded-full transition-all duration-500 flex items-center justify-end pr-1 text-[9px] text-white font-bold"
                    :style="{ width: `${(item.partner / 10) * 100}%` }"
                  >
                    {{ item.partner }}分
                  </div>
                </div>
              </div>
            </div>

            <p class="text-[11px] text-slate-500 italic mt-1">
              {{ questions[idx].title }}
            </p>
          </div>
        </div>
      </div>

      <!-- 新增：恒温相处温馨建议 -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 shadow-sm border border-rose-200 bg-gradient-to-br from-rose-50/60 to-teal-50/60 backdrop-blur-md">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
          <span>💌 恒温相处定制温馨建议</span>
          <span class="text-xs font-normal text-rose-500">基于你们的心理温差生成的相处锦囊</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          <!-- 零温差默契高地 -->
          <div class="p-4 rounded-xl bg-white/90 border border-emerald-200 shadow-2xs space-y-1.5">
            <div class="flex items-center gap-1.5 font-bold text-emerald-800 text-sm">
              <span>🌟 天然共振高地：</span>
              <span>{{ bestMatchScene.category }} (温差{{ bestMatchScene.diff }}分)</span>
            </div>
            <p class="text-slate-600">
              你们在【{{ bestMatchScene.category }}】上的需求几乎如出一辙！这是保持长久亲密与舒适感的定海神针，日常相处时尽情享受这份不谋而合的心照不宣吧。
            </p>
          </div>

          <!-- 温差最大互补区域 -->
          <div class="p-4 rounded-xl bg-white/90 border border-rose-200 shadow-2xs space-y-1.5">
            <div class="flex items-center gap-1.5 font-bold text-rose-800 text-sm">
              <span>💡 恒温沟通密钥：</span>
              <span>{{ maxDiffScene.category }} (温差{{ maxDiffScene.diff }}分)</span>
            </div>
            <p class="text-slate-600">
              在【{{ maxDiffScene.category }}】上存在一定的温度差。一方更偏向{{ maxDiffScene.maxHolder }}，另一方更偏向{{ maxDiffScene.minHolder }}。记得给彼此留出包容的心理余量，不要把差异误会为冷淡哦~
            </p>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="flex items-center justify-center gap-4 pt-2 pb-6">
        <button 
          @click="restartGame"
          class="px-6 py-2.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-600 rounded-full text-xs sm:text-sm font-bold border border-teal-200 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          🔄 重新测量一轮
        </button>
        <button 
          @click="$emit('back')"
          class="px-8 py-2.5 bg-gradient-to-r from-teal-500 via-rose-500 to-pink-500 hover:opacity-90 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-teal-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          返回展区 &rarr;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import { appState, recordGameReward } from '@/状态/恋爱树状态.js'
import { soundManager } from './音效合成器.js'

defineEmits(['back'])

// 静音状态
const isMuted = ref(soundManager.muted)
function toggleAudio() {
  isMuted.value = soundManager.toggleMute()
}

// 8道主观场景题目
const questions = [
  {
    id: 1,
    icon: '🔋',
    category: '社交电量',
    title: '周末和一大群朋友聚会5小时后，你的能量续航状态？',
    desc: '衡量你们在社交之后，是需要立刻自闭充电，还是能持续嗨聊？',
    minDesc: '彻底耗尽，必须断联自闭3天',
    maxDesc: '满血澎湃，甚至还想通宵转场K歌'
  },
  {
    id: 2,
    icon: '🍋',
    category: '吃醋敏感度',
    title: '看到有异性朋友在TA的朋友圈频繁热络互动，你的内心吃醋度？',
    desc: '衡量在日常交往中，彼此对边界感与安全感的感知敏锐度。',
    minDesc: '完全云淡风轻，信任至上',
    maxDesc: '醋意滔天，暗中观察并立刻宣示主权'
  },
  {
    id: 3,
    icon: '🐱',
    category: '分享欲播报',
    title: '走在路上偶遇一只特别逗的小猫或一朵奇特的云，想发给TA的冲动？',
    desc: '衡量你们日常生活琐碎信息的互通渴望度。',
    minDesc: '克制内敛，有重要事件才说',
    maxDesc: '24小时全天候直播，每分每秒都想分享'
  },
  {
    id: 4,
    icon: '💐',
    category: '仪式感期待',
    title: '对于恋爱纪念日、情人节与生日，你对仪式感的隆重期望？',
    desc: '衡量你们在浪漫安排、惊喜制造与生活诗意上的期待契合度。',
    minDesc: '粗茶淡饭最真，简简单单吃顿便饭就好',
    maxDesc: '仪式感至高无上，鲜花蛋糕手写信缺一不可'
  },
  {
    id: 5,
    icon: '🧘',
    category: '独立私密空间',
    title: '在亲密相处时，你每周必须拥有的专属独处发呆时间？',
    desc: '衡量你们在“黏人贴贴”与“独立自由”之间的平衡偏好。',
    minDesc: '24小时连体婴，随时随地都要贴贴',
    maxDesc: '独立星人，每天必须有一段谁也不理的私密时间'
  },
  {
    id: 6,
    icon: '💸',
    category: '消费安全感储备',
    title: '发了工资或奖金后，你对于将大部分资金存起来的心理需求度？',
    desc: '衡量你们在未雨绸缪存钱与即时享受犒劳生活之间的平衡倾向。',
    minDesc: '活在当下，吃喝玩乐买体验最重要',
    maxDesc: '高筑防御，看到账户余额增长才有踏实安全感'
  },
  {
    id: 7,
    icon: '🧊',
    category: '矛盾冷战耐受度',
    title: '两人产生小情绪摩擦时，你对短时间冷淡或互不理睬的耐受上限？',
    desc: '衡量在面对矛盾时，是渴望立竿见影说开，还是允许彼此冷静沉淀。',
    minDesc: '0耐受！1分钟冷战都受不了，必须立刻拥抱说开',
    maxDesc: '高耐受，可以各自冷静一天，想清楚再沟通'
  },
  {
    id: 8,
    icon: '🎁',
    category: '突发小惊喜渴望',
    title: '在平淡的日常生活中，你对TA突然制造意料之外小浪漫的渴望度？',
    desc: '衡量对于打破生活惯性、制造恋爱小涟漪的心理期待值。',
    minDesc: '平淡踏实即幸福，太突然的惊喜容易不知所措',
    maxDesc: '极度渴望生活惊喜，随时期待被意外宠溺'
  }
]

// 流程状态
const currentIndex = ref(0)
const blindMode = ref(false)
const hasRevealedCurrent = ref(false)
const isCompleted = ref(false)
const hasRewarded = ref(false)

// 临时打分
const scoreMe = ref(5)
const scorePartner = ref(5)

// 记录所有结果
const recordedResults = ref([])

const currentQuestion = computed(() => questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === questions.length - 1)

// 刻度描述映射
function getScoreLabel(val) {
  if (val <= 2) return '极低/克制'
  if (val <= 4) return '温和/轻度'
  if (val <= 6) return '适中/平衡'
  if (val <= 8) return '活跃/高需求'
  return '满格/极度浓烈'
}

function handleSliderChange(val) {
  soundManager.playSliderTick(val)
}

function adjustScore(role, delta) {
  if (role === 'me') {
    scoreMe.value = Math.max(1, Math.min(10, scoreMe.value + delta))
    soundManager.playSliderTick(scoreMe.value)
  } else {
    scorePartner.value = Math.max(1, Math.min(10, scorePartner.value + delta))
    soundManager.playSliderTick(scorePartner.value)
  }
}

function toggleBlindMode() {
  blindMode.value = !blindMode.value
  soundManager.playBubble()
}

// 计算当前温差
const tempDiff = computed(() => {
  return Math.abs(scoreMe.value - scorePartner.value)
})

// 计算当前题契合度
const currentMatchPercent = computed(() => {
  return Math.max(0, 100 - tempDiff.value * 10)
})

// 当前温差点评
const currentResultComment = computed(() => {
  const diff = tempDiff.value
  if (diff === 0) {
    return {
      badge: '🎯 零温差绝对共鸣',
      desc: '你们俩在这件事上的主观感受居然分毫不差！完全是心连心的共频体验。'
    }
  } else if (diff <= 2) {
    return {
      badge: '🍃 微风拂面极度同调',
      desc: '温差极小，步调非常一致，相处起来毫不费力且天然默契！'
    }
  } else if (diff <= 4) {
    return {
      badge: '🤝 和而不同视角互补',
      desc: '存在些许温差，但正好形成互补，能为彼此的生活打开不同的窗户。'
    }
  } else {
    return {
      badge: '🪐 双星引力反差萌',
      desc: '两极的感受碰撞！爱正是因为彼此的不同而变得深邃而丰富，记得多给TA一些包容与理解哦。'
    }
  }
})

// 刻度百分比转换 (1~10 分映射为 0%~100%)
function getScalePercent(val) {
  return Math.round(((val - 1) / 9) * 100)
}

// 揭晓温差
function revealDifference() {
  hasRevealedCurrent.value = true
  if (tempDiff.value <= 1) {
    soundManager.playMatchSuccess()
  } else {
    soundManager.playLockIn()
  }
}

// 下一题处理
function nextQuestion() {
  soundManager.playCardFlip()
  // 保存本题记录
  recordedResults.value[currentIndex.value] = {
    me: scoreMe.value,
    partner: scorePartner.value,
    diff: tempDiff.value,
    match: currentMatchPercent.value
  }

  if (isLastQuestion.value) {
    finishGame()
  } else {
    currentIndex.value++
    hasRevealedCurrent.value = false
    scoreMe.value = 5
    scorePartner.value = 5
  }
}

// 平均温差
const avgDifference = computed(() => {
  if (recordedResults.value.length === 0) return 0
  const totalDiff = recordedResults.value.reduce((acc, cur) => acc + cur.diff, 0)
  return (totalDiff / recordedResults.value.length).toFixed(1)
})

// 综合同频指数
const overallMatchScore = computed(() => {
  if (recordedResults.value.length === 0) return 0
  const avg = parseFloat(avgDifference.value)
  return Math.max(0, Math.round(100 - avg * 10))
})

// 最佳契合场景与最大温差场景
const bestMatchScene = computed(() => {
  if (recordedResults.value.length === 0) return { category: '整体共鸣', diff: 0 }
  let bestIdx = 0
  let minDiff = 999
  recordedResults.value.forEach((r, idx) => {
    if (r.diff < minDiff) {
      minDiff = r.diff
      bestIdx = idx
    }
  })
  return { category: questions[bestIdx].category, diff: minDiff }
})

const maxDiffScene = computed(() => {
  if (recordedResults.value.length === 0) return { category: '互补视角', diff: 0, maxHolder: '', minHolder: '' }
  let maxIdx = 0
  let maxDiff = -1
  recordedResults.value.forEach((r, idx) => {
    if (r.diff > maxDiff) {
      maxDiff = r.diff
      maxIdx = idx
    }
  })
  const target = recordedResults.value[maxIdx]
  const isMeHigher = target.me > target.partner
  return {
    category: questions[maxIdx].category,
    diff: maxDiff,
    maxHolder: isMeHigher ? `${appState.names.me}（更热烈）` : `${appState.names.partner}（更热烈）`,
    minHolder: isMeHigher ? `${appState.names.partner}（更克制）` : `${appState.names.me}（更克制）`
  }
})

// 总评
const totalEvaluation = computed(() => {
  const score = overallMatchScore.value
  if (score >= 85) {
    return {
      badge: '恒温挚爱 · 灵魂共振标尺',
      desc: '你们的内心标尺几乎严丝合缝！在几乎所有主观感受和情绪需求上都能相互理解，天生一对。'
    }
  } else if (score >= 70) {
    return {
      badge: '温柔恒定 · 舒心契合伴侣',
      desc: '温差控制在非常舒适的区间，既有相同的温度，又保留了彼此的个性空间，相处十分甜蜜惬意。'
    }
  } else {
    return {
      badge: '奇妙反差 · 丰富多元的爱',
      desc: '你们对世界有着不一样的温度感知，但也正因如此，你们拼在一起才拥有了全光谱的完整世界！'
    }
  }
})

// 完成结算
function finishGame() {
  isCompleted.value = true
  soundManager.playFanfare()
  
  try {
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0d9488', '#10b981', '#f43f5e', '#ec4899']
    })
  } catch (e) {}

  if (!hasRewarded.value) {
    recordGameReward('spectrum', { water: 3, sun: 3, exp: 20, radarCategory: '敏锐感知', radarDelta: 3 })
    hasRewarded.value = true
  }
}

// 重新开始
function restartGame() {
  soundManager.playBubble()
  currentIndex.value = 0
  hasRevealedCurrent.value = false
  isCompleted.value = false
  hasRewarded.value = false
  scoreMe.value = 5
  scorePartner.value = 5
  recordedResults.value = []
}
</script>

<style scoped>
.custom-slider {
  background: linear-gradient(to right, #0d9488, #f43f5e);
}

.animate-fadeIn {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
