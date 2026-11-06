<template>
  <div class="space-y-6">
    <!-- 顶部导航与状态条 -->
    <div class="flex items-center justify-between bg-white/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-rose-100 shadow-xs">
      <button 
        @click="$emit('back')"
        class="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition-colors active:scale-95 cursor-pointer"
      >
        <span>&larr;</span>
        <span>返回展区目录</span>
      </button>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          游戏 7 · 心愿券兑换
        </span>
        <button
          @click="openCreateModal(false)"
          class="text-xs font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 px-3 py-1.5 rounded-full shadow-xs transition-all cursor-pointer active:scale-95"
        >
          🎁 心愿礼赠 & 定制
        </button>
      </div>
    </div>

    <!-- 盲盒主交互卡片 -->
    <div class="glass-card rounded-3xl p-5 sm:p-8 shadow-xl border border-rose-200/80 relative overflow-hidden bg-gradient-to-br from-white/90 via-rose-50/20 to-amber-50/30">
      <!-- 柔光背景 -->
      <div class="absolute -top-12 -left-12 w-48 h-48 bg-rose-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <!-- 顶部切换 Tabs: 盲盒机 VS 我的心愿卡包 -->
      <div class="flex items-center justify-center mb-6 relative z-10">
        <div class="bg-rose-100/60 p-1 rounded-2xl flex items-center gap-1 shadow-2xs">
          <button
            @click="currentTab = 'box'"
            class="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            :class="currentTab === 'box' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-rose-500'"
          >
            <span>🎁 开启3D盲盒</span>
          </button>
          <button
            @click="currentTab = 'wallet'"
            class="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            :class="currentTab === 'wallet' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-rose-500'"
          >
            <span>🎟️ 恋爱心愿卡包 ({{ coupons.length }})</span>
            <span v-if="unredeemedCount > 0" class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </button>
        </div>
      </div>

      <!-- Tab 1: 盲盒机区域 (3D 开箱与光晕特效) -->
      <div v-if="currentTab === 'box'" class="py-4 text-center max-w-lg mx-auto space-y-6 relative z-10">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold mb-2">
            <span>✨ 3D 默契心愿盲盒机</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            拆开心愿 · 赋予彼此爱的特权
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            随机抽取专属于你们的特权心愿券。抽中即可永久存入卡包，日常生活中随时出示实体盖印核销！
          </p>
        </div>

        <!-- 3D 盲盒舞台与动画主体 -->
        <div class="relative py-8 flex items-center justify-center select-none perspective-1000">
          
          <!-- 背景开箱放射光晕特效 -->
          <div 
            v-if="isOpening" 
            class="absolute w-72 h-72 rounded-full bg-gradient-to-r from-amber-300/60 via-rose-300/60 to-pink-300/60 blur-2xl animate-spin-slow pointer-events-none"
          ></div>

          <!-- 3D 盒子容器 -->
          <div 
            @click="openBox"
            :class="[
              'w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 shadow-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all border-4 border-white relative group preserve-3d',
              isOpening ? 'scale-110 shadow-rose-300/80 animate-wiggle' : 'hover:scale-105 active:scale-95'
            ]"
          >
            <!-- 盒盖 (3D 翻开动效) -->
            <div 
              class="absolute -top-3 inset-x-2 h-10 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 shadow-md border-2 border-white flex items-center justify-center transition-transform duration-700 origin-bottom"
              :class="isOpening ? 'rotate-x-120 -translate-y-6 opacity-80' : ''"
            >
              <!-- 蝴蝶结 -->
              <span class="text-2xl drop-shadow-md">🎀</span>
            </div>

            <!-- 礼盒缎带十字装饰 -->
            <div class="absolute inset-x-0 h-6 bg-amber-200/80 top-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div class="absolute inset-y-0 w-6 bg-amber-200/80 left-1/2 -translate-x-1/2 pointer-events-none"></div>

            <!-- 礼盒中心大图标与卡券升起 -->
            <div 
              class="relative z-10 text-5xl sm:text-6xl drop-shadow-md transition-all duration-500"
              :class="isOpening ? '-translate-y-4 scale-125' : ''"
            >
              {{ isOpening ? '🌟' : '🎁' }}
            </div>

            <span class="relative z-10 mt-3 text-xs sm:text-sm font-black text-white bg-black/25 px-3 py-1 rounded-full backdrop-blur-xs">
              {{ isOpening ? '心愿光芒破盒而出...' : '点击拆开盲盒' }}
            </span>
          </div>
        </div>

        <!-- 盲盒奖池概率说明 -->
        <div class="grid grid-cols-3 gap-2 text-[11px] max-w-sm mx-auto">
          <div class="bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-800">
            <span class="font-bold">👑 传说级</span>
            <p class="text-[10px] text-amber-600 mt-0.5">无条件听话 / 清空购物车</p>
          </div>
          <div class="bg-purple-50 p-2 rounded-xl border border-purple-200 text-purple-800">
            <span class="font-bold">✨ 稀有级</span>
            <p class="text-[10px] text-purple-600 mt-0.5">家务全免 / 深夜夜宵特批</p>
          </div>
          <div class="bg-rose-50 p-2 rounded-xl border border-rose-200 text-rose-800">
            <span class="font-bold">🌸 温暖级</span>
            <p class="text-[10px] text-rose-600 mt-0.5">赖床抱抱 / 撒娇原谅卡</p>
          </div>
        </div>

        <!-- 快速去卡包按钮 -->
        <div class="pt-2 flex items-center justify-center gap-4 text-xs font-semibold">
          <button 
            @click="currentTab = 'wallet'"
            class="text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            查看我的心愿卡包 ({{ unredeemedCount }} 张待兑现) &rarr;
          </button>
          <span class="text-slate-300">|</span>
          <button 
            @click="openCreateModal(true)"
            class="text-amber-600 hover:text-amber-700 cursor-pointer"
          >
            💌 送给TA一张礼赠心愿 &rarr;
          </button>
        </div>
      </div>

      <!-- Tab 2: 心愿券卡包列表 -->
      <div v-else class="space-y-5 relative z-10">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>🎟️ 恋爱心愿特权卡包</span>
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              手持爱意凭证，在日常生活中出示并由对方实体盖章核销。
            </p>
          </div>

          <!-- 状态筛选 -->
          <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              @click="filterStatus = 'all'"
              class="px-3 py-1 rounded-lg transition-colors cursor-pointer"
              :class="filterStatus === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500'"
            >
              全部 ({{ coupons.length }})
            </button>
            <button
              @click="filterStatus = 'active'"
              class="px-3 py-1 rounded-lg transition-colors cursor-pointer"
              :class="filterStatus === 'active' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500'"
            >
              待兑现 ({{ unredeemedCount }})
            </button>
            <button
              @click="filterStatus = 'used'"
              class="px-3 py-1 rounded-lg transition-colors cursor-pointer"
              :class="filterStatus === 'used' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500'"
            >
              已核销 ({{ coupons.length - unredeemedCount }})
            </button>
            <button
              @click="filterStatus = 'gift'"
              class="px-3 py-1 rounded-lg transition-colors cursor-pointer"
              :class="filterStatus === 'gift' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500'"
            >
              🎁 伴侣礼赠 ({{ giftCount }})
            </button>
          </div>
        </div>

        <!-- 空列表提示 -->
        <div v-if="filteredCoupons.length === 0" class="text-center py-12 bg-white/60 rounded-3xl border border-dashed border-rose-200 space-y-3">
          <div class="text-4xl">💌</div>
          <p class="text-xs sm:text-sm text-slate-500">当前没有符合筛选的心愿券</p>
          <button 
            @click="currentTab = 'box'"
            class="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-rose-600 cursor-pointer"
          >
            前往开启盲盒抽取
          </button>
        </div>

        <!-- 卡券网格展示 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(coupon, cIdx) in filteredCoupons"
            :key="coupon.id"
            class="relative rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between"
            :class="[
              coupon.used 
                ? 'bg-slate-50/90 border-slate-200 opacity-80' 
                : coupon.rarity === 'legendary' 
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-sm'
                  : coupon.rarity === 'rare'
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-sm'
                    : 'bg-gradient-to-br from-rose-50 to-white border-rose-200 shadow-sm'
            ]"
          >
            <!-- 齿孔修饰（左右凹槽） -->
            <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-4 h-4 rounded-full bg-rose-50/70 border border-slate-200/50"></div>
            <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-4 h-4 rounded-full bg-rose-50/70 border border-slate-200/50"></div>

            <!-- 卡券头部 -->
            <div class="p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1.5">
                  <span 
                    class="text-[10px] font-black px-2 py-0.5 rounded-full"
                    :class="[
                      coupon.rarity === 'legendary' ? 'bg-amber-200 text-amber-900' :
                      coupon.rarity === 'rare' ? 'bg-purple-200 text-purple-900' :
                      'bg-rose-200 text-rose-900'
                    ]"
                  >
                    {{ coupon.rarityText }}
                  </span>

                  <!-- 礼赠标签 -->
                  <span v-if="coupon.isGift" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                    💌 礼赠心愿
                  </span>
                </div>

                <span class="text-[10px] font-mono text-slate-400">
                  NO.{{ coupon.code }}
                </span>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="text-3xl shrink-0">{{ coupon.icon }}</span>
                <div>
                  <h4 class="text-sm font-black text-slate-800">
                    {{ coupon.title }}
                  </h4>
                  <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {{ coupon.desc }}
                  </p>
                </div>
              </div>

              <!-- 若包含礼赠暖心留言 -->
              <div v-if="coupon.giftMessage" class="mt-2.5 bg-white/70 p-2.5 rounded-xl border border-pink-100 text-[11px] text-pink-800 space-y-0.5">
                <div class="font-bold flex items-center justify-between text-[10px] text-pink-600">
                  <span>来自 {{ coupon.from }} 的暖心情书：</span>
                  <span>♥ 心意如金</span>
                </div>
                <p class="italic text-slate-700">“{{ coupon.giftMessage }}”</p>
              </div>
            </div>

            <!-- 卡券虚线分割线 -->
            <div class="border-t border-dashed border-slate-300/80 mx-3 my-1"></div>

            <!-- 卡券底部操作栏与印章 -->
            <div class="p-3 bg-white/50 flex items-center justify-between relative">
              <div class="text-[10px] text-slate-400">
                <span>持券人：{{ coupon.holder }}</span>
              </div>

              <!-- 已核销印章 (复古红色双环实体印) -->
              <div v-if="coupon.used" class="flex items-center">
                <div class="border-2 border-rose-600 text-rose-600 px-2 py-0.5 rounded-lg rotate-[-6deg] bg-rose-50/90 text-center font-black shadow-2xs text-[10px]">
                  <span>已兑现 ♥ {{ coupon.redeemedDate || '2026-11-06' }}</span>
                </div>
              </div>

              <!-- 待使用立即兑现按钮 -->
              <div v-else>
                <button
                  @click="openRedeemModal(coupon)"
                  class="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  立即兑现 &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 1：抽取盲盒揭晓弹窗 -->
    <div v-if="revealedCoupon" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-rose-200 relative overflow-hidden animate-bounce-slow">
        <div class="text-xs font-bold text-amber-700 bg-amber-50 py-1 px-3 rounded-full inline-block border border-amber-200">
          ✨ 恭喜拆得新心愿券！
        </div>

        <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-400 to-amber-300 flex items-center justify-center text-4xl shadow-md border-2 border-white">
          {{ revealedCoupon.icon }}
        </div>

        <div>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
            {{ revealedCoupon.rarityText }}
          </span>
          <h3 class="text-lg font-black text-slate-800 mt-1">
            {{ revealedCoupon.title }}
          </h3>
          <p class="text-xs text-slate-500 mt-2 px-2 leading-relaxed">
            {{ revealedCoupon.desc }}
          </p>
        </div>

        <div class="p-3 bg-rose-50/70 rounded-2xl border border-rose-100 text-xs text-rose-800">
          已成功放入【恋爱心愿卡包】，归属：<b>{{ revealedCoupon.holder }}</b>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button 
            @click="revealedCoupon = null; currentTab = 'wallet'"
            class="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            前往卡包查看
          </button>
          <button 
            @click="revealedCoupon = null"
            class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            继续拆盲盒
          </button>
        </div>
      </div>
    </div>

    <!-- 弹窗 2：心愿券兑现核销仪式 (带实体印章重力砸落动效与音效) -->
    <div v-if="redeemingCoupon" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-5 relative overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-black text-slate-800 flex items-center gap-1.5">
            <span>💌 心愿出示与盖章核销</span>
          </h3>
          <button @click="redeemingCoupon = null" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">&times;</button>
        </div>

        <!-- 卡券展示 -->
        <div class="bg-gradient-to-br from-rose-50 to-amber-50 p-5 rounded-2xl border-2 border-rose-200 space-y-2 relative overflow-hidden">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>NO.{{ redeemingCoupon.code }}</span>
            <span class="text-rose-600 font-bold">{{ redeemingCoupon.rarityText }}</span>
          </div>

          <div class="flex items-center gap-3 pt-1">
            <span class="text-3xl shrink-0">{{ redeemingCoupon.icon }}</span>
            <div>
              <h4 class="text-base font-black text-slate-800">{{ redeemingCoupon.title }}</h4>
              <p class="text-xs text-slate-500 mt-0.5">{{ redeemingCoupon.desc }}</p>
            </div>
          </div>

          <!-- 礼赠情书留言展示 -->
          <div v-if="redeemingCoupon.giftMessage" class="mt-2 bg-white/80 p-2.5 rounded-xl border border-pink-200 text-xs text-pink-900">
            <span class="font-bold text-[10px] text-pink-600 block">💌 来自 {{ redeemingCoupon.from }} 的嘱咐：</span>
            <p class="italic text-slate-700 mt-0.5">“{{ redeemingCoupon.giftMessage }}”</p>
          </div>

          <div class="pt-2 text-[11px] text-slate-400 flex justify-between">
            <span>持券人：{{ redeemingCoupon.holder }}</span>
            <span>履约执行人：全心陪伴履行</span>
          </div>

          <!-- 盖章动效（实体木质印章砸落朱砂印动效） -->
          <div v-if="justStamped" class="absolute inset-0 bg-white/40 backdrop-blur-2xs flex items-center justify-center pointer-events-none">
            <div class="w-36 h-36 rounded-full border-4 border-rose-600 text-rose-600 flex flex-col items-center justify-center rotate-[-12deg] font-black animate-stamp shadow-lg bg-rose-50/70">
              <span class="text-2xl">❤️</span>
              <span class="text-xs font-black tracking-widest">已兑现 ♥ 契约达成</span>
              <span class="text-[10px] font-mono mt-0.5">{{ currentDateStr }}</span>
            </div>
          </div>
        </div>

        <!-- 履约承诺说明 -->
        <div class="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <span class="font-bold">⚠️ 履约规则：</span>
          出示此券后，对方应本着换位关爱原则全力配合执行！点击下方“盖章核销”，将生成实体时间印章并为恋爱树增加雨露滋养！
        </div>

        <!-- 操作按钮 -->
        <div class="pt-2 flex items-center gap-2">
          <button 
            @click="redeemingCoupon = null"
            class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-xs cursor-pointer"
          >
            暂不核销
          </button>
          <button 
            @click="confirmRedeem(redeemingCoupon)"
            :disabled="justStamped"
            class="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black rounded-xl text-xs shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>💮 双方确认 · 盖章核销</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 弹窗 3：心愿礼赠 & DIY 定制心愿卡 -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-100 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>{{ isGiftMode ? '💌 心愿礼赠 · 专属爱意心愿卡' : '✏️ 定制专属恋爱特权券' }}</span>
          </h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">&times;</button>
        </div>

        <!-- 模式切换 -->
        <div class="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            @click="isGiftMode = true"
            class="py-1.5 rounded-lg transition-colors cursor-pointer"
            :class="isGiftMode ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500'"
          >
            🎁 暖心礼赠模式
          </button>
          <button
            type="button"
            @click="isGiftMode = false"
            class="py-1.5 rounded-lg transition-colors cursor-pointer"
            :class="!isGiftMode ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500'"
          >
            🛠️ 自由定制模式
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">心愿特权标题：</label>
            <input 
              v-model="customForm.title" 
              placeholder="例如：无条件陪看球赛券 / 专属肩颈推拿卡" 
              class="w-full text-xs p-2.5 border rounded-xl border-slate-200 focus:outline-rose-400"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">心愿图标：</label>
              <input 
                v-model="customForm.icon" 
                placeholder="例如: 🍧 或 🚗" 
                class="w-full text-xs p-2.5 border rounded-xl border-slate-200 text-center"
              />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">品质等级：</label>
              <select 
                v-model="customForm.rarity"
                class="w-full text-xs p-2.5 border rounded-xl border-slate-200 bg-white"
              >
                <option value="warm">🌸 温暖级</option>
                <option value="rare">✨ 稀有级</option>
                <option value="legendary">👑 传说级</option>
              </select>
            </div>
          </div>

          <!-- 礼赠对象与赠送人 -->
          <div v-if="isGiftMode" class="bg-pink-50/70 p-3 rounded-xl border border-pink-200 space-y-2">
            <div class="text-xs font-bold text-pink-800">💌 礼赠对象设定：</div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="customForm.holder = appState.names.partner; customForm.from = appState.names.me"
                class="py-2 text-xs rounded-xl border font-bold cursor-pointer"
                :class="customForm.holder === appState.names.partner ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-600'"
              >
                {{ appState.names.me }} 赠送给 {{ appState.names.partner }}
              </button>
              <button
                type="button"
                @click="customForm.holder = appState.names.me; customForm.from = appState.names.partner"
                class="py-2 text-xs rounded-xl border font-bold cursor-pointer"
                :class="customForm.holder === appState.names.me ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600'"
              >
                {{ appState.names.partner }} 赠送给 {{ appState.names.me }}
              </button>
            </div>

            <div>
              <label class="text-xs font-bold text-pink-700 block mt-2 mb-1">附上暖心情书留言：</label>
              <textarea 
                v-model="customForm.giftMessage" 
                rows="2" 
                placeholder="例如：最近看你工作辛苦，特别赠你这张卡，随时使唤我，不许客气哦~"
                class="w-full text-xs p-2.5 bg-white border rounded-xl border-pink-200 focus:outline-pink-400"
              ></textarea>
            </div>
          </div>

          <!-- 普通模式下的归属选择 -->
          <div v-else>
            <label class="text-xs font-bold text-slate-700 block mb-1">持券人（拥有者）：</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="customForm.holder = appState.names.me"
                class="py-2 text-xs rounded-xl border font-bold cursor-pointer"
                :class="customForm.holder === appState.names.me ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-600'"
              >
                {{ appState.names.me }} 拥有
              </button>
              <button
                type="button"
                @click="customForm.holder = appState.names.partner"
                class="py-2 text-xs rounded-xl border font-bold cursor-pointer"
                :class="customForm.holder === appState.names.partner ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600'"
              >
                {{ appState.names.partner }} 拥有
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">兑现规则与细节约定：</label>
            <textarea 
              v-model="customForm.desc" 
              rows="2" 
              placeholder="详细描述心愿的具体内容与生效契约..."
              class="w-full text-xs p-2.5 border rounded-xl border-slate-200 focus:outline-rose-400"
            ></textarea>
          </div>
        </div>

        <div class="pt-2 flex items-center gap-2">
          <button 
            @click="showCreateModal = false"
            class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-xs cursor-pointer"
          >
            取消
          </button>
          <button 
            @click="createCustomCoupon"
            class="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer active:scale-95"
          >
            {{ isGiftMode ? '封入火漆情书并赠送' : '生成并存入卡包' }}
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

