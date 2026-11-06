<template>
  <div class="space-y-6">
    <!-- 顶部导航与状态条 -->
    <div class="flex items-center justify-between bg-white/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-rose-100 shadow-xs">
      <button 
        @click="$emit('back')"
        class="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition-colors active:scale-95"
      >
        <span>&larr;</span>
        <span>返回展区目录</span>
      </button>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          游戏 5 · 深度换位共情
        </span>
        <span v-if="gameState === 'playing'" class="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
          第 {{ currentIdx + 1 }} / {{ scenarios.length }} 题
        </span>
      </div>
    </div>

    <!-- 游戏主容器 -->
    <div class="glass-card rounded-3xl p-5 sm:p-8 shadow-xl border border-rose-200/80 relative overflow-hidden bg-gradient-to-br from-white/90 via-rose-50/20 to-amber-50/30">
      <!-- 柔光背景光晕 -->
      <div class="absolute -top-12 -left-12 w-48 h-48 bg-gradient-to-br from-rose-200/40 to-pink-300/30 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-12 -right-12 w-48 h-48 bg-gradient-to-tl from-amber-200/40 to-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <!-- 状态 1：开始准备界面 -->
      <div v-if="gameState === 'intro'" class="text-center py-6 sm:py-10 max-w-xl mx-auto space-y-6 relative z-10">
        <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-400 to-amber-400 flex items-center justify-center text-4xl shadow-lg shadow-rose-200 animate-float">
          🎭
        </div>

        <div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            假如我是你 · 走进TA的内心宇宙
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            站在对方的性格和处事习惯角度，设想TA的第一反应与真正心声。<br class="hidden sm:inline" />
            好的感情不是天然毫无偏差，而是即便有了误解，我也愿意一次次走向你。
          </p>
        </div>

        <!-- 玩法说明卡 -->
        <div class="bg-gradient-to-r from-rose-50/90 to-amber-50/90 rounded-2xl p-4 sm:p-5 text-left border border-rose-100 text-xs sm:text-sm text-slate-600 space-y-2.5 shadow-2xs">
          <div class="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <span>💡 互动规则：</span>
          </div>
          <p class="flex items-start gap-2">
            <span class="text-rose-500 font-bold shrink-0">1.</span>
            <span><b>交替互猜</b>：根据真实生活情景，一人先站在对方视角猜测TA的第一反应；</span>
          </p>
          <p class="flex items-start gap-2">
            <span class="text-rose-500 font-bold shrink-0">2.</span>
            <span><b>坦诚揭晓</b>：随后由被猜一方揭晓“我真正的心声”，形成“换位思考对账单”；</span>
          </p>
          <p class="flex items-start gap-2">
            <span class="text-rose-500 font-bold shrink-0">3.</span>
            <span><b>独家秘籍</b>：每题附赠心理学共情秘籍与浪漫约定，通关后支持<b>一键封存为恋爱树永久记忆</b>！</span>
          </p>
        </div>

        <!-- 身份设定小贴士 -->
        <div class="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 bg-white/80 py-2.5 px-4 rounded-xl border border-rose-100 shadow-2xs">
          <span class="flex items-center gap-1.5">
            <span>👦 主角A：</span>
            <span class="text-rose-600 font-bold">{{ appState.names.me }}</span>
          </span>
          <span class="text-slate-300">|</span>
          <span class="flex items-center gap-1.5">
            <span>👧 主角B：</span>
            <span class="text-amber-600 font-bold">{{ appState.names.partner }}</span>
          </span>
        </div>

        <!-- 题库场景预览标签 -->
        <div class="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-500">
          <span class="bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">💼 工作受气安慰</span>
          <span class="bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">🌧️ 暴雨突袭应对</span>
          <span class="bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">🎁 送礼翻车化解</span>
          <span class="bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">🌸 生理期情绪照顾</span>
          <span class="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">🧊 冷战破冰台阶</span>
        </div>

        <!-- 开启按钮 -->
        <div>
          <button 
            @click="startGame"
            class="px-8 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
          >
            开始换位答题 (共 {{ scenarios.length }} 组精选情境)
          </button>
        </div>
      </div>

      <!-- 状态 2：答题进行中 -->
      <div v-else-if="gameState === 'playing'" class="space-y-6 relative z-10">
        <!-- 进度条 -->
        <div>
          <div class="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span>换位共情推演进度</span>
            <span>第 {{ currentIdx + 1 }} 题 / 共 {{ scenarios.length }} 题</span>
          </div>
          <div class="w-full h-2.5 bg-rose-100/70 rounded-full overflow-hidden p-0.5 border border-rose-100">
            <div 
              class="h-full bg-gradient-to-r from-rose-500 via-pink-400 to-amber-400 rounded-full transition-all duration-300"
              :style="{ width: `${((currentIdx + 1) / scenarios.length) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- 当前轮次提示牌：谁在猜，谁在揭晓 -->
        <div class="bg-gradient-to-r from-rose-100/70 via-white/80 to-amber-100/70 border border-rose-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-xs border border-rose-100 shrink-0">
              {{ currentScenario.icon }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  情境 {{ currentIdx + 1 }} · {{ currentScenario.theme }}
                </span>
                <span class="text-xs text-slate-400 font-normal">
                  {{ isMeGuessing ? `${appState.names.me} 正在猜想` : `${appState.names.partner} 正在猜想` }}
                </span>
              </div>
              <h3 class="text-base sm:text-lg font-black text-slate-800 mt-1">
                {{ currentScenario.title }}
              </h3>
            </div>
          </div>

          <!-- 步骤状态胶囊 -->
          <div class="flex items-center gap-1.5 text-xs bg-white/90 p-1.5 rounded-xl border border-rose-100 shadow-2xs">
            <span class="px-2.5 py-1 rounded-lg font-bold transition-colors" :class="step === 1 ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500'">
              1. 换位猜测
            </span>
            <span class="text-slate-300">→</span>
            <span class="px-2.5 py-1 rounded-lg font-bold transition-colors" :class="step === 2 ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500'">
              2. 真实揭晓
            </span>
            <span class="text-slate-300">→</span>
            <span class="px-2.5 py-1 rounded-lg font-bold transition-colors" :class="step === 3 ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500'">
              3. 对账共鸣
            </span>
          </div>
        </div>

        <!-- 情景深度描述卡 -->
        <div class="bg-white/90 rounded-2xl p-5 border border-rose-100 shadow-2xs text-slate-700 text-sm sm:text-base leading-relaxed space-y-2">
          <div class="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <span>📖 真实场景发生：</span>
          </div>
          <p class="text-slate-700">{{ replaceNames(currentScenario.description) }}</p>
        </div>

        <!-- 步骤1：猜测阶段 -->
        <div v-if="step === 1" class="space-y-4">
          <div class="flex items-center justify-between bg-rose-50/60 p-3 rounded-xl border border-rose-100">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-rose-700 bg-white px-2.5 py-1 rounded-full border border-rose-200">
                当前猜想者：{{ guesserName }}
              </span>
              <span class="text-xs text-slate-600">
                请闭眼想象：如果是 {{ targetName }} 遇到此事，TA此刻最真实的心态是？
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="(opt, oIdx) in currentScenario.options"
              :key="oIdx"
              @click="selectGuess(oIdx)"
              :class="[
                'text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer',
                guessedOption === oIdx 
                  ? 'border-rose-500 bg-rose-50/90 shadow-md scale-[1.01]' 
                  : 'border-slate-100 bg-white/85 hover:border-rose-200 hover:bg-rose-50/30'
              ]"
            >
              <div 
                class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors"
                :class="guessedOption === oIdx ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'"
              >
                {{ ['A', 'B', 'C', 'D'][oIdx] }}
              </div>
              <div class="flex-1">
                <p class="text-xs sm:text-sm font-bold text-slate-800">
                  {{ replaceNames(opt.text) }}
                </p>
                <p class="text-[11px] text-slate-400 mt-1">
                  {{ opt.subText }}
                </p>
              </div>
            </button>
          </div>

          <div v-if="guessedOption !== null" class="flex justify-end pt-2">
            <button
              @click="confirmGuess"
              class="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>锁定猜测，交给 {{ targetName }} 揭晓真相反馈</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        <!-- 步骤2：真实揭晓阶段 -->
        <div v-else-if="step === 2" class="space-y-4">
          <div class="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-800 bg-white px-3 py-1 rounded-full border border-amber-300">
                当前揭晓者：{{ targetName }}
              </span>
              <span class="text-xs text-amber-900 font-semibold">
                {{ guesserName }} 已经作答完毕！请问你真实的心思和第一反应是？
              </span>
            </div>
            <span class="text-[11px] text-slate-400">（{{ guesserName }} 的选择先保密哦）</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="(opt, oIdx) in currentScenario.options"
              :key="oIdx"
              @click="selectActual(oIdx)"
              :class="[
                'text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer',
                actualOption === oIdx 
                  ? 'border-amber-500 bg-amber-50/90 shadow-md scale-[1.01]' 
                  : 'border-slate-100 bg-white/85 hover:border-amber-200 hover:bg-amber-50/30'
              ]"
            >
              <div 
                class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors"
                :class="actualOption === oIdx ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'"
              >
                {{ ['A', 'B', 'C', 'D'][oIdx] }}
              </div>
              <div class="flex-1">
                <p class="text-xs sm:text-sm font-bold text-slate-800">
                  {{ replaceNames(opt.text) }}
                </p>
                <p class="text-[11px] text-slate-400 mt-1">
                  {{ opt.subText }}
                </p>
              </div>
            </button>
          </div>

          <div v-if="actualOption !== null" class="flex justify-end pt-2">
            <button
              @click="revealComparison"
              class="px-6 py-2.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>揭晓换位对账单！</span>
              <span>✨</span>
            </button>
          </div>
        </div>

        <!-- 步骤3：揭晓比对与对账单卡片 -->
        <div v-else-if="step === 3" class="space-y-5">
          <!-- 匹配结果横幅 -->
          <div 
            class="p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
            :class="isMatched ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-sm' : 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-sm'"
          >
            <div class="flex items-center gap-4">
              <div class="text-4xl shrink-0">
                {{ isMatched ? '🎯' : '🌱' }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base sm:text-lg font-black">
                    {{ isMatched ? '心有灵犀！完全懂TA的内心！' : '有了新的惊喜发现，原来TA真实这么想！' }}
                  </h4>
                  <span 
                    class="text-xs px-2.5 py-0.5 rounded-full font-bold"
                    :class="isMatched ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'"
                  >
                    {{ isMatched ? '共鸣匹配成功 +1' : '换位认知深入 +1' }}
                  </span>
                </div>
                <p class="text-xs mt-1 text-slate-600">
                  {{ isMatched ? `${guesserName} 准确猜中了 ${targetName} 最深层的第一反应，给足了安全感与被懂的幸福！` : `爱不是读心术，而是通过每一次沟通，更懂得对方卸下防备后的真实模样。` }}
                </p>
              </div>
            </div>

            <div class="text-right shrink-0">
              <span class="text-2xl font-black" :class="isMatched ? 'text-emerald-600' : 'text-amber-600'">
                {{ isMatched ? '100% 同频' : '倾听加深' }}
              </span>
            </div>
          </div>

          <!-- 换位思考对账单对比行 -->
          <div class="bg-white/90 rounded-2xl p-5 border border-rose-100 shadow-2xs space-y-3">
            <div class="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="flex items-center gap-1.5">
                <span>📋 本题换位对账细节</span>
              </span>
              <span class="text-slate-400 font-normal text-[11px]">情境：{{ currentScenario.theme }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <!-- 猜测 -->
              <div class="p-3 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1">
                <div class="flex items-center justify-between text-xs text-rose-700 font-bold">
                  <span>{{ guesserName }} 的猜测：</span>
                  <span class="text-[10px] bg-rose-100 px-2 py-0.5 rounded">选项 {{ ['A', 'B', 'C', 'D'][guessedOption] }}</span>
                </div>
                <p class="text-xs text-slate-800 font-semibold">{{ replaceNames(currentScenario.options[guessedOption].text) }}</p>
                <p class="text-[11px] text-slate-500">{{ currentScenario.options[guessedOption].subText }}</p>
              </div>

              <!-- 真实 -->
              <div class="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <div class="flex items-center justify-between text-xs text-amber-800 font-bold">
                  <span>{{ targetName }} 真实的心声：</span>
                  <span class="text-[10px] bg-amber-100 px-2 py-0.5 rounded">选项 {{ ['A', 'B', 'C', 'D'][actualOption] }}</span>
                </div>
                <p class="text-xs text-slate-800 font-semibold">{{ replaceNames(currentScenario.options[actualOption].text) }}</p>
                <p class="text-[11px] text-slate-500">{{ currentScenario.options[actualOption].subText }}</p>
              </div>
            </div>

            <!-- 恋爱保鲜秘籍专属提示 -->
            <div class="bg-gradient-to-r from-rose-50/70 to-pink-50/70 p-3.5 rounded-xl border border-rose-100 space-y-1.5 mt-2">
              <div class="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <span>💡 恋爱保鲜秘籍贴士：</span>
                <span class="text-[10px] font-normal text-rose-500">（让感情更细腻长久）</span>
              </div>
              <p class="text-xs text-slate-700 leading-relaxed">
                {{ replaceNames(currentScenario.secretTip || currentScenario.insight) }}
              </p>
              <div class="bg-white/80 p-2.5 rounded-lg border border-rose-100 text-xs text-rose-800 font-medium">
                <span>💬 此时此刻的小约定：</span>
                <span>{{ replaceNames(currentScenario.couplePromise) }}</span>
              </div>
            </div>
          </div>

          <!-- 下一题按钮 -->
          <div class="flex justify-end pt-1">
            <button
              @click="nextScenario"
              class="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{{ currentIdx < scenarios.length - 1 ? '进入下一题（交换视角互猜）' : '查看完整换位思考对账单与报告' }}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

      </div>

      <!-- 状态 3：通关总结报告 & 换位思考对账单 -->
      <div v-else-if="gameState === 'finished'" class="py-4 sm:py-6 space-y-6 relative z-10">
        <div class="text-center space-y-2">
          <div class="inline-block p-4 rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-400 to-rose-400 text-5xl shadow-xl shadow-rose-200 animate-bounce-slow">
            🏆
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-800">
            换位共情 · 深度对账结题！
          </h2>
          <p class="text-xs sm:text-sm text-slate-500">
            {{ appState.names.me }} 与 {{ appState.names.partner }} 完成了 {{ scenarios.length }} 组现实深层生活情境的推演
          </p>
        </div>

        <!-- 默契指数大卡片 -->
        <div class="bg-gradient-to-br from-rose-50/90 via-white to-amber-50/90 rounded-3xl p-6 border-2 border-rose-200 shadow-lg text-center space-y-4">
          <div class="flex items-center justify-center gap-2">
            <span class="text-xs font-bold text-rose-600 bg-rose-100/80 px-3 py-1 rounded-full">
              换位共鸣指数
            </span>
            <span class="text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
              {{ finalScoreLevel.title }}
            </span>
          </div>

          <div class="text-5xl sm:text-6xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
            {{ matchRate }}%
          </div>

          <p class="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {{ finalScoreLevel.desc }}
          </p>

          <!-- 一键封存恋爱树记忆功能 -->
          <div class="pt-2">
            <button
              v-if="!isMemoryArchived"
              @click="archiveToLoveTree"
              class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-md shadow-emerald-200 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>💌 一键封存这段走心对话为【恋爱树记忆】</span>
              <span>✨</span>
            </button>
            <div v-else class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-200 shadow-2xs">
              <span>💮 已成功封存入【恋爱树永久记忆库】！可前往首页恋爱树面板回顾</span>
            </div>
          </div>
        </div>

        <!-- 换位思考完整对账单 -->
        <div class="bg-white/95 rounded-3xl p-5 sm:p-6 border border-rose-200 shadow-md space-y-4">
          <div class="flex items-center justify-between border-b border-rose-100 pb-3">
            <div>
              <h3 class="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                <span>📑 换位思考对账单 (完整明细)</span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">记录每一次你心中的TA，与TA最真实的呼唤</p>
            </div>
            <span class="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              同频 {{ historyRecords.filter(r => r.matched).length }} / {{ historyRecords.length }}
            </span>
          </div>

          <div class="space-y-3">
            <div 
              v-for="(rec, rIdx) in historyRecords" 
              :key="rIdx"
              class="p-4 rounded-2xl border transition-all"
              :class="rec.matched ? 'bg-emerald-50/40 border-emerald-200' : 'bg-amber-50/40 border-amber-200'"
            >
              <div class="flex items-center justify-between text-xs mb-2">
                <span class="font-bold flex items-center gap-1.5" :class="rec.matched ? 'text-emerald-800' : 'text-amber-800'">
                  <span>{{ rec.icon }}</span>
                  <span>情境 {{ rIdx + 1 }}：{{ rec.theme }}</span>
                </span>
                <span 
                  class="font-bold px-2 py-0.5 rounded-full text-[11px]"
                  :class="rec.matched ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'"
                >
                  {{ rec.matched ? '🎯 灵魂同频' : '💡 新知发现' }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div class="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 text-[10px] block mb-0.5">{{ rec.guesser }} 的猜测：</span>
                  <span class="font-medium text-slate-700">{{ rec.guessText }}</span>
                </div>
                <div class="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 text-[10px] block mb-0.5">{{ rec.target }} 真实的心声：</span>
                  <span class="font-semibold text-slate-800">{{ rec.actualText }}</span>
                </div>
              </div>

              <!-- 展开的保鲜秘籍小提示 -->
              <div class="mt-2 text-[11px] text-slate-500 bg-white/60 p-2 rounded-lg border border-slate-100/80">
                <span class="text-rose-600 font-bold">✨ 保鲜秘籍：</span>
                <span>{{ rec.secretTip }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 通关奖励入账提示 -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-xs">
              💧
            </div>
            <div>
              <div class="text-xs font-bold text-emerald-800">
                已为恋爱树注入养分！
              </div>
              <div class="text-xs text-emerald-600 mt-0.5">
                水滴 +3 · 阳光 +2 · 经验 +20 · 【情绪共鸣】雷达分提高
              </div>
            </div>
          </div>
          <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
            已打卡入账
          </span>
        </div>

        <!-- 底部操作按钮 -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button 
            @click="startGame"
            class="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-xs transition-all text-sm cursor-pointer"
          >
            🔄 再测一次
          </button>
          <button 
            @click="$emit('back')"
            class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer"
          >
            返回展区二总览
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import { appState, recordGameReward } from '@/状态/恋爱树状态.js'

defineEmits(['back'])

// 深度扩充至 9 组真实接地气情境库
const scenarios = [
  {
    theme: '工作受委屈如何安慰',
    icon: '💼',
    title: '被领导当众严厉批评，心情极度低落回到家',
    description: '{target} 今天在公司承受了很大压力，被无理挑刺，晚饭时眼圈红红的，几乎不想说话。{guesser} 此时判断 {target} 最渴望什么？',
    options: [
      {
        text: '不要讲大道理，先紧紧抱住我，递上一杯温热饮品',
        subText: '情绪接纳型：需要无条件被包容与无声的陪伴'
      },
      {
        text: '陪我一起狠狠吐槽那个极品领导，比我还要同仇敌忾',
        subText: '战友并肩型：渴望立场坚定的情绪发泄与偏爱'
      },
      {
        text: '带我去大吃一顿甜品或火锅，打两把游戏彻底转移注意力',
        subText: '行动解压型：不想沉浸在负能量里，渴望快乐电击'
      },
      {
        text: '让我一个人在被子里安静放空半小时，等我整理好再聊',
        subText: '自我沉淀型：需要私密的情绪消化安全屋'
      }
    ],
    secretTip: '伴侣在职场受委屈时，最忌讳“理性说教”或“你也有责任”。先给情绪一个安全着陆的怀抱，比提供解决方案重要一百倍。',
    insight: '心理学研究表明：当人在外界受挫时，最需要的不是“理性分析解决问题”，而是“无论对错我都站在你身边”的安全感确认。',
    couplePromise: '“下一次当你委屈难过时，我会先拥抱你，问你：‘你想听吐槽，还是只想靠着我休息？’”'
  },
  {
    theme: '突发大雨如何应对',
    icon: '🌧️',
    title: '精心打扮准备去公园野餐，刚下楼就倾盆暴雨',
    description: '两个人穿搭精致，还带了精心烤制的三明治和水果，刚走到小区门口天空突然打雷下起暴雨，野餐计划彻底泡汤。{target} 的第一反应通常是？',
    options: [
      {
        text: '既来之则安之！索性在雨里踩水拍照，转战附近室内咖啡馆打卡',
        subText: '乐观随性派：遗憾也可以变成独特的浪漫插曲'
      },
      {
        text: '立刻回家换上舒服睡衣，煮一锅热腾腾的泡面边吃边看经典老电影',
        subText: '温馨宅家派：只要和你在一起，哪里都是最好的野餐'
      },
      {
        text: '第一反应有点小沮丧和叹气，需要对方轻轻摸摸头哄一哄',
        subText: '细腻感性派：对期待的事情落空敏感，渴望被温柔托底'
      },
      {
        text: '迅速打开手机地图，5分钟内规划出一个更棒的室内展览路线',
        subText: '执行行动派：绝不浪费精心梳洗的好时光'
      }
    ],
    secretTip: '计划外的突发事件是爱情的试金石。不要纠结于计划泡汤，幽默与随机应变能把所有阴天点缀成专属回忆。',
    insight: '遇到突发事件，往往是检验情侣抗挫力和共同应对模式的最佳契机。换位思考能将摩擦化为意想不到的浪漫回忆。',
    couplePromise: '“任何不顺心的坏天气，只要牵着你的手，都可以变成专属于我们俩的冒险日。”'
  },
  {
    theme: '生理期情绪照顾',
    icon: '🌸',
    title: '身体酸痛腹坠无力，莫名烦躁想要被宠溺',
    description: '{target} 迎来了生理期不适，浑身发冷且腰酸腹痛，心情像过山车一样容易敏感委屈。此时 {target} 最希望对方做到的是？',
    options: [
      {
        text: '提前准备好热热水袋与红糖姜茶，全包所有家务不让我碰冷水',
        subText: '体贴行动派：用无微不至的细节照顾表达爱'
      },
      {
        text: '把我的无理取闹和小任性全盘包容，摸摸头说“乖乖，我知道你很难受”',
        subText: '无限包容派：需要情绪上的最大耐受与无限被偏爱'
      },
      {
        text: '陪在身边安静看剧捏捏脚揉揉肚子，不问多余问题',
        subText: '静默守护派：身体难受时说话都累，陪伴就是力量'
      },
      {
        text: '买来想吃的解馋零食甜品，用好吃的哄开心',
        subText: '甜蜜治愈派：美食多巴胺是最好的止痛剂'
      }
    ],
    secretTip: '不要只说“多喝热水”。用暖宝宝贴在手里、揉按腹部的实际温度，和一句温柔的“今天你什么都不用做，全有我呢”，能融化所有烦躁。',
    insight: '荷尔蒙引起的身体酸痛常伴随脆弱感，这时的体贴会深深烙印在对方记忆里。',
    couplePromise: '“你的特殊日子就是我的守护日，所有小脾气我都负责照单全收并温柔化解。”'
  },
  {
    theme: '送礼翻车如何化解',
    icon: '🎁',
    title: '纪念日满怀期待拆开礼物，却发现款式或尺码完全踩雷',
    description: '{target} 拆开了对方精心准备但完全不合心意（或根本用不上）的纪念日礼物。{target} 心里最真实的微表情和做法是？',
    options: [
      {
        text: '先欣喜表达感谢肯定对方的心意，然后再撒娇商量是否可以一起去换个款式',
        subText: '情商拉满派：保护对方的热情，又求真务实'
      },
      {
        text: '无论多不实用都会视若珍宝地收下，绝不让对方看出一丝失望',
        subText: '温柔体贴派：爱的是你送礼的初心，哪怕踩雷也觉得可爱'
      },
      {
        text: '当场忍不住噗嗤笑出来，打趣调侃对方的直男/奇葩审美，化尴尬为欢笑',
        subText: '幽默化解派：亲密就是可以肆无忌惮地吐槽又紧紧相拥'
      },
      {
        text: '有一点点小失落，心想“原来TA还是不够了解我的喜好”，需要对方后续找补',
        subText: '期待被懂派：渴望对方能百分百精准命中自己的心意'
      }
    ],
    secretTip: '礼物踩雷不可怕，可怕的是害怕坦诚而掩盖感受。坦率告诉对方自己喜欢的风格，下次一起去挑，反而是一次浪漫的约会。',
    insight: '送礼的核心是心意被看见。换位能看懂对方挑选时的笨拙与真挚。',
    couplePromise: '“无论礼物是否完美，我最珍惜的永远是你满心期待走向我的眼神。”'
  },
  {
    theme: '生活琐事小冷战',
    icon: '🧊',
    title: '因为一件家务或约会迟到的小事拌了嘴，突然陷入沉默',
    description: '两个人刚刚各执一词争辩了两句，随后两人背对背坐着，谁也不说话，房间里安静得只能听见呼吸声。{target} 此刻内心真正的状态是？',
    options: [
      {
        text: '表面冷若冰霜，其实心里早已后悔，疯狂在数秒等对方给个台阶',
        subText: '被动等待型：骨子里缺乏安全感，害怕主动服软被轻视'
      },
      {
        text: '默默去洗个手或倒杯水，顺便给对方也端一杯，假装无事发生打破僵局',
        subText: '主动求和型：比起所谓的面子，更舍不得让冷战消耗感情'
      },
      {
        text: '需要独处15分钟理智冷静，等情绪退潮后再心平气和就事论事',
        subText: '理性冷却型：不想在冲动时说出伤人的狠话'
      },
      {
        text: '非常讨厌隔夜仇，必须立刻说清楚拉扯清楚，否则今晚无法入睡',
        subText: '彻底坦诚型：情绪悬空会带来极大的内耗与煎熬'
      }
    ],
    secretTip: '给台阶不是认输，而是更懂珍惜。吵架时主动递过去的一张纸巾或一杯温水，胜过千言万语。',
    insight: '冷战不是没有爱，而是双方都在用坚硬的刺伪装内心的脆弱。读懂对方的冷战模式，给对方一个不需要低头的台阶。',
    couplePromise: '“吵架时你可以有脾气，但我们要约定：冷战不超过1小时，谁先递水谁就是更懂爱的那一个。”'
  },
  {
    theme: '长辈相处意见分歧',
    icon: '🏡',
    title: '和长辈聚会时产生观念代沟，心里两难受憋屈',
    description: '在家庭聚会中，长辈催促或提出了与你们生活习惯相悖的要求。{target} 此时最希望 {guesser} 怎么做？',
    options: [
      {
        text: '私下紧紧握住我的手，聚会结束后第一时间带我去喝奶茶并认真听我倒苦水',
        subText: '情绪托底型：不需要当面冲突，但私下必须站我这边'
      },
      {
        text: '在长辈面前主动打圆场、把话题岔开，替我化解尴尬和压力',
        subText: '挡箭牌型：勇于担当，在外人/长辈面前做我的护盾'
      },
      {
        text: '尊重长辈的传统观念，劝我不要往心里去，左耳进右耳出就好',
        subText: '息事宁人型：不把长辈的唠叨升华成严肃矛盾'
      },
      {
        text: '回家后和我一起制定未来的边界策略，明确两个人才是生活的主角',
        subText: '盟友共建型：渴望稳固的家庭边界感与未来确定性'
      }
    ],
    secretTip: '在任何面对外界压力的时刻，伴侣都是彼此的第一盟友。私下里的坚定拥护，是抵御外界风雨的最佳铠甲。',
    insight: '原生家庭的观念碰撞极易引发焦虑，此时伴侣的坚定站位是安全感的核心来源。',
    couplePromise: '“在任何人面前，我都永远是那个最先保护你、为你遮风挡雨的人。”'
  },
  {
    theme: '聚会社交电量耗尽',
    icon: '🔋',
    title: '在喧闹的朋友聚会中能量耗尽，想要提前离开',
    description: '聚会上大家欢声笑语，但 {target} 的“社交电量”突然亮起红灯，感到疲惫想要回家窝着。{target} 通常会怎样向对方发出信号？',
    options: [
      {
        text: '在桌子底下轻轻捏捏对方的手指，递过去一个求救的眼神',
        subText: '默契暗号型：希望你懂我的微表情，主动找借口带我开溜'
      },
      {
        text: '低头安静刷手机，整个人变得话少，等对方察觉到我的疲惫',
        subText: '等待觉察型：测试对方是否能在人群中时刻关注到我'
      },
      {
        text: '大大方方找个理由跟朋友们告辞，不勉强自己硬撑',
        subText: '坦率自主型：把自己的舒适度放在第一位'
      },
      {
        text: '强打精神继续陪大家玩，生怕自己扫了对方和朋友们的兴致',
        subText: '奉献顾局型：宁可自己内耗也不愿给别人添麻烦'
      }
    ],
    secretTip: '在聚会中设计属于你们俩的“撤退暗号”（如捏三下手心），能让彼此在喧闹中感受到独一份的心有灵犀。',
    insight: '社交内耗往往是隐蔽的。在人群中敏锐捕捉到伴侣的疲态，是最高阶的体贴。',
    couplePromise: '“无论在多热闹的聚会里，只要你累了，我的目光随时都在等你发撤退暗号。”'
  },
  {
    theme: '深夜馋虫来袭',
    icon: '🍢',
    title: '深夜11点半看剧，肚子突然不争气地叫了一声',
    description: '外面有点凉，两个人都洗漱好躺在被窝里看剧。突然肚子里一阵轰鸣，明知道吃夜宵容易发胖，{target} 此时会怎么做？',
    options: [
      {
        text: '挣扎纠结5分钟，然后转头对TA说：“来都来了，点！吃饱才有力气减肥！”',
        subText: '快乐至上型：人生苦短，绝不能辜负深夜的美食召唤'
      },
      {
        text: '撒娇摇晃对方手臂：“好想吃泡面呀，你可以帮我煮一包加蛋加肠的吗~”',
        subText: '撒娇依赖型：夜宵最好吃的部分，是心爱之人亲手端来的那一碗'
      },
      {
        text: '意志坚定地吞了口口水，灌下一大杯温开水，催促赶紧闭眼睡觉',
        subText: '自律狠人型：为了身材与健康坚守底线'
      },
      {
        text: '默默打开外卖APP逛了半小时，挑了半天最后只点了一杯温热的无糖豆浆',
        subText: '纠结妥协型：渴望满足馋虫又想把罪恶感降到最低'
      }
    ],
    secretTip: '偶尔的“放纵与不自律”是亲密生活里最甜的作料。别指责，陪TA分吃一碗深夜热面，是极具烟火气的浪漫。',
    insight: '深夜的小馋与小任性，是亲密关系中最生动的人间烟火。',
    couplePromise: '“想吃就大大方方告诉我，只要你想吃，随时都有为你下楼买夜宵的专属外卖员。”'
  },
  {
    theme: '突发情绪低落沉默不语',
    icon: '🌧️',
    title: '某天回到家突然格外沉默，不想说话只想发呆',
    description: '{target} 今天并没有发生具体的大事，但就是情绪电量归零，坐在沙发上发呆不想说话。{guesser} 怎样做才能真正走到TA心里？',
    options: [
      {
        text: '什么都不问，默默坐到身边，把肩膀借给我靠着，陪我一起发呆',
        subText: '无言陪伴型：不逼问原因的陪伴，就是最大的情绪安全感'
      },
      {
        text: '温柔地问一句“今天是不是累坏啦？想聊聊还是想放空？我都陪着你”',
        subText: '温和探询型：给选择权，不施加沟通压力'
      },
      {
        text: '去放一缸热水或准备好泡脚桶，递上毛茸茸的毯子和热牛奶',
        subText: '身体舒缓型：身体先暖起来，情绪才能慢慢舒展'
      },
      {
        text: '做鬼脸或讲个无厘头冷笑话，努力试图把对方逗笑破冰',
        subText: '快乐救兵型：想用自己的小太阳能量驱散对方的乌云'
      }
    ],
    secretTip: '情绪低落不一定有“原因”。很多时候伴侣只是需要“允许自己不开心”的权利，给TA一个不被审判的安静角落。',
    insight: '允许对方有低气压的时刻，不急于“拯救”，是成熟亲密关系的重要标志。',
    couplePromise: '“你可以随时在我面前不坚强、不开心，我的怀抱永远是你的情绪避风港。”'
  }
]

// 游戏状态管理
const gameState = ref('intro') // intro | playing | finished
const currentIdx = ref(0)
const step = ref(1) // 1: 猜测阶段, 2: 真实揭晓阶段, 3: 比对与解读

const guessedOption = ref(null)
const actualOption = ref(null)
const historyRecords = ref([])
const isMemoryArchived = ref(false)

// 动态角色分配：奇数题 Me 猜 Partner，偶数题 Partner 猜 Me
const isMeGuessing = computed(() => currentIdx.value % 2 === 0)
const guesserName = computed(() => isMeGuessing.value ? appState.names.me : appState.names.partner)
const targetName = computed(() => isMeGuessing.value ? appState.names.partner : appState.names.me)

const currentScenario = computed(() => scenarios[currentIdx.value] || scenarios[0])
const isMatched = computed(() => guessedOption.value !== null && guessedOption.value === actualOption.value)

function replaceNames(str) {
  if (!str) return ''
  return str
    .replace(/\{guesser\}/g, guesserName.value)
    .replace(/\{target\}/g, targetName.value)
    .replace(/\{me\}/g, appState.names.me)
    .replace(/\{partner\}/g, appState.names.partner)
}

function startGame() {
  gameState.value = 'playing'
  currentIdx.value = 0
  step.value = 1
  guessedOption.value = null
  actualOption.value = null
  historyRecords.value = []
  isMemoryArchived.value = false
}

function selectGuess(index) {
  guessedOption.value = index
}

function confirmGuess() {
  step.value = 2
}

function selectActual(index) {
  actualOption.value = index
}

function revealComparison() {
  step.value = 3
  const matched = guessedOption.value === actualOption.value
  historyRecords.value.push({
    theme: currentScenario.value.theme,
    icon: currentScenario.value.icon,
    matched,
    guesser: guesserName.value,
    target: targetName.value,
    guessText: replaceNames(currentScenario.value.options[guessedOption.value].text),
    actualText: replaceNames(currentScenario.value.options[actualOption.value].text),
    secretTip: replaceNames(currentScenario.value.secretTip || currentScenario.value.insight)
  })

  if (matched) {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      })
    } catch (e) {}
  }
}

function nextScenario() {
  if (currentIdx.value < scenarios.length - 1) {
    currentIdx.value += 1
    step.value = 1
    guessedOption.value = null
    actualOption.value = null
  } else {
    finishGame()
  }
}

const matchRate = computed(() => {
  if (!historyRecords.value.length) return 100
  const matchedCount = historyRecords.value.filter(r => r.matched).length
  return Math.round((matchedCount / historyRecords.value.length) * 100)
})

const finalScoreLevel = computed(() => {
  const rate = matchRate.value
  if (rate >= 80) {
    return {
      title: '🌟 灵魂共振级知己',
      desc: '太震撼了！你们仿佛在彼此的心底安装了雷达，对TA的脆弱、喜怒哀乐洞若观火，懂得TA每一个无声的眼神。'
    }
  } else if (rate >= 60) {
    return {
      title: '💖 温柔体贴守护者',
      desc: '非常出色的共情力！你们已经掌握了彼此大部分情绪密码，偶尔的偏差也成为了增进好奇与了解的有趣契机。'
    }
  } else {
    return {
      title: '🌱 正在深潜的心灵探索者',
      desc: '恭喜发现了许多对方不为人知的真实想法！爱不是天然一致，而是借由一次次真诚的沟通，走入对方的内心宇宙。'
    }
  }
})

function finishGame() {
  gameState.value = 'finished'
  // 通关奖励注入
  recordGameReward('role-switch', {
    water: 3,
    sun: 2,
    exp: 20,
    radarCategory: '情绪共鸣',
    radarDelta: 3
  })

  try {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 }
    })
  } catch (e) {}
}

// 封存为恋爱树记忆
function archiveToLoveTree() {
  if (isMemoryArchived.value) return
  isMemoryArchived.value = true

  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  
  const newMemory = {
    id: Date.now(),
    title: `换位共情 · 走心对账单 (${matchRate.value}%同频)`,
    date: dateStr,
    note: `${appState.names.me} 与 ${appState.names.partner} 在换位共情测试中完成了 ${historyRecords.value.length} 组情境对话。我们用心倾听了对方最真实的脆弱与心声，愿做彼此最温柔的避风港。`
  }

  if (!appState.loveTree.unlockedMemories) {
    appState.loveTree.unlockedMemories = []
  }
  appState.loveTree.unlockedMemories.unshift(newMemory)

  try {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 }
    })
  } catch (e) {}
}
</script>
