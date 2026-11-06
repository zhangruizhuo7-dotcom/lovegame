<template>
  <div class="w-full max-w-4xl mx-auto py-2 px-3 sm:px-6">
    <!-- 顶部状态栏与返回按钮 -->
    <div class="flex items-center justify-between mb-5">
      <button 
        @click="$emit('back')" 
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 border border-rose-200/80 shadow-xs text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span>&larr;</span>
        <span>返回展区</span>
      </button>

      <div class="flex items-center gap-2">
        <!-- 音效开关 -->
        <button 
          @click="toggleAudio"
          class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 hover:bg-white border border-rose-200/80 shadow-2xs text-slate-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          :title="isMuted ? '点击开启浪漫音效' : '点击静音'"
        >
          <span>{{ isMuted ? '🔇 静音' : '🎵 音效开' }}</span>
        </button>

        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-2xs">
          <span class="animate-pulse">💓</span> 心跳同频 · 极速二选一
        </span>
      </div>
    </div>

    <!-- 游戏未完成时：作答界面 -->
    <div v-if="!isCompleted" class="space-y-6">
      <!-- 模式与进度指示 -->
      <div class="glass-card rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-200/80 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <!-- 模式切换 -->
          <div class="flex items-center bg-rose-50/90 p-1 rounded-xl border border-rose-200/60 text-xs">
            <button 
              @click="changeMode('dual')" 
              :class="gameMode === 'dual' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'"
              class="px-3 py-1 rounded-lg transition-all cursor-pointer"
            >
              👥 双人同屏共选
            </button>
            <button 
              @click="changeMode('relay')" 
              :class="gameMode === 'relay' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'"
              class="px-3 py-1 rounded-lg transition-all cursor-pointer"
            >
              🔄 接力盲选交棒
            </button>
          </div>

          <!-- 双端在线状态提示 -->
          <div v-if="partnerOnline" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-bold animate-pulse">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>伴侣在线同步中</span>
          </div>

          <!-- 进度文字与同频题数 -->
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>第 <strong class="text-rose-600 text-sm font-black">{{ currentIndex + 1 }}</strong> / {{ questions.length }} 题</span>
            <span class="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
            <span>已同频 <strong class="text-rose-600 font-bold">{{ matchCount }}</strong> 题</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="w-full h-2 bg-rose-100/60 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            class="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 rounded-full transition-all duration-300"
            :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- 接力交棒提示页（接力模式且第二人准备作答） -->
      <div v-if="gameMode === 'relay' && relayStep === 'handover'" class="glass-card rounded-3xl p-8 text-center shadow-lg border border-rose-200 backdrop-blur-md">
        <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-rose-100 to-pink-200 flex items-center justify-center text-4xl mb-4 shadow-sm animate-bounce">
          📱
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">前半程完成！请交接设备</h3>
        <p class="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
          {{ appState.names.me }} 已经完成了TA的选择并已加密锁定！<br/>
          现在请将手机/电脑交给 <strong>{{ appState.names.partner }}</strong>，点击下方开始揭晓答案吧~
        </p>
        <button 
          @click="startPartnerRelay" 
          class="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full font-bold shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer"
        >
          {{ appState.names.partner }} 准备就绪，开始作答 &rarr;
        </button>
      </div>

      <!-- 主作答卡片 -->
      <div v-else class="glass-card rounded-3xl p-5 sm:p-8 shadow-md border border-rose-200/90 relative overflow-hidden backdrop-blur-md">
        <!-- 装饰背景 -->
        <div class="absolute -right-12 -top-12 w-48 h-48 bg-rose-100/50 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -left-12 -bottom-12 w-48 h-48 bg-pink-100/40 rounded-full blur-2xl pointer-events-none"></div>

        <!-- 题目头部 -->
        <div class="text-center mb-6 relative z-10">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200/80 rounded-full text-xs font-semibold mb-2 shadow-2xs">
            <span>🏷️</span>
            <span>场景 {{ currentIndex + 1 }} · {{ currentQuestion.theme }}</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {{ currentQuestion.title }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5">
            请遵循内心第一直觉，3秒内做出选择哦！
          </p>

          <!-- 对方状态脉冲提示（双人模式） -->
          <div v-if="gameMode === 'dual'" class="mt-3 flex items-center justify-center gap-3">
            <!-- 男方状态 -->
            <div 
              class="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all"
              :class="answers.me[currentIndex] 
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' 
                : 'bg-slate-100 text-slate-500 animate-pulse'"
            >
              <span>👦 {{ appState.names.me }}</span>
              <span>{{ answers.me[currentIndex] ? '🔒 已锁定' : '💭 正在挑选...' }}</span>
            </div>

            <span class="text-rose-300 font-bold">&</span>

            <!-- 女方状态 -->
            <div 
              class="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all"
              :class="answers.partner[currentIndex] 
                ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-300' 
                : 'bg-slate-100 text-slate-500 animate-pulse'"
            >
              <span>👧 {{ appState.names.partner }}</span>
              <span>{{ answers.partner[currentIndex] ? '🔒 已锁定' : '💭 正在挑选...' }}</span>
            </div>
          </div>
        </div>

        <!-- 选项大卡片 A vs B (加入 3D 立体透视与翻牌质感) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 relative z-10">
          <!-- 选项 A -->
          <div 
            class="group relative rounded-2xl p-5 sm:p-6 border-2 transition-all duration-300 select-none shadow-xs"
            :class="[
              isSelectedForCurrent('A') 
                ? 'bg-gradient-to-br from-rose-50/95 to-pink-50/80 border-rose-400 shadow-lg scale-[1.01]' 
                : 'bg-white/85 hover:bg-white border-rose-100/90 hover:border-rose-300 hover:shadow-md'
            ]"
          >
            <!-- 顶角装饰小标签 -->
            <div class="flex items-start gap-3.5">
              <div class="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-rose-100/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                {{ currentQuestion.optA.emoji }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-rose-500 uppercase tracking-wider">选项 A</span>
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

            <!-- 选择按钮区域 -->
            <div class="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between">
              <span class="text-xs text-slate-400 font-medium">选择此项：</span>
              <div class="flex items-center gap-2">
                <!-- 双人同屏模式下的两位选择按钮 -->
                <template v-if="gameMode === 'dual'">
                  <button 
                    @click="handleSelect('me', 'A')"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                    :class="answers.me[currentIndex] === 'A' 
                      ? 'bg-blue-500 text-white shadow-sm ring-2 ring-blue-300 scale-105' 
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600'"
                  >
                    <span>{{ appState.names.me }}</span>
                    <span v-if="answers.me[currentIndex] === 'A'">✓</span>
                  </button>
                  <button 
                    @click="handleSelect('partner', 'A')"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                    :class="answers.partner[currentIndex] === 'A' 
                      ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300 scale-105' 
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'"
                  >
                    <span>{{ appState.names.partner }}</span>
                    <span v-if="answers.partner[currentIndex] === 'A'">✓</span>
                  </button>
                </template>

                <!-- 接力盲选模式下的单人选择按钮 -->
                <template v-else>
                  <button 
                    @click="handleRelaySelect('A')"
                    class="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
                    :class="currentRelayChoice === 'A'
                      ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-300'
                      : 'bg-rose-100/80 hover:bg-rose-500 text-rose-700 hover:text-white'"
                  >
                    <span>选这个</span>
                    <span v-if="currentRelayChoice === 'A'">✓</span>
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- 选项 B -->
          <div 
            class="group relative rounded-2xl p-5 sm:p-6 border-2 transition-all duration-300 select-none shadow-xs"
            :class="[
              isSelectedForCurrent('B') 
                ? 'bg-gradient-to-br from-amber-50/95 to-rose-50/80 border-amber-400 shadow-lg scale-[1.01]' 
                : 'bg-white/85 hover:bg-white border-rose-100/90 hover:border-rose-300 hover:shadow-md'
            ]"
          >
            <div class="flex items-start gap-3.5">
              <div class="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-amber-100/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                {{ currentQuestion.optB.emoji }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-amber-600 uppercase tracking-wider">选项 B</span>
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

            <!-- 选择按钮区域 -->
            <div class="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between">
              <span class="text-xs text-slate-400 font-medium">选择此项：</span>
              <div class="flex items-center gap-2">
                <!-- 双人同屏模式下的两位选择按钮 -->
                <template v-if="gameMode === 'dual'">
                  <button 
                    @click="handleSelect('me', 'B')"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                    :class="answers.me[currentIndex] === 'B' 
                      ? 'bg-blue-500 text-white shadow-sm ring-2 ring-blue-300 scale-105' 
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600'"
                  >
                    <span>{{ appState.names.me }}</span>
                    <span v-if="answers.me[currentIndex] === 'B'">✓</span>
                  </button>
                  <button 
                    @click="handleSelect('partner', 'B')"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                    :class="answers.partner[currentIndex] === 'B' 
                      ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300 scale-105' 
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'"
                  >
                    <span>{{ appState.names.partner }}</span>
                    <span v-if="answers.partner[currentIndex] === 'B'">✓</span>
                  </button>
                </template>

                <!-- 接力盲选模式下的单人选择按钮 -->
                <template v-else>
                  <button 
                    @click="handleRelaySelect('B')"
                    class="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
                    :class="currentRelayChoice === 'B'
                      ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-300'
                      : 'bg-rose-100/80 hover:bg-rose-500 text-rose-700 hover:text-white'"
                  >
                    <span>选这个</span>
                    <span v-if="currentRelayChoice === 'B'">✓</span>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 即时同频合拍小横幅（双人模式下当两人选完即时合拍） -->
        <div 
          v-if="gameMode === 'dual' && answers.me[currentIndex] && answers.partner[currentIndex]"
          class="mb-4 p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 transition-all animate-bounce-subtle shadow-xs"
          :class="isMatch(currentIndex) 
            ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300 text-rose-700' 
            : 'bg-slate-50 border-slate-200 text-slate-600'"
        >
          <span class="text-xl">{{ isMatch(currentIndex) ? '💖' : '✨' }}</span>
          <span class="text-xs font-bold">
            {{ isMatch(currentIndex) 
              ? '心跳同频！两人不约而同选择了同一个选项！' 
              : '视角互补！你们看到了生活不同维度的美好~' 
            }}
          </span>
        </div>

        <!-- 底部状态与切题控制 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-rose-100">
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <template v-if="gameMode === 'dual'">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" :class="answers.me[currentIndex] ? 'bg-blue-500 ring-2 ring-blue-200' : 'bg-slate-300'"></span>
                <span>{{ appState.names.me }}: {{ answers.me[currentIndex] ? '已锁定' : '待选' }}</span>
              </div>
              <span class="text-rose-200">|</span>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" :class="answers.partner[currentIndex] ? 'bg-rose-500 ring-2 ring-rose-200' : 'bg-slate-300'"></span>
                <span>{{ appState.names.partner }}: {{ answers.partner[currentIndex] ? '已锁定' : '待选' }}</span>
              </div>
            </template>
            <template v-else>
              <span>当前作答人: <strong class="text-rose-600">{{ relayStep === 'me' ? appState.names.me : appState.names.partner }}</strong></span>
            </template>
          </div>

          <div class="flex items-center gap-2">
            <button 
              v-if="currentIndex > 0" 
              @click="prevQuestion"
              class="px-3.5 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-slate-600 hover:bg-rose-50 transition-all cursor-pointer"
            >
              上一题
            </button>
            <button 
              @click="nextQuestion"
              :disabled="!canProceed"
              class="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {{ isLastQuestion ? (gameMode === 'relay' && relayStep === 'me' ? '交棒给对方 &rarr;' : '揭晓心跳同频！🎉') : '下一题 &rarr;' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏完成：结果大揭晓页面 -->
    <div v-else class="space-y-6 animate-fadeIn">
      <!-- 结果榜首大卡片 -->
      <div class="glass-card rounded-3xl p-6 sm:p-8 text-center shadow-xl border border-rose-200 relative overflow-hidden backdrop-blur-md">
        <!-- 装饰彩带背景 -->
        <div class="absolute inset-0 bg-gradient-to-b from-rose-100/50 via-transparent to-pink-100/30 pointer-events-none"></div>

        <!-- 心跳律动动画与同频光环 -->
        <div class="relative w-28 h-28 mx-auto flex items-center justify-center my-2 cursor-pointer" @click="soundManager.playHeartbeat()">
          <div class="absolute inset-0 rounded-full bg-rose-400/20 animate-ping"></div>
          <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white text-5xl shadow-lg shadow-rose-300 animate-pulse">
            💓
          </div>
        </div>

        <!-- 同频指数与评价 -->
        <div class="relative mt-3">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
            ✨ {{ evaluation.badge }}
          </span>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-800 mt-2 tracking-tight">
            心跳同频指数：<span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 font-extrabold">{{ matchPercent }}%</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            在 {{ questions.length }} 道接地气的情侣日常选择中，你们有 <strong class="text-rose-600 font-bold">{{ matchCount }}</strong> 题心意完全一致！
            {{ evaluation.comment }}
          </p>
        </div>

        <!-- 获得的奖励展示条 -->
        <div class="mt-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50/90 via-pink-50/80 to-rose-50/90 border border-rose-200/80 max-w-lg mx-auto flex items-center justify-around text-xs font-bold text-slate-700 shadow-inner">
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
          <div class="flex items-center gap-1 text-rose-600">
            <span>📊 日常习惯</span>
            <span class="text-rose-600 font-black">+3分</span>
          </div>
        </div>
      </div>

      <!-- 逐题复盘对照表（卡片式 3D 翻牌复盘） -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 shadow-sm border border-rose-200 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-rose-100 mb-4 gap-2">
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>📋 全场景心跳对照清单 (共{{ questions.length }}题)</span>
            <span class="text-xs font-normal text-slate-400">点击卡片重温双方回答</span>
          </h3>
          <span class="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            一致率: {{ matchCount }} / {{ questions.length }} ({{ matchPercent }}%)
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div 
            v-for="(q, idx) in questions" 
            :key="q.id"
            class="p-4 rounded-2xl border transition-all duration-300 hover:shadow-md"
            :class="isMatch(idx) ? 'bg-rose-50/70 border-rose-300' : 'bg-slate-50/70 border-slate-200'"
          >
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="font-bold text-slate-700">#{{ idx + 1 }} {{ q.theme }}</span>
              <span 
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                :class="isMatch(idx) ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'"
              >
                {{ isMatch(idx) ? '💕 默契同频' : '✨ 奇妙互补' }}
              </span>
            </div>

            <p class="text-xs text-slate-600 mb-2.5 font-medium line-clamp-1">
              {{ q.title }}
            </p>

            <!-- 双方选择对比 -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <!-- 男友选 -->
              <div class="p-2.5 rounded-xl bg-white/90 border border-blue-100 shadow-2xs flex flex-col gap-0.5">
                <span class="text-blue-500 font-bold text-[10px]">{{ appState.names.me }}:</span>
                <span class="truncate font-semibold text-slate-700">
                  {{ answers.me[idx] === 'A' ? q.optA.emoji + ' ' + q.optA.text : q.optB.emoji + ' ' + q.optB.text }}
                </span>
              </div>
              <!-- 女友选 -->
              <div class="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs flex flex-col gap-0.5">
                <span class="text-rose-500 font-bold text-[10px]">{{ appState.names.partner }}:</span>
                <span class="truncate font-semibold text-slate-700">
                  {{ answers.partner[idx] === 'A' ? q.optA.emoji + ' ' + q.optA.text : q.optB.emoji + ' ' + q.optB.text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="flex items-center justify-center gap-4 pt-2 pb-6">
        <button 
          @click="restartGame"
          class="px-6 py-2.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-full text-xs sm:text-sm font-bold border border-rose-200 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          🔄 重新测试一轮
        </button>
        <button 
          @click="$emit('back')"
          class="px-8 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          返回展区 &rarr;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'
import { appState, recordGameReward } from '@/状态/恋爱树状态.js'
import { authState, socket } from '@/网络/联机服务.js'
import { soundManager } from './音效合成器.js'

defineEmits(['back'])

// 静音状态
const isMuted = ref(soundManager.muted)
function toggleAudio() {
  isMuted.value = soundManager.toggleMute()
}

// 伴侣在线状态检测
const partnerOnline = computed(() => {
  return authState?.presence?.bothOnline || false
})

// 18道精选接地气情侣日常偏好题库（涵盖日常习惯、旅行浪漫、矛盾处理、消费观、厨房生活等）
const questions = [
  {
    id: 1,
    theme: '萌宠偏好',
    title: '如果家里只能养一只毛孩子，你们会选择？',
    optA: { emoji: '🐱', text: '软萌傲娇猫咪', tag: '猫派', desc: '独立安静、呼噜治愈、偶尔黏人的小确幸' },
    optB: { emoji: '🐶', text: '热情忠诚修勾', tag: '狗派', desc: '摇尾迎接、户外散步、活力四射的小太阳' }
  },
  {
    id: 2,
    theme: '周末充电',
    title: '难得双休，哪种方式更能让你满血复活？',
    optA: { emoji: '🛋️', text: '宅家被窝躺平', tag: '室内派', desc: '追剧打游戏、吃外卖、享受无人打扰的惬意' },
    optB: { emoji: '🏕️', text: '出门逛街探店', tag: '户外派', desc: '打卡市集、草坪野餐露营、拥抱大自然与阳光' }
  },
  {
    id: 3,
    theme: '旅行节奏',
    title: '两个人一起出远门旅游，你更崇尚哪种风格？',
    optA: { emoji: '🗺️', text: '特种兵细致攻略', tag: '计划派', desc: '打卡每一个经典坐标，时间管理大师不留遗憾' },
    optB: { emoji: '🧳', text: '随心漫游自然醒', tag: '佛系派', desc: '睡到日落，走走停停，享受意外相遇的风景' }
  },
  {
    id: 4,
    theme: '火锅绝杀',
    title: '情侣吃火锅，必点锅底是哪一个？',
    optA: { emoji: '🌶️', text: '麻辣牛油红锅', tag: '重口派', desc: '无辣不欢，越煮越香，大汗淋漓的爽快' },
    optB: { emoji: '🍅', text: '浓郁番茄/清汤', tag: '鲜甜派', desc: '先喝一碗热乎鲜汤，清甜养生不易上火' }
  },
  {
    id: 5,
    theme: '约会景致',
    title: '为了看一场绝美自然景致，更乐意起大早还是等黄昏？',
    optA: { emoji: '🌄', text: '山巅破晓看日出', tag: '晨光感', desc: '迎着清晨的第一缕微光，迎接希望与朝霞' },
    optB: { emoji: '🌊', text: '海边微醺吹晚风', tag: '暮色感', desc: '踩着金色沙滩看落日沉入大海，温柔浪漫' }
  },
  {
    id: 6,
    theme: '通信频率',
    title: '日常异地或分开时，你更喜欢的联络方式？',
    optA: { emoji: '💬', text: '打字秒回秒聊', tag: '高频文字', desc: '随时随地分享表情包和小事，各忙各的互不耽误' },
    optB: { emoji: '📱', text: '夜间语音长连', tag: '深度语音', desc: '听着呼吸声入睡，哪怕都不说话也觉得心安' }
  },
  {
    id: 7,
    theme: '治愈甜水',
    title: '逛街口渴了，第一反应会想喝什么？',
    optA: { emoji: '🧋', text: '多料波霸奶茶', tag: '多巴胺', desc: '嚼劲满满，甜甜蜜蜜的大满足快乐源泉' },
    optB: { emoji: '☕', text: '冰生椰拿铁', tag: '提神风', desc: '浓郁椰香混合醇厚咖啡，清爽解腻微苦回甘' }
  },
  {
    id: 8,
    theme: '游乐设施',
    title: '进入游乐园，第一件最想体验的项目是？',
    optA: { emoji: '🎢', text: '心跳极速过山车', tag: '尖叫刺激', desc: '牵着手放声大叫，感受荷尔蒙的剧烈飙升' },
    optB: { emoji: '🎡', text: '高空浪漫摩天轮', tag: '温情浪漫', desc: '升到最高点俯瞰全城，在专属轿厢里偷偷亲一下' }
  },
  {
    id: 9,
    theme: '矛盾处理',
    title: '两个人有小分歧摩擦时，你倾向于？',
    optA: { emoji: '🤗', text: '立马拥抱说开', tag: '直面解决', desc: '绝不过夜，一个拥抱化解80%的委屈' },
    optB: { emoji: '🧘', text: '先冷静半小时', tag: '理智沉淀', desc: '平复情绪再交流，避免冲动说出伤人的狠话' }
  },
  {
    id: 10,
    theme: '爱情底色',
    title: '你心中理想的爱情最核心的模样？',
    optA: { emoji: '💥', text: '永远热烈的心跳', tag: '激情澎湃', desc: '仪式感与惊喜不断，永远保持初见时的悸动' },
    optB: { emoji: '🍃', text: '舒服自在的陪伴', tag: '细水长流', desc: '像呼吸一样自然，彼此做最真实的自己毫不费力' }
  },
  {
    id: 11,
    theme: '消费哲学',
    title: '突然发了一笔可观的年终奖，倾向怎么安排？',
    optA: { emoji: '🎉', text: '犒劳当下体验', tag: '即时快乐', desc: '买长草已久的奢品心愿物，或者说走就走的奢华度假' },
    optB: { emoji: '🏦', text: '存入恋爱基金', tag: '长远安全', desc: '稳健理财或作为未来共同小家的筑巢基金，踏实安心' }
  },
  {
    id: 12,
    theme: '纪念日庆祝',
    title: '恋爱一周年纪念日，你更向往怎样度过？',
    optA: { emoji: '🥂', text: '盛装西餐厅烛光', tag: '庄重仪式', desc: '精心搭配礼服，在浪漫小提琴曲里留下珍贵纪念照' },
    optB: { emoji: '🍳', text: '亲手做大餐小酌', tag: '温馨私密', desc: '一起系上围裙下厨，在属于两个人的私密客厅里微醺' }
  },
  {
    id: 13,
    theme: '居住愿景',
    title: '未来梦想中的两人爱巢，更偏爱哪一种？',
    optA: { emoji: '🏙️', text: '市中心落地窗大平层', tag: '都市繁华', desc: '推窗看车水马龙万家灯火，下楼即是商圈与繁华' },
    optB: { emoji: '🏡', text: '郊野庭院森系小屋', tag: '静谧桃源', desc: '拥有自己的小花园种种花草，享受清风与草木芬芳' }
  },
  {
    id: 14,
    theme: '影院座位',
    title: '去电影院看期待的大片，挑座位的首选是？',
    optA: { emoji: '🍿', text: '正中间黄金皇帝位', tag: '视听极致', desc: '全景声最佳声场，视线毫无死角，全身心投入沉浸' },
    optB: { emoji: '🤫', text: '后排角落靠边位', tag: '私密贴贴', desc: '没人打扰的小角落，能偷偷靠着对方肩膀甚至说悄悄话' }
  },
  {
    id: 15,
    theme: '拍照风格',
    title: '平时出去玩给彼此拍照，你更注重哪一点？',
    optA: { emoji: '📸', text: '抓拍鲜活生动搞怪', tag: '真实瞬间', desc: '哪怕表情失控大笑也是最珍贵的日常瞬间，生动有趣' },
    optB: { emoji: '🎞️', text: '精雕细琢电影质感', tag: '高级美感', desc: '构图光影完美，色调优雅，每一张都能当手机壁纸' }
  },
  {
    id: 16,
    theme: '睡前习惯',
    title: '关灯上床后的半小时，最享受的相处状态？',
    optA: { emoji: '💤', text: '互道晚安安静入眠', tag: '宁静安睡', desc: '抱在一起听着彼此的呼吸声，安稳沉入梦乡' },
    optB: { emoji: '📱', text: '钻一个被窝夜聊刷视频', tag: '深夜长谈', desc: '一起看搞笑段子哈哈大笑，分享心里最深的小秘密' }
  },
  {
    id: 17,
    theme: '早餐胃口',
    title: '美好的清晨醒来，第一口最想吃到的早餐？',
    optA: { emoji: '🥟', text: '中式热乎包子豆浆', tag: '暖胃扎实', desc: '热气腾腾的刚出笼包子，配上香浓豆浆或一碗热馄饨' },
    optB: { emoji: '🥪', text: '现烤吐司滑蛋咖啡', tag: '元气精致', desc: '金黄焦脆的面包香，配上一杯手冲冰咖啡，清醒优雅' }
  },
  {
    id: 18,
    theme: '厨房日常',
    title: '在家里做饭时，最理想的厨房互动是？',
    optA: { emoji: '🔪', text: '分工明确互不添乱', tag: '高效默契', desc: '一人专注掌勺烹饪大餐，另一人洗菜切配包揽洗碗' },
    optB: { emoji: '👩‍🍳', text: '挤在一起嬉闹试吃', tag: '甜蜜玩闹', desc: '从后面抱住掌勺的人，偷尝一口酱汁，厨房也是游乐场' }
  }
]

// 模式：dual (双人同屏) | relay (接力盲选)
const gameMode = ref('dual')
const relayStep = ref('me') // 'me' | 'handover' | 'partner'
const currentIndex = ref(0)
const isCompleted = ref(false)
const hasRewarded = ref(false)

// 答案存储
const answers = ref({
  me: {},
  partner: {}
})

// 当前接力单人选择临时变量
const currentRelayChoice = ref('')

const currentQuestion = computed(() => questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === questions.length - 1)

// 检查某个选项是否被当前选中
function isSelectedForCurrent(opt) {
  if (gameMode.value === 'dual') {
    return answers.value.me[currentIndex.value] === opt || answers.value.partner[currentIndex.value] === opt
  } else {
    return currentRelayChoice.value === opt
  }
}

// 检查当前题目是否可以进入下一阶段
const canProceed = computed(() => {
  if (gameMode.value === 'dual') {
    return answers.value.me[currentIndex.value] && answers.value.partner[currentIndex.value]
  } else {
    return !!currentRelayChoice.value
  }
})

// 模式切换
function changeMode(mode) {
  if (confirm('切换模式将重置当前答题进度，确定要切换吗？')) {
    gameMode.value = mode
    restartGame()
  }
}

// 双人模式选择
function handleSelect(role, opt) {
  answers.value[role][currentIndex.value] = opt
  soundManager.playBubble()

  // 如果双端在线，广播当前选择操作
  if (socket?.connected) {
    socket.emit('game_action', {
      gameId: 'heart-sync',
      action: 'select',
      data: { role, opt, index: currentIndex.value }
    })
  }

  // 如果双方都已选择当前题目
  if (answers.value.me[currentIndex.value] && answers.value.partner[currentIndex.value]) {
    if (isMatch(currentIndex.value)) {
      soundManager.playMatchSuccess()
      triggerMiniConfetti()
    } else {
      soundManager.playLockIn()
    }
  }
}

// 接力模式单人选择
function handleRelaySelect(opt) {
  currentRelayChoice.value = opt
  soundManager.playBubble()
}

// 迷你彩带效果
function triggerMiniConfetti() {
  try {
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#ec4899', '#fda4af', '#f472b6']
    })
  } catch (e) {}
}