const STORAGE_COUPONS_KEY = 'couple_wish_coupons_v2'

// 盲盒预设心愿池
const poolCoupons = [
  {
    title: '无条件听话1小时券',
    icon: '👑',
    rarity: 'legendary',
    rarityText: '👑 传说级',
    desc: '在使用的1小时内，对方必须无条件顺从你的合理指令，绝不可反驳或顶嘴！'
  },
  {
    title: '今日洗碗做饭免单券',
    icon: '🍳',
    rarity: 'rare',
    rarityText: '✨ 稀有级',
    desc: '今天一整天的洗碗收拾家务全部由对方承包，你可以舒舒服服躺平当甩手掌柜！'
  },
  {
    title: '赖床抱抱续期券',
    icon: '🛌',
    rarity: 'warm',
    rarityText: '🌸 温暖级',
    desc: '早晨闹钟响后出示，可在对方温暖的怀抱里多赖床抱抱20分钟，不许催促起床！'
  },
  {
    title: '深夜罪恶夜宵特批券',
    icon: '🍢',
    rarity: 'rare',
    rarityText: '✨ 稀有级',
    desc: '无论多晚突然馋了，对方必须陪同品尝或主动下楼跑腿买回，不许说“发胖警告”！'
  },
  {
    title: '专属捏肩捶背服务券',
    icon: '💆',
    rarity: 'warm',
    rarityText: '🌸 温暖级',
    desc: '享受对方长达20分钟的沉浸式肩颈推拿或头部放松，手法需尽心尽力！'
  },
  {
    title: '无理由撒娇原谅卡',
    icon: '🥺',
    rarity: 'warm',
    rarityText: '🌸 温暖级',
    desc: '犯了小迷糊或惹对方生气时出示，对方必须立刻亲一口额头并无条件消气原谅！'
  },
  {
    title: '清空单件购物车心愿券',
    icon: '🛍️',
    rarity: 'legendary',
    rarityText: '👑 传说级',
    desc: '在合理预算内，挑选一件长久以来心仪但舍不得买的礼物，由对方全款赞助！'
  },
  {
    title: '周末出行全权指挥券',
    icon: '🗺️',
    rarity: 'rare',
    rarityText: '✨ 稀有级',
    desc: '本周六/周日的全部行程安排、餐厅打卡全部听你的，对方必须快乐跟随！'
  }
]

