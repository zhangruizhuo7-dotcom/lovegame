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
          <span>📡</span> 词汇同频 · 恋爱电波
        </span>
      </div>
    </div>

    <!-- 未完成状态：电波发射过程 -->
    <div v-if="!isCompleted" class="space-y-6">
      <!-- 轮次进度卡片 -->
      <div class="glass-card rounded-2xl p-4 sm:p-5 shadow-sm border border-purple-200/80 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-medium">电波轮次：</span>
            <span class="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold shadow-2xs">
              第 {{ currentRound + 1 }} 轮 / 共 {{ rounds.length }} 轮 · {{ currentTheme.title }}
            </span>
          </div>

          <!-- 累计捕获暗号计数 -->
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>已成功对接 <strong class="text-rose-600 font-bold text-sm">{{ totalMatchedCount }}</strong> 个默契暗号</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="w-full h-2 bg-purple-100/60 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            class="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-rose-500 rounded-full transition-all duration-300"
            :style="{ width: `${((currentRound + (subStep === 'match' ? 1 : 0.5)) / rounds.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- 主交互卡片 -->
      <div class="glass-card rounded-3xl p-5 sm:p-8 shadow-md border border-purple-200 relative overflow-hidden backdrop-blur-md">
        <!-- 装饰背景 -->
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-purple-100/40 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-100/40 rounded-full blur-2xl pointer-events-none"></div>

        <!-- 中心词醒目展示 -->
        <div class="text-center mb-6 relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 shadow-2xs transition-all"
            :class="{
              'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse': subStep === 'input-me',
              'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse': subStep === 'input-partner',
              'bg-purple-100 text-purple-700 border border-purple-200': subStep === 'match'
            }"
          >
            <span v-if="subStep === 'input-me'">📡 步骤一：{{ appState.names.me }} 正在发射联想电波</span>
            <span v-else-if="subStep === 'input-partner'">📡 步骤二：{{ appState.names.partner }} 正在发射联想电波</span>
            <span v-else>⚡ 步骤三：双向电波共振交汇</span>
          </div>

          <div class="text-4xl sm:text-5xl my-2 animate-bounce-subtle filter drop-shadow-sm">{{ currentTheme.icon }}</div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            中心词：「<span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{{ currentTheme.keyword }}</span>」
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
            {{ currentTheme.desc }}
          </p>
        </div>

        <!-- 作答阶段（input-me 或 input-partner） -->
        <div v-if="subStep === 'input-me' || subStep === 'input-partner'" class="max-w-xl mx-auto space-y-5 relative z-10">
          <!-- 角色提示与防偷看小罩子 -->
          <div class="p-3.5 rounded-2xl border flex items-center justify-between shadow-2xs"
            :class="subStep === 'input-me' ? 'bg-blue-50/80 border-blue-200' : 'bg-rose-50/80 border-rose-200'"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">{{ subStep === 'input-me' ? '👦' : '👧' }}</span>
              <div>
                <p class="text-xs font-black text-slate-800">
                  当前作答：{{ subStep === 'input-me' ? appState.names.me : appState.names.partner }}
                </p>
                <p class="text-[11px] text-slate-500">凭第一直觉在下方写下 3 个你立刻联想到的词</p>
              </div>
            </div>

            <!-- 防偷看遮罩开关 -->
            <button 
              @click="toggleShield" 
              class="px-3 py-1 text-xs font-bold rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
            >
              {{ isShieldActive ? '🔒 输入已加密' : '👀 正常显示' }}
            </button>
          </div>

          <!-- 3个输入框 -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div v-for="i in 3" :key="i" class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500">联想词 #{{ i }}</label>
              <div class="relative">
                <input 
                  type="text"
                  maxlength="10"
                  :placeholder="`词汇 ${i}`"
                  v-model.trim="currentInputWords[i - 1]"
                  :type="isShieldActive ? 'password' : 'text'"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-400 bg-white/95 text-sm font-bold text-slate-800 transition-all shadow-2xs"
                />
                <button 
                  v-if="currentInputWords[i - 1]"
                  @click="currentInputWords[i - 1] = ''"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- 灵感快捷气泡推荐 -->
          <div class="p-3.5 rounded-2xl bg-white/70 border border-purple-100 shadow-2xs">
            <div class="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span class="flex items-center gap-1 text-purple-600">
                <span>💡</span> 灵感气泡（点击直接填入空位）
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="kw in currentTheme.inspiration" 
                :key="kw"
                @click="fillInspiration(kw)"
                class="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                + {{ kw }}
              </button>
            </div>
          </div>

          <!-- 底部确认提交按钮 -->
          <div class="pt-3 text-center">
            <button 
              @click="submitCurrentInput"
              :disabled="!isCurrentInputComplete"
              class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-purple-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span v-if="subStep === 'input-me'">🔒 锁定词汇，交由 {{ appState.names.partner }} 作答 &rarr;</span>
              <span v-else>⚡ 发射电波，开始对暗号！&rarr;</span>
            </button>
          </div>
        </div>

        <!-- 电波交汇对比展示（match 阶段） -->
        <div v-else class="max-w-xl mx-auto space-y-5 animate-fadeIn relative z-10">
          <!-- 对接评级横幅 -->
          <div class="p-4 rounded-2xl text-center border shadow-xs"
            :class="currentRoundMatches.length >= 2 ? 'bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border-pink-300 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-700'"
          >
            <span class="text-3xl mb-1 inline-block">{{ currentRoundMatches.length > 0 ? '🎉' : '💭' }}</span>
            <h4 class="text-base sm:text-lg font-black tracking-tight">
              {{ currentWaveEvaluation.title }}
            </h4>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">
              {{ currentWaveEvaluation.desc }}
            </p>
          </div>

          <!-- 双方词汇对比卡片 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- 男友词汇 -->
            <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs">
              <span class="text-xs font-bold text-blue-600 block mb-2.5">👦 {{ appState.names.me }} 的联想词：</span>
              <div class="space-y-2">
                <div 
                  v-for="(w, idx) in roundWords.me[currentRound]" 
                  :key="idx"
                  class="px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all"
                  :class="isMatchedWord(w) ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-xs scale-102' : 'bg-white text-slate-700 border-blue-100'"
                >
                  <span>{{ w }}</span>
                  <span v-if="isMatchedWord(w)" class="text-[11px] bg-white/20 px-1.5 py-0.5 rounded-full">
                    {{ getMatchBadge(w) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 女友词汇 -->
            <div class="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-2xs">
              <span class="text-xs font-bold text-rose-600 block mb-2.5">👧 {{ appState.names.partner }} 的联想词：</span>
              <div class="space-y-2">
                <div 
                  v-for="(w, idx) in roundWords.partner[currentRound]" 
                  :key="idx"
                  class="px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all"
                  :class="isMatchedWord(w) ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-xs scale-102' : 'bg-white text-slate-700 border-rose-100'"
                >
                  <span>{{ w }}</span>
                  <span v-if="isMatchedWord(w)" class="text-[11px] bg-white/20 px-1.5 py-0.5 rounded-full">
                    {{ getMatchBadge(w) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 下一步按钮 -->
          <div class="pt-4 text-center">
            <button 
              @click="nextRoundOrFinish"
              class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-purple-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {{ isLastRound ? '生成心有灵犀词云海报 &rarr;' : '进入下一轮中心词 &rarr;' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏结算状态：精美词云海报与总评 -->
    <div v-else class="space-y-6 animate-fadeIn">
      <!-- 汇总荣誉大卡 -->
      <div class="glass-card rounded-3xl p-6 sm:p-8 text-center shadow-xl border border-purple-200 relative overflow-hidden backdrop-blur-md">
        <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white text-5xl shadow-lg shadow-pink-300 animate-pulse mb-3">
          📡
        </div>

        <div class="relative">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200 shadow-2xs">
            ⚡ {{ totalSummary.badge }}
          </span>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-800 mt-2 tracking-tight">
            共捕获 <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-extrabold">{{ totalMatchedCount }}</span> 个同频暗号
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            {{ totalSummary.desc }}
          </p>
        </div>

        <!-- 通关奖励卡片 -->
        <div class="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border border-rose-200/80 max-w-lg mx-auto flex items-center justify-around text-xs font-bold text-slate-700 shadow-inner">
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
          <div class="flex items-center gap-1 text-pink-600">
            <span>📊 默契反应</span>
            <span class="text-rose-600 font-black">+3分</span>
          </div>
        </div>
      </div>

      <!-- 新增：精美「心有灵犀词云海报」卡片 -->
      <div class="glass-card rounded-3xl p-6 sm:p-8 border-2 border-rose-200/90 bg-gradient-to-b from-white/95 via-rose-50/40 to-purple-50/50 shadow-xl relative overflow-hidden text-center backdrop-blur-md">
        <!-- 海报顶角装饰印章 -->
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-rose-100">
          <div class="flex items-center gap-2">
            <span class="text-xl">💌</span>
            <div class="text-left">
              <h3 class="text-sm font-black text-slate-800">心有灵犀 · 专属情侣词云画卷</h3>
              <p class="text-[11px] text-slate-400">Recorded for {{ appState.names.me }} & {{ appState.names.partner }}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
            默契命中 {{ totalMatchedCount }} 组
          </span>
        </div>

        <!-- 词云主视觉区域 -->
        <div class="my-6 min-h-[160px] p-6 rounded-2xl bg-white/80 border border-rose-100/90 shadow-inner flex flex-wrap items-center justify-center gap-3 relative">
          <!-- 装饰心形背景浮水印 -->
          <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none text-9xl">
            ♥
          </div>

          <!-- 词汇云泡泡 -->
          <template v-if="allSubmittedWords.length > 0">
            <span 
              v-for="(w, idx) in allSubmittedWords" 
              :key="idx"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all shadow-2xs hover:scale-110 select-none cursor-default"
              :class="w.matched 
                ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white text-sm sm:text-base font-black shadow-md ring-2 ring-pink-300 animate-bounce-subtle' 
                : 'bg-slate-100 text-slate-600 text-xs sm:text-sm hover:bg-slate-200'"
              :style="{ animationDelay: `${(idx % 5) * 0.2}s` }"
            >
              <span v-if="w.matched">💖</span>
              <span>{{ w.word }}</span>
            </span>
          </template>
        </div>

        <!-- 海报底部署名与寄语 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-rose-100 text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span>📅 认证日期：{{ new Date().toLocaleDateString() }}</span>
            <span>·</span>
            <span>两颗心在同一频率跳动</span>
          </div>

          <button 
            @click="copyPosterText"
            class="px-4 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <span>📋</span>
            <span>{{ hasCopied ? '已复制海报文案！' : '复制默契海报文本' }}</span>
          </button>
        </div>
      </div>

      <!-- 三轮明细回顾 -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 shadow-sm border border-purple-200 backdrop-blur-md">
        <h4 class="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
          <span>📜 三轮中心词作答明细</span>
        </h4>
        <div class="space-y-3">
          <div 
            v-for="(round, idx) in rounds" 
            :key="idx"
            class="p-3.5 rounded-xl border border-slate-200/80 bg-white/80 text-xs shadow-2xs"
          >
            <div class="flex items-center justify-between mb-1.5">
              <span class="font-bold text-slate-700">第 {{ idx + 1 }} 轮：「{{ round.keyword }}」</span>
              <span class="text-pink-600 font-bold">命中 {{ roundHistory[idx]?.matches?.length || 0 }} 词</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-slate-600">
              <div class="truncate">
                <span class="text-blue-500 font-bold">{{ appState.names.me }}:</span> {{ (roundWords.me[idx] || []).join('、') }}
              </div>
              <div class="truncate">
                <span class="text-rose-500 font-bold">{{ appState.names.partner }}:</span> {{ (roundWords.partner[idx] || []).join('、') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="flex items-center justify-center gap-4 pt-2 pb-6">
        <button 
          @click="restartGame"
          class="px-6 py-2.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-pink-600 rounded-full text-xs sm:text-sm font-bold border border-rose-200 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          🔄 换一组中心词再测
        </button>
        <button 
          @click="$emit('back')"
          class="px-8 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-pink-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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

// 扩充丰富的中心词库（增添“初吻瞬间”、“看电影”、“吃醋时刻”、“深夜长谈”等高频情侣场景）
const allRoundsPool = [
  {
    icon: '🌸',
    keyword: '初次约会',
    title: '初次约会 · 悸动心跳',
    desc: '回忆起那一天你们最初相遇的瞬间，脑海中涌出的三个词是什么？',
    inspiration: ['心跳加速', '电影院', '害羞', '偷看对方', '奶茶', '手心出汗', '牵手', '西餐厅']
  },
  {
    icon: '💋',
    keyword: '初吻瞬间',
    title: '初吻瞬间 · 脸红心跳',
    desc: '第一次靠得那么近，周围空气都安静下来的那一刻？',
    inspiration: ['闭上双眼', '呼吸急促', '甜甜的', '心跳爆表', '路灯下', '害羞低头', '抱住不放']
  },
  {
    icon: '🎬',
    keyword: '看电影',
    title: '影院约会 · 荧幕微光',
    desc: '当放映厅灯光熄灭，属于你们俩的看电影暗号？',
    inspiration: ['爆米花', '后排牵手', '黑漆漆', '靠着肩膀', '冰可乐', '感动哭湿', '片尾彩蛋']
  },
  {
    icon: '🍋',
    keyword: '吃醋时刻',
    title: '小醋意 · 专属占有欲',
    desc: '当看到对方身边有异性互动时，你的下意识反应词汇？',
    inspiration: ['嘟嘴', '故意冷淡', '快来哄我', '哼一声', '宣示主权', '不理你了', '悄悄吃味']
  },
  {
    icon: '🌙',
    keyword: '深夜长谈',
    title: '深夜长谈 · 枕边心语',
    desc: '钻进被窝夜深人静时，长聊里最常出现的词？',
    inspiration: ['听呼吸声', '舍不得挂', '心里话', '小秘密', '晚安么么', '未来规划', '失眠想你']
  },
  {
    icon: '🌧️',
    keyword: '下雨天',
    title: '下雨天 · 浪漫微凉',
    desc: '当窗外细雨绵绵，属于你们两个人的浪漫场景是什么？',
    inspiration: ['共撑一把伞', '窝被窝追剧', '热热的奶茶', '听雨声', '煮热腾腾火锅', '踩水坑', '依偎拥抱']
  },
  {
    icon: '🍜',
    keyword: '深夜夜宵',
    title: '深夜夜宵 · 治愈烟火',
    desc: '时钟拨到半夜11点，属于你们俩的心灵抚慰美食是什么？',
    inspiration: ['烤串小烧烤', '热汤面加荷包蛋', '小龙虾', '香脆炸鸡', '冰镇可乐', '串串香', '螺蛳粉']
  },
  {
    icon: '🏖️',
    keyword: '期待的旅行',
    title: '远方旅行 · 自由旷野',
    desc: '收拾行囊奔赴未知，你们心中最渴望的度假画面？',
    inspiration: ['海边吹风', '沙滩看日出', '落日晚霞', '拍情侣大片', '自然醒漫步', '吃特色小吃', '牵手自驾']
  },
  {
    icon: '🛋️',
    keyword: '周末宅家',
    title: '周末宅家 · 舒服贴贴',
    desc: '不用定闹钟的周日午后，最舒服惬意的画面是？',
    inspiration: ['抱抱睡懒觉', '联机打游戏', '一起吃外卖', '沙发躺平', '猫咪在脚边', '吃大西瓜', '泡澡敷面膜']
  },
  {
    icon: '🤝',
    keyword: '第一次牵手',
    title: '第一次牵手 · 触电指尖',
    desc: '第一次鼓起勇气握住TA手的那一瞬间？',
    inspiration: ['手心出汗', '过马路借口', '悄悄碰触', '十指相扣', '满脸通红', '不敢直视', '心花怒放']
  }
]

// 选定3轮
const rounds = ref(allRoundsPool.slice(0, 3))
const currentRound = ref(0)
const subStep = ref('input-me') // 'input-me' | 'input-partner' | 'match'
const isShieldActive = ref(false)
const isCompleted = ref(false)
const hasRewarded = ref(false)
const hasCopied = ref(false)

// 当前正在输入的词汇（3个）
const currentInputWords = ref(['', '', ''])

// 存储每轮双方词汇
const roundWords = ref({
  me: {},
  partner: {}
})

// 历史轮次匹配结果
const roundHistory = ref([])

const currentTheme = computed(() => rounds.value[currentRound.value])
const isLastRound = computed(() => currentRound.value === rounds.value.length - 1)

// 当前输入是否已填满3个有效词
const isCurrentInputComplete = computed(() => {
  return currentInputWords.value.every(w => w && w.trim().length > 0)
})

function toggleShield() {
  isShieldActive.value = !isShieldActive.value
  soundManager.playBubble()
}

// 快捷点击灵感词填入空位
function fillInspiration(kw) {
  soundManager.playBubble()
  const emptyIndex = currentInputWords.value.findIndex(w => !w || w.trim() === '')
  if (emptyIndex !== -1) {
    currentInputWords.value[emptyIndex] = kw
  } else {
    currentInputWords.value[2] = kw
  }
}

// 同义词/近义词映射表（提高智能模糊匹配质量）
const synonymGroups = [
  ['猫咪', '小猫', '猫', '修咪'],
  ['修勾', '小狗', '狗狗', '狗'],
  ['拥抱', '抱抱', '搂抱', '相拥'],
  ['接吻', '亲亲', '亲吻', '初吻'],
  ['牵手', '拉手', '十指紧扣', '十指相扣'],
  ['烧烤', '烤串', '撸串'],
  ['奶茶', '波霸奶茶', '果茶', '甜水'],
  ['看电影', '电影院', '看大片', '看剧'],
  ['生气', '吃醋', '吃味', '闹脾气']
]

// 升级版智能匹配算法（精准匹配 + 同义词群组 + 子串包含 + 首字联想得分）
function wordsMatch(w1, w2) {
  if (!w1 || !w2) return false
  const s1 = w1.trim().toLowerCase()
  const s2 = w2.trim().toLowerCase()
  if (s1 === s2) return true

  // 1. 同义词群组检测
  for (const group of synonymGroups) {
    if (group.some(w => s1.includes(w)) && group.some(w => s2.includes(w))) {
      return true
    }
  }

  // 2. 包含关系（子串）
  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.abs(s1.length - s2.length) <= 3
  }

  // 3. 首字相同且长度>=2（联想相同字头意向）
  if (s1.length >= 2 && s2.length >= 2 && s1[0] === s2[0]) {
    // 若有两个及以上字相同
    let commonChars = 0
    for (const ch of s1) {
      if (s2.includes(ch)) commonChars++
    }
    if (commonChars >= 2) return true
  }

  return false
}

// 匹配勋章文案
function getMatchBadge(w) {
  return '💖 同频命中'
}

// 检查某个词是否在当前轮匹配命中
function isMatchedWord(w) {
  return currentRoundMatches.value.some(m => wordsMatch(m, w))
}

// 当前轮命中重合词列表
const currentRoundMatches = computed(() => {
  const meList = roundWords.value.me[currentRound.value] || []
  const partnerList = roundWords.value.partner[currentRound.value] || []
  const matches = []

  meList.forEach(mWord => {
    partnerList.forEach(pWord => {
      if (wordsMatch(mWord, pWord)) {
        if (!matches.some(existing => wordsMatch(existing, mWord))) {
          matches.push(mWord)
        }
      }
    })
  })

  return matches
})

// 当前轮评价
const currentWaveEvaluation = computed(() => {
  const count = currentRoundMatches.value.length
  if (count === 3) {
    return {
      title: '📡 强磁场量子纠缠！3词全中！',
      desc: '太神了！你们的脑海电波完全处于同一个波段，想到了一模一样的事物！'
    }
  } else if (count === 2) {
    return {
      title: '⚡ 强烈同频电波！不谋而合',
      desc: '有2个词汇高度重合，你们的日常默契已经刻进彼此潜意识了！'
    }
  } else if (count === 1) {
    return {
      title: '✨ 捕捉到同频微光！浪漫呼应',
      desc: '命中了一个珍贵的共同词汇！心照不宣的小浪漫在这一刻闪闪发光。'
    }
  } else {
    return {
      title: '🌌 奇思妙想平行宇宙！',
      desc: '虽然没有撞词，但两个人的联想拼合起来，恰好是一副最完整的甜蜜画卷！'
    }
  }
})

// 提交当前输入
function submitCurrentInput() {
  if (subStep.value === 'input-me') {
    roundWords.value.me[currentRound.value] = [...currentInputWords.value]
    currentInputWords.value = ['', '', '']
    isShieldActive.value = false
    soundManager.playLockIn()
    subStep.value = 'input-partner'
  } else if (subStep.value === 'input-partner') {
    roundWords.value.partner[currentRound.value] = [...currentInputWords.value]
    currentInputWords.value = ['', '', '']
    isShieldActive.value = false
    
    // 记录本轮命中
    roundHistory.value[currentRound.value] = {
      matches: [...currentRoundMatches.value]
    }

    if (currentRoundMatches.value.length > 0) {
      soundManager.playMatchSuccess()
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#a855f7', '#ec4899', '#f43f5e']
        })
      } catch (e) {}
    } else {
      soundManager.playLockIn()
    }

    subStep.value = 'match'
  }
}

// 下一轮或完成
function nextRoundOrFinish() {
  soundManager.playCardFlip()
  if (isLastRound.value) {
    finishGame()
  } else {
    currentRound.value++
    subStep.value = 'input-me'
  }
}

// 累计命中的所有词汇
const totalMatchedWords = computed(() => {
  const list = []
  roundHistory.value.forEach(h => {
    if (h && h.matches) {
      h.matches.forEach(m => {
        if (!list.includes(m)) list.push(m)
      })
    }
  })
  return list
})

const totalMatchedCount = computed(() => {
  return totalMatchedWords.value.length
})

// 所有双方提交的词汇汇总（用于海报词云）
const allSubmittedWords = computed(() => {
  const results = []
  const seen = new Set()

  for (let r = 0; r < rounds.value.length; r++) {
    const mWords = roundWords.value.me[r] || []
    const pWords = roundWords.value.partner[r] || []
    const all = [...mWords, ...pWords]

    all.forEach(w => {
      if (w && !seen.has(w)) {
        seen.add(w)
        const isMatched = totalMatchedWords.value.some(mw => wordsMatch(mw, w))
        results.push({
          word: w,
          matched: isMatched
        })
      }
    })
  }
  return results
})

// 总评总结
const totalSummary = computed(() => {
  const count = totalMatchedCount.value
  if (count >= 4) {
    return {
      badge: '超自然恋爱电波接收站 · 100% 灵魂同调',
      desc: '你们不仅心有灵犀，而且联想反应极其一致！生活里只要一个眼神就能读懂对方全部心思。'
    }
  } else if (count >= 2) {
    return {
      badge: '高频共振情侣 · 默契满分',
      desc: '你们对许多浪漫生活画面的联想不谋而合，日常相处充满惊喜与心照不宣。'
    }
  } else {
    return {
      badge: '灵感互补恋人 · 双倍精彩',
      desc: '你们的思维各具魅力，碰撞在一起就像不同音符组成的动听交响乐，越聊越有聊！'
    }
  }
})

// 复制海报文本
function copyPosterText() {
  const text = `【心有灵犀 · 恋爱词云海报】\n情侣：${appState.names.me} & ${appState.names.partner}\n同频暗号：${totalMatchedWords.value.join('、') || '两颗心同频振动'}\n评价：${totalSummary.value.badge}\n日期：${new Date().toLocaleDateString()}`
  navigator.clipboard.writeText(text).then(() => {
    hasCopied.value = true
    soundManager.playBubble()
    setTimeout(() => {
      hasCopied.value = false
    }, 2500)
  })
}

// 完成结算
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
    recordGameReward('word-wave', { water: 3, sun: 3, exp: 20, radarCategory: '默契反应', radarDelta: 3 })
    hasRewarded.value = true
  }
}

// 重新挑战
function restartGame() {
  soundManager.playBubble()
  // 打乱挑选3个
  rounds.value = [...allRoundsPool].sort(() => Math.random() - 0.5).slice(0, 3)
  currentRound.value = 0
  subStep.value = 'input-me'
  isCompleted.value = false
  hasRewarded.value = false
  hasCopied.value = false
  currentInputWords.value = ['', '', '']
  roundWords.value = { me: {}, partner: {} }
  roundHistory.value = []
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

@keyframes bounceSubtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-bounce-subtle {
  animation: bounceSubtle 2.5s infinite ease-in-out;
}
</style>