// 下一题处理
function nextQuestion() {
  soundManager.playCardFlip()
  if (gameMode.value === 'dual') {
    if (isLastQuestion.value) {
      finishGame()
    } else {
      currentIndex.value++
    }
  } else {
    // 接力模式
    if (relayStep.value === 'me') {
      answers.value.me[currentIndex.value] = currentRelayChoice.value
      currentRelayChoice.value = ''
      if (isLastQuestion.value) {
        // 第一位完成全部题目，进入交接页
        relayStep.value = 'handover'
        soundManager.playLockIn()
      } else {
        currentIndex.value++
      }
    } else if (relayStep.value === 'partner') {
      answers.value.partner[currentIndex.value] = currentRelayChoice.value
      currentRelayChoice.value = ''
      if (isLastQuestion.value) {
        // 第二位也完成，揭晓
        finishGame()
      } else {
        currentIndex.value++
      }
    }
  }
}

// 上一题处理
function prevQuestion() {
  soundManager.playBubble()
  if (currentIndex.value > 0) {
    currentIndex.value--
    if (gameMode.value === 'relay') {
      const activeRole = relayStep.value === 'me' ? 'me' : 'partner'
      currentRelayChoice.value = answers.value[activeRole][currentIndex.value] || ''
    }
  }
}