// 默认初始卡包
const initialCoupons = [
  {
    id: 1,
    code: '1001',
    title: '无条件听话1小时券',
    icon: '👑',
    rarity: 'legendary',
    rarityText: '👑 传说级',
    desc: '在使用的1小时内，对方必须无条件顺从你的合理指令，绝不可反驳或顶嘴！',
    holder: appState.names.partner,
    used: false
  },
  {
    id: 2,
    code: '1002',
    title: '赖床抱抱续期券',
    icon: '🛌',
    rarity: 'warm',
    rarityText: '🌸 温暖级',
    desc: '早晨闹钟响后出示，可在对方温暖的怀抱里多赖床抱抱20分钟，不许催促起床！',
    holder: appState.names.me,
    isGift: true,
    from: appState.names.partner,
    giftMessage: '早晨看你睡得香甜舍不得叫醒，特赠此卡，多抱你一会我也很开心。',
    used: false
  },
  {
    id: 3,
    code: '1003',
    title: '今日洗碗做饭免单券',
    icon: '🍳',
    rarity: 'rare',
    rarityText: '✨ 稀有级',
    desc: '今天一整天的洗碗收拾家务全部由对方承包，你可以舒舒服服躺平当甩手掌柜！',
    holder: appState.names.partner,
    used: true,
    redeemedDate: '2026-11-06'
  }
]

