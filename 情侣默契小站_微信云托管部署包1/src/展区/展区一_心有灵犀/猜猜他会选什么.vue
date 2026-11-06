<template>
  <div class="w-full max-w-4xl mx-auto py-2 px-3 sm:px-6">
    <!-- 顶部状态栏与返回按钮 -->
    <div class="flex items-center justify-between mb-5">
      <button 
        @click="$emit('back')" 
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-purple-600 border border-purple-200/80 shadow-xs text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span>&larr;</span>
        <span>返回展区</span>
      </button>

      <div class="flex items-center gap-2">
        <!-- 音效开关 -->
        <button 
          @click="toggleAudio"
          class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 hover:bg-white border border-purple-200/80 shadow-2xs text-slate-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>{{ isMuted ? '🔇 静音' : '🎵 音效开' }}</span>
        </button>

        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1 shadow-2xs">
          <span>🎁</span> 猜猜TA会选什么 · 换位盲盒
        </span>
      </div>
    </div>

    <!-- 游戏未完成状态 -->
    <div v-if="!isCompleted" class="space-y-6">
      <!-- 角色与轮次设定栏 -->
      <div class="glass-card rounded-2xl p-4 sm:p-5 shadow-sm border border-purple-200/80 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <!-- 角色阵营身份说明与一键交接身份按钮 -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs text-slate-500 font-medium">当前角色：</span>
            <div class="flex items-center gap-2 bg-purple-50/90 px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-700 shadow-2xs">
              <span class="text-blue-600 flex items-center gap-1">
                <span>👤 主角:</span>
                <strong class="underline decoration-blue-300">{{ targetName }}</strong>
              </span>
              <span class="text-purple-300 font-normal">|</span>
              <span class="text-purple-600 flex items-center gap-1">
                <span>🔮 猜心者:</span>
                <strong class="underline decoration-purple-300">{{ guesserName }}</strong>
              </span>
            </div>

            <!-- 一键交接身份按钮 -->
            <button 
              @click="swapRoles"
              class="px-3 py-1 rounded-xl text-xs font-bold bg-white hover:bg-purple-50 text-purple-600 border border-purple-200/80 shadow-2xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              title="交换主角与猜心者身份"
            >
              <span>⇄</span>
              <span>一键交接身份</span>
            </button>
          </div>

          <!-- 答题进度与当前得分 -->
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>第 <strong class="text-purple-600 text-sm font-black">{{ currentIndex + 1 }}</strong> / {{ questions.length }} 题</span>
            <span class="w-1.5 h-1.5 rounded-full bg-purple-300"></span>
            <span>已猜中 <strong class="text-emerald-600 font-bold">{{ correctCount }}</strong> 题</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="w-full h-2 bg-purple-100/60 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            class="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-rose-500 rounded-full transition-all duration-300"
            :style="{ width: `${((currentIndex + (subStep === 'reveal' ? 1 : 0.5)) / questions.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- 游戏主交互卡片 -->
      <div class="glass-card rounded-3xl p-5 sm:p-8 shadow-md border border-purple-200 relative overflow-hidden backdrop-blur-md">
        <!-- 装饰渐变光圈 -->
        <div class="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-100/50 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -right-12 -top-12 w-48 h-48 bg-pink-100/40 rounded-full blur-2xl pointer-events-none"></div>

        <!-- 步骤提示徽章 -->
        <div class="text-center mb-5 relative z-10">
          <div class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold mb-3 shadow-2xs transition-all"
            :class="{
              'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse': subStep === 'answer',
              'bg-purple-100 text-purple-700 border border-purple-200 animate-pulse': subStep === 'guess',
              'bg-rose-100 text-rose-700 border border-rose-200': subStep === 'reveal'
            }"
          >
            <template v-if="subStep === 'answer'">
              <span>🔒 步骤一：主角心声</span>
              <span>· 请 {{ targetName }} 作答，{{ guesserName }} 请自觉闭眼哦！</span>
            </template>
            <template v-else-if="subStep === 'guess'">
              <span>🔮 步骤二：读心时刻</span>
              <span>· 请 {{ guesserName }} 换位猜测：TA会选哪一个？</span>
            </template>
            <template v-else>
              <span>🎉 步骤三：盲盒揭晓</span>
              <span>· 看看你们是否心有灵犀！</span>
            </template>
          </div>

          <div class="text-xs font-bold text-purple-500 mb-1">
            场景 {{ currentIndex + 1 }} · {{ currentQuestion.theme }}
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {{ currentQuestion.title }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            {{ currentQuestion.prompt }}
          </p>
        </div>

        <!-- 选项展示区（双选项） -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-6 relative z-10">
          <!-- 选项 A -->
          <div 
            @click="handleOptionClick('A')"
            class="group relative rounded-2xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer select-none shadow-xs"
            :class="getOptionCardClass('A')"
          >
            <div class="flex items-start gap-3.5">
              <div class="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-rose-100/60 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                {{ currentQuestion.optA.emoji }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-rose-500 uppercase tracking-wider">选项 A</span>
                  <span class="text-[11px] text-slate-400 font-bold px-2 py-0.5 rounded-md bg-slate-100/80">{{ currentQuestion.optA.tag }}</span>
                </div>
                <h4 class="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
                  {{ currentQuestion.optA.text }}
                </h4>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                  {{ currentQuestion.optA.desc }}
                </p>
              </div>
            </div>

            <!-- 揭晓状态下的对比标记 -->
            <div v-if="subStep === 'reveal'" class="mt-4 pt-3 border-t border-purple-100 flex flex-wrap gap-2 text-xs font-bold">
              <span v-if="historyRecords[currentIndex]?.targetChoice === 'A'" class="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 flex items-center gap-1 shadow-2xs">
                <span>👤 {{ targetName }} 的心意</span>
              </span>
              <span v-if="historyRecords[currentIndex]?.guessChoice === 'A'" class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 flex items-center gap-1 shadow-2xs">
                <span>🔮 {{ guesserName }} 的猜测</span>
              </span>
            </div>

            <!-- 当前选中的指示浮标 -->
            <div v-else-if="isSelectedInCurrentStep('A')" class="mt-3 flex justify-end">
              <span class="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs flex items-center gap-1"
                :class="subStep === 'answer' ? 'bg-blue-500 ring-2 ring-blue-300' : 'bg-purple-500 ring-2 ring-purple-300'"
              >
                <span>✓ 已选此项</span>
              </span>
            </div>
          </div>

          <!-- 选项 B -->
          <div 
            @click="handleOptionClick('B')"
            class="group relative rounded-2xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer select-none shadow-xs"
            :class="getOptionCardClass('B')"
          >
            <div class="flex items-start gap-3.5">
              <div class="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-amber-100/60 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                {{ currentQuestion.optB.emoji }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">选项 B</span>
                  <span class="text-[11px] text-slate-400 font-bold px-2 py-0.5 rounded-md bg-slate-100/80">{{ currentQuestion.optB.tag }}</span>
                </div>
                <h4 class="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
                  {{ currentQuestion.optB.text }}
                </h4>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                  {{ currentQuestion.optB.desc }}
                </p>
              </div>
            </div>

            <!-- 揭晓状态下的对比标记 -->
            <div v-if="subStep === 'reveal'" class="mt-4 pt-3 border-t border-purple-100 flex flex-wrap gap-2 text-xs font-bold">
              <span v-if="historyRecords[currentIndex]?.targetChoice === 'B'" class="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 flex items-center gap-1 shadow-2xs">
                <span>👤 {{ targetName }} 的心意</span>
              </span>
              <span v-if="historyRecords[currentIndex]?.guessChoice === 'B'" class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 flex items-center gap-1 shadow-2xs">
                <span>🔮 {{ guesserName }} 的猜测</span>
              </span>
            </div>

            <!-- 当前选中的指示浮标 -->
            <div v-else-if="isSelectedInCurrentStep('B')" class="mt-3 flex justify-end">
              <span class="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs flex items-center gap-1"
                :class="subStep === 'answer' ? 'bg-blue-500 ring-2 ring-blue-300' : 'bg-purple-500 ring-2 ring-purple-300'"
              >
                <span>✓ 已选此项</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 揭晓深度解读与甜蜜互动卡片（仅在 reveal 步骤显示） -->
        <div v-if="subStep === 'reveal'" class="my-5 p-5 rounded-2xl border transition-all animate-fadeIn"
          :class="isCurrentMatch 
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
            : 'bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border-rose-300 text-rose-900 shadow-sm'"
        >
          <div class="flex items-start gap-3.5">
            <span class="text-3xl sm:text-4xl shrink-0">{{ isCurrentMatch ? '💖' : '💌' }}</span>
            <div class="flex-1 space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm sm:text-base font-black">
                    {{ isCurrentMatch ? '心有灵犀！完全猜中啦！' : '哎呀，这次猜得有点偏差哦~' }}
                  </h4>
                  <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full"
                    :class="isCurrentMatch ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'"
                  >
                    {{ isCurrentMatch ? '✨ 专属称号：' + currentQuestion.matchTitle : '💡 甜蜜互动锦囊' }}
                  </span>
                </div>
              </div>

              <!-- 深度换位心理剖析 -->
              <div class="p-3 bg-white/80 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                <strong class="text-purple-600 block mb-0.5">🧠 换位心理独家解析：</strong>
                {{ currentQuestion.psychology }}
              </div>

              <!-- 猜错趣味小惩罚/猜中奖励提示 -->
              <div class="p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                :class="isCurrentMatch ? 'bg-emerald-100/70 text-emerald-800' : 'bg-rose-100/70 text-rose-800'"
              >
                <span>{{ isCurrentMatch ? '🎁 伴侣奖励：' : '🍭 趣味甜蜜互动任务：' }}</span>
                <span>{{ isCurrentMatch ? currentQuestion.matchReward : currentQuestion.punishHint }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部主操作按钮 -->
        <div class="flex items-center justify-between pt-4 border-t border-purple-100">
          <div class="text-xs text-slate-400">
            <template v-if="subStep === 'answer'">
              请确保身边人没有偷瞄哦~
            </template>
            <template v-else-if="subStep === 'guess'">
              根据你对TA的平时了解大胆猜！
            </template>
            <template v-else>
              沟通好两人的想法后继续~
            </template>
          </div>

          <div>
            <!-- 步骤一确定：锁定心意 -->
            <button 
              v-if="subStep === 'answer'"
              @click="confirmTargetChoice"
              :disabled="!tempTargetChoice"
              class="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔒 锁定心意，交给TA猜</span>
              <span>&rarr;</span>
            </button>

            <!-- 步骤二确定：开箱揭晓 -->
            <button 
              v-else-if="subStep === 'guess'"
              @click="confirmGuesserChoice"
              :disabled="!tempGuesserChoice"
              class="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🎁 打开盲盒对答案</span>
              <span>&rarr;</span>
            </button>

            <!-- 步骤三确定：下一题或查看总评 -->
            <button 
              v-else
              @click="proceedToNext"
              class="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {{ isLastQuestion ? '查看盲盒总成绩 &rarr;' : '继续下一题 &rarr;' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏结算大看板 -->
    <div v-else class="space-y-6 animate-fadeIn">
      <!-- 汇总荣誉大卡 -->
      <div class="glass-card rounded-3xl p-6 sm:p-8 text-center shadow-xl border border-purple-200 relative overflow-hidden backdrop-blur-md">
        <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-500 to-rose-500 flex items-center justify-center text-white text-5xl shadow-lg shadow-purple-300 animate-pulse mb-3">
          🎁
        </div>

        <div class="relative">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 shadow-2xs">
            🔮 {{ finalEvaluation.title }}
          </span>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-800 mt-2 tracking-tight">
            猜中率：<span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-extrabold">{{ matchRate }}%</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            在 {{ questions.length }} 道深度换位盲盒题中，{{ guesserName }} 成功洞察到了 {{ targetName }} <strong class="text-purple-600 font-bold">{{ correctCount }}</strong> 次真实心声！
            {{ finalEvaluation.desc }}
          </p>
        </div>

        <!-- 通关养分与雷达奖励卡片 -->
        <div class="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border border-purple-200/80 max-w-lg mx-auto flex items-center justify-around text-xs font-bold text-slate-700 shadow-inner">
          <div class="flex items-center gap-1 text-sky-600">
            <span>💧 水滴</span>
            <span class="text-rose-600 font-black">+3</span>
          </div>
          <div class="flex items-center gap-1 text-amber-600">
            <span>☀️ 阳光</span>
            <span class="text-rose-600 font-black">+2</span>
          </div>
          <div class="flex items-center gap-1 text-emerald-600">
            <span>🌱 经验</span>
            <span class="text-rose-600 font-black">+20</span>
          </div>
          <div class="flex items-center gap-1 text-purple-600">
            <span>📊 敏锐感知</span>
            <span class="text-rose-600 font-black">+3分</span>
          </div>
        </div>
      </div>

      <!-- 盲盒拆箱全纪录 -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 shadow-sm border border-purple-200 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-purple-100 mb-4 gap-2">
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>🗂️ 盲盒拆箱全纪录 (共{{ questions.length }}题)</span>
            <span class="text-xs font-normal text-slate-400">真实心意 vs 猜测视角</span>
          </h3>
          <span class="text-xs text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            猜中 {{ correctCount }} / {{ questions.length }} ({{ matchRate }}%)
          </span>
        </div>

        <div class="space-y-3">
          <div 
            v-for="(item, idx) in historyRecords" 
            :key="idx"
            class="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:shadow-xs"
            :class="item.isMatch ? 'bg-emerald-50/60 border-emerald-300' : 'bg-rose-50/60 border-rose-300'"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold text-slate-700">#{{ idx + 1 }} {{ questions[idx].theme }}</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold"
                  :class="item.isMatch ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'"
                >
                  {{ item.isMatch ? '🎉 准确命中' : '💬 甜蜜未猜中' }}
                </span>
              </div>
              <p class="text-xs text-slate-600 font-medium">{{ questions[idx].title }}</p>
            </div>

            <!-- 双方对比 -->
            <div class="flex items-center gap-2 text-xs w-full sm:w-auto shrink-0">
              <div class="flex-1 sm:flex-initial px-3 py-1.5 bg-white/95 rounded-lg border border-slate-200 text-center shadow-2xs">
                <span class="text-blue-500 font-bold block text-[10px]">{{ targetName }}真实想法</span>
                <span class="font-bold text-slate-700">
                  {{ item.targetChoice === 'A' ? questions[idx].optA.emoji + ' ' + questions[idx].optA.tag : questions[idx].optB.emoji + ' ' + questions[idx].optB.tag }}
                </span>
              </div>

              <span class="text-purple-300 font-bold">vs</span>

              <div class="flex-1 sm:flex-initial px-3 py-1.5 bg-white/95 rounded-lg border border-slate-200 text-center shadow-2xs">
                <span class="text-purple-500 font-bold block text-[10px]">{{ guesserName }}的盲猜</span>
                <span class="font-bold text-slate-700">
                  {{ item.guessChoice === 'A' ? questions[idx].optA.emoji + ' ' + questions[idx].optA.tag : questions[idx].optB.emoji + ' ' + questions[idx].optB.tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="flex items-center justify-center gap-4 pt-2 pb-6">
        <button 
          @click="swapAndRestart"
          class="px-6 py-2.5 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-600 rounded-full text-xs sm:text-sm font-bold border border-purple-200 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          ⇄ 互换角色再猜一轮
        </button>
        <button 
          @click="$emit('back')"
          class="px-8 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-purple-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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

// 10道深度心意换位盲盒题目
const questions = [
  {
    id: 1,
    theme: '假期余温',
    title: '长假的最后一天下午，TA内心最想怎么度过？',
    prompt: '是希望用独处的安静充电，还是和你一起抓住假期的尾巴？',
    optA: { emoji: '🛋️', text: '瘫在家里躺平刷剧', tag: '静止自愈', desc: '吃零食、打游戏、不出门，为明天的工作学习积攒电量' },
    optB: { emoji: '☕', text: '拉你出去找好吃的', tag: '仪式收官', desc: '去常去的咖啡馆或散步看晚霞，把浪漫过满到最后一秒' },
    psychology: '选择静止代表TA把安全感建立在稳定与休整上；选择仪式收官代表TA更注重与爱人共享时光的珍贵仪式感。',
    matchTitle: '假期充电心电图精算师',
    matchReward: '奖励TA今晚挑选想看的电影或电视节目！',
    punishHint: '罚你给TA泡一杯温热的蜂蜜水或剥一个新鲜橘子！'
  },
  {
    id: 2,
    theme: '飞来横财',
    title: '如果突然收到一笔意外奖励（如5000元），TA第一反应是？',
    prompt: '面对突如其来的小惊喜，TA是理智长远还是立刻浪漫？',
    optA: { emoji: '💰', text: '存进金库或买实用大件', tag: '未雨绸缪', desc: '作为恋爱梦想基金存起来，或者入手种草已久的生活改善好物' },
    optB: { emoji: '✈️', text: '立刻订酒店安排双人出游', tag: '即刻浪漫', desc: '金钱有价回忆无价！马上带你去心驰神往的目的地享受二人世界' },
    psychology: '未雨绸缪体现了对未来共同生活的责任感；即刻浪漫展现了活在当下、渴望与你共创璀璨记忆的深情。',
    matchTitle: '财富与浪漫金牌管家',
    matchReward: 'TA承诺未来带你去一次TA最想去的美食餐厅！',
    punishHint: '罚你夸赞TA理财/生活眼光3句真挚情话！'
  },
  {
    id: 3,
    theme: '烦恼消化',
    title: '在外面遇到委屈或情绪低谷时，TA此刻最渴望的是？',
    prompt: '当情绪乌云笼罩时，TA的心灵避风港是怎样的？',
    optA: { emoji: '🎧', text: '一个人戴耳机发呆沉淀', tag: '自我消化', desc: '不想把负能量传染给你，想先自己安静把事情理顺' },
    optB: { emoji: '🫂', text: '钻进你怀里求摸头吐槽', tag: '依恋倾诉', desc: '需要你的拥抱、偏爱和毫无保留的倾听，被爱瞬间治愈' },
    psychology: '自我消化的人往往内心体贴、害怕给伴侣增加负担；依恋倾诉的人则对你拥有极高信任度和情感依赖。',
    matchTitle: '心灵乌云驱散专家',
    matchReward: '享受对方一个长达10秒的深情大拥抱！',
    punishHint: '罚你轻揉TA的肩膀2分钟，并认真对TA说“以后难过都有我在”！'
  },
  {
    id: 4,
    theme: '超市驻足',
    title: '两个人一起逛大型生活超市，TA绝对会拉着你去的区域？',
    prompt: '推着购物车时，TA的眼睛总是在哪里放光？',
    optA: { emoji: '🍫', text: '膨化零食与冰饮专区', tag: '快乐源泉', desc: '挑选最新口味的薯片、辣条、冰淇淋，囤满零食抽屉' },
    optB: { emoji: '🥐', text: '烘焙熟食与生鲜试吃', tag: '烟火人间', desc: '闻着现烤面包的香气，研究今晚给两人做一顿什么丰盛大餐' },
    psychology: '零食区充满孩子气与多巴胺狂欢；生鲜烘焙区则是充满生活烟火气与共筑小家的踏实感。',
    matchTitle: '购物车偷心大盗',
    matchReward: 'TA下次逛街主动帮你提购物袋！',
    punishHint: '罚你下次陪TA去逛街时给TA买一份TA最喜欢的零食！'
  },
  {
    id: 5,
    theme: '小口角反应',
    title: '两个人发生小分歧闹脾气时，TA内心最直接的想法是？',
    prompt: '在情绪上头的瞬间，TA更倾向怎么应对？',
    optA: { emoji: '🧊', text: '先冷静分开半小时', tag: '理智避险', desc: '深怕冲动之下说出后悔的话伤害感情，想等理智上线再谈' },
    optB: { emoji: '🤝', text: '一分钟都不想拖，立刻说开', tag: '直球解结', desc: '受不了冷落与距离感，必须马上拉着手把心结彻底打开' },
    psychology: '冷静的人是保护机制优先，怕伤害爱；立刻说开的人是依恋机制优先，怕冷落隔阂。理解这一点是亲密关系升华的钥匙。',
    matchTitle: '情绪灭火王牌特工',
    matchReward: '免除一次未来做家务的特权！',
    punishHint: '罚你主动牵起TA的手，深情注视对方双眼5秒并亲一下！'
  },
  {
    id: 6,
    theme: '礼物心意',
    title: '在恋爱纪念日，TA内心深处更被哪种礼物深深打动？',
    prompt: '怎样的礼物最能直接叩响TA的心门？',
    optA: { emoji: '💌', text: '手写长信与专属回忆册', tag: '深情手作', desc: '一字一句记录彼此走过的时光，充满无可替代的真挚温度' },
    optB: { emoji: '🎁', text: '购物车心仪很久的梦想物', tag: '心愿实现', desc: '你竟然悄悄记住了TA想要的东西，惊喜与满足感瞬间爆棚' },
    psychology: '手写信看重情感价值与时间投入；购物车心仪物看重对TA平时生活细节的洞察与宠爱。',
    matchTitle: '心愿盲盒拆箱宗师',
    matchReward: '获得TA为你亲手写一句专属情话在便签纸上的机会！',
    punishHint: '罚你在手机备忘录里立刻记下TA最想要的一样小东西！'
  },
  {
    id: 7,
    theme: '约会穿搭',
    title: '周末精心挑选约会着装，TA更享受哪种感觉？',
    prompt: 'TA的穿搭哲学更偏向实用惬意还是仪式感？',
    optA: { emoji: '👟', text: '自在随性的宽松舒适风', tag: '惬意自然', desc: '怎么舒服怎么来，和你在一起可以完全不用紧绷' },
    optB: { emoji: '👗', text: '用心呼应的情侣氛围感', tag: '精致上镜', desc: '配色精心搭调，走在街上让人一看就是登对的一对璧人' },
    psychology: '随性代表你给了TA百分百安全感；精心呼应代表TA视每次相聚如初见，珍视二人合体的甜蜜光芒。',
    matchTitle: '恋爱穿搭美学大师',
    matchReward: '由你决定下次约会对方穿什么风格！',
    punishHint: '罚你认真夸对方今天的发型或衣服很好看！'
  },
  {
    id: 8,
    theme: '深夜罪恶',
    title: '半夜突然肚子咕咕叫，TA最无法拒绝的夜宵诱惑是？',
    prompt: '在深夜的食欲面前，哪一道美味拥有最高暴击？',
    optA: { emoji: '🍗', text: '火辣喷香的烧烤炸鸡', tag: '罪恶狂欢', desc: '孜然辣椒的香气配上冰镇可乐，快乐到灵魂出窍' },
    optB: { emoji: '🍜', text: '热气腾腾的砂锅汤面', tag: '暖胃治愈', desc: '咕嘟咕嘟的浓郁热汤配上一颗荷包蛋，暖胃又踏实' },
    psychology: '烧烤炸鸡是多巴胺的狂欢派对；砂锅汤面是温暖内心的慢火疗愈。',
    matchTitle: '深夜觅食灵魂雷达',
    matchReward: '今晚对方喂你吃第一口好吃的！',
    punishHint: '罚你现在给TA倒一杯温水端到面前！'
  },
  {
    id: 9,
    theme: '秘密小情绪',
    title: '如果TA最近工作特别累，TA最希望你为TA做的是？',
    prompt: '当身心疲惫时，哪一种陪伴最能消解疲倦？',
    optA: { emoji: '💆', text: '安静地默默帮TA打理好家务', tag: '默默守护', desc: '放好热水澡，把房间收拾整齐，给TA一个最舒适的港湾' },
    optB: { emoji: '🍿', text: '拉TA出门散心吃大餐转转移注意力', tag: '带TA逃离', desc: '带TA去透透气，用欢声笑语和美味彻底冲刷掉工作烦恼' },
    psychology: '默默打理是如水般润物细无声的体贴；带TA逃离是用阳光穿透阴霾的积极拯救。',
    matchTitle: '解忧杂货铺首席掌柜',
    matchReward: '享受对方给你的专属揉肩按摩！',
    punishHint: '罚你轻轻摸摸TA的头并温和地说一声“辛苦啦宝贝”！'
  },
  {
    id: 10,
    theme: '理想求婚',
    title: '在心中最完美的求婚或告白场景中，TA更倾向？',
    prompt: '是挚友见证的盛大浪漫，还是二人独享的私密星空？',
    optA: { emoji: '🎆', text: '好友欢聚助阵的惊喜现场', tag: '热烈见证', desc: '在挚爱亲友的欢呼与掌声中，留下毕生难忘的高光瞬间' },
    optB: { emoji: '🌌', text: '只有两个人的海边/星空下', tag: '纯粹私密', desc: '海浪轻拍，繁星满天，在最真挚的眼眸中私定终身' },
    psychology: '热烈见证者渴望将幸福昭告世界并得到祝福；纯粹私密者认为爱是两个人最隐秘最神圣的灵魂契约。',
    matchTitle: '终极浪漫预言神使',
    matchReward: '获得兑现未来一个浪漫小愿望的心愿卡一张！',
    punishHint: '罚你拉着对方的手，深情唱两句TA喜欢的浪漫情歌！'
  }
]

// 角色设置：主角是谁，猜心者是谁
const isTargetMe = ref(true)
const targetName = computed(() => isTargetMe.value ? appState.names.me : appState.names.partner)
const guesserName = computed(() => isTargetMe.value ? appState.names.partner : appState.names.me)

// 当前题目与流程状态
const currentIndex = ref(0)
const subStep = ref('answer') // 'answer' (主角作答) | 'guess' (猜心者猜) | 'reveal' (揭晓盲盒)
const isCompleted = ref(false)
const hasRewarded = ref(false)

// 临时选择
const tempTargetChoice = ref('')
const tempGuesserChoice = ref('')

// 历史记录
const historyRecords = ref([])

const currentQuestion = computed(() => questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === questions.length - 1)

// 判断当前卡片样式
function getOptionCardClass(opt) {
  if (subStep.value === 'reveal') {
    const rec = historyRecords.value[currentIndex.value]
    if (rec && rec.targetChoice === opt) {
      return 'bg-blue-50/90 border-blue-400 shadow-md scale-[1.01]'
    }
    if (rec && rec.guessChoice === opt) {
      return 'bg-purple-50/90 border-purple-400 shadow-md'
    }
    return 'bg-white/70 border-slate-100 opacity-60'
  }

  const selected = isSelectedInCurrentStep(opt)
  if (selected) {
    return subStep.value === 'answer'
      ? 'bg-blue-50/90 border-blue-400 shadow-md scale-[1.01]'
      : 'bg-purple-50/90 border-purple-400 shadow-md scale-[1.01]'
  }
  return 'bg-white/80 hover:bg-white border-purple-100/90 hover:border-purple-300'
}

function isSelectedInCurrentStep(opt) {
  if (subStep.value === 'answer') {
    return tempTargetChoice.value === opt
  } else if (subStep.value === 'guess') {
    return tempGuesserChoice.value === opt
  }
  return false
}

function handleOptionClick(opt) {
  soundManager.playBubble()
  if (subStep.value === 'answer') {
    tempTargetChoice.value = opt
  } else if (subStep.value === 'guess') {
    tempGuesserChoice.value = opt
  }
}

// 主角确认心意
function confirmTargetChoice() {
  soundManager.playLockIn()
  subStep.value = 'guess'
}

// 猜心者确认猜测并揭晓
function confirmGuesserChoice() {
  const match = tempTargetChoice.value === tempGuesserChoice.value
  historyRecords.value[currentIndex.value] = {
    targetChoice: tempTargetChoice.value,
    guessChoice: tempGuesserChoice.value,
    isMatch: match
  }
  subStep.value = 'reveal'

  if (match) {
    soundManager.playMatchSuccess()
    try {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#a855f7', '#ec4899', '#f43f5e', '#3b82f6']
      })
    } catch (e) {}
  } else {
    soundManager.playLockIn()
  }
}

// 当前题是否猜中
const isCurrentMatch = computed(() => {
  return historyRecords.value[currentIndex.value]?.isMatch
})

// 下一题处理
function proceedToNext() {
  soundManager.playCardFlip()
  if (isLastQuestion.value) {
    finishGame()
  } else {
    currentIndex.value++
    subStep.value = 'answer'
    tempTargetChoice.value = ''
    tempGuesserChoice.value = ''
  }
}

// 交换角色
function swapRoles() {
  soundManager.playCardFlip()
  isTargetMe.value = !isTargetMe.value
  tempTargetChoice.value = ''
  tempGuesserChoice.value = ''
}

// 猜中题数
const correctCount = computed(() => {
  return historyRecords.value.filter(r => r && r.isMatch).length
})

// 猜中率百分比
const matchRate = computed(() => {
  if (historyRecords.value.length === 0) return 0
  return Math.round((correctCount.value / questions.length) * 100)
})

// 终局评价
const finalEvaluation = computed(() => {
  const count = correctCount.value
  if (count >= 8) {
    return {
      title: '高维读心大师 · 毫无秘密的深情',
      desc: '简直就像住在对方心里一样！每一个微小的偏好都逃不过你的眼睛，这份用心令人动容。'
    }
  } else if (count >= 6) {
    return {
      title: '心灵敏锐感知者 · 极度默契',
      desc: '你对TA的生活习惯和心理有着非常精准的洞察，稍微多留意就能百分百读懂TA！'
    }
  } else if (count >= 4) {
    return {
      title: '好奇心满满的爱意探索家',
      desc: '原来TA还藏着一些你未曾发觉的反差萌一面！多了一层了解，也就多了一份甜蜜的惊喜。'
    }
  } else {
    return {
      title: '充满无限未知的新奇恋人',
      desc: 'TA的想法总是让你出其不意！像一本读不完的宝藏书，快抓住TA好好聊聊那些未知的秘密吧！'
    }
  }
})

// 结算游戏
function finishGame() {
  isCompleted.value = true
  soundManager.playFanfare()
  
  try {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#f43f5e', '#fbbf24']
    })
  } catch (e) {}

  if (!hasRewarded.value) {
    recordGameReward('guess-choice', { water: 3, sun: 2, exp: 20, radarCategory: '敏锐感知', radarDelta: 3 })
    hasRewarded.value = true
  }
}

// 互换角色重新挑战
function swapAndRestart() {
  soundManager.playFanfare()
  isTargetMe.value = !isTargetMe.value
  restartGame()
}

// 重启本轮
function restartGame() {
  soundManager.playBubble()
  currentIndex.value = 0
  subStep.value = 'answer'
  isCompleted.value = false
  hasRewarded.value = false
  tempTargetChoice.value = ''
  tempGuesserChoice.value = ''
  historyRecords.value = []
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