// 开始第二棒接力
function startPartnerRelay() {
  soundManager.playFanfare()
  relayStep.value = 'partner'
  currentIndex.value = 0
  currentRelayChoice.value = ''
}

// 判断某题双方是否一致
function isMatch(idx) {
  const m = answers.value.me[idx]
  const p = answers.value.partner[idx]
  return m && p && m === p
}

// 统计一致题数
const matchCount = computed(() => {
  let count = 0
  for (let i = 0; i < questions.length; i++) {
    if (isMatch(i)) count++
  }
  return count
})

// 同频百分比
const matchPercent = computed(() => {
  return Math.round((matchCount.value / questions.length) * 100)
})

// 结果评价
const evaluation = computed(() => {
  const percent = matchPercent.value
  if (percent >= 85) {
    return {
      badge: '灵魂共振 · 天作之合',
      comment: '太不可思议了！你们的脑回路仿佛装了同一块芯片，心跳节拍严丝合缝！'
    }
  } else if (percent >= 65) {
    return {
      badge: '心有灵犀 · 高度同频',
      comment: '绝大多数生活细节上你们都能不谋而合，是令人羡慕的超默契伴侣！'
    }
  } else if (percent >= 45) {
    return {
      badge: '奇妙互补 · 和而不同',
      comment: '你们既有共同的频率，又各自保留着可爱的独特个性，在一起永远充满新意！'
    }
  } else {
    return {
      badge: '双星引力 · 探秘彼此',
      comment: '原来你们是截然不同的两片星云！但正因不同，才让每次探索都像开启未知盲盒般有趣~'
    }
  }
})