function loadCoupons() {
  try {
    const raw = localStorage.getItem(STORAGE_COUPONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {}
  return initialCoupons
}

const coupons = ref(loadCoupons())
const currentTab = ref('box') // 'box' | 'wallet'
const filterStatus = ref('all') // 'all' | 'active' | 'used' | 'gift'

const isOpening = ref(false)
const revealedCoupon = ref(null)

const redeemingCoupon = ref(null)
const justStamped = ref(false)

const showCreateModal = ref(false)
const isGiftMode = ref(false)
const customForm = ref({
  title: '',
  icon: '🎁',
  rarity: 'warm',
  holder: appState.names.partner,
  from: appState.names.me,
  giftMessage: '',
  desc: ''
})

function saveCoupons() {
  try {
    localStorage.setItem(STORAGE_COUPONS_KEY, JSON.stringify(coupons.value))
  } catch (e) {}
}

const unredeemedCount = computed(() => coupons.value.filter(c => !c.used).length)
const giftCount = computed(() => coupons.value.filter(c => c.isGift).length)

const currentDateStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const filteredCoupons = computed(() => {
  if (filterStatus.value === 'active') return coupons.value.filter(c => !c.used)
  if (filterStatus.value === 'used') return coupons.value.filter(c => c.used)
  if (filterStatus.value === 'gift') return coupons.value.filter(c => c.isGift)
  return coupons.value
})

// Web Audio API 合成印章盖章与拆盒音效
let audioCtx = null
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) audioCtx = new AudioContext()
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// 模拟实木厚重印章落地声 "Thump & Click"
function playStampSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  } catch (e) {}
}

// 拆盲盒发光音效
function playOpenBoxSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const notes = [440, 554.37, 659.25, 880, 1108.73]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09)
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.09)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + idx * 0.09)
      osc.stop(ctx.currentTime + idx * 0.09 + 0.3)
    })
  } catch (e) {}
}

function openBox() {
  if (isOpening.value) return
  isOpening.value = true
  playOpenBoxSound()

  setTimeout(() => {
    isOpening.value = false
    const sample = poolCoupons[Math.floor(Math.random() * poolCoupons.length)]
    const newId = Date.now()
    const newCode = String(Math.floor(1000 + Math.random() * 9000))
    // 随机分配持有者
    const randomHolder = Math.random() > 0.5 ? appState.names.me : appState.names.partner
    
    const newOne = {
      id: newId,
      code: newCode,
      title: sample.title,
      icon: sample.icon,
      rarity: sample.rarity,
      rarityText: sample.rarityText,
      desc: sample.desc,
      holder: randomHolder,
      used: false
    }

    coupons.value.unshift(newOne)
    saveCoupons()
    revealedCoupon.value = newOne

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (e) {}
  }, 1000)
}

function openRedeemModal(coupon) {
  redeemingCoupon.value = coupon
  justStamped.value = false
}

function confirmRedeem(coupon) {
  justStamped.value = true
  playStampSound()

  setTimeout(() => {
    coupon.used = true
    coupon.redeemedDate = currentDateStr.value
    saveCoupons()

    // 通关奖励注入
    recordGameReward('wish-box', {
      water: 3,
      sun: 3,
      exp: 20,
      radarCategory: '情绪共鸣',
      radarDelta: 2
    })

    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.5 }
      })
    } catch (e) {}

    setTimeout(() => {
      redeemingCoupon.value = null
      justStamped.value = false
    }, 1300)
  }, 650)
}