// 游戏完成结算
function finishGame() {
  isCompleted.value = true
  soundManager.playFanfare()
  soundManager.playHeartbeat()
  
  // 触发盛大彩带雨
  try {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#38bdf8', '#fbbf24']
    })
  } catch (e) {}

  if (!hasRewarded.value) {
    // 调用全局恋爱树奖励机制
    recordGameReward('heart-sync', { water: 3, sun: 2, exp: 20, radarCategory: '日常习惯', radarDelta: 3 })
    hasRewarded.value = true
  }
}

// 重新开始
function restartGame() {
  soundManager.playBubble()
  currentIndex.value = 0
  isCompleted.value = false
  hasRewarded.value = false
  relayStep.value = 'me'
  currentRelayChoice.value = ''
  answers.value = {
    me: {},
    partner: {}
  }
}

// 联机事件监听
function onPartnerAction(payload) {
  if (payload.gameId !== 'heart-sync') return
  if (payload.action === 'select') {
    const { role, opt, index } = payload.data
    answers.value[role][index] = opt
  }
}

onMounted(() => {
  if (socket) {
    socket.on('partner_game_action', onPartnerAction)
  }
})

onUnmounted(() => {
  if (socket) {
    socket.off('partner_game_action', onPartnerAction)
  }
})
</script>

<style scoped>
@keyframes pulseSubtle {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.03); opacity: 0.92; }
}

@keyframes bounceSubtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-pulse-subtle {
  animation: pulseSubtle 2.5s infinite ease-in-out;
}

.animate-bounce-subtle {
  animation: bounceSubtle 2s infinite ease-in-out;
}

.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