function openCreateModal(giftMode = false) {
  isGiftMode.value = giftMode
  showCreateModal.value = true
  if (giftMode) {
    customForm.value.holder = appState.names.partner
    customForm.value.from = appState.names.me
  } else {
    customForm.value.holder = appState.names.me
    customForm.value.from = ''
    customForm.value.giftMessage = ''
  }
}

function createCustomCoupon() {
  if (!customForm.value.title.trim()) return

  const rarityMap = {
    warm: '🌸 温暖级',
    rare: '✨ 稀有级',
    legendary: '👑 传说级'
  }

  const newOne = {
    id: Date.now(),
    code: String(Math.floor(1000 + Math.random() * 9000)),
    title: customForm.value.title.trim(),
    icon: customForm.value.icon || '🎁',
    rarity: customForm.value.rarity,
    rarityText: rarityMap[customForm.value.rarity],
    desc: customForm.value.desc.trim() || '情侣专属爱意特权',
    holder: customForm.value.holder,
    isGift: isGiftMode.value,
    from: customForm.value.from,
    giftMessage: customForm.value.giftMessage.trim(),
    used: false
  }

  coupons.value.unshift(newOne)
  saveCoupons()
  showCreateModal.value = false
  currentTab.value = 'wallet'

  customForm.value = {
    title: '',
    icon: '🎁',
    rarity: 'warm',
    holder: appState.names.me,
    from: '',
    giftMessage: '',
    desc: ''
  }

  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    })
  } catch (e) {}
}
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
.rotate-x-120 {
  transform: rotateX(-110deg);
}

@keyframes stamp {
  0% {
    transform: scale(3) rotate(-30deg);
    opacity: 0;
  }
  60% {
    transform: scale(0.9) rotate(-10deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(-12deg);
    opacity: 1;
  }
}
.animate-stamp {
  animation: stamp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg) scale(1.08); }
  25% { transform: rotate(-3deg) scale(1.08); }
  75% { transform: rotate(3deg) scale(1.08); }
}
.animate-wiggle {
  animation: wiggle 0.25s ease-in-out infinite;
}
</style>
